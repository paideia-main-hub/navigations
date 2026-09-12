import type { SupabaseClient } from "@supabase/supabase-js";
import { listJudgeAssignments as fetchAssignments, upsertScore, type UpsertScoreInput } from "@/data/repositories/judging.repository";
import type { JudgeAssignment } from "./types";

export async function listAssignments(supabase: SupabaseClient, profileId: string): Promise<JudgeAssignment[]> {
  return fetchAssignments(supabase, profileId);
}

export async function submitScore(supabase: SupabaseClient, input: UpsertScoreInput): Promise<{ error: string | null }> {
  return upsertScore(supabase, input);
}
