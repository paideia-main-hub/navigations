// Domain layer: business rules for competitions. The UI layer only ever
// imports from here (never from data/repositories directly), so the data
// source can change without touching a single page or component.

import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/competitions.repository";
import type {
  AgeCategory,
  Competition,
  CompetitionEvent,
  CompetitionStatus,
} from "./types";

export async function listCompetitions(supabase: SupabaseClient): Promise<Competition[]> {
  return repo.getAllCompetitions(supabase);
}

export async function getCompetitionBySlug(supabase: SupabaseClient, slug: string): Promise<Competition | null> {
  return repo.getCompetitionBySlug(supabase, slug);
}

export async function listOpenAndUpcoming(supabase: SupabaseClient): Promise<Competition[]> {
  const all = await repo.getAllCompetitions(supabase);
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
}

export async function listPublishedWinners(supabase: SupabaseClient): Promise<PublishedWinner[]> {
  const all = await repo.getAllCompetitions(supabase);
  return all.flatMap((c) =>
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
}

export interface UpcomingDate {
  competition: string;
  label: string;
  date: string;
}

export async function upcomingDates(supabase: SupabaseClient): Promise<UpcomingDate[]> {
  const all = await repo.getAllCompetitions(supabase);
  return all
    .flatMap((c) => c.events.map((e) => ({ competition: c.title, label: e.title, date: e.eventDate })))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** Looks up a competition's registration-close event. A draft competition may have none yet. */
export function registrationDeadlineOf(competition: Competition): string | undefined {
  return findEvent(competition.events, "registration_close");
}

/** Looks up a competition's final-event date. A draft competition may have none yet. */
export function finalEventDateOf(competition: Competition): string | undefined {
  return findEvent(competition.events, "final_event");
}

function findEvent(events: CompetitionEvent[], type: CompetitionEvent["type"]): string | undefined {
  return events.find((e) => e.type === type)?.eventDate;
}

export interface CompetitionFilters {
  query?: string;
  category?: AgeCategory | "all";
  status?: CompetitionStatus | "all";
  sort?: "deadline" | "event-date" | "alphabetical";
}

/** Business rule (FR-03): search, filter and sort the competition directory.
 * Pure and framework-agnostic (no Supabase import) so it's safe to call from
 * a "use client" component operating on an already-fetched list. */
export function filterCompetitionsClientSide(competitions: Competition[], filters: CompetitionFilters): Competition[] {
  const { query = "", category = "all", status = "all", sort = "deadline" } = filters;

  let list = competitions.filter((c) => {
    const matchesQuery =
      query.trim() === "" ||
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.domain.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "all" || c.eligibility.some((e) => e.category === category);
    const matchesStatus = status === "all" || c.status === status;
    return matchesQuery && matchesCategory && matchesStatus;
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
export async function filterCompetitions(supabase: SupabaseClient, filters: CompetitionFilters): Promise<Competition[]> {
  const all = await repo.getAllCompetitions(supabase);
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

export async function adminListCompetitions(admin: SupabaseClient): Promise<Competition[]> {
  return repo.adminListCompetitions(admin);
}

export async function adminGetCompetitionById(admin: SupabaseClient, id: string): Promise<Competition | null> {
  return repo.adminGetCompetitionById(admin, id);
}

export const createCompetition = repo.insertCompetition;
export const updateCompetitionCore = repo.updateCompetitionCore;
export const updateCompetitionStatus = repo.updateCompetitionStatus;
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
