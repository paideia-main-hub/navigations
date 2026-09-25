"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/data/supabase/admin";
import type { CompetitionPathway } from "@/domain/competitions/types";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import { uploadFile } from "@/domain/storage/actions";
import * as service from "./service";
import type {
  AgeCategory,
  AwardType,
  CompetitionStatus,
  EventType,
  ManualType,
  ResourceType,
} from "./types";

export type ActionState = { error: string | null; success?: boolean };

/** Parses repeatable-row fields submitted as name="prefix[0][field]" into an
 * ordered array of plain string maps. Avoids needing a client-side JSON
 * serialization library for the editor's "+ Add row" sections. */
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

/** Normalizes an admin-typed slug into something safe as a URL path segment
 * (lowercase, hyphen-separated, no spaces/punctuation) — a raw title like
 * "MindWorks Decathlon" saved as a slug verbatim breaks the public
 * `/competitions/[slug]` route. */
function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function revalidateCompetition(id: string, slug?: string) {
  revalidatePath("/admin/competitions");
  revalidatePath(`/admin/competitions/${id}`);
  revalidatePath("/competitions");
  if (slug) revalidatePath(`/competitions/${slug}`);
}

// ---------------------------------------------------------------------------
// Core competition record
// ---------------------------------------------------------------------------

export async function createCompetitionAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { id, error } = await service.createCompetition(admin, {
    slug: slugify(String(formData.get("slug") ?? "")),
    title: String(formData.get("title") ?? "").trim(),
    shortDescription: String(formData.get("short_description") ?? ""),
    overview: "",
    // Both are set later from the competition editor.
    pathway: null,
    imageUrl: null,
    domain: "",
    status: "draft",
    supportsIndividual: true,
    supportsTeam: false,
    feeRequired: true,
    feeAmount: null,
    season: null,
  });

  if (error || !id) return { error: error ?? "Failed to create competition." };

  revalidatePath("/admin/competitions");
  redirect(`/admin/competitions/${id}`);
}

export async function updateCompetitionCoreAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("competition_id"));

  const existing = await service.adminGetCompetitionById(admin, id);
  if (!existing) return { error: "Competition not found." };

  const newSlug = slugify(String(formData.get("slug") ?? existing.slug)) || existing.slug;

  const { error } = await service.updateCompetitionCore(admin, id, {
    slug: newSlug,
    title: String(formData.get("title") ?? "").trim(),
    shortDescription: String(formData.get("short_description") ?? ""),
    overview: String(formData.get("overview") ?? ""),
    domain: String(formData.get("domain") ?? ""),
    pathway: (String(formData.get("pathway") ?? "") || null) as CompetitionPathway | null,
    imageUrl: String(formData.get("image_url") ?? "").trim() || null,
    status: existing.status,
    supportsIndividual: formData.get("supports_individual") === "on",
    supportsTeam: formData.get("supports_team") === "on",
    // Every competition requires a fee receipt upload now — there's no
    // per-competition toggle in the registration wizard anymore, so this is
    // always true; only the amount itself is admin-configurable.
    feeRequired: true,
    feeAmount: formData.get("fee_amount") ? Number(formData.get("fee_amount")) : null,
    season: String(formData.get("season") ?? "") || null,
  });

  if (error) return { error };
  revalidateCompetition(id, newSlug);
  if (newSlug !== existing.slug) revalidatePath(`/competitions/${existing.slug}`);
  return { error: null, success: true };
}

export async function updateCompetitionStatusAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("competition_id"));
  const status = String(formData.get("status")) as CompetitionStatus;

  const { error } = await service.updateCompetitionStatus(admin, id, status);
  if (error) return { error };
  revalidateCompetition(id);
  return { error: null, success: true };
}

// ---------------------------------------------------------------------------
// Eligibility rules
// ---------------------------------------------------------------------------

export async function saveEligibilityAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const competitionId = String(formData.get("competition_id"));

  const rows = collectIndexed(formData, "eligibility");
  const { error } = await service.saveEligibility(
    admin,
    competitionId,
    rows.map((r) => ({
      category: r.category as AgeCategory,
      minGrade: r.minGrade ?? "",
      maxGrade: r.maxGrade ?? "",
      minAge: r.minAge ? Number(r.minAge) : null,
      maxAge: r.maxAge ? Number(r.maxAge) : null,
      teamMinSize: r.teamMinSize ? Number(r.teamMinSize) : null,
      teamMaxSize: r.teamMaxSize ? Number(r.teamMaxSize) : null,
      notes: r.notes || null,
    })),
  );

  if (error) return { error };
  revalidateCompetition(competitionId);
  return { error: null, success: true };
}

// ---------------------------------------------------------------------------
// Stages
// ---------------------------------------------------------------------------

export async function saveStagesAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const competitionId = String(formData.get("competition_id"));

  const rows = collectIndexed(formData, "stages");
  const { error } = await service.saveStages(
    admin,
    competitionId,
    rows.map((r, i) => ({
      id: r.id || undefined,
      stageNumber: Number(r.stageNumber) || i + 1,
      title: r.title ?? "",
      format: r.format ?? "",
      duration: r.duration ?? "",
      taskDescription: r.taskDescription ?? "",
      progressionRule: r.progressionRule ?? "",
      orderIndex: i,
    })),
  );

  if (error) return { error };
  revalidateCompetition(competitionId);
  return { error: null, success: true };
}

// ---------------------------------------------------------------------------
// Rubrics (one at a time, per stage or competition-wide)
// ---------------------------------------------------------------------------

export async function saveRubricAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const competitionId = String(formData.get("competition_id"));
  const rubricId = String(formData.get("rubric_id") ?? "") || null;

  const criteriaRows = collectIndexed(formData, "criteria");
  const { error } = await service.saveRubric(admin, competitionId, rubricId, {
    stageId: String(formData.get("stage_id") ?? "") || null,
    criteria: criteriaRows.map((c) => ({
      name: c.name ?? "",
      weight: Number(c.weight) || 0,
      scale: c.scale || null,
    })),
    tieBreakRule: String(formData.get("tie_break_rule") ?? "") || null,
    isPublic: formData.get("is_public") === "on",
  });

  if (error) return { error };
  revalidateCompetition(competitionId);
  return { error: null, success: true };
}

export async function deleteRubricAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const competitionId = String(formData.get("competition_id"));
  const { error } = await service.removeRubric(admin, String(formData.get("rubric_id")));
  if (error) return { error };
  revalidateCompetition(competitionId);
  return { error: null, success: true };
}

// ---------------------------------------------------------------------------
// Manuals (file upload)
// ---------------------------------------------------------------------------

export async function uploadManualAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const competitionId = String(formData.get("competition_id"));
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) return { error: "Choose a file to upload." };

  const { url, error: uploadError } = await uploadFile("manuals", file, competitionId);
  if (uploadError || !url) return { error: uploadError ?? "Upload failed." };

  const { error } = await service.addManual(admin, competitionId, {
    type: String(formData.get("type")) as ManualType,
    title: String(formData.get("title") ?? file.name),
    fileUrl: url,
    versionLabel: String(formData.get("version_label") ?? "") || null,
    versionDate: String(formData.get("version_date") ?? "") || null,
  });

  if (error) return { error };
  revalidateCompetition(competitionId);
  return { error: null, success: true };
}

export async function deleteManualAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const competitionId = String(formData.get("competition_id"));
  const { error } = await service.removeManual(admin, String(formData.get("manual_id")));
  if (error) return { error };
  revalidateCompetition(competitionId);
  return { error: null, success: true };
}

// ---------------------------------------------------------------------------
// Resources (optional file upload for video/media resources)
// ---------------------------------------------------------------------------

export async function saveResourceAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const competitionId = String(formData.get("competition_id"));
  const resourceId = String(formData.get("resource_id") ?? "") || null;

  let videoUrl = String(formData.get("video_url") ?? "") || null;
  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const { url, error: uploadError } = await uploadFile("resources", file, competitionId);
    if (uploadError) return { error: uploadError };
    videoUrl = url;
  }

  const input = {
    stageId: String(formData.get("stage_id") ?? "") || null,
    type: String(formData.get("type")) as ResourceType,
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? "") || null,
    videoUrl,
    orderIndex: Number(formData.get("order_index")) || 0,
    downloadAllowed: formData.get("download_allowed") === "on",
  };

  const { error } = resourceId
    ? await service.editResource(admin, resourceId, input)
    : await service.addResource(admin, competitionId, input);

  if (error) return { error };
  revalidateCompetition(competitionId);
  return { error: null, success: true };
}

export async function deleteResourceAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const competitionId = String(formData.get("competition_id"));
  const { error } = await service.removeResource(admin, String(formData.get("resource_id")));
  if (error) return { error };
  revalidateCompetition(competitionId);
  return { error: null, success: true };
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export async function saveFaqsAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const competitionId = String(formData.get("competition_id"));

  const rows = collectIndexed(formData, "faqs");
  const { error } = await service.saveFaqs(
    admin,
    competitionId,
    rows.map((r, i) => ({ question: r.question ?? "", answer: r.answer ?? "", orderIndex: i })),
  );

  if (error) return { error };
  revalidateCompetition(competitionId);
  return { error: null, success: true };
}

// ---------------------------------------------------------------------------
// Winners (optional photo upload)
// ---------------------------------------------------------------------------

export async function saveWinnerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const competitionId = String(formData.get("competition_id"));
  const winnerId = String(formData.get("winner_id") ?? "") || null;

  // Manually-entered winners have no linked student to fetch a photo from —
  // there's no admin upload for this anymore, so a photo only ever appears
  // here if it was already set before that upload path was removed.
  const photoUrl = String(formData.get("existing_photo_url") ?? "") || null;

  const input = {
    studentName: String(formData.get("student_name") ?? ""),
    schoolName: String(formData.get("school_name") ?? ""),
    award: String(formData.get("award")) as AwardType,
    customAwardLabel: String(formData.get("custom_award_label") ?? "") || null,
    positionLabel: String(formData.get("position_label") ?? "") || null,
    photoUrl,
    published: formData.get("published") === "on",
    orderIndex: Number(formData.get("order_index")) || 0,
  };

  const { error } = winnerId
    ? await service.editWinner(admin, winnerId, input)
    : await service.addWinner(admin, competitionId, input);

  if (error) return { error };
  revalidateCompetition(competitionId);
  return { error: null, success: true };
}

export async function deleteWinnerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const competitionId = String(formData.get("competition_id"));
  const { error } = await service.removeWinner(admin, String(formData.get("winner_id")));
  if (error) return { error };
  revalidateCompetition(competitionId);
  return { error: null, success: true };
}

// ---------------------------------------------------------------------------
// Events / Important Dates
// ---------------------------------------------------------------------------

export async function saveEventsAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const competitionId = String(formData.get("competition_id"));

  const rows = collectIndexed(formData, "events");
  const { error } = await service.saveEvents(
    admin,
    competitionId,
    rows.map((r) => ({
      type: r.type as EventType,
      title: r.title ?? "",
      eventDate: r.eventDate ?? new Date().toISOString(),
      description: r.description || null,
    })),
  );

  if (error) return { error };
  revalidateCompetition(competitionId);
  return { error: null, success: true };
}
