"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/data/supabase/admin";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import * as service from "./service";
import type { AnnouncementCategory } from "./types";

export type ActionState = { error: string | null; success?: boolean };

function revalidateAnnouncements(competitionSlug?: string) {
  revalidatePath("/");
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  if (competitionSlug) revalidatePath(`/competitions/${competitionSlug}`);
}

function fieldsFromForm(formData: FormData) {
  return {
    competitionId: String(formData.get("competition_id") ?? "") || null,
    category: String(formData.get("category")) as AnnouncementCategory,
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    isImportant: formData.get("is_important") === "on",
    publishDate: publishDateFromForm(String(formData.get("publish_date") ?? "")),
  };
}

function inputFromForm(formData: FormData): { error: string; input?: undefined } | { error: null; input: service.AnnouncementInput } {
  const fields = fieldsFromForm(formData);
  if (!fields.publishDate) return { error: "Enter the date to show with this announcement." };
  return { error: null, input: { ...fields, publishDate: fields.publishDate } };
}

/** The public site formats this instant in the visitor's timezone. Noon UTC
 * keeps the calendar day the admin picked. */
function publishDateFromForm(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export async function createAnnouncementAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const parsed = inputFromForm(formData);
  if (parsed.error !== null) return { error: parsed.error };
  const admin = createAdminClient();
  const { error } = await service.createAnnouncement(admin, parsed.input);
  if (error) return { error };
  revalidateAnnouncements(String(formData.get("competition_slug") ?? "") || undefined);
  return { error: null, success: true };
}

export async function updateAnnouncementAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const parsed = inputFromForm(formData);
  if (parsed.error !== null) return { error: parsed.error };
  const admin = createAdminClient();
  const id = String(formData.get("announcement_id"));
  const { error } = await service.updateAnnouncement(admin, id, parsed.input);
  if (error) return { error };
  revalidateAnnouncements(String(formData.get("competition_slug") ?? "") || undefined);
  return { error: null, success: true };
}

export async function setAnnouncementStatusAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("announcement_id"));
  const status = String(formData.get("status"));
  if (status !== "published" && status !== "expired") return { error: "Choose published or expired." };
  const { error } = await service.setAnnouncementStatus(admin, id, status);
  if (error) return { error };
  revalidateAnnouncements(String(formData.get("competition_slug") ?? "") || undefined);
  return { error: null, success: true };
}
