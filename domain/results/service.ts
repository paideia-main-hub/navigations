import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/results.repository";
import type { AwardType } from "@/domain/competitions/types";
import type { ComputedWinner, DraftResultRow, ResultInfo } from "./types";

export async function getPublishedResultsFor(supabase: SupabaseClient, registrationIds: string[]): Promise<Map<string, ResultInfo>> {
  return repo.listPublishedResultsForRegistrations(supabase, registrationIds);
}

export async function listPublishedComputedWinners(supabase: SupabaseClient): Promise<ComputedWinner[]> {
  return repo.listPublishedComputedWinners(supabase);
}

// ---------------------------------------------------------------------------
// Admin functions — take the service-role client (createAdminClient()).
// Callers (domain/results/actions.ts) are responsible for the admin session
// check before calling any of these.
// ---------------------------------------------------------------------------

export async function generateDraftResults(admin: SupabaseClient, competitionId: string): Promise<{ error: string | null; count: number }> {
  return repo.generateDraftResults(admin, competitionId);
}

export async function listResultsForAdmin(admin: SupabaseClient, competitionId: string): Promise<DraftResultRow[]> {
  return repo.listResultsForAdmin(admin, competitionId);
}

export async function overrideAward(
  admin: SupabaseClient,
  resultId: string,
  award: AwardType,
  customAwardLabel: string | null,
): Promise<{ error: string | null }> {
  return repo.updateResultAward(admin, resultId, award, customAwardLabel);
}

export async function setWinnerPhoto(admin: SupabaseClient, resultId: string, photoUrl: string): Promise<{ error: string | null }> {
  return repo.setWinnerPhoto(admin, resultId, photoUrl);
}

export async function publishSelected(
  admin: SupabaseClient,
  resultIds: string[],
  approvedBy: string | null,
): Promise<{ published: string[]; skipped: { resultId: string; reason: string }[] }> {
  return repo.publishResults(admin, resultIds, approvedBy);
}

export async function unpublish(admin: SupabaseClient, resultId: string): Promise<{ error: string | null }> {
  return repo.unpublishResult(admin, resultId);
}
