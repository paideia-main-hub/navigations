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
   * Applied Skills and Project Showcase; false for Live Performances. */
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

/** Entry fee per registration, in Pakistani rupees — the same for every
 * League competition. New competitions start with it; an admin can still
 * change one competition's amount from its Overview tab. */
export const DEFAULT_ENTRY_FEE = 1000;

/** "PKR 1,000" */
export function formatFee(amount: number): string {
  return `PKR ${amount.toLocaleString("en-US")}`;
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
