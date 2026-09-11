// Domain types for competitions — framework-agnostic, no Supabase or React imports.
// Mirrors the shape of the `competitions` family of tables in
// supabase/migrations/0001_init_schema.sql.

export type AgeCategory = "primary" | "middle" | "secondary";
export type CompetitionStatus = "draft" | "upcoming" | "open" | "closed" | "archived";
export type EntryType = "individual" | "team";

export interface EligibilityRule {
  category: AgeCategory;
  minGrade: string;
  maxGrade: string;
  teamMinSize?: number;
  teamMaxSize?: number;
}

export interface CompetitionStage {
  stageNumber: number;
  title: string;
  format: string;
  duration: string;
  taskDescription: string;
  progressionRule: string;
}

export interface RubricCriterion {
  name: string;
  weight: number;
}

export interface Winner {
  studentName: string;
  schoolName: string;
  award: "gold" | "silver" | "bronze" | "finalist";
  photoUrl?: string;
}

export interface Competition {
  slug: string;
  title: string;
  shortDescription: string;
  overview: string;
  domain: string;
  status: CompetitionStatus;
  participationType: EntryType | "both";
  registrationDeadline: string;
  eventDate: string;
  eligibility: EligibilityRule[];
  stages: CompetitionStage[];
  rubric: RubricCriterion[];
  faqs: { question: string; answer: string }[];
  winners: Winner[];
}

export const categoryLabels: Record<AgeCategory, string> = {
  primary: "Primary",
  middle: "Middle",
  secondary: "Secondary",
};

export const statusLabels: Record<CompetitionStatus, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  open: "Open",
  closed: "Closed",
  archived: "Archived",
};
