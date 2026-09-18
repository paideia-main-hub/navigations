import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/school-awards.repository";
import { adminListCategories } from "@/domain/awards/service";
import type { SchoolAwardResultRow } from "@/data/repositories/school-awards.repository";

/** Ranks one category's per-school values, writes them all, and marks every
 * school tied for the top value as a joint winner (spec: "Exact ties in the
 * calculated school awards receive joint recognition"). */
async function rankAndSave(admin: SupabaseClient, categoryId: string, values: { schoolId: string; value: number }[]): Promise<void> {
  if (values.length === 0) return;
  const sorted = [...values].sort((a, b) => b.value - a.value);
  const topValue = sorted[0].value;

  let rank = 1;
  let prevValue: number | null = null;
  for (const [i, entry] of sorted.entries()) {
    if (prevValue !== null && entry.value !== prevValue) rank = i + 1;
    prevValue = entry.value;
    await repo.upsertSchoolAwardResult(admin, {
      schoolId: entry.schoolId,
      categoryId,
      computedValue: entry.value,
      rank,
      isWinner: entry.value === topValue,
    });
  }
}

/** Recomputes the four formulaic School Awards (Champion, Excellence, Whole
 * School Participation, Diversified) from current registrations/results.
 * Collaboration & Integrity is untouched here — see setCollaborationScore. */
export async function recomputeSchoolAwards(admin: SupabaseClient): Promise<{ error: string | null; schoolsScored: number }> {
  const [inputs, categories] = await Promise.all([repo.computeSchoolFormulaInputs(admin), adminListCategories(admin)]);

  const bySlug = new Map(categories.filter((c) => c.layer === "school_award").map((c) => [c.slug, c.id]));

  const championId = bySlug.get("champion-school");
  const excellenceId = bySlug.get("school-excellence");
  const participationId = bySlug.get("whole-school-participation");
  const diversifiedId = bySlug.get("diversified-school");

  if (championId) await rankAndSave(admin, championId, inputs.map((i) => ({ schoolId: i.schoolId, value: repo.championPoints(i) })));
  if (excellenceId) await rankAndSave(admin, excellenceId, inputs.map((i) => ({ schoolId: i.schoolId, value: i.outstandingPerformerCount })));
  if (participationId) await rankAndSave(admin, participationId, inputs.map((i) => ({ schoolId: i.schoolId, value: i.participationCount })));
  if (diversifiedId) await rankAndSave(admin, diversifiedId, inputs.map((i) => ({ schoolId: i.schoolId, value: repo.diversifiedCoverage(i) })));

  return { error: null, schoolsScored: inputs.length };
}

export async function listResults(admin: SupabaseClient, categoryId?: string): Promise<SchoolAwardResultRow[]> {
  return repo.listSchoolAwardResults(admin, categoryId);
}

export async function publishResults(admin: SupabaseClient, categoryId: string): Promise<{ error: string | null }> {
  return repo.publishSchoolAwardResults(admin, categoryId);
}

export async function setCollaborationScore(admin: SupabaseClient, schoolId: string, categoryId: string, score: number): Promise<{ error: string | null }> {
  return repo.setCollaborationScore(admin, schoolId, categoryId, score);
}
