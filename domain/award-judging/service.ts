import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/award-judging.repository";
import { updateNominationStatus } from "@/domain/award-nominations/service";
import { DISAGREEMENT_THRESHOLD_POINTS, type AwardJudgeAssignment } from "./types";
import type { UpsertAwardScoreInput } from "@/data/repositories/award-judging.repository";

export async function listAssignments(supabase: SupabaseClient, profileId: string): Promise<AwardJudgeAssignment[]> {
  return repo.listAwardJudgeAssignments(supabase, profileId);
}

/** Submits a judge's score, then applies the "additional review where scores
 * differ substantially" rule from the spec: once at least two judges have
 * scored the same nomination, if their total scores differ by more than
 * DISAGREEMENT_THRESHOLD_POINTS, the nomination is flagged needs_third_review
 * instead of judged, for an admin/third judge to resolve. */
export async function submitScore(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  input: UpsertAwardScoreInput,
): Promise<{ error: string | null }> {
  const { error } = await repo.upsertAwardScore(supabase, input);
  if (error) return { error };

  const scores = await repo.listScoresForNomination(admin, input.nominationId);
  const totals = scores.map((s) => s.totalScore).filter((s): s is number => s != null);

  if (totals.length >= 2) {
    const spread = Math.max(...totals) - Math.min(...totals);
    if (spread > DISAGREEMENT_THRESHOLD_POINTS) {
      await updateNominationStatus(admin, input.nominationId, "needs_third_review");
    } else {
      await updateNominationStatus(admin, input.nominationId, "judged");
    }
  }

  return { error: null };
}

export async function assignJudgeToCategory(admin: SupabaseClient, judgeId: string, categoryId: string): Promise<{ error: string | null }> {
  return repo.assignJudgeToCategory(admin, judgeId, categoryId);
}

export async function listAllJudges(admin: SupabaseClient) {
  return repo.listAllJudges(admin);
}

export async function listScoresForNomination(admin: SupabaseClient, nominationId: string) {
  return repo.listScoresForNomination(admin, nominationId);
}

export async function listJudgeAssignmentsForCategory(admin: SupabaseClient, categoryId: string) {
  return repo.listJudgeAssignmentsForCategory(admin, categoryId);
}
