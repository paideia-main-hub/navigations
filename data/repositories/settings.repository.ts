import type { SupabaseClient } from "@supabase/supabase-js";
import { type SiteSettings, defaultSiteSettings } from "@/domain/settings/types";

type SiteSettingsRow = {
  id: number;
  hide_download_manuals: boolean;
  updated_at: string;
};

export async function getSiteSettings(supabase: SupabaseClient): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("hide_download_manuals, updated_at")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) {
      return defaultSiteSettings;
    }

    const row = data as SiteSettingsRow;
    return {
      hideDownloadManuals: Boolean(row.hide_download_manuals),
      updatedAt: row.updated_at,
    };
  } catch {
    return defaultSiteSettings;
  }
}

export async function saveSiteSettings(
  admin: SupabaseClient,
  settings: Partial<SiteSettings>,
): Promise<{ error: string | null }> {
  try {
    const updatePayload: Record<string, unknown> = {
      id: 1,
      updated_at: new Date().toISOString(),
    };

    if (typeof settings.hideDownloadManuals === "boolean") {
      updatePayload.hide_download_manuals = settings.hideDownloadManuals;
    }

    const { error } = await admin
      .from("site_settings")
      .upsert(updatePayload, { onConflict: "id" });

    if (error) {
      if (
        error.code === "PGRST205" ||
        error.code === "42P01" ||
        error.message?.includes("not find the table")
      ) {
        return {
          error:
            "Table 'site_settings' does not exist in Supabase yet. Please run migration 0038_site_settings.sql in your Supabase SQL Editor.",
        };
      }
      return { error: error.message };
    }

    return { error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: message };
  }
}
