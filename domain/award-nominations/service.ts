import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/award-nominations.repository";
import type { AwardNomination, AwardNominationStatus } from "./types";

/** Same generation approach as generateRegistrationNumber in
 * domain/registrations/service.ts, with an FRL prefix (Future Ready League)
 * to keep the two number series visually distinct in exports/CSVs. */
export function generateNominationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FRL-${year}-${random}`;
}

export async function listMyNominations(supabase: SupabaseClient, profileId: string): Promise<AwardNomination[]> {
  return repo.listMyNominations(supabase, profileId);
}

export async function listSchoolNominations(supabase: SupabaseClient, schoolId: string): Promise<AwardNomination[]> {
  return repo.listSchoolNominations(supabase, schoolId);
}

export async function adminListNominations(admin: SupabaseClient, categoryId?: string): Promise<AwardNomination[]> {
  return repo.adminListNominations(admin, categoryId);
}

export async function listPublishedNominations(supabase: SupabaseClient): Promise<AwardNomination[]> {
  return repo.listPublishedNominations(supabase);
}

export async function getNominationById(supabase: SupabaseClient, id: string): Promise<AwardNomination | null> {
  return repo.getNominationById(supabase, id);
}

export async function updateNominationStatus(admin: SupabaseClient, id: string, status: AwardNominationStatus): Promise<{ error: string | null }> {
  return repo.updateNominationStatus(admin, id, status);
}

export async function listClarifications(supabase: SupabaseClient, nominationId: string) {
  return repo.listClarifications(supabase, nominationId);
}

export async function requestClarification(admin: SupabaseClient, nominationId: string, requestedBy: string, message: string): Promise<{ error: string | null }> {
  return repo.requestClarification(admin, nominationId, requestedBy, message);
}

export async function respondToClarification(supabase: SupabaseClient, clarificationId: string, responseText: string): Promise<{ error: string | null }> {
  return repo.respondToClarification(supabase, clarificationId, responseText);
}
