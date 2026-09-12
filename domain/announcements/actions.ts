"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/data/supabase/admin";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import * as service from "./service";
import type { AnnouncementCategory } from "./types";

export type ActionState = { error: string | null; success?: boolean };

function revalidateAnnouncements(competitionSlug?: string) {
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  if (competitionSlug) revalidatePath(`/competitions/${competitionSlug}`);
}

function inputFromForm(formData: FormData) {
  return {
    competitionId: String(formData.get("competition_id") ?? "") || null,
    category: String(formData.get("category")) as AnnouncementCategory,
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    isImportant: formData.get("is_important") === "on",
  };
}

export async function createAnnouncementAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const { error } = await service.createAnnouncement(admin, inputFromForm(formData));
  if (error) return { error };
  revalidateAnnouncements(String(formData.get("competition_slug") ?? "") || undefined);
  return { error: null, success: true };
}

export async function updateAnnouncementAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("announcement_id"));
  const { error } = await service.updateAnnouncement(admin, id, inputFromForm(formData));
  if (error) return { error };
  revalidateAnnouncements(String(formData.get("competition_slug") ?? "") || undefined);
  return { error: null, success: true };
}

export async function expireAnnouncementAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("announcement_id"));
  const { error } = await service.expireAnnouncement(admin, id);
  if (error) return { error };
  revalidateAnnouncements();
  return { error: null, success: true };
}
