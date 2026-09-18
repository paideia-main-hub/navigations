import type { SupabaseClient } from "@supabase/supabase-js";
import type { AwardJudgeAssignment } from "@/domain/award-judging/types";

type CategoryRow = { slug: string; title: string; rubric_criteria: { key: string; label: string; weight: number }[] };
type AssignmentRow = { id: string; category_id: string; award_categories: CategoryRow | null };
type NominationRow = { id: string; nominee_name: string };
type ScoreRow = {
  nomination_id: string;
  criteria_scores: Record<string, number>;
  total_score: number | null;
  comments: string | null;
  locked: boolean;
};

/** Every nomination in every award category this judge has been granted
 * access to (see award_judge_assignments), joined with the category's fixed
 * rubric and any score already submitted — same shape as
 * data/repositories/judging.repository.ts's listJudgeAssignments for
 * competitions. */
export async function listAwardJudgeAssignments(supabase: SupabaseClient, profileId: string): Promise<AwardJudgeAssignment[]> {
  const { data: judge } = await supabase.from("judges").select("id").eq("profile_id", profileId).maybeSingle();
  if (!judge) return [];

  const { data: assignments } = await supabase
    .from("award_judge_assignments")
    .select("id, category_id, award_categories(slug, title, rubric_criteria)")
    .eq("judge_id", judge.id);
  if (!assignments || assignments.length === 0) return [];

  const perAssignment = await Promise.all(
    (assignments as unknown as AssignmentRow[]).map(async (assignment): Promise<AwardJudgeAssignment[]> => {
      const category = assignment.award_categories;
      if (!category) return [];

      const [{ data: nominations }, { data: scores }] = await Promise.all([
        supabase.from("award_nominations").select("id, nominee_name").eq("category_id", assignment.category_id),
        supabase.from("award_scores").select("nomination_id, criteria_scores, total_score, comments, locked").eq("award_judge_assignment_id", assignment.id),
      ]);

      const scoreByNomination = new Map(((scores ?? []) as unknown as ScoreRow[]).map((s) => [s.nomination_id, s]));

      return ((nominations ?? []) as unknown as NominationRow[]).map((nomination) => {
        const existing = scoreByNomination.get(nomination.id);
        return {
          id: nomination.id,
          nominationId: nomination.id,
          awardJudgeAssignmentId: assignment.id,
          categorySlug: category.slug,
          categoryTitle: category.title,
          nomineeName: nomination.nominee_name,
          criteria: category.rubric_criteria ?? [],
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

export interface UpsertAwardScoreInput {
  awardJudgeAssignmentId: string;
  nominationId: string;
  criteriaScores: Record<string, number>;
  totalScore: number;
  comments: string | null;
}

export async function upsertAwardScore(supabase: SupabaseClient, input: UpsertAwardScoreInput): Promise<{ error: string | null }> {
  const { data: existing } = await supabase
    .from("award_scores")
    .select("id, locked")
    .eq("award_judge_assignment_id", input.awardJudgeAssignmentId)
    .eq("nomination_id", input.nominationId)
    .maybeSingle();

  if (existing?.locked) return { error: "Scoring is locked for this nomination." };

  const row = {
    criteria_scores: input.criteriaScores,
    total_score: input.totalScore,
    comments: input.comments,
    submitted_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase.from("award_scores").update(row).eq("id", existing.id);
    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from("award_scores").insert({
    award_judge_assignment_id: input.awardJudgeAssignmentId,
    nomination_id: input.nominationId,
    ...row,
  });
  return { error: error?.message ?? null };
}

/** All scores recorded for one nomination, across every judge assigned to
 * its category — used to detect the 2-judge disagreement rule and to
 * average for the admin review panel. */
export async function listScoresForNomination(
  admin: SupabaseClient,
  nominationId: string,
): Promise<{ totalScore: number | null; comments: string | null; judgeName: string }[]> {
  const { data } = await admin
    .from("award_scores")
    .select("total_score, comments, award_judge_assignments(judges(profiles(full_name)))")
    .eq("nomination_id", nominationId);
  return (data ?? []).map((r) => {
    const row = r as unknown as { total_score: number | null; comments: string | null; award_judge_assignments: { judges: { profiles: { full_name: string } | null } | null } | null };
    return { totalScore: row.total_score, comments: row.comments, judgeName: row.award_judge_assignments?.judges?.profiles?.full_name ?? "—" };
  });
}

export async function listAllJudges(admin: SupabaseClient): Promise<{ id: string; fullName: string }[]> {
  const { data } = await admin.from("judges").select("id, profiles(full_name)");
  return (data ?? []).map((r) => {
    const row = r as unknown as { id: string; profiles: { full_name: string } | null };
    return { id: row.id, fullName: row.profiles?.full_name ?? "—" };
  });
}

export async function assignJudgeToCategory(admin: SupabaseClient, judgeId: string, categoryId: string): Promise<{ error: string | null }> {
  const { error } = await admin.from("award_judge_assignments").insert({ judge_id: judgeId, category_id: categoryId });
  return { error: error?.message ?? null };
}

export async function listJudgeAssignmentsForCategory(admin: SupabaseClient, categoryId: string): Promise<{ id: string; judgeId: string; judgeName: string }[]> {
  const { data } = await admin
    .from("award_judge_assignments")
    .select("id, judge_id, judges(profile_id, profiles(full_name))")
    .eq("category_id", categoryId);
  return (data ?? []).map((r) => {
    const row = r as unknown as { id: string; judge_id: string; judges: { profiles: { full_name: string } | null } | null };
    return { id: row.id, judgeId: row.judge_id, judgeName: row.judges?.profiles?.full_name ?? "—" };
  });
}
