// Domain types for award categories — framework-agnostic, no Supabase or
// React imports. Mirrors supabase/migrations/0016_awards.sql's
// award_categories table.

export type AwardLayer = "competition_distinction" | "school_award" | "spotlight" | "teacher_parent" | "sports" | "principal";
export type AwardCategoryStatus = "draft" | "open" | "closed" | "archived";

export interface RubricCriterion {
  key: string;
  label: string;
  weight: number;
}

export interface AwardCategory {
  id: string;
  slug: string;
  title: string;
  layer: AwardLayer;
  description: string;
  requiresSchool: boolean;
  allowsIndependent: boolean;
  rubricCriteria: RubricCriterion[];
  passThreshold: number;
  /** Ordered criterion keys consulted in sequence when two scores tie. */
  tieBreakOrder: string[];
  maxWinners: number | null;
  evidencePeriodStart: string | null;
  evidencePeriodEnd: string | null;
  closingAt: string | null;
  status: AwardCategoryStatus;
  createdAt: string;
  updatedAt: string;
}

export const layerLabels: Record<AwardLayer, string> = {
  competition_distinction: "Competition Distinctions",
  school_award: "School Awards",
  spotlight: "Spotlight Awards",
  teacher_parent: "Teacher and Parent Recognition",
  sports: "Sports Recognition",
  principal: "Principal Recognition",
};

export const categoryStatusLabels: Record<AwardCategoryStatus, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
  archived: "Archived",
};

/** Route 2's seven nomination categories (3 Spotlight, 2 Teacher & Parent,
 * 2 Sports), per the published calendar. Competition Distinctions and School
 * Awards come out of Route 1 results, and Principal recognition is announced
 * separately, so none of those are entered through Route 2. */
export const routeTwoLayers: AwardLayer[] = ["spotlight", "teacher_parent", "sports"];

/** Layers with no submission at all — categories exist purely for their
 * public criteria page and computed/published results. */
export const computedLayers: AwardLayer[] = ["competition_distinction", "school_award"];

/** Layers scored against rubricCriteria with a pass_threshold gate. */
export const judgedLayers: AwardLayer[] = ["spotlight", "sports", "principal"];

/** teacher_parent is the only layer with no scoring — every complete, valid
 * nomination is approved. */
export function isJudgedLayer(layer: AwardLayer): boolean {
  return judgedLayers.includes(layer);
}
