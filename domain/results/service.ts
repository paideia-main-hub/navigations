import type { SupabaseClient } from "@supabase/supabase-js";
import { listPublishedResultsForRegistrations } from "@/data/repositories/results.repository";
import type { ResultInfo } from "./types";

export async function getPublishedResultsFor(
  supabase: SupabaseClient,
  registrationIds: string[],
): Promise<Map<string, ResultInfo>> {
  return listPublishedResultsForRegistrations(supabase, registrationIds);
}
