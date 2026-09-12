import type { SupabaseClient } from "@supabase/supabase-js";
import type { ResultInfo } from "@/domain/results/types";

/** Only published results are ever returned — the results table stays empty
 * until an admin approves & publishes, which is a future (admin CMS) build. */
export async function listPublishedResultsForRegistrations(
  supabase: SupabaseClient,
  registrationIds: string[],
): Promise<Map<string, ResultInfo>> {
  if (registrationIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("results")
    .select("registration_id, award, custom_award_label, score")
    .in("registration_id", registrationIds)
    .eq("is_published", true);

  const map = new Map<string, ResultInfo>();
  if (error || !data) return map;

  for (const row of data) {
    map.set(row.registration_id, {
      registrationId: row.registration_id,
      award: row.award,
      customAwardLabel: row.custom_award_label,
      score: row.score,
    });
  }
  return map;
}
