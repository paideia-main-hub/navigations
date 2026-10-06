"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/data/supabase/admin";
import {
  allowedEventTypes,
  competitionAllowsEventType,
  effectiveHasOnlineSubmission,
  pathwayAllowsOnlineSubmissionToggle,
  pathwayRequiresOnlineSubmission,
  pathwayRequiresVenue,
} from "@/domain/competitions/pathwayDateRules";
import {
  DEFAULT_ENTRY_FEE,
  eventTypeAdminLabels,
  pathwayOrder,
  type CompetitionPathway,
} from "@/domain/competitions/types";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import { deleteCompetitionCardImage, uploadCompetitionCardImage, uploadFile } from "@/domain/storage/actions";
import { normalizeCompetencies } from "./competencies";
import * as service from "./service";
import type {
  AgeCategory,
  AwardType,
  CompetitionStatus,
  EventType,
  ManualType,
  ResourceType,
} from "./types";

export type ActionState = { error: string | null; success?: boolean; warning?: string; message?: string };

/** The competency picker submits one `competencies` field per selection. */
function readCompetencies(formData: FormData): string[] {
  return normalizeCompetencies(formData.getAll("competencies").map(String));
}

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
  revalidatePath("/");
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
    datesCardOne: String(formData.get("dates_card_one") ?? "").trim(),
    datesCardTwo: String(formData.get("dates_card_two") ?? "").trim(),
    overview: "",
    // Pathway, venue and online-submission are set later from the competition editor.
    pathway: null,
    competencies: readCompetencies(formData),
    imageUrl: null,
    venue: null,
    hasOnlineSubmission: false,
    domain: "",
    status: "draft",
    supportsIndividual: true,
    supportsTeam: false,
    feeRequired: true,
    feeAmount: DEFAULT_ENTRY_FEE,
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
  const pathway = (String(formData.get("pathway") ?? "") || null) as CompetitionPathway | null;
  const hasOnlineSubmission = effectiveHasOnlineSubmission(
    pathway,
    formData.get("has_online_submission") === "on",
  );
  const venueRaw = String(formData.get("venue") ?? "").trim();
  const venue = pathwayRequiresVenue(pathway) ? venueRaw || null : null;

  const { error, warning } = await service.updateCompetitionCore(admin, id, {
    slug: newSlug,
    title: String(formData.get("title") ?? "").trim(),
    shortDescription: String(formData.get("short_description") ?? ""),
    datesCardOne: String(formData.get("dates_card_one") ?? "").trim(),
    datesCardTwo: String(formData.get("dates_card_two") ?? "").trim(),
    overview: String(formData.get("overview") ?? ""),
    domain: String(formData.get("domain") ?? ""),
    pathway,
    competencies: readCompetencies(formData),
    // Card artwork is managed by uploadCompetitionImageAction / removeCompetitionImageAction.
    imageUrl: existing.imageUrl,
    venue,
    hasOnlineSubmission,
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
  return { error: null, success: true, warning };
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

export async function uploadCompetitionImageAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("competition_id"));
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose an image to upload." };

  const existing = await service.adminGetCompetitionById(admin, id);
  if (!existing) return { error: "Competition not found." };

  const previousUrl = existing.imageUrl;

  const { url, error: uploadError } = await uploadCompetitionCardImage(file, id);
  if (uploadError || !url) return { error: uploadError ?? "Upload failed." };

  const { error } = await service.setCompetitionImageUrl(admin, id, url);
  if (error) {
    await deleteCompetitionCardImage(url);
    return { error };
  }

  if (previousUrl && previousUrl !== url) await deleteCompetitionCardImage(previousUrl);

  revalidateCompetition(id, existing.slug);
  return { error: null, success: true };
}

export async function removeCompetitionImageAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("competition_id"));

  const existing = await service.adminGetCompetitionById(admin, id);
  if (!existing) return { error: "Competition not found." };

  const { error } = await service.setCompetitionImageUrl(admin, id, null);
  if (error) return { error };

  if (existing.imageUrl) await deleteCompetitionCardImage(existing.imageUrl);

  revalidateCompetition(id, existing.slug);
  return { error: null, success: true };
}

export async function deleteCompetitionAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();
  const id = String(formData.get("competition_id"));

  const existing = await service.adminGetCompetitionById(admin, id);
  if (!existing) return { error: "Competition not found." };
  // The form asks the admin to type the title; checked here too so the
  // confirmation can't be skipped by submitting the form directly.
  if (String(formData.get("confirm_title") ?? "").trim() !== existing.title.trim()) {
    return { error: "The title you typed doesn't match — nothing was deleted." };
  }

  const { error } = await service.deleteCompetition(admin, id);
  if (error) return { error };

  // The uploaded card artwork isn't a child row, so the cascade leaves it in
  // storage; remove it the same way removeCompetitionImageAction does.
  if (existing.imageUrl) await deleteCompetitionCardImage(existing.imageUrl);

  revalidateCompetition(id, existing.slug);
  revalidatePath("/");
  redirect("/admin/competitions");
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

  const competition = await service.adminGetCompetitionById(admin, competitionId);
  if (!competition) return { error: "Competition not found." };

  const allowed = new Set(allowedEventTypes(competition.pathway, competition.hasOnlineSubmission));

  const rows = collectIndexed(formData, "events")
    .map((r) => ({
      type: r.type as EventType,
      title: (r.title ?? "").trim(),
      eventDate: r.eventDate ?? "",
      description: r.description || null,
    }))
    .filter((r) => allowed.has(r.type) && r.eventDate);

  const { error } = await service.saveEvents(admin, competitionId, rows);

  if (error) return { error };
  revalidateCompetition(competitionId);
  return { error: null, success: true };
}

const ALL_CATEGORY_DATE_TYPES: EventType[] = [
  "registration_close",
  "round",
  "submission_deadline",
  "result_date",
  "final_event",
];

/** Apply venue, online-submission flag, and any filled pathway date slots to
 * many competitions in one save. `pathway=all` applies across categories,
 * writing each field only onto competitions whose category allows it. */
export async function bulkSavePathwayScheduleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();

  const scope = String(formData.get("pathway") ?? "");
  const allCategories = scope === "all";
  const pathway = scope as CompetitionPathway;
  if (!allCategories && !pathwayOrder.includes(pathway)) {
    return { error: "Choose a participation category first." };
  }

  const competitionIds = formData.getAll("competition_id").map(String).filter(Boolean);
  if (competitionIds.length === 0) return { error: "Select at least one competition." };

  const listed = await service.adminListCompetitions(admin);
  const byId = new Map(listed.map((c) => [c.id, c]));
  for (const id of competitionIds) {
    const c = byId.get(id);
    if (!c) return { error: "One of the selected competitions was not found." };
    if (!allCategories && c.pathway !== pathway) {
      return { error: "Every selected competition must match the chosen participation category." };
    }
  }

  const applyVenue = formData.get("apply_venue") === "on";
  const applyOnline = formData.get("apply_online") === "on";
  const venueRaw = String(formData.get("venue") ?? "").trim();
  const onlineChecked = formData.get("has_online_submission") === "on";

  const formDateTypes = allCategories
    ? ALL_CATEGORY_DATE_TYPES
    : allowedEventTypes(pathway, effectiveHasOnlineSubmission(pathway, onlineChecked)).filter(
        (t) => t !== "other",
      );
  const description = String(formData.get("description") ?? "").trim() || null;

  const dateUpdates: { type: EventType; title: string; eventDate: string }[] = [];
  for (const type of formDateTypes) {
    const dateOnly = String(formData.get(`date[${type}]`) ?? "").trim();
    if (!dateOnly) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      return { error: `Invalid date for ${eventTypeAdminLabels[type]}.` };
    }
    const title =
      String(formData.get(`title[${type}]`) ?? "").trim() || eventTypeAdminLabels[type];
    dateUpdates.push({ type, title, eventDate: `${dateOnly}T12:00:00.000Z` });
  }

  let touchedMeta = false;
  let clearedSubmissionDeadlines = false;

  if (applyVenue) {
    const venueIds = competitionIds.filter((id) => pathwayRequiresVenue(byId.get(id)?.pathway ?? null));
    if (venueIds.length > 0) {
      const { error } = await service.bulkUpdateScheduleMeta(admin, venueIds, {
        venue: venueRaw || null,
      });
      if (error) return { error };
      touchedMeta = true;
    }
  }

  if (applyOnline) {
    if (allCategories) {
      const toggleIds = competitionIds.filter((id) =>
        pathwayAllowsOnlineSubmissionToggle(byId.get(id)?.pathway ?? null),
      );
      if (toggleIds.length > 0) {
        const { error } = await service.bulkUpdateScheduleMeta(admin, toggleIds, {
          hasOnlineSubmission: onlineChecked,
        });
        if (error) return { error };
        touchedMeta = true;
        if (!onlineChecked) {
          const { error: clearError } = await service.deleteEventTypeForCompetitions(
            admin,
            toggleIds,
            "submission_deadline",
          );
          if (clearError) return { error: clearError };
          clearedSubmissionDeadlines = true;
        }
      }
      const independentIds = competitionIds.filter((id) =>
        pathwayRequiresOnlineSubmission(byId.get(id)?.pathway ?? null),
      );
      if (independentIds.length > 0) {
        const { error } = await service.bulkUpdateScheduleMeta(admin, independentIds, {
          hasOnlineSubmission: true,
        });
        if (error) return { error };
        touchedMeta = true;
      }
    } else {
      const metaPatch: { hasOnlineSubmission?: boolean } = {};
      if (pathwayRequiresOnlineSubmission(pathway)) metaPatch.hasOnlineSubmission = true;
      else if (pathwayAllowsOnlineSubmissionToggle(pathway)) metaPatch.hasOnlineSubmission = onlineChecked;

      if (metaPatch.hasOnlineSubmission !== undefined) {
        const { error } = await service.bulkUpdateScheduleMeta(admin, competitionIds, metaPatch);
        if (error) return { error };
        touchedMeta = true;
      }
      if (pathwayAllowsOnlineSubmissionToggle(pathway) && !onlineChecked) {
        const { error } = await service.deleteEventTypeForCompetitions(
          admin,
          competitionIds,
          "submission_deadline",
        );
        if (error) return { error };
        clearedSubmissionDeadlines = true;
      }
    }
  }

  if (!touchedMeta && dateUpdates.length === 0 && !clearedSubmissionDeadlines) {
    return {
      error: "Fill at least one date, or apply venue / use the online-submission toggle.",
    };
  }

  for (const event of dateUpdates) {
    const targetIds = competitionIds.filter((id) => {
      const c = byId.get(id);
      if (!c) return false;
      const onlineForRules = (() => {
        if (pathwayRequiresOnlineSubmission(c.pathway)) return true;
        if (applyOnline && pathwayAllowsOnlineSubmissionToggle(c.pathway)) return onlineChecked;
        return c.hasOnlineSubmission;
      })();
      return competitionAllowsEventType(c.pathway, onlineForRules, event.type);
    });
    if (targetIds.length === 0) continue;
    const { error } = await service.upsertEventTypeForCompetitions(admin, targetIds, {
      type: event.type,
      title: event.title,
      eventDate: event.eventDate,
      description,
    });
    if (error) return { error };
  }

  revalidatePath("/admin/bulk-dates");
  revalidatePath("/admin/competitions");
  revalidatePath("/competitions");
  revalidatePath("/");
  for (const id of competitionIds) {
    revalidatePath(`/admin/competitions/${id}`);
  }

  const parts: string[] = [];
  if (dateUpdates.length > 0) parts.push(`${dateUpdates.length} date type${dateUpdates.length === 1 ? "" : "s"}`);
  if (touchedMeta) parts.push("venue / online settings");
  if (clearedSubmissionDeadlines) parts.push("cleared submission deadlines");

  return {
    error: null,
    success: true,
    message: `Updated ${parts.join(" + ") || "schedule"} on ${competitionIds.length} competition${competitionIds.length === 1 ? "" : "s"}${allCategories ? " across all categories" : ""}.`,
  };
}

export async function bulkSaveEventsAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();

  const competitionIds = formData.getAll("competition_id").map(String).filter(Boolean);
  const type = String(formData.get("type") ?? "") as EventType;
  const title = String(formData.get("title") ?? "").trim();
  const dateOnly = String(formData.get("eventDate") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  const allowed: EventType[] = [
    "registration_close",
    "round",
    "submission_deadline",
    "result_date",
    "final_event",
    "other",
  ];
  if (!allowed.includes(type)) return { error: "Choose a date type." };
  if (!title) return { error: "Title is required." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return { error: "Date is required." };
  if (competitionIds.length === 0) return { error: "Select at least one competition." };

  // Store noon UTC so the calendar day stays stable across timezones.
  const eventDate = `${dateOnly}T12:00:00.000Z`;

  const { updated, error } = await service.upsertEventTypeForCompetitions(admin, competitionIds, {
    type,
    title,
    eventDate,
    description,
  });
  if (error) return { error };

  revalidatePath("/admin/bulk-dates");
  revalidatePath("/admin/competitions");
  revalidatePath("/competitions");
  revalidatePath("/");
  for (const id of competitionIds) {
    revalidatePath(`/admin/competitions/${id}`);
  }

  return {
    error: null,
    success: true,
    message: `Set ${type.replaceAll("_", " ")} on ${updated} competition${updated === 1 ? "" : "s"}.`,
  };
}

export async function bulkSaveIndividualEventsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminSession();
  const admin = createAdminClient();

  const type = String(formData.get("type") ?? "") as EventType;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const competitionIds = formData.getAll("competition_id").map(String).filter(Boolean);

  const allowed: EventType[] = [
    "registration_close",
    "round",
    "submission_deadline",
    "result_date",
    "final_event",
    "other",
  ];
  if (!allowed.includes(type)) return { error: "Choose a date type." };
  if (!title) return { error: "Title is required." };
  if (competitionIds.length === 0) return { error: "Select at least one competition." };

  const rows: { competitionId: string; eventDate: string }[] = [];
  for (const competitionId of competitionIds) {
    const dateOnly = String(formData.get(`eventDate[${competitionId}]`) ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      return { error: "Every selected competition needs a date." };
    }
    rows.push({ competitionId, eventDate: `${dateOnly}T12:00:00.000Z` });
  }

  const { updated, error } = await service.upsertEventTypePerCompetition(
    admin,
    { type, title, description },
    rows,
  );
  if (error) return { error };

  revalidatePath("/admin/bulk-dates");
  revalidatePath("/admin/competitions");
  revalidatePath("/competitions");
  revalidatePath("/");
  for (const id of competitionIds) {
    revalidatePath(`/admin/competitions/${id}`);
  }

  return {
    error: null,
    success: true,
    message: `Set individual ${type.replaceAll("_", " ")} dates on ${updated} competition${updated === 1 ? "" : "s"}.`,
  };
}
