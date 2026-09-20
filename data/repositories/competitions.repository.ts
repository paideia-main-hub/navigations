// Data layer: the only place that knows where competition data comes from —
// real Supabase queries against the `competitions` table family (see
// supabase/migrations/0001_init_schema.sql, 0009, 0010). The domain layer
// only calls these functions, never Supabase directly.

import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AgeCategory,
  AwardType,
  Competition,
  CompetitionEvent,
  CompetitionPathway,
  CompetitionSummary,
  CompetitionFaq,
  CompetitionStage,
  CompetitionStatus,
  CompetitionWinner,
  EligibilityRule,
  EventType,
  Manual,
  ManualType,
  Resource,
  ResourceType,
  RubricCriterion,
  StageRubric,
} from "@/domain/competitions/types";

const FULL_SELECT = `
  *,
  competition_eligibility_rules (*),
  competition_stages (*),
  rubrics (*),
  manuals (*),
  resources (*),
  competition_faqs (*),
  competition_winners (*),
  events (*)
`;

type Row = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  overview: string | null;
  domain_competency_area: string | null;
  status: CompetitionStatus;
  pathway?: CompetitionPathway | null;
  image_url?: string | null;
  supports_individual: boolean;
  supports_team: boolean;
  fee_required: boolean;
  fee_amount: number | null;
  season: string | null;
  created_at: string;
  updated_at: string;
  competition_eligibility_rules: {
    id: string;
    category: AgeCategory;
    min_grade: string | null;
    max_grade: string | null;
    min_age: number | null;
    max_age: number | null;
    team_min_size: number | null;
    team_max_size: number | null;
    notes: string | null;
  }[];
  competition_stages: {
    id: string;
    stage_number: number;
    title: string;
    format: string | null;
    duration: string | null;
    task_description: string | null;
    progression_rule: string | null;
    order_index: number;
  }[];
  rubrics: {
    id: string;
    stage_id: string | null;
    criteria: RubricCriterion[];
    tie_break_rule: string | null;
    is_public: boolean;
  }[];
  manuals: {
    id: string;
    type: ManualType;
    title: string;
    file_url: string;
    version_label: string | null;
    version_date: string | null;
  }[];
  resources: {
    id: string;
    stage_id: string | null;
    type: ResourceType;
    title: string;
    content: string | null;
    video_url: string | null;
    order_index: number;
    download_allowed: boolean;
  }[];
  competition_faqs: { id: string; question: string; answer: string; order_index: number }[];
  competition_winners: {
    id: string;
    student_name: string;
    school_name: string;
    award: AwardType;
    custom_award_label: string | null;
    position_label: string | null;
    photo_url: string | null;
    published: boolean;
    order_index: number;
  }[];
  events: { id: string; type: EventType; title: string; event_date: string; description: string | null }[];
};

function toCompetition(row: Row): Competition {
  const eligibility: EligibilityRule[] = (row.competition_eligibility_rules ?? []).map((r) => ({
    id: r.id,
    category: r.category,
    minGrade: r.min_grade ?? "",
    maxGrade: r.max_grade ?? "",
    minAge: r.min_age,
    maxAge: r.max_age,
    teamMinSize: r.team_min_size,
    teamMaxSize: r.team_max_size,
    notes: r.notes,
  }));

  const stages: CompetitionStage[] = (row.competition_stages ?? [])
    .map((s) => ({
      id: s.id,
      stageNumber: s.stage_number,
      title: s.title,
      format: s.format ?? "",
      duration: s.duration ?? "",
      taskDescription: s.task_description ?? "",
      progressionRule: s.progression_rule ?? "",
      orderIndex: s.order_index,
    }))
    .sort((a, b) => a.orderIndex - b.orderIndex || a.stageNumber - b.stageNumber);

  const rubrics: StageRubric[] = (row.rubrics ?? []).map((r) => ({
    id: r.id,
    stageId: r.stage_id,
    criteria: r.criteria ?? [],
    tieBreakRule: r.tie_break_rule,
    isPublic: r.is_public,
  }));

  const manuals: Manual[] = (row.manuals ?? []).map((m) => ({
    id: m.id,
    type: m.type,
    title: m.title,
    fileUrl: m.file_url,
    versionLabel: m.version_label,
    versionDate: m.version_date,
  }));

  const resources: Resource[] = (row.resources ?? [])
    .map((r) => ({
      id: r.id,
      stageId: r.stage_id,
      type: r.type,
      title: r.title,
      content: r.content,
      videoUrl: r.video_url,
      orderIndex: r.order_index,
      downloadAllowed: r.download_allowed,
    }))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const faqs: CompetitionFaq[] = (row.competition_faqs ?? [])
    .map((f) => ({ id: f.id, question: f.question, answer: f.answer, orderIndex: f.order_index }))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const winners: CompetitionWinner[] = (row.competition_winners ?? [])
    .map((w) => ({
      id: w.id,
      studentName: w.student_name,
      schoolName: w.school_name,
      award: w.award,
      customAwardLabel: w.custom_award_label,
      positionLabel: w.position_label,
      photoUrl: w.photo_url,
      published: w.published,
      orderIndex: w.order_index,
    }))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const events: CompetitionEvent[] = (row.events ?? [])
    .map((e) => ({ id: e.id, type: e.type, title: e.title, eventDate: e.event_date, description: e.description }))
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description ?? "",
    overview: row.overview ?? "",
    domain: row.domain_competency_area ?? "",
    status: row.status,
    pathway: row.pathway ?? null,
    imageUrl: row.image_url ?? null,
    supportsIndividual: row.supports_individual,
    supportsTeam: row.supports_team,
    feeRequired: row.fee_required,
    feeAmount: row.fee_amount,
    season: row.season,
    eligibility,
    stages,
    rubrics,
    manuals,
    resources,
    faqs,
    winners: winners.filter((w) => w.published),
    events,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Same mapper, but keeps unpublished winners — for the admin editor, which
// needs to see and manage every winner row, not just the public-visible ones.
function toCompetitionAdmin(row: Row): Competition {
  const c = toCompetition(row);
  const winners: CompetitionWinner[] = (row.competition_winners ?? [])
    .map((w) => ({
      id: w.id,
      studentName: w.student_name,
      schoolName: w.school_name,
      award: w.award,
      customAwardLabel: w.custom_award_label,
      positionLabel: w.position_label,
      photoUrl: w.photo_url,
      published: w.published,
      orderIndex: w.order_index,
    }))
    .sort((a, b) => a.orderIndex - b.orderIndex);
  return { ...c, winners };
}

// ---------------------------------------------------------------------------
// Public reads (RLS-respecting client — every table selected here has a
// public-read policy, so the anon/cookie-bound client works directly)
//
// These are wrapped in React cache() so that a page rendering several
// features off the same data — the home page reads featured competitions,
// winners and upcoming dates — issues one query per shape per request instead
// of one per call site. The cache key is the supabase client instance, and a
// page creates exactly one, so the memo is scoped to that render and never
// leaks between requests or between users.
//
// Prefer the narrowest function that covers the caller. FULL_SELECT joins
// eight child tables; running it to read a title is what made the directory
// and home pages slow.
// ---------------------------------------------------------------------------

/** Core columns only — no child tables, and no `overview`, which runs to
 * several thousand characters per competition. */
const SUMMARY_COLUMNS = `
  id, slug, title, short_description, domain_competency_area, status,
  supports_individual, supports_team, fee_required, fee_amount, season,
  created_at, updated_at
`;

const SUMMARY_SELECT = `
  ${SUMMARY_COLUMNS}, pathway, image_url,
  competition_eligibility_rules (*),
  events (*)
`;

/** Same query without the two columns migration 0018 adds, so a database that
 * hasn't had it applied still serves every listing on the site. Remove this,
 * and the retry below, once 0018 is applied everywhere. */
const SUMMARY_SELECT_PRE_0018 = `
  ${SUMMARY_COLUMNS},
  competition_eligibility_rules (*),
  events (*)
`;

/** PostgreSQL's "column does not exist". */
const UNDEFINED_COLUMN = "42703";

function toSummary(row: Row): CompetitionSummary {
  const eligibility: EligibilityRule[] = (row.competition_eligibility_rules ?? []).map((e) => ({
    id: e.id,
    category: e.category,
    minGrade: e.min_grade ?? "",
    maxGrade: e.max_grade ?? "",
    minAge: e.min_age,
    maxAge: e.max_age,
    teamMinSize: e.team_min_size,
    teamMaxSize: e.team_max_size,
    notes: e.notes,
  }));

  const events: CompetitionEvent[] = (row.events ?? [])
    .map((e) => ({ id: e.id, type: e.type, title: e.title, eventDate: e.event_date, description: e.description }))
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description ?? "",
    domain: row.domain_competency_area ?? "",
    status: row.status,
    pathway: row.pathway ?? null,
    imageUrl: row.image_url ?? null,
    supportsIndividual: row.supports_individual,
    supportsTeam: row.supports_team,
    feeRequired: row.fee_required,
    feeAmount: row.fee_amount,
    season: row.season,
    eligibility,
    events,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Every competition with the card/filter/deadline fields only. The default
 * choice for listings, directories and dashboard slug lookups. */
export const getCompetitionSummaries = cache(async (supabase: SupabaseClient): Promise<CompetitionSummary[]> => {
  const first = await supabase.from("competitions").select(SUMMARY_SELECT).order("created_at");
  if (!first.error && first.data) return (first.data as unknown as Row[]).map(toSummary);

  if (first.error?.code !== UNDEFINED_COLUMN) return [];

  const legacy = await supabase.from("competitions").select(SUMMARY_SELECT_PRE_0018).order("created_at");
  if (legacy.error || !legacy.data) return [];
  return (legacy.data as unknown as Row[]).map(toSummary);
});

/** Just enough to render a name and link to the competition — for index pages
 * that only list titles. */
export const getCompetitionIndex = cache(
  async (supabase: SupabaseClient): Promise<{ slug: string; title: string; domain: string }[]> => {
    const { data, error } = await supabase
      .from("competitions")
      .select("slug, title, domain_competency_area")
      .order("created_at");
    if (error || !data) return [];
    return (data as { slug: string; title: string; domain_competency_area: string | null }[]).map((r) => ({
      slug: r.slug,
      title: r.title,
      domain: r.domain_competency_area ?? "",
    }));
  },
);

/** Published manual winners, with the competition they belong to. */
export const getCompetitionWinnerRows = cache(
  async (supabase: SupabaseClient): Promise<{ slug: string; title: string; winners: CompetitionWinner[] }[]> => {
    const { data, error } = await supabase
      .from("competitions")
      .select("slug, title, competition_winners (*)")
      .order("created_at");
    if (error || !data) return [];
    return (data as unknown as Row[]).map((row) => ({
      slug: row.slug,
      title: row.title,
      winners: (row.competition_winners ?? [])
        .filter((w) => w.published)
        .map((w) => ({
          id: w.id,
          studentName: w.student_name,
          schoolName: w.school_name,
          award: w.award,
          customAwardLabel: w.custom_award_label,
          positionLabel: w.position_label,
          photoUrl: w.photo_url,
          published: w.published,
          orderIndex: w.order_index,
        }))
        .sort((a, b) => a.orderIndex - b.orderIndex),
    }));
  },
);

/** Every competition's calendar events, with the competition title and slug. */
export const getCompetitionEventRows = cache(
  async (supabase: SupabaseClient): Promise<{ title: string; slug: string; events: CompetitionEvent[] }[]> => {
    const { data, error } = await supabase.from("competitions").select("title, slug, events (*)").order("created_at");
    if (error || !data) return [];
    return (data as unknown as Row[]).map((row) => ({
      title: row.title,
      slug: row.slug,
      events: (row.events ?? []).map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        eventDate: e.event_date,
        description: e.description,
      })),
    }));
  },
);

/** Every competition with every child table. Only for callers that genuinely
 * need the whole object graph — prefer a narrower read above. */
export const getAllCompetitions = cache(async (supabase: SupabaseClient): Promise<Competition[]> => {
  const { data, error } = await supabase.from("competitions").select(FULL_SELECT).order("created_at");
  if (error || !data) return [];
  return (data as unknown as Row[]).map(toCompetition);
});

export const getCompetitionBySlug = cache(
  async (supabase: SupabaseClient, slug: string): Promise<Competition | null> => {
    const { data, error } = await supabase.from("competitions").select(FULL_SELECT).eq("slug", slug).maybeSingle();
    if (error || !data) return null;
    return toCompetition(data as unknown as Row);
  },
);

// ---------------------------------------------------------------------------
// Admin reads/writes (service-role client — bypasses RLS; see
// data/supabase/admin.ts and domain/admin-auth/guard.ts for the real gate)
// ---------------------------------------------------------------------------

export async function adminListCompetitions(admin: SupabaseClient): Promise<Competition[]> {
  const { data, error } = await admin.from("competitions").select(FULL_SELECT).order("updated_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as Row[]).map(toCompetitionAdmin);
}

export async function adminGetCompetitionById(admin: SupabaseClient, id: string): Promise<Competition | null> {
  const { data, error } = await admin.from("competitions").select(FULL_SELECT).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return toCompetitionAdmin(data as unknown as Row);
}

export interface CompetitionCoreInput {
  slug: string;
  title: string;
  shortDescription: string;
  overview: string;
  domain: string;
  pathway: CompetitionPathway | null;
  imageUrl: string | null;
  status: CompetitionStatus;
  supportsIndividual: boolean;
  supportsTeam: boolean;
  feeRequired: boolean;
  feeAmount: number | null;
  season: string | null;
}

function coreToRow(input: CompetitionCoreInput) {
  return {
    slug: input.slug,
    title: input.title,
    short_description: input.shortDescription,
    overview: input.overview,
    domain_competency_area: input.domain,
    pathway: input.pathway,
    image_url: input.imageUrl,
    status: input.status,
    supports_individual: input.supportsIndividual,
    supports_team: input.supportsTeam,
    fee_required: input.feeRequired,
    fee_amount: input.feeAmount,
    season: input.season,
  };
}

export async function insertCompetition(
  admin: SupabaseClient,
  input: CompetitionCoreInput,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await admin.from("competitions").insert(coreToRow(input)).select("id").single();
  if (error || !data) return { id: null, error: error?.message ?? "Failed to create competition." };
  return { id: data.id as string, error: null };
}

export async function updateCompetitionCore(
  admin: SupabaseClient,
  id: string,
  input: CompetitionCoreInput,
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("competitions")
    .update({ ...coreToRow(input), updated_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function updateCompetitionStatus(
  admin: SupabaseClient,
  id: string,
  status: CompetitionStatus,
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("competitions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error?.message ?? null };
}

// --- Eligibility rules: nothing else references these rows, so a full
// delete-then-insert per save is safe and simplest. ---

export interface EligibilityRuleInput {
  category: AgeCategory;
  minGrade: string;
  maxGrade: string;
  minAge: number | null;
  maxAge: number | null;
  teamMinSize: number | null;
  teamMaxSize: number | null;
  notes: string | null;
}

export async function replaceEligibilityRules(
  admin: SupabaseClient,
  competitionId: string,
  rules: EligibilityRuleInput[],
): Promise<{ error: string | null }> {
  const { error: deleteError } = await admin.from("competition_eligibility_rules").delete().eq("competition_id", competitionId);
  if (deleteError) return { error: deleteError.message };
  if (rules.length === 0) return { error: null };

  const { error } = await admin.from("competition_eligibility_rules").insert(
    rules.map((r) => ({
      competition_id: competitionId,
      category: r.category,
      min_grade: r.minGrade,
      max_grade: r.maxGrade,
      min_age: r.minAge,
      max_age: r.maxAge,
      team_min_size: r.teamMinSize,
      team_max_size: r.teamMaxSize,
      notes: r.notes,
    })),
  );
  return { error: error?.message ?? null };
}

// --- Stages: resources.stage_id and rubrics.stage_id reference these with
// `on delete set null` — a naive delete-all/insert-all would silently null
// out those links on every save. Real per-row upsert instead: update rows
// that carry an existing id, insert rows that don't, delete only rows whose
// id was actually removed from the submitted list. ---

export interface StageInput {
  id?: string;
  stageNumber: number;
  title: string;
  format: string;
  duration: string;
  taskDescription: string;
  progressionRule: string;
  orderIndex: number;
}

export async function replaceStages(
  admin: SupabaseClient,
  competitionId: string,
  stages: StageInput[],
): Promise<{ error: string | null }> {
  const { data: existing, error: fetchError } = await admin
    .from("competition_stages")
    .select("id")
    .eq("competition_id", competitionId);
  if (fetchError) return { error: fetchError.message };

  const existingIds = new Set((existing ?? []).map((r) => r.id as string));
  const submittedIds = new Set(stages.filter((s) => s.id).map((s) => s.id as string));
  const idsToDelete = [...existingIds].filter((id) => !submittedIds.has(id));

  if (idsToDelete.length > 0) {
    const { error } = await admin.from("competition_stages").delete().in("id", idsToDelete);
    if (error) return { error: error.message };
  }

  for (const stage of stages) {
    const row = {
      competition_id: competitionId,
      stage_number: stage.stageNumber,
      title: stage.title,
      format: stage.format,
      duration: stage.duration,
      task_description: stage.taskDescription,
      progression_rule: stage.progressionRule,
      order_index: stage.orderIndex,
    };
    if (stage.id && existingIds.has(stage.id)) {
      const { error } = await admin.from("competition_stages").update(row).eq("id", stage.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await admin.from("competition_stages").insert(row);
      if (error) return { error: error.message };
    }
  }

  return { error: null };
}

// --- Rubrics: edited one at a time, per stage (or competition-wide when
// stageId is null). ---

export interface StageRubricInput {
  stageId: string | null;
  criteria: RubricCriterion[];
  tieBreakRule: string | null;
  isPublic: boolean;
}

export async function upsertRubric(
  admin: SupabaseClient,
  competitionId: string,
  id: string | null,
  input: StageRubricInput,
): Promise<{ error: string | null }> {
  const row = {
    competition_id: competitionId,
    stage_id: input.stageId,
    criteria: input.criteria,
    tie_break_rule: input.tieBreakRule,
    is_public: input.isPublic,
  };
  if (id) {
    const { error } = await admin.from("rubrics").update(row).eq("id", id);
    return { error: error?.message ?? null };
  }
  const { error } = await admin.from("rubrics").insert(row);
  return { error: error?.message ?? null };
}

export async function deleteRubric(admin: SupabaseClient, id: string): Promise<{ error: string | null }> {
  const { error } = await admin.from("rubrics").delete().eq("id", id);
  return { error: error?.message ?? null };
}

// --- Manuals: added one at a time (upload a file -> create a row). ---

export interface ManualInput {
  type: ManualType;
  title: string;
  fileUrl: string;
  versionLabel: string | null;
  versionDate: string | null;
}

export async function insertManual(
  admin: SupabaseClient,
  competitionId: string,
  input: ManualInput,
): Promise<{ error: string | null }> {
  const { error } = await admin.from("manuals").insert({
    competition_id: competitionId,
    type: input.type,
    title: input.title,
    file_url: input.fileUrl,
    version_label: input.versionLabel,
    version_date: input.versionDate,
  });
  return { error: error?.message ?? null };
}

export async function deleteManual(admin: SupabaseClient, id: string): Promise<{ error: string | null }> {
  const { error } = await admin.from("manuals").delete().eq("id", id);
  return { error: error?.message ?? null };
}

// --- Resources ---

export interface ResourceInput {
  stageId: string | null;
  type: ResourceType;
  title: string;
  content: string | null;
  videoUrl: string | null;
  orderIndex: number;
  downloadAllowed: boolean;
}

export async function insertResource(
  admin: SupabaseClient,
  competitionId: string,
  input: ResourceInput,
): Promise<{ error: string | null }> {
  const { error } = await admin.from("resources").insert({
    competition_id: competitionId,
    stage_id: input.stageId,
    type: input.type,
    title: input.title,
    content: input.content,
    video_url: input.videoUrl,
    order_index: input.orderIndex,
    download_allowed: input.downloadAllowed,
  });
  return { error: error?.message ?? null };
}

export async function updateResource(
  admin: SupabaseClient,
  id: string,
  input: ResourceInput,
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("resources")
    .update({
      stage_id: input.stageId,
      type: input.type,
      title: input.title,
      content: input.content,
      video_url: input.videoUrl,
      order_index: input.orderIndex,
      download_allowed: input.downloadAllowed,
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteResource(admin: SupabaseClient, id: string): Promise<{ error: string | null }> {
  const { error } = await admin.from("resources").delete().eq("id", id);
  return { error: error?.message ?? null };
}

// --- FAQs: nothing references these rows, safe to replace wholesale. ---

export interface FaqInput {
  question: string;
  answer: string;
  orderIndex: number;
}

export async function replaceFaqs(
  admin: SupabaseClient,
  competitionId: string,
  faqs: FaqInput[],
): Promise<{ error: string | null }> {
  const { error: deleteError } = await admin.from("competition_faqs").delete().eq("competition_id", competitionId);
  if (deleteError) return { error: deleteError.message };
  if (faqs.length === 0) return { error: null };

  const { error } = await admin.from("competition_faqs").insert(
    faqs.map((f) => ({ competition_id: competitionId, question: f.question, answer: f.answer, order_index: f.orderIndex })),
  );
  return { error: error?.message ?? null };
}

// --- Winners: added/edited one at a time. ---

export interface WinnerInput {
  studentName: string;
  schoolName: string;
  award: AwardType;
  customAwardLabel: string | null;
  positionLabel: string | null;
  photoUrl: string | null;
  published: boolean;
  orderIndex: number;
}

export async function insertWinner(
  admin: SupabaseClient,
  competitionId: string,
  input: WinnerInput,
): Promise<{ error: string | null }> {
  const { error } = await admin.from("competition_winners").insert({
    competition_id: competitionId,
    student_name: input.studentName,
    school_name: input.schoolName,
    award: input.award,
    custom_award_label: input.customAwardLabel,
    position_label: input.positionLabel,
    photo_url: input.photoUrl,
    published: input.published,
    order_index: input.orderIndex,
  });
  return { error: error?.message ?? null };
}

export async function updateWinner(
  admin: SupabaseClient,
  id: string,
  input: WinnerInput,
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("competition_winners")
    .update({
      student_name: input.studentName,
      school_name: input.schoolName,
      award: input.award,
      custom_award_label: input.customAwardLabel,
      position_label: input.positionLabel,
      photo_url: input.photoUrl,
      published: input.published,
      order_index: input.orderIndex,
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteWinner(admin: SupabaseClient, id: string): Promise<{ error: string | null }> {
  const { error } = await admin.from("competition_winners").delete().eq("id", id);
  return { error: error?.message ?? null };
}

// --- Events: nothing references these rows, safe to replace wholesale. ---

export interface EventInput {
  type: EventType;
  title: string;
  eventDate: string;
  description: string | null;
}

export async function replaceEvents(
  admin: SupabaseClient,
  competitionId: string,
  events: EventInput[],
): Promise<{ error: string | null }> {
  const { error: deleteError } = await admin.from("events").delete().eq("competition_id", competitionId);
  if (deleteError) return { error: deleteError.message };
  if (events.length === 0) return { error: null };

  const { error } = await admin.from("events").insert(
    events.map((e) => ({
      competition_id: competitionId,
      type: e.type,
      title: e.title,
      event_date: e.eventDate,
      description: e.description,
    })),
  );
  return { error: error?.message ?? null };
}
