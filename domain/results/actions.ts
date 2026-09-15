"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/data/supabase/admin";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import { uploadFile } from "@/domain/storage/actions";
import type { AwardType } from "@/domain/competitions/types";
import * as service from "./service";

export type ActionState = { error: string | null; success?: boolean; message?: string | null };

function revalidatePublicResults(competitionSlug?: string) {
  revalidatePath("/admin/results");
  revalidatePath("/");
  revalidatePath("/results");
  revalidatePath("/dashboard");
  if (competitionSlug) revalidatePath(`/competitions/${competitionSlug}`);
}

export async function generateResultsAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const competitionId = String(formData.get("competition_id"));

  const { error, count } = await service.generateDraftResults(admin, competitionId);
  if (error) return { error };

  revalidatePath("/admin/results");
  return {
    error: null,
    success: true,
    message: count === 0 ? "No scored entrants yet — nothing to rank." : `Computed standings for ${count} entrant(s).`,
  };
}

export async function overrideAwardAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const resultId = String(formData.get("result_id"));
  const award = String(formData.get("award")) as AwardType;
  const customAwardLabel = String(formData.get("custom_award_label") ?? "") || null;

  const { error } = await service.overrideAward(admin, resultId, award, customAwardLabel);
  if (error) return { error };
  revalidatePath("/admin/results");
  return { error: null, success: true };
}

export async function uploadWinnerPhotoAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const resultId = String(formData.get("result_id"));
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose a photo to upload." };

  const { url, error: uploadError } = await uploadFile("winner-photos", file, resultId);
  if (uploadError || !url) return { error: uploadError ?? "Upload failed." };

  const { error } = await service.setWinnerPhoto(admin, resultId, url);
  if (error) return { error };
  revalidatePath("/admin/results");
  return { error: null, success: true };
}

export async function publishResultsAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const resultIds = formData.getAll("result_id").map(String);
  const competitionSlug = String(formData.get("competition_slug") ?? "") || undefined;
  if (resultIds.length === 0) return { error: "Select at least one row to publish." };

  // approved_by is a FK to profiles(id) — the hardcoded admin login has no
  // Supabase Auth identity/profile row, so there's nothing valid to store
  // here (left null, same treatment as judge_applications.reviewed_by).
  const { published, skipped } = await service.publishSelected(admin, resultIds, null);

  revalidatePublicResults(competitionSlug);
  return {
    error: null,
    success: published.length > 0,
    message:
      skipped.length > 0
        ? `Published ${published.length}. Skipped ${skipped.length} — missing result-publication consent.`
        : `Published ${published.length} result(s).`,
  };
}

export async function unpublishResultAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const resultId = String(formData.get("result_id"));
  const competitionSlug = String(formData.get("competition_slug") ?? "") || undefined;

  const { error } = await service.unpublish(admin, resultId);
  if (error) return { error };
  revalidatePublicResults(competitionSlug);
  return { error: null, success: true };
}
