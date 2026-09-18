import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/award-nominations.repository";
import { adminGetCategoryById } from "@/domain/awards/service";
import type { UserRole } from "@/domain/auth/session";
import type { AwardCategory } from "@/domain/awards/types";
import type { AwardNomination, AwardNominationStatus } from "./types";

/** Who can actually submit a nomination for a category — the single source
 * of truth the dashboard's category picker, the per-category submission
 * page, and (implicitly, via RLS) the server both rely on.
 * Competition Distinctions and School Awards are computed, never submitted,
 * regardless of role. Schools can submit to every other category; a
 * student/independent nominator only where the category explicitly allows
 * an independent submission (Idea of the Year, Story of the Year, Young
 * Changemaker). */
export function canRoleNominate(category: AwardCategory, role: UserRole): boolean {
  if (category.layer === "competition_distinction" || category.layer === "school_award") return false;
  if (role === "school_coordinator") return true;
  if (role === "student" || role === "nominator") return category.allowsIndependent;
  return false;
}

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

/** Saves an admin's direct score against a nomination's fixed rubric, then
 * immediately re-ranks its whole category so winners reflect the new score
 * — the "winners calculated automatically after the grades are submitted"
 * behavior, no separate "generate standings" step required. */
export async function submitAdminScoreAndRecompute(
  admin: SupabaseClient,
  nominationId: string,
  categoryId: string,
  criteriaScores: Record<string, number>,
  totalScore: number,
): Promise<{ error: string | null }> {
  const { error: scoreError } = await repo.submitAdminScore(admin, nominationId, criteriaScores, totalScore);
  if (scoreError) return { error: scoreError };

  const category = await adminGetCategoryById(admin, categoryId);
  if (!category) return { error: null }; // scored fine; nothing to rank against if the category vanished

  return repo.recomputeCategoryWinners(admin, categoryId, category.passThreshold, category.tieBreakOrder, category.maxWinners);
}

export async function setWinnerPhoto(admin: SupabaseClient, nominationId: string, photoUrl: string): Promise<{ error: string | null }> {
  return repo.setWinnerPhoto(admin, nominationId, photoUrl);
}
