import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminJudgeApplication,
  InterviewMode,
  JudgeApplication,
  JudgeApplicationStatus,
} from "@/domain/judge-applications/types";

type Row = {
  id: string;
  status: JudgeApplicationStatus;
  interview_mode: InterviewMode | null;
  interview_at: string | null;
  interview_location: string | null;
  admin_notes: string | null;
  created_at: string;
  competitions: { slug: string; title: string } | null;
};

function toApplication(row: Row): JudgeApplication {
  return {
    id: row.id,
    competitionSlug: row.competitions?.slug ?? "",
    competitionTitle: row.competitions?.title ?? "",
    status: row.status,
    interviewMode: row.interview_mode,
    interviewAt: row.interview_at,
    interviewLocation: row.interview_location,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
  };
}

const SELECT = "id, status, interview_mode, interview_at, interview_location, admin_notes, created_at, competitions(slug, title)";

export async function findJudgeByProfile(supabase: SupabaseClient, profileId: string): Promise<{ id: string } | null> {
  const { data, error } = await supabase.from("judges").select("id").eq("profile_id", profileId).maybeSingle();
  if (error || !data) return null;
  return { id: data.id as string };
}

export async function listMyApplications(supabase: SupabaseClient, judgeId: string): Promise<JudgeApplication[]> {
  const { data, error } = await supabase
    .from("judge_applications")
    .select(SELECT)
    .eq("judge_id", judgeId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as Row[]).map(toApplication);
}

export async function applyToCompetition(
  supabase: SupabaseClient,
  judgeId: string,
  competitionId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("judge_applications").insert({ judge_id: judgeId, competition_id: competitionId });
  if (error?.code === "23505") return { error: "You've already applied to judge this competition." };
  return { error: error?.message ?? null };
}

type AdminRow = Row & {
  judge_id: string;
  judges: { profile_id: string; profiles: { full_name: string; email: string } | null } | null;
};

export async function adminListApplications(admin: SupabaseClient): Promise<AdminJudgeApplication[]> {
  const { data, error } = await admin
    .from("judge_applications")
    .select(`${SELECT}, judge_id, judges(profile_id, profiles(full_name, email))`)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as AdminRow[]).map((row) => ({
    ...toApplication(row),
    judgeId: row.judge_id,
    judgeName: row.judges?.profiles?.full_name ?? "Unknown",
    judgeEmail: row.judges?.profiles?.email ?? null,
  }));
}

export async function adminGetApplicationById(
  admin: SupabaseClient,
  id: string,
): Promise<{ judgeId: string; competitionId: string } | null> {
  const { data, error } = await admin.from("judge_applications").select("judge_id, competition_id").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return { judgeId: data.judge_id as string, competitionId: data.competition_id as string };
}

export async function scheduleInterview(
  admin: SupabaseClient,
  id: string,
  input: { mode: InterviewMode; at: string; location: string },
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("judge_applications")
    .update({
      status: "interview_scheduled",
      interview_mode: input.mode,
      interview_at: input.at,
      interview_location: input.location,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function approveApplication(admin: SupabaseClient, id: string, reviewedBy: string | null): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("judge_applications")
    .update({ status: "approved", reviewed_by: reviewedBy, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function rejectApplication(
  admin: SupabaseClient,
  id: string,
  notes: string | null,
  reviewedBy: string | null,
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("judge_applications")
    .update({
      status: "rejected",
      admin_notes: notes,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

/** Grants real access — inserts the judge_assignments row an approval creates.
 * stage_id is left null: whole-competition access, per the confirmed scope
 * ("access to that competition... for all students"). Postgres treats NULL
 * as distinct in a unique constraint, so `unique(judge_id, competition_id,
 * stage_id)` would NOT stop a second null-stage row from being inserted —
 * check for an existing row first instead of relying on that constraint. */
export async function grantCompetitionAccess(
  admin: SupabaseClient,
  judgeId: string,
  competitionId: string,
): Promise<{ error: string | null }> {
  const { data: existing } = await admin
    .from("judge_assignments")
    .select("id")
    .eq("judge_id", judgeId)
    .eq("competition_id", competitionId)
    .is("stage_id", null)
    .maybeSingle();

  if (existing) return { error: null };

  const { error } = await admin.from("judge_assignments").insert({ judge_id: judgeId, competition_id: competitionId, stage_id: null });
  return { error: error?.message ?? null };
}
