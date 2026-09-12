export interface JudgeAssignment {
  id: string;
  competitionSlug: string;
  competitionTitle: string;
  stageTitle: string;
  entrantName: string;
  criteria: { name: string; weight: number }[];
  status: "pending" | "scored";
  totalScore?: number;
}
