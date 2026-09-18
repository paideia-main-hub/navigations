import type { SupabaseClient } from "@supabase/supabase-js";
import type { JudgeAssignment } from "@/domain/judging/types";

type RubricRow = { stage_id: string | null; criteria: { name: string; weight: number }[] };
type AssignmentRow = {
  id: string;
  competitions: { slug: string; title: string; rubrics: RubricRow[] } | null;
};
type RegistrationRow = {
  id: string;
  entry_type: "individual" | "team";
  students: { full_name: string } | null;
  teams: { team_name: string } | null;
};
type ScoreRow = {
  registration_id: string;
  criteria_scores: Record<string, number>;
  total_score: number | null;
  comments: string | null;
  locked: boolean;
};

/** Every registration in every competition this judge (by profile id) has
 * been granted access to, joined with the competition's public rubric and
 * any score already submitted. One judge_assignments row (whole-competition
 * access, stage_id null) fans out into one list entry per registration. */
export async function listJudgeAssignments(supabase: SupabaseClient, profileId: string): Promise<JudgeAssignment[]> {
  const { data: judge } = await supabase.from("judges").select("id").eq("profile_id", profileId).maybeSingle();
  if (!judge) return [];

  const { data: assignments } = await supabase
    .from("judge_assignments")
    .select("id, competitions(slug, title, rubrics(stage_id, criteria))")
    .eq("judge_id", judge.id);
  if (!assignments || assignments.length === 0) return [];

  const perAssignment = await Promise.all(
    (assignments as unknown as AssignmentRow[]).map(async (assignment): Promise<JudgeAssignment[]> => {
      const competition = assignment.competitions;
      if (!competition) return [];

      const rubric = competition.rubrics.find((r) => r.stage_id === null) ?? competition.rubrics[0];
      const criteria = rubric?.criteria ?? [];

      const [{ data: registrations }, { data: scores }] = await Promise.all([
        supabase
          .from("registrations")
          .select("id, entry_type, students(full_name), teams(team_name)")
          .eq("competition_slug", competition.slug),
        supabase
          .from("scores")
          .select("registration_id, criteria_scores, total_score, comments, locked")
          .eq("judge_assignment_id", assignment.id),
      ]);

      const scoreByRegistration = new Map(((scores ?? []) as unknown as ScoreRow[]).map((s) => [s.registration_id, s]));

      return ((registrations ?? []) as unknown as RegistrationRow[]).map((registration) => {
        const existing = scoreByRegistration.get(registration.id);
        return {
          id: registration.id,
          registrationId: registration.id,
          judgeAssignmentId: assignment.id,
          competitionSlug: competition.slug,
          competitionTitle: competition.title,
          stageTitle: "Competition-wide",
          entrantName:
            registration.entry_type === "individual"
              ? (registration.students?.full_name ?? "—")
              : (registration.teams?.team_name ?? "—"),
          criteria,
          criteriaScores: existing?.criteria_scores ?? {},
          comments: existing?.comments ?? null,
          status: existing?.total_score != null ? "scored" : ("pending" as const),
          totalScore: existing?.total_score ?? undefined,
          locked: existing?.locked ?? false,
        };
      });
    }),
  );

  return perAssignment.flat();
}

export interface UpsertScoreInput {
  judgeAssignmentId: string;
  registrationId: string;
  criteriaScores: Record<string, number>;
  totalScore: number;
  comments: string | null;
}

export async function upsertScore(supabase: SupabaseClient, input: UpsertScoreInput): Promise<{ error: string | null }> {
  const { data: existing } = await supabase
    .from("scores")
    .select("id, locked")
    .eq("judge_assignment_id", input.judgeAssignmentId)
    .eq("registration_id", input.registrationId)
    .maybeSingle();

  if (existing?.locked) return { error: "Scoring is locked for this entrant." };

  const row = {
    criteria_scores: input.criteriaScores,
    total_score: input.totalScore,
    comments: input.comments,
    submitted_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase.from("scores").update(row).eq("id", existing.id);
    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from("scores").insert({
    judge_assignment_id: input.judgeAssignmentId,
    registration_id: input.registrationId,
    ...row,
  });
  return { error: error?.message ?? null };
}
