export interface JudgeAssignment {
  /** The registration being scored — unique per row in the list. */
  id: string;
  registrationId: string;
  judgeAssignmentId: string;
  competitionSlug: string;
  competitionTitle: string;
  stageTitle: string;
  entrantName: string;
  criteria: { name: string; weight: number }[];
  criteriaScores: Record<string, number>;
  comments: string | null;
  status: "pending" | "scored";
  totalScore?: number;
  locked: boolean;
}
