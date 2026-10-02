"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/data/supabase/admin";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import * as service from "./service";
import type { AwardCategoryStatus, AwardLayer, RubricCriterion } from "./types";
import { deleteAwardCardImage, uploadAwardCardImage } from "@/domain/storage/actions";

export type ActionState = { error: string | null; success?: boolean };

/** Parses repeatable-row fields submitted as name="prefix[0][field]" — same
 * approach as domain/competitions/actions.ts's collectIndexed, kept as its
 * own small copy rather than a shared import since the two editors' rows
 * shapes will keep diverging (rubric criteria here vs. eligibility/stages
 * there). */
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

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCriteria(formData: FormData): RubricCriterion[] {
  return collectIndexed(formData, "criteria")
    .filter((r) => r.label?.trim())
    .map((r) => ({
      key: r.key?.trim() || slugify(r.label),
      label: r.label.trim(),
      weight: Number(r.weight) || 0,
    }));
}

function parseTieBreakOrder(formData: FormData): string[] {
  return String(formData.get("tie_break_order") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function revalidateCategory(id: string, slug?: string) {
  revalidatePath("/admin/awards");
  revalidatePath(`/admin/awards/${id}`);
  revalidatePath("/awards");
  if (slug) revalidatePath(`/awards/${slug}`);
}

export async function createCategoryAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { id, error } = await service.createCategory(admin, {
    slug: slugify(String(formData.get("slug") ?? "")),
    title: String(formData.get("title") ?? "").trim(),
    layer: String(formData.get("layer") ?? "spotlight") as AwardLayer,
    description: "",
    requiresSchool: false,
    allowsIndependent: false,
    rubricCriteria: [],
    passThreshold: 70,
    tieBreakOrder: [],
    maxWinners: null,
    evidencePeriodStart: null,
    evidencePeriodEnd: null,
    closingAt: null,
  });

  if (error || !id) return { error: error ?? "Failed to create award category." };

  revalidatePath("/admin/awards");
  redirect(`/admin/awards/${id}`);
}

export async function updateCategoryAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("category_id"));

  const existing = await service.adminGetCategoryById(admin, id);
  if (!existing) return { error: "Award category not found." };

  const newSlug = slugify(String(formData.get("slug") ?? existing.slug)) || existing.slug;
  const maxWinnersRaw = String(formData.get("max_winners") ?? "").trim();

  const { error } = await service.updateCategory(admin, id, {
    slug: newSlug,
    title: String(formData.get("title") ?? "").trim(),
    layer: (String(formData.get("layer") ?? existing.layer) as AwardLayer) ?? existing.layer,
    description: String(formData.get("description") ?? ""),
    requiresSchool: formData.get("requires_school") === "on",
    allowsIndependent: formData.get("allows_independent") === "on",
    rubricCriteria: parseCriteria(formData),
    passThreshold: Number(formData.get("pass_threshold")) || 70,
    tieBreakOrder: parseTieBreakOrder(formData),
    maxWinners: maxWinnersRaw ? Number(maxWinnersRaw) : null,
    evidencePeriodStart: String(formData.get("evidence_period_start") ?? "") || null,
    evidencePeriodEnd: String(formData.get("evidence_period_end") ?? "") || null,
    closingAt: String(formData.get("closing_at") ?? "") || null,
  });

  if (error) return { error };

  revalidateCategory(id, newSlug);
  return { error: null, success: true };
}

export async function updateCategoryStatusAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("category_id"));
  const status = String(formData.get("status")) as AwardCategoryStatus;

  const { error } = await service.updateCategoryStatus(admin, id, status);
  if (error) return { error };

  revalidateCategory(id);
  return { error: null, success: true };
}

export async function uploadAwardImageAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("category_id"));
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose an image to upload." };

  const existing = await service.adminGetCategoryById(admin, id);
  if (!existing) return { error: "Award category not found." };

  const previousUrl = existing.imageUrl;

  const { url, error: uploadError } = await uploadAwardCardImage(file, id);
  if (uploadError || !url) return { error: uploadError ?? "Upload failed." };

  const { error } = await service.setAwardCategoryImageUrl(admin, id, url);
  if (error) {
    await deleteAwardCardImage(url);
    return { error };
  }

  if (previousUrl && previousUrl !== url) await deleteAwardCardImage(previousUrl);

  revalidateCategory(id, existing.slug);
  return { error: null, success: true };
}

export async function removeAwardImageAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("category_id"));

  const existing = await service.adminGetCategoryById(admin, id);
  if (!existing) return { error: "Award category not found." };

  const { error } = await service.setAwardCategoryImageUrl(admin, id, null);
  if (error) return { error };

  if (existing.imageUrl) await deleteAwardCardImage(existing.imageUrl);

  revalidateCategory(id, existing.slug);
  return { error: null, success: true };
}
