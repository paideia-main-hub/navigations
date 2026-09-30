import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/appreciations.repository";

export async function listAppreciations(supabase: SupabaseClient) {
  return repo.listAppreciations(supabase);
}

export const createAppreciation = repo.insertAppreciation;
export const updateAppreciation = repo.updateAppreciation;
export const deleteAppreciation = repo.deleteAppreciation;

export type { AppreciationInput } from "@/data/repositories/appreciations.repository";
