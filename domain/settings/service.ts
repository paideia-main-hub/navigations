import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/settings.repository";
import type { SiteSettings } from "./types";

export async function getSiteSettings(supabase: SupabaseClient): Promise<SiteSettings> {
  return repo.getSiteSettings(supabase);
}

export async function saveSiteSettings(
  admin: SupabaseClient,
  settings: Partial<SiteSettings>,
): Promise<{ error: string | null }> {
  return repo.saveSiteSettings(admin, settings);
}

export { defaultSiteSettings } from "./types";
export type { SiteSettings } from "./types";
