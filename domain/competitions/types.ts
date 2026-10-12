// Domain types for competitions — framework-agnostic, no Supabase or React imports.
// Mirrors the shape of the `competitions` family of tables in
// supabase/migrations/0001_init_schema.sql (plus competition_faqs and
// competition_winners from 0009/0010).

export type AgeCategory = "primary" | "middle" | "secondary";
export type CompetitionStatus = "draft" | "upcoming" | "open" | "closed" | "archived";
export type ManualType = "registration_rules" | "guiding_principles" | "complete_manual" | "judging_rubric";
export type ResourceType = "practice_question" | "sample_task" | "video" | "quiz" | "article";
export type AwardType = "gold" | "silver" | "bronze" | "finalist" | "merit" | "custom";
export type EventType =
  | "registration_close"
  | "round"
  | "submission_deadline"
  | "result_date"
  | "final_event"
  | "other";

export interface EligibilityRule {
  id: string;
  category: AgeCategory;
  minGrade: string;
  maxGrade: string;
  minAge?: number | null;
  maxAge?: number | null;
  teamMinSize?: number | null;
  teamMaxSize?: number | null;
  notes?: string | null;
}

export interface CompetitionStage {
  id: string;
  stageNumber: number;
  title: string;
  format: string;
  duration: string;
  taskDescription: string;
  progressionRule: string;
  orderIndex: number;
}

export interface RubricCriterion {
  name: string;
  weight: number;
  scale?: string | null;
}

export interface StageRubric {
  id: string;
  /** null = a competition-wide rubric not tied to a specific stage. */
  stageId: string | null;
  criteria: RubricCriterion[];
  tieBreakRule: string | null;
  isPublic: boolean;
}

export interface Manual {
  id: string;
  type: ManualType;
  title: string;
  fileUrl: string;
  versionLabel: string | null;
  versionDate: string | null;
}

export interface Resource {
  id: string;
  stageId: string | null;
  type: ResourceType;
  title: string;
  content: string | null;
  videoUrl: string | null;
  orderIndex: number;
  downloadAllowed: boolean;
}

export interface CompetitionFaq {
  id: string;
  question: string;
  answer: string;
  orderIndex: number;
}

export interface CompetitionWinner {
  id: string;
  studentName: string;
  schoolName: string;
  award: AwardType;
  customAwardLabel: string | null;
  positionLabel: string | null;
  photoUrl: string | null;
  published: boolean;
  orderIndex: number;
}

export interface CompetitionEvent {
  id: string;
  type: EventType;
  title: string;
  eventDate: string;
  description: string | null;
}

/** What a listing needs: the card fields, the eligibility rules it filters and
 * labels by, and the events it reads deadlines from. Deliberately excludes the
 * heavy child tables (stages, rubrics, resources, FAQs) and the long `overview`
 * — a directory of 19 competitions that carries those ships roughly half a
 * megabyte of text nobody renders. Fetch with getCompetitionSummaries(). */
/** The four participation routes from "Ways to Participate". Null until an
 * admin assigns one. */
export type CompetitionPathway =
  | "applied_skills"
  | "independent_submission"
  | "project_showcase"
  | "live_response";

// Wording matches the catalogue's own "Choose your journey" table exactly
// (documentation/FRL_Catalogue_REVISED_Nov_Dec_2026.docx): "Applied Skills
// Challenges · Independent Submission · Project Showcasing · Live
// Performances" — not a paraphrase, so a coordinator reading both side by
// side sees the same four names.
export const pathwayLabels: Record<CompetitionPathway, string> = {
  applied_skills: "Applied Skills Challenges",
  independent_submission: "Independent Submission",
  project_showcase: "Project Showcasing",
  live_response: "Live Performances",
};

export const pathwayOrder: CompetitionPathway[] = [
  "applied_skills",
  "independent_submission",
  "project_showcase",
  "live_response",
];

export interface CompetitionSummary {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  /** Two short lines shown as small cards on the Important Dates carousel. */
  datesCardOne: string;
  datesCardTwo: string;
  domain: string;
  status: CompetitionStatus;
  pathway: CompetitionPathway | null;
  /** Framework codes ("C01") or custom names — see competencies.ts. Empty
   * until an admin tags the competition. */
  competencies: string[];
  imageUrl: string | null;
  /** Physical contest / performance venue. Unused for Independent Submission. */
  venue: string | null;
  /** Online work upload. Always true for Independent Submission; optional for
   * Applied Skills, Project Showcase, and Live Performances. */
  hasOnlineSubmission: boolean;
  supportsIndividual: boolean;
  supportsTeam: boolean;
  feeRequired: boolean;
  feeAmount: number | null;
  season: string | null;
  eligibility: EligibilityRule[];
  events: CompetitionEvent[];
  createdAt: string;
  updatedAt: string;
}

/** One competition with every child table loaded — what a detail page needs.
 * Extends the summary, so anything typed against CompetitionSummary accepts a
 * full Competition too. */
export interface Competition extends CompetitionSummary {
  overview: string;
  stages: CompetitionStage[];
  rubrics: StageRubric[];
  manuals: Manual[];
  resources: Resource[];
  faqs: CompetitionFaq[];
  winners: CompetitionWinner[];
}

export const categoryLabels: Record<AgeCategory, string> = {
  primary: "Primary",
  middle: "Middle",
  secondary: "Secondary",
};

/** Starting entry fee, in Pakistani rupees, for a competition an admin has
 * just created. Everywhere a fee is shown reads that competition's saved
 * fee_amount, which an admin can change from its Overview tab or Bulk changes. */
export const DEFAULT_ENTRY_FEE = 1000;

/** "PKR 1,000" */
export function formatFee(amount: number): string {
  return `PKR ${amount.toLocaleString("en-US")}`;
}

/** Team size for a competition. Members may come from any of its grade bands. */
export function competitionTeamSize(rules: Pick<EligibilityRule, "teamMinSize" | "teamMaxSize">[]): { min: number; max: number } {
  const mins = rules.map((rule) => rule.teamMinSize).filter((size): size is number => size != null && size > 0);
  const maxes = rules.map((rule) => rule.teamMaxSize).filter((size): size is number => size != null && size > 0);
  const min = mins.length > 0 ? Math.min(...mins) : 2;
  const max = maxes.length > 0 ? Math.max(...maxes) : min;
  return { min, max: Math.max(min, max) };
}

/** Combined open grades, such as "grades 6–10". */
export function competitionGradeLabel(rules: Pick<EligibilityRule, "minGrade" | "maxGrade">[]): string {
  const lows = rules.map((rule) => Number(rule.minGrade)).filter((grade) => !Number.isNaN(grade));
  const highs = rules.map((rule) => Number(rule.maxGrade)).filter((grade) => !Number.isNaN(grade));
  if (lows.length === 0 || highs.length === 0) return "an open grade";
  const low = Math.min(...lows);
  const high = Math.max(...highs);
  return low === high ? `grade ${low}` : `grades ${low}–${high}`;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "A student";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

/**
 * Says what a team is short of, and the next thing the coordinator should do.
 * Returns null when the current selection already fits the team size.
 */
export function teamRosterGuidance(input: {
  students: { id: string; fullName: string }[];
  takenIds: string[];
  selectedCount: number;
  min: number;
  max: number;
  gradeLabel: string;
  /** Teams already chosen that meet the size. */
  readyTeams?: number;
  /** The registration steps talk about choosing a team. The add-team form talks about choosing students. */
  place?: "form" | "journey";
}): string | null {
  const taken = input.students.filter((student) => input.takenIds.includes(student.id));
  const free = input.students.filter((student) => !input.takenIds.includes(student.id));
  const size = input.min === input.max ? `${input.min}` : `${input.min}–${input.max}`;
  const missing = Math.max(0, input.min - free.length);
  const takenText =
    taken.length > 0
      ? `${joinNames(taken.map((student) => student.fullName))} ${taken.length === 1 ? "is" : "are"} already on another team. `
      : "";
  const freeText =
    free.length === 0 ? "" : free.length === 1 ? `Only ${free[0]?.fullName} is free. ` : `${free.length} students are still free. `;
  const addText = missing === 1 ? "Add 1 more student." : `Add ${missing} more students.`;

  if ((input.readyTeams ?? 0) > 0) {
    if (missing <= 0) return null;
    const stillFree =
      free.length === 0 ? "No student is still free. " : free.length === 1 ? `Only ${free[0]?.fullName} is still free. ` : `${free.length} students are still free. `;
    return `The selected team can be registered. ${stillFree}To add another team, ${addText.charAt(0).toLowerCase()}${addText.slice(1)} Use ${input.gradeLabel}.`;
  }

  if (input.students.length === 0) {
    return `This team needs ${size} students in ${input.gradeLabel}. Add ${input.min === 1 ? "1 student" : `${input.min} students`}.`;
  }

  if (missing > 0) {
    return `This team needs ${size} students in ${input.gradeLabel}. ${takenText}${freeText}${addText}`;
  }

  if (input.selectedCount < input.min) {
    const more = input.min - input.selectedCount;
    if (input.place === "journey" && more === input.min) {
      return `Select a team of ${size}, or add one. A team can mix any ${input.gradeLabel}.`;
    }
    return more === input.min
      ? `Select ${size} students. A team can mix any ${input.gradeLabel}.`
      : `Select ${more} more student${more === 1 ? "" : "s"}. A team can mix any ${input.gradeLabel}.`;
  }

  if (input.selectedCount > input.max) {
    const extra = input.selectedCount - input.max;
    return `Uncheck ${extra} student${extra === 1 ? "" : "s"}. This team takes ${size} students.`;
  }

  return null;
}

function teamSizeLabel(rules: EligibilityRule[]): string | null {
  const mins = rules.map((rule) => rule.teamMinSize).filter((size): size is number => size != null && size > 0);
  const maxes = rules.map((rule) => rule.teamMaxSize).filter((size): size is number => size != null && size > 0);
  if (mins.length === 0 && maxes.length === 0) return null;
  const min = Math.min(...(mins.length > 0 ? mins : maxes));
  const max = Math.max(...(maxes.length > 0 ? maxes : mins));
  return min === max ? `${min} members` : `${min}–${max} members`;
}

/** How a competition is entered: individual, team required (with size), or both. */
export function entryFormatLabel(competition: Pick<CompetitionSummary, "supportsIndividual" | "supportsTeam" | "eligibility">): string {
  const size = teamSizeLabel(competition.eligibility);
  if (competition.supportsIndividual && competition.supportsTeam) {
    return size ? `Individual + team · ${size}` : "Individual + team";
  }
  if (competition.supportsTeam) {
    return size ? `Team required · ${size}` : "Team required";
  }
  return "Individual";
}

/** Statuses the public site shows. Draft (not ready yet) and Archived
 * (retired) competitions stay admin-only: they're left out of every public
 * listing and their public pages return 404. Signed-in dashboards still see
 * them, so a student's history keeps working after a competition is archived. */
export const publicStatuses: CompetitionStatus[] = ["upcoming", "open", "closed"];

export function isPubliclyVisible(status: CompetitionStatus): boolean {
  return publicStatuses.includes(status);
}

export const statusLabels: Record<CompetitionStatus, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  open: "Open",
  closed: "Closed",
  archived: "Archived",
};

export const manualTypeLabels: Record<ManualType, string> = {
  registration_rules: "Eligibility & Registration Rules",
  guiding_principles: "Guiding Principles",
  complete_manual: "Complete Competition Manual",
  judging_rubric: "Judging Rubric",
};

export const resourceTypeLabels: Record<ResourceType, string> = {
  practice_question: "Practice Question",
  sample_task: "Sample Task",
  video: "Video",
  quiz: "Quiz",
  article: "Article",
};

export const awardLabels: Record<AwardType, string> = {
  // The stored values stay gold/silver/bronze; these are the League's official
  // names for the three competition distinctions (Awards & Recognition
  // Framework), used everywhere a place is shown.
  gold: "Outstanding Performer",
  silver: "Distinguished Finalist",
  bronze: "Emerging Talent",
  finalist: "Finalist",
  merit: "Merit",
  custom: "Custom",
};

export const eventTypeLabels: Record<EventType, string> = {
  registration_close: "Registration closes",
  round: "Round",
  submission_deadline: "Online submission date",
  result_date: "Result date",
  final_event: "Final event",
  other: "Other",
};

/** Admin select labels — clearer than public eventTypeLabels. */
export const eventTypeAdminLabels: Record<EventType, string> = {
  registration_close: "Registration closes",
  round: "Round / competition day",
  submission_deadline: "Online submission date",
  result_date: "Result date",
  final_event: "Final event / ceremony",
  other: "Other",
};

/** Short admin hints — what each Type is for on this competition. */
export const eventTypeHints: Record<EventType, string> = {
  registration_close:
    "Last day/time to register for this competition. Used for “registration closes” on cards and sorting by deadline.",
  round: "Contest / performance day at the venue for this competition.",
  submission_deadline: "Last day to upload online work for this competition.",
  result_date: "When results for this competition are published.",
  final_event: "Showcase, finale, or awards moment tied to this competition.",
  other: "Any other milestone that should appear in Important Dates on the competition page.",
};

/** Ordered list used by bulk-date tools and wide admin tables. */
export const allEventTypes: EventType[] = [
  "registration_close",
  "round",
  "submission_deadline",
  "result_date",
  "final_event",
  "other",
];
