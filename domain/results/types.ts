import type { AwardType } from "@/domain/competitions/types";

export interface ResultInfo {
  registrationId: string;
  award: string | null;
  customAwardLabel: string | null;
  score: number | null;
  photoUrl: string | null;
}

/** One row of the admin "Results" review screen: every registration in a
 * competition, whether or not it's been scored/generated/published yet. */
export interface DraftResultRow {
  resultId: string | null;
  registrationId: string;
  entrantName: string;
  entryType: "individual" | "team";
  category: string;
  schoolName: string | null;
  averageScore: number | null;
  judgeCount: number;
  award: AwardType | null;
  customAwardLabel: string | null;
  isPublished: boolean;
  hasResultConsent: boolean;
  hasPhotoConsent: boolean;
  photoUrl: string | null;
}

/** A published winner sourced from a real registration + judge scoring,
 * shaped to merge with the manually-entered CompetitionWinner list. */
export interface ComputedWinner {
  entrantName: string;
  entryType: "individual" | "team";
  teamMembers?: string[];
  schoolName: string | null;
  award: AwardType;
  customAwardLabel: string | null;
  photoUrl: string | null;
  competitionTitle: string;
  competitionSlug: string;
  season: string | null;
  category: string;
}

export const awardRank: Record<AwardType, number> = {
  gold: 0,
  silver: 1,
  bronze: 2,
  finalist: 3,
  merit: 4,
  custom: 5,
};
