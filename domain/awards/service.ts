import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/awards.repository";
import type { AwardCategory, AwardCategoryStatus } from "./types";

export async function listCategories(supabase: SupabaseClient): Promise<AwardCategory[]> {
  return repo.getAllCategories(supabase);
}

export async function listOpenCategories(supabase: SupabaseClient): Promise<AwardCategory[]> {
  const all = await repo.getAllCategories(supabase);
  return all.filter((c) => c.status === "open" || c.status === "closed" || c.status === "archived");
}

/** Business rule: which award categories a student or coordinator can actually
 * put a nomination into. Competition Distinctions are derived from published
 * results and School Awards are computed from participation data — nobody
 * submits to either. Everything else is open to a nomination, with the
 * school-vs-independent check happening on the submission form rather than by
 * hiding the category here. */
export function isSubmittable(category: AwardCategory): boolean {
  return (
    category.status === "open" &&
    category.layer !== "competition_distinction" &&
    category.layer !== "school_award"
  );
}

export async function listSubmittableCategories(supabase: SupabaseClient): Promise<AwardCategory[]> {
  const all = await repo.getAllCategories(supabase);
  return all.filter(isSubmittable);
}

export async function getCategoryBySlug(supabase: SupabaseClient, slug: string): Promise<AwardCategory | null> {
  return repo.getCategoryBySlug(supabase, slug);
}

export async function adminListCategories(admin: SupabaseClient): Promise<AwardCategory[]> {
  return repo.adminListCategories(admin);
}

export async function adminGetCategoryById(admin: SupabaseClient, id: string): Promise<AwardCategory | null> {
  return repo.adminGetCategoryById(admin, id);
}

export const createCategory = repo.insertCategory;
export const updateCategory = repo.updateCategory;

export async function updateCategoryStatus(admin: SupabaseClient, id: string, status: AwardCategoryStatus): Promise<{ error: string | null }> {
  return repo.updateCategoryStatus(admin, id, status);
}

export const setAwardCategoryImageUrl = repo.setAwardCategoryImageUrl;

export type { AwardCategoryInput } from "@/data/repositories/awards.repository";
