"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";
import { getCurrentUser } from "@/domain/auth/session";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import { uploadEvidenceFile, uploadFile } from "@/domain/storage/actions";
import * as repo from "@/data/repositories/award-nominations.repository";
import { generateNominationNumber, submitAdminScoreAndRecompute, setWinnerPhoto } from "./service";
import type { AwardEventRecord, AwardRoute } from "./types";

export type ActionState = { error: string | null; success?: boolean; nominationNumber?: string };

/** Same repeatable-row parser as domain/competitions/actions.ts and
 * domain/awards/actions.ts — name="event[0][sport]" etc. */
function collectIndexed(formData: FormData, prefix: string): Record<string, string>[] {
  const rows: Record<number, Record<string, string>> = {};
  const pattern = new RegExp(`^${prefix}\\[(\\d+)\\]\\[(\\w+)\\]$`);
  for (const [key, value] of formData.entries()) {
    const match = key.match(pattern);
    if (!match) continue;
    const idx = Number(match[1]);
    const field = match[2];
    rows[idx] ??= {};
    rows[idx][field] = String(value);
  }
  return Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b)
    .map((i) => rows[i]);
}

function parseEventRecords(formData: FormData): Omit<AwardEventRecord, "id">[] {
  return collectIndexed(formData, "event")
    .filter((r) => r.sport?.trim())
    .map((r, i) => ({
      sport: r.sport.trim(),
      event: r.event ?? "",
      organizer: r.organizer ?? "",
      level: r.level ?? "",
      role: r.role ?? "",
      result: r.result ?? "",
      evidenceNote: r.evidence_note ?? "",
      orderIndex: i,
    }));
}

/** Every "field_*" input becomes one entry in the nomination's form_data
 * jsonb blob — this is what lets one nomination table serve nine very
 * differently-shaped category forms without a column per field. */
function parseFormData(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("field_")) result[key.slice("field_".length)] = String(value);
  }
  return result;
}

export async function submitNominationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in to submit a nomination." };

  const supabase = await createClient();

  const categoryId = String(formData.get("category_id") ?? "");
  if (!categoryId) return { error: "Missing award category." };

  const nominationNumber = generateNominationNumber();
  const routeRaw = String(formData.get("route") ?? "");

  const { id: nominationId, error } = await repo.insertNomination(supabase, {
    nominationNumber,
    categoryId,
    nominatorProfileId: user.id,
    schoolId: String(formData.get("school_id") ?? "") || null,
    nomineeName: String(formData.get("nominee_name") ?? "").trim(),
    nomineeRelationship: String(formData.get("nominee_relationship") ?? "") || null,
    route: (routeRaw as AwardRoute) || null,
    formData: parseFormData(formData),
    verifierName: String(formData.get("verifier_name") ?? "") || null,
    verifierContact: String(formData.get("verifier_contact") ?? "") || null,
    consent: {
      terms: formData.get("consent_terms") === "on",
      privacy: formData.get("consent_privacy") === "on",
      resultPublication: formData.get("consent_result_publication") === "on",
      photoPublication: formData.get("consent_photo_publication") === "on",
    },
  });

  if (error || !nominationId) return { error: error ?? "Failed to submit nomination." };

  const eventRecords = parseEventRecords(formData);
  if (eventRecords.length > 0) {
    await repo.insertEventRecords(supabase, nominationId, eventRecords);
  }

  const files = formData.getAll("evidence_files").filter((f): f is File => f instanceof File && f.size > 0);
  for (const file of files) {
    const { path, error: uploadError } = await uploadEvidenceFile(file, nominationId);
    if (uploadError || !path) continue; // best-effort: a single failed upload shouldn't fail the whole submission
    const fileType = file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : "link";
    await repo.insertEvidenceFile(supabase, nominationId, { fileType, fileUrl: path, sizeBytes: file.size, pageCount: null });
  }

  const evidenceLink = String(formData.get("evidence_link") ?? "").trim();
  if (evidenceLink) {
    await repo.insertEvidenceFile(supabase, nominationId, { fileType: "link", fileUrl: evidenceLink, sizeBytes: null, pageCount: null });
  }

  revalidatePath("/dashboard");
  return { error: null, success: true, nominationNumber };
}

// ---------------------------------------------------------------------------
// Admin review
// ---------------------------------------------------------------------------

function revalidateAdminReview() {
  revalidatePath("/admin/nominations");
  revalidatePath("/awards/results");
  revalidatePath("/dashboard");
}

export async function approveNominationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const { error } = await repo.updateNominationStatus(admin, String(formData.get("nomination_id")), "approved");
  if (error) return { error };
  revalidateAdminReview();
  return { error: null, success: true };
}

export async function rejectNominationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const { error } = await repo.updateNominationStatus(admin, String(formData.get("nomination_id")), "rejected");
  if (error) return { error };
  revalidateAdminReview();
  return { error: null, success: true };
}

export async function publishNominationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const { error } = await repo.updateNominationStatus(admin, String(formData.get("nomination_id")), "published");
  if (error) return { error };
  revalidateAdminReview();
  return { error: null, success: true };
}

export async function requestClarificationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireAdminSession();
  const admin = createAdminClient();
  const message = String(formData.get("message") ?? "").trim();
  if (!message) return { error: "Enter a message for the nominator." };

  const { error } = await repo.requestClarification(admin, String(formData.get("nomination_id")), session.id, message);
  if (error) return { error };
  revalidateAdminReview();
  return { error: null, success: true };
}

export async function respondToClarificationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authorized." };

  const supabase = await createClient();
  const responseText = String(formData.get("response_text") ?? "").trim();
  if (!responseText) return { error: "Enter a response." };

  const { error } = await repo.respondToClarification(supabase, String(formData.get("clarification_id")), responseText);
  if (error) return { error };

  await repo.updateNominationStatus(supabase, String(formData.get("nomination_id")), "submitted");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

/** Admin's direct score against a nomination's fixed rubric — same
 * criterion_key[]/criterion_weight[]/criterion_value[] shape as the judge
 * scoring action, so the same weighted-sum math applies. Recomputes the
 * whole category's winners immediately afterward. */
export async function submitAdminScoreAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();

  const keys = formData.getAll("criterion_key").map(String);
  const weights = formData.getAll("criterion_weight").map(Number);
  const values = formData.getAll("criterion_value").map(Number);

  const criteriaScores: Record<string, number> = {};
  let total = 0;
  keys.forEach((key, i) => {
    criteriaScores[key] = values[i] ?? 0;
    total += ((values[i] ?? 0) * (weights[i] ?? 0)) / 100;
  });

  const nominationId = String(formData.get("nomination_id"));
  const categoryId = String(formData.get("category_id"));

  const { error } = await submitAdminScoreAndRecompute(admin, nominationId, categoryId, criteriaScores, Math.round(total));
  if (error) return { error };

  revalidateAdminReview();
  return { error: null, success: true };
}

export async function uploadNominationWinnerPhotoAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const nominationId = String(formData.get("nomination_id"));
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose a photo to upload." };

  const { url, error: uploadError } = await uploadFile("winner-photos", file, nominationId);
  if (uploadError || !url) return { error: uploadError ?? "Upload failed." };

  const admin = createAdminClient();
  const { error } = await setWinnerPhoto(admin, nominationId, url);
  if (error) return { error };

  revalidateAdminReview();
  return { error: null, success: true };
}
