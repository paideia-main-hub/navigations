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

export type { AwardCategoryInput } from "@/data/repositories/awards.repository";
