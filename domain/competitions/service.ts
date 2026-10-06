// Domain layer: business rules for competitions. The UI layer only ever
// imports from here (never from data/repositories directly), so the data
// source can change without touching a single page or component.

import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/competitions.repository";
import { listPublishedComputedWinners } from "@/domain/results/service";
import { awardRank } from "@/domain/results/types";
import { competencyLabel } from "./competencies";
import { isPubliclyVisible } from "./types";
import type {
  AgeCategory,
  Competition,
  CompetitionEvent,
  CompetitionPathway,
  CompetitionStatus,
  CompetitionSummary,
  EventType,
} from "./types";

/** Card/filter/deadline fields for every competition — what listings and
 * dashboard lookups want. For the full object graph use getCompetitionBySlug
 * (one competition) or listCompetitionsFull (all of them). */
export async function listCompetitions(supabase: SupabaseClient): Promise<CompetitionSummary[]> {
  return repo.getCompetitionSummaries(supabase);
}

/** listCompetitions minus drafts and archived competitions — for anything a
 * visitor sees. */
export async function listPublicCompetitions(supabase: SupabaseClient): Promise<CompetitionSummary[]> {
  const all = await repo.getCompetitionSummaries(supabase);
  return all.filter((c) => isPubliclyVisible(c.status));
}

/** Titles and slugs of publicly visible competitions, for index pages that
 * just link onward. */
export async function listCompetitionIndex(supabase: SupabaseClient) {
  const all = await repo.getCompetitionIndex(supabase);
  return all.filter((c) => isPubliclyVisible(c.status));
}

/** Every competition with every child table loaded. Rarely what you want. */
export async function listCompetitionsFull(supabase: SupabaseClient): Promise<Competition[]> {
  return repo.getAllCompetitions(supabase);
}

export async function getCompetitionBySlug(supabase: SupabaseClient, slug: string): Promise<Competition | null> {
  return repo.getCompetitionBySlug(supabase, slug);
}

/** getCompetitionBySlug, but null for a draft or archived competition — so
 * its public page and registration page 404 like it doesn't exist. */
export async function getPublicCompetitionBySlug(supabase: SupabaseClient, slug: string): Promise<Competition | null> {
  const competition = await repo.getCompetitionBySlug(supabase, slug);
  return competition && isPubliclyVisible(competition.status) ? competition : null;
}

export async function listOpenAndUpcoming(supabase: SupabaseClient): Promise<CompetitionSummary[]> {
  const all = await repo.getCompetitionSummaries(supabase);
  return all.filter((c) => c.status === "open" || c.status === "upcoming");
}

export interface PublishedWinner {
  studentName: string;
  schoolName: string;
  award: string;
  customAwardLabel: string | null;
  photoUrl: string | null;
  competitionTitle: string;
  competitionSlug: string;
  /** Only populated for winners computed from real registrations + judge
   * scoring — manually-entered (competition_winners) rows leave these unset. */
  season?: string | null;
  category?: string | null;
  entryType?: "individual" | "team";
  teamMembers?: string[];
}

/** Merges the two sources of published winners: manually-entered ones
 * (competition_winners — a fallback for competitions with no registration
 * data behind them) and computed ones (real registrations ranked by judge
 * scoring — see domain/results). Sorted gold -> silver -> bronze -> finalist
 * -> merit -> custom, computed winners first within each award tier. */
export async function listPublishedWinners(supabase: SupabaseClient): Promise<PublishedWinner[]> {
  const [all, computed] = await Promise.all([
    repo.getCompetitionWinnerRows(supabase),
    listPublishedComputedWinners(supabase),
  ]);

  const manual: PublishedWinner[] = all.flatMap((c) =>
    c.winners.map((w) => ({
      studentName: w.studentName,
      schoolName: w.schoolName,
      award: w.award,
      customAwardLabel: w.customAwardLabel,
      photoUrl: w.photoUrl,
      competitionTitle: c.title,
      competitionSlug: c.slug,
    })),
  );

  const fromComputed: PublishedWinner[] = computed.map((w) => ({
    studentName: w.entrantName,
    schoolName: w.schoolName ?? "—",
    award: w.award,
    customAwardLabel: w.customAwardLabel,
    photoUrl: w.photoUrl,
    competitionTitle: w.competitionTitle,
    competitionSlug: w.competitionSlug,
    season: w.season,
    category: w.category,
    entryType: w.entryType,
    teamMembers: w.teamMembers,
  }));

  return [...fromComputed, ...manual].sort((a, b) => {
    const rankA = awardRank[a.award as keyof typeof awardRank] ?? 99;
    const rankB = awardRank[b.award as keyof typeof awardRank] ?? 99;
    return rankA - rankB;
  });
}

export interface CompetitionWinnerGroup {
  competitionTitle: string;
  competitionSlug: string;
  /** Top 3 for that competition (gold/silver/bronze first, filling in with
   * whatever's next — finalist/merit/custom — only if fewer than 3 medals
   * were awarded). */
  podium: PublishedWinner[];
}

/** Splits a flat, cross-competition winners list (as returned by
 * listPublishedWinners) into one group per competition, each holding just
 * its own top 3 — the shape a "1st/2nd/3rd per competition" podium slider
 * needs, instead of one global top-3 that mixes unrelated competitions
 * together. Groups are ordered by their best award (a competition with a
 * published Gold leads), then alphabetically by title. */
export function groupWinnersByCompetition(winners: PublishedWinner[]): CompetitionWinnerGroup[] {
  const bySlug = new Map<string, PublishedWinner[]>();
  for (const w of winners) {
    const list = bySlug.get(w.competitionSlug) ?? [];
    list.push(w);
    bySlug.set(w.competitionSlug, list);
  }

  const groups: CompetitionWinnerGroup[] = Array.from(bySlug.entries()).map(([slug, list]) => {
    const sorted = [...list].sort((a, b) => {
      const rankA = awardRank[a.award as keyof typeof awardRank] ?? 99;
      const rankB = awardRank[b.award as keyof typeof awardRank] ?? 99;
      return rankA - rankB;
    });
    return {
      competitionTitle: sorted[0].competitionTitle,
      competitionSlug: slug,
      podium: sorted.slice(0, 3),
    };
  });

  return groups.sort((a, b) => {
    const bestA = awardRank[a.podium[0]?.award as keyof typeof awardRank] ?? 99;
    const bestB = awardRank[b.podium[0]?.award as keyof typeof awardRank] ?? 99;
    if (bestA !== bestB) return bestA - bestB;
    return a.competitionTitle.localeCompare(b.competitionTitle);
  });
}

export interface UpcomingDate {
  competition: string;
  /** Links the date back to its competition page. */
  slug: string;
  label: string;
  type: EventType;
  date: string;
}

export async function upcomingDates(supabase: SupabaseClient): Promise<UpcomingDate[]> {
  const all = await repo.getCompetitionEventRows(supabase);
  return all
    .filter((c) => isPubliclyVisible(c.status))
    .flatMap((c) =>
      c.events.map((e) => ({
        competition: c.title,
        slug: c.slug,
        label: e.title,
        type: e.type,
        date: e.eventDate,
      })),
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** Looks up a competition's registration-close event. A draft competition may have none yet. */
export function registrationDeadlineOf(competition: CompetitionSummary): string | undefined {
  return findEvent(competition.events, "registration_close");
}

/** Looks up a competition's final-event date. A draft competition may have none yet. */
export function finalEventDateOf(competition: CompetitionSummary): string | undefined {
  return findEvent(competition.events, "final_event");
}

function findEvent(events: CompetitionEvent[], type: CompetitionEvent["type"]): string | undefined {
  return events.find((e) => e.type === type)?.eventDate;
}

export interface CompetitionFilters {
  query?: string;
  category?: AgeCategory | "all";
  /** Route 1's four categories — Applied Skills Challenges, Independent
   * Submission, Project Showcasing, Live Performances. Distinct from
   * `category`, which is the grade tier (Primary/Middle/Secondary). */
  pathway?: CompetitionPathway | "all";
  /** A competencies entry — a framework code ("C01") or a custom name. */
  competency?: string | "all";
  status?: CompetitionStatus | "all";
  sort?: "deadline" | "event-date" | "alphabetical";
}

/** Business rule (FR-03): search, filter and sort the competition directory.
 * Pure and framework-agnostic (no Supabase import) so it's safe to call from
 * a "use client" component operating on an already-fetched list. */
export function filterCompetitionsClientSide<T extends CompetitionSummary>(
  competitions: T[],
  filters: CompetitionFilters,
): T[] {
  const { query = "", category = "all", pathway = "all", competency = "all", status = "all", sort = "deadline" } = filters;
  const q = query.toLowerCase();

  let list = competitions.filter((c) => {
    const matchesQuery =
      query.trim() === "" ||
      c.title.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q) ||
      c.competencies.some((v) => competencyLabel(v).toLowerCase().includes(q));
    const matchesCategory = category === "all" || c.eligibility.some((e) => e.category === category);
    const matchesPathway = pathway === "all" || c.pathway === pathway;
    const matchesCompetency = competency === "all" || c.competencies.includes(competency);
    const matchesStatus = status === "all" || c.status === status;
    return matchesQuery && matchesCategory && matchesPathway && matchesCompetency && matchesStatus;
  });

  list = [...list].sort((a, b) => {
    if (sort === "alphabetical") return a.title.localeCompare(b.title);
    const aDate = sort === "event-date" ? finalEventDateOf(a) : registrationDeadlineOf(a);
    const bDate = sort === "event-date" ? finalEventDateOf(b) : registrationDeadlineOf(b);
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });

  return list;
}

/** Server-side equivalent of filterCompetitionsClientSide — fetches once, then filters. */
export async function filterCompetitions(
  supabase: SupabaseClient,
  filters: CompetitionFilters,
): Promise<CompetitionSummary[]> {
  const all = await repo.getCompetitionSummaries(supabase);
  return filterCompetitionsClientSide(all, filters);
}

/** Business rule (FR-04): is a student in this grade eligible for this competition's category rule? */
export function isGradeEligible(minGrade: string, maxGrade: string, grade: string): boolean {
  const min = Number(minGrade);
  const max = Number(maxGrade);
  const value = Number(grade);
  if (Number.isNaN(min) || Number.isNaN(max) || Number.isNaN(value)) return true; // non-numeric grades: skip check
  return value >= min && value <= max;
}

// ---------------------------------------------------------------------------
// Admin functions — take the service-role client (createAdminClient()),
// thin pass-throughs to the repository. Callers (domain/competitions/actions.ts)
// are responsible for the admin session check before calling any of these.
// ---------------------------------------------------------------------------

export async function adminListCompetitions(admin: SupabaseClient): Promise<CompetitionSummary[]> {
  return repo.adminListCompetitions(admin);
}

export async function adminCountCompetitions(admin: SupabaseClient): Promise<number> {
  return repo.adminCountCompetitions(admin);
}

export async function adminGetCompetitionById(admin: SupabaseClient, id: string): Promise<Competition | null> {
  return repo.adminGetCompetitionById(admin, id);
}

export const createCompetition = repo.insertCompetition;
export const updateCompetitionCore = repo.updateCompetitionCore;
export const setCompetitionImageUrl = repo.setCompetitionImageUrl;
export const updateCompetitionStatus = repo.updateCompetitionStatus;
export const countCompetitionRegistrations = repo.countCompetitionRegistrations;

/** Deletes a competition only when nothing depends on it: a competition with
 * registrations carries student entries, payments, scores and results that
 * the cascade would erase, so it has to be archived instead. */
export async function deleteCompetition(admin: SupabaseClient, id: string): Promise<{ error: string | null }> {
  const registrations = await repo.countCompetitionRegistrations(admin, id);
  if (registrations === null) return { error: "Couldn't check this competition's registrations — nothing was deleted." };
  if (registrations > 0) {
    return {
      error: `This competition has ${registrations} registration${registrations === 1 ? "" : "s"}, so it can't be deleted — deleting would erase those entries, payments and results. Set its status to Archived to hide it from the site instead.`,
    };
  }
  return repo.deleteCompetition(admin, id);
}
export const saveEligibility = repo.replaceEligibilityRules;
export const saveStages = repo.replaceStages;
export const saveRubric = repo.upsertRubric;
export const removeRubric = repo.deleteRubric;
export const addManual = repo.insertManual;
export const removeManual = repo.deleteManual;
export const addResource = repo.insertResource;
export const editResource = repo.updateResource;
export const removeResource = repo.deleteResource;
export const saveFaqs = repo.replaceFaqs;
export const addWinner = repo.insertWinner;
export const editWinner = repo.updateWinner;
export const removeWinner = repo.deleteWinner;
export const saveEvents = repo.replaceEvents;
export const upsertEventTypeForCompetitions = repo.upsertEventTypeForCompetitions;
export const upsertEventTypePerCompetition = repo.upsertEventTypePerCompetition;
export const bulkUpdateScheduleMeta = repo.bulkUpdateScheduleMeta;
export const deleteEventTypeForCompetitions = repo.deleteEventTypeForCompetitions;

export type {
  CompetitionCoreInput,
  EligibilityRuleInput,
  StageInput,
  StageRubricInput,
  ManualInput,
  ResourceInput,
  FaqInput,
  WinnerInput,
  EventInput,
} from "@/data/repositories/competitions.repository";
