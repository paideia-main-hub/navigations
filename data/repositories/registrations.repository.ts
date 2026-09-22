import type { SupabaseClient } from "@supabase/supabase-js";
import type { Registration, RegistrationStatus } from "@/domain/registrations/types";
import type { PaymentStatus } from "@/domain/payments/types";

type Row = {
  id: string;
  registration_number: string;
  competition_slug: string;
  competition_title: string;
  entry_type: "individual" | "team";
  status: RegistrationStatus;
  submitted_at: string;
  students: { full_name: string } | null;
  teams: { team_name: string; team_members: { students: { full_name: string } | null }[] } | null;
  registration_payments: { status: PaymentStatus } | null;
};

function toRegistration(row: Row): Registration {
  return {
    id: row.id,
    registrationNumber: row.registration_number,
    competitionSlug: row.competition_slug,
    competitionTitle: row.competition_title,
    entryType: row.entry_type,
    entrantName: row.entry_type === "individual" ? (row.students?.full_name ?? "—") : (row.teams?.team_name ?? "—"),
    teamMembers:
      row.entry_type === "team"
        ? (row.teams?.team_members ?? []).map((m) => m.students?.full_name).filter((n): n is string => Boolean(n))
        : undefined,
    status: row.status,
    submittedAt: row.submitted_at,
    paymentStatus: row.registration_payments?.status ?? null,
  };
}

const SELECT =
  "id, registration_number, competition_slug, competition_title, entry_type, status, submitted_at, students(full_name), teams(team_name, team_members(students(full_name))), registration_payments(status)";

// registration_payments (migration 0019) may not exist yet on a database
// that hasn't had it applied — the embedded-relationship select then fails
// outright (PostgREST can't resolve the FK to embed), not just drop one
// column, so every call here retries once without the join rather than
// probing a specific error code the way the pathway/image_url fallback
// does. Every caller gets paymentStatus: null until the migration runs.
const SELECT_PRE_0019 =
  "id, registration_number, competition_slug, competition_title, entry_type, status, submitted_at, students(full_name), teams(team_name, team_members(students(full_name)))";

async function runWithPaymentFallback(
  build: (select: string) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<Registration[]> {
  const first = await build(SELECT);
  if (!first.error && first.data) return (first.data as unknown as Row[]).map(toRegistration);

  const fallback = await build(SELECT_PRE_0019);
  if (fallback.error || !fallback.data) return [];
  return (fallback.data as unknown as Omit<Row, "registration_payments">[]).map((row) =>
    toRegistration({ ...row, registration_payments: null }),
  );
}

export async function listRegistrationsBySchool(supabase: SupabaseClient, schoolId: string): Promise<Registration[]> {
  return runWithPaymentFallback((select) =>
    supabase.from("registrations").select(select).eq("school_id", schoolId).order("submitted_at", { ascending: false }),
  );
}

export async function listRegistrationsByRegistrant(supabase: SupabaseClient, profileId: string): Promise<Registration[]> {
  return runWithPaymentFallback((select) =>
    supabase.from("registrations").select(select).eq("registered_by", profileId).order("submitted_at", { ascending: false }),
  );
}

/** Admin overview: every registration across every school/student, unscoped,
 * optionally narrowed to one competition. Filters on the competition_slug
 * snapshot column (registrations don't carry a real competition_id FK — see
 * 0004_school_dashboard_real_data.sql) rather than joining a live competition
 * row, so a competition's slug must stay stable once registrations exist
 * against it. */
export async function adminListAllRegistrations(
  admin: SupabaseClient,
  filters?: { competitionSlug?: string },
): Promise<Registration[]> {
  return runWithPaymentFallback((select) => {
    let query = admin.from("registrations").select(select).order("submitted_at", { ascending: false });
    if (filters?.competitionSlug) query = query.eq("competition_slug", filters.competitionSlug);
    return query;
  });
}

export interface InsertRegistrationInput {
  registrationNumber: string;
  competitionSlug: string;
  competitionTitle: string;
  category: string;
  entryType: "individual" | "team";
  studentId?: string;
  teamId?: string;
  schoolId: string | null;
  registeredBy: string;
}

export async function insertRegistration(
  supabase: SupabaseClient,
  input: InsertRegistrationInput,
): Promise<{ id: string | null; error: string | null }> {
  const id = crypto.randomUUID();
  const { error } = await supabase.from("registrations").insert({
    id,
    registration_number: input.registrationNumber,
    competition_slug: input.competitionSlug,
    competition_title: input.competitionTitle,
    category: input.category,
    entry_type: input.entryType,
    student_id: input.studentId ?? null,
    team_id: input.teamId ?? null,
    school_id: input.schoolId,
    registered_by: input.registeredBy,
    status: "pending",
  });

  if (error) return { id: null, error: error.message };
  return { id, error: null };
}

export async function insertConsentRecords(
  supabase: SupabaseClient,
  registrationId: string,
  registeredBy: string,
  consent: { terms: boolean; privacy: boolean; results: boolean; photo: boolean },
): Promise<void> {
  const now = new Date().toISOString();
  const typeMap: Record<string, "terms" | "privacy" | "result_publication" | "photo_publication"> = {
    terms: "terms",
    privacy: "privacy",
    results: "result_publication",
    photo: "photo_publication",
  };

  await supabase.from("consent_records").insert(
    Object.entries(consent).map(([key, accepted]) => ({
      registration_id: registrationId,
      type: typeMap[key],
      accepted,
      accepted_at: accepted ? now : null,
      accepted_by: registeredBy,
    })),
  );
}
