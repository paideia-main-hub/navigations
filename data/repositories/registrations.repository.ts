import type { SupabaseClient } from "@supabase/supabase-js";
import type { Registration, RegistrationStatus } from "@/domain/registrations/types";

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
  };
}

const SELECT =
  "id, registration_number, competition_slug, competition_title, entry_type, status, submitted_at, students(full_name), teams(team_name, team_members(students(full_name)))";

export async function listRegistrationsBySchool(supabase: SupabaseClient, schoolId: string): Promise<Registration[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select(SELECT)
    .eq("school_id", schoolId)
    .order("submitted_at", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as Row[]).map(toRegistration);
}

export async function listRegistrationsByRegistrant(supabase: SupabaseClient, profileId: string): Promise<Registration[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select(SELECT)
    .eq("registered_by", profileId)
    .order("submitted_at", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as Row[]).map(toRegistration);
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
  let query = admin.from("registrations").select(SELECT).order("submitted_at", { ascending: false });
  if (filters?.competitionSlug) query = query.eq("competition_slug", filters.competitionSlug);

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as unknown as Row[]).map(toRegistration);
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
