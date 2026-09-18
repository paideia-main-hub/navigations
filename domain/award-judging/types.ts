export interface AwardJudgeAssignment {
  id: string;
  nominationId: string;
  awardJudgeAssignmentId: string;
  categorySlug: string;
  categoryTitle: string;
  nomineeName: string;
  criteria: { key: string; label: string; weight: number }[];
  criteriaScores: Record<string, number>;
  comments: string | null;
  status: "pending" | "scored";
  totalScore?: number;
  locked: boolean;
}

/** Points at which two judges' scores for the same nomination are treated as
 * substantially different and auto-flagged for a third opinion (see the
 * doc's "additional review where their scores differ substantially"). */
export const DISAGREEMENT_THRESHOLD_POINTS = 15;
