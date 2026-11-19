"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/data/supabase/admin";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import { saveSiteSettings } from "./service";

export type ToggleManualsState = {
  error: string | null;
  saved: boolean;
  hideDownloadManuals: boolean;
};

export async function toggleHideDownloadManualsAction(
  _prev: ToggleManualsState,
  formData: FormData,
): Promise<ToggleManualsState> {
  await requireAdminSession();

  const hideDownloadManuals = formData.get("hide_download_manuals") === "true";
  const admin = createAdminClient();

  const { error } = await saveSiteSettings(admin, { hideDownloadManuals });
  if (error) {
    return {
      error,
      saved: false,
      hideDownloadManuals: !hideDownloadManuals,
    };
  }

  // Clear caches across public and admin pages
  revalidatePath("/admin");
  revalidatePath("/manuals");
  revalidatePath("/competitions/[slug]", "page");
  revalidatePath("/", "layout");

  return {
    error: null,
    saved: true,
    hideDownloadManuals,
  };
}
