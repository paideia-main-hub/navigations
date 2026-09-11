// Domain layer: business rules for competitions. The UI layer only ever
// imports from here (never from data/repositories directly), so the data
// source can change without touching a single page or component.

import {
  getAllCompetitions,
  getCompetitionBySlug as fetchCompetitionBySlug,
} from "@/data/repositories/competitions.repository";
import type { AgeCategory, Competition, CompetitionStatus } from "./types";

export function listCompetitions(): Competition[] {
  return getAllCompetitions();
}

export function getCompetitionBySlug(slug: string): Competition | undefined {
  return fetchCompetitionBySlug(slug);
}

export function listOpenAndUpcoming(): Competition[] {
  return getAllCompetitions().filter((c) => c.status === "open" || c.status === "upcoming");
}

export function listPublishedWinners() {
  return getAllCompetitions().flatMap((c) =>
    c.winners.map((w) => ({ ...w, competitionTitle: c.title, competitionSlug: c.slug })),
  );
}

export function upcomingDates() {
  return getAllCompetitions()
    .flatMap((c) => [
      { competition: c.title, label: "Registration closes", date: c.registrationDeadline },
      { competition: c.title, label: "Final event", date: c.eventDate },
    ])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export interface CompetitionFilters {
  query?: string;
  category?: AgeCategory | "all";
  status?: CompetitionStatus | "all";
  sort?: "deadline" | "event-date" | "alphabetical";
}

/** Business rule (FR-03): search, filter and sort the competition directory. */
export function filterCompetitions(filters: CompetitionFilters): Competition[] {
  const { query = "", category = "all", status = "all", sort = "deadline" } = filters;

  let list = getAllCompetitions().filter((c) => {
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
    if (sort === "event-date") return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
    return new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime();
  });

  return list;
}

/** Business rule (FR-04): is a student in this grade eligible for this competition's category rule? */
export function isGradeEligible(minGrade: string, maxGrade: string, grade: string): boolean {
  const min = Number(minGrade);
  const max = Number(maxGrade);
  const value = Number(grade);
  if (Number.isNaN(min) || Number.isNaN(max) || Number.isNaN(value)) return true; // non-numeric grades: skip check
  return value >= min && value <= max;
}
