import type { SupabaseClient } from "@supabase/supabase-js";
import { effectiveHasOnlineSubmission } from "@/domain/competitions/pathwayDateRules";
import type { CompetitionPathway } from "@/domain/competitions/types";
import { SUBMISSION_SLUGS, type SubmissionFile, type SubmissionStatus, type WorkSubmission } from "@/domain/submissions/config";

type Row = {
  id: string;
  registration_id: string;
  competition_slug: string;
  answers: Record<string, string> | null;
  files: Record<string, SubmissionFile> | null;
  status: SubmissionStatus;
  submitted_at: string | null;
  scores: Record<string, number> | null;
  total_score: number | null;
  max_score: number | null;
  feedback: string | null;
  reviewed_at: string | null;
};

const COLUMNS =
  "id, registration_id, competition_slug, answers, files, status, submitted_at, scores, total_score, max_score, feedback, reviewed_at";

function toSubmission(row: Row): WorkSubmission {
  return {
    id: row.id,
    registrationId: row.registration_id,
    competitionSlug: row.competition_slug,
    answers: row.answers ?? {},
    files: row.files ?? {},
    status: row.status,
    submittedAt: row.submitted_at,
    scores: row.scores ?? {},
    totalScore: row.total_score === null ? null : Number(row.total_score),
    maxScore: row.max_score === null ? null : Number(row.max_score),
    feedback: row.feedback,
    reviewedAt: row.reviewed_at,
  };
}

/** A registration a student can hand work in for. */
export interface SubmittableRegistration {
  registrationId: string;
  registrationNumber: string;
  competitionSlug: string;
  competitionTitle: string;
  entryType: "individual" | "team";
  entrantName: string;
}

/** Competitions whose admin "online submission" setting is on.
 * Independent Submission is always on. If the column cannot be read, the
 * three competitions that already have a form stay available. */
export async function listOnlineSubmissionCompetitions(
  supabase: SupabaseClient,
): Promise<{ slug: string; pathway: CompetitionPathway | null }[]> {
  const { data, error } = await supabase.from("competitions").select("slug, pathway, has_online_submission");
  if (error || !data) {
    return SUBMISSION_SLUGS.map((slug) => ({ slug, pathway: "independent_submission" as const }));
  }
  return (data as { slug: string; pathway: CompetitionPathway | null; has_online_submission: boolean | null }[])
    .filter((row) => effectiveHasOnlineSubmission(row.pathway, Boolean(row.has_online_submission)))
    .map((row) => ({ slug: row.slug, pathway: row.pathway }));
}

/** The student's own registrations in the given competitions — ones they made
 * themselves or that a school made for them. Filtered explicitly rather than
 * relying on RLS alone, because published results make other students'
 * registrations publicly readable too. */
export async function listOwnRegistrationsIn(
  supabase: SupabaseClient,
  profileId: string,
  studentId: string | null,
  slugs: string[],
): Promise<SubmittableRegistration[]> {
  if (slugs.length === 0) return [];
  const owner = studentId ? `registered_by.eq.${profileId},student_id.eq.${studentId}` : `registered_by.eq.${profileId}`;
  const { data, error } = await supabase
    .from("registrations")
    .select("id, registration_number, competition_slug, competition_title, entry_type, status, students(full_name), teams(team_name)")
    .in("competition_slug", slugs)
    .neq("status", "rejected")
    .or(owner)
    .order("submitted_at", { ascending: false });
  if (error || !data) return [];
  return (
    data as unknown as {
      id: string;
      registration_number: string;
      competition_slug: string;
      competition_title: string;
      entry_type: "individual" | "team";
      students: { full_name: string } | null;
      teams: { team_name: string } | null;
    }[]
  ).map((r) => ({
    registrationId: r.id,
    registrationNumber: r.registration_number,
    competitionSlug: r.competition_slug,
    competitionTitle: r.competition_title,
    entryType: r.entry_type,
    entrantName: r.entry_type === "team" ? (r.teams?.team_name ?? "Team") : (r.students?.full_name ?? ""),
  }));
}

export async function listSubmissionsForRegistrations(supabase: SupabaseClient, registrationIds: string[]): Promise<WorkSubmission[]> {
  if (registrationIds.length === 0) return [];
  const { data, error } = await supabase.from("work_submissions").select(COLUMNS).in("registration_id", registrationIds);
  if (error || !data) return [];
  return (data as Row[]).map(toSubmission);
}

export async function getSubmissionForRegistration(supabase: SupabaseClient, registrationId: string): Promise<WorkSubmission | null> {
  const { data, error } = await supabase.from("work_submissions").select(COLUMNS).eq("registration_id", registrationId).maybeSingle();
  if (error || !data) return null;
  return toSubmission(data as Row);
}

export async function upsertOwnSubmission(
  supabase: SupabaseClient,
  input: {
    registrationId: string;
    competitionSlug: string;
    submittedBy: string;
    answers: Record<string, string>;
    files: Record<string, SubmissionFile>;
    status: "draft" | "submitted";
  },
): Promise<{ error: string | null }> {
  const now = new Date().toISOString();
  const { error } = await supabase.from("work_submissions").upsert(
    {
      registration_id: input.registrationId,
      competition_slug: input.competitionSlug,
      submitted_by: input.submittedBy,
      answers: input.answers,
      files: input.files,
      status: input.status,
      submitted_at: input.status === "submitted" ? now : null,
      updated_at: now,
    },
    { onConflict: "registration_id" },
  );
  return { error: error?.message ?? null };
}

// --- Admin (service-role client) --------------------------------------------

export interface AdminSubmissionRow extends WorkSubmission {
  registrationNumber: string;
  entrantName: string;
  entryType: "individual" | "team";
  frlId: string | null;
  grade: string | null;
  schoolName: string | null;
  category: string;
}

type AdminRow = Row & {
  registrations: {
    registration_number: string;
    entry_type: "individual" | "team";
    category: string;
    students: { full_name: string; frl_id?: string | null; grade: string | null; school_name_input: string | null; schools: { official_name: string } | null } | null;
    teams: { team_name: string } | null;
    schools: { official_name: string } | null;
  } | null;
};

const ADMIN_SELECT = `${COLUMNS}, registrations(registration_number, entry_type, category, students(*, schools(official_name)), teams(team_name), schools(official_name))`;

function toAdminRow(row: AdminRow): AdminSubmissionRow {
  const reg = row.registrations;
  const student = reg?.students ?? null;
  return {
    ...toSubmission(row),
    registrationNumber: reg?.registration_number ?? "—",
    entryType: reg?.entry_type ?? "individual",
    entrantName: reg?.entry_type === "team" ? (reg?.teams?.team_name ?? "Team") : (student?.full_name ?? "—"),
    frlId: student?.frl_id ?? null,
    grade: student?.grade ?? null,
    schoolName: reg?.schools?.official_name ?? student?.schools?.official_name ?? student?.school_name_input ?? null,
    category: reg?.category ?? "",
  };
}

export async function adminListSubmissions(admin: SupabaseClient): Promise<AdminSubmissionRow[]> {
  const { data, error } = await admin
    .from("work_submissions")
    .select(ADMIN_SELECT)
    .neq("status", "draft")
    .order("submitted_at", { ascending: true });
  if (error || !data) return [];
  return (data as unknown as AdminRow[]).map(toAdminRow);
}

export async function adminGetSubmission(admin: SupabaseClient, id: string): Promise<AdminSubmissionRow | null> {
  const { data, error } = await admin.from("work_submissions").select(ADMIN_SELECT).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return toAdminRow(data as unknown as AdminRow);
}

export async function adminScoreSubmission(
  admin: SupabaseClient,
  id: string,
  input: { scores: Record<string, number>; totalScore: number; maxScore: number; feedback: string | null; reviewedBy: string | null },
): Promise<{ error: string | null }> {
  const now = new Date().toISOString();
  const { error } = await admin
    .from("work_submissions")
    .update({
      scores: input.scores,
      total_score: input.totalScore,
      max_score: input.maxScore,
      feedback: input.feedback,
      status: "scored",
      reviewed_by: input.reviewedBy,
      reviewed_at: now,
      updated_at: now,
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}
