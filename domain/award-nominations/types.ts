export type AwardNominationStatus =
  | "draft"
  | "submitted"
  | "needs_clarification"
  | "needs_third_review"
  | "judged"
  | "approved"
  | "rejected"
  | "published";

export type AwardRoute = "implemented" | "future_proposal";
export type AwardEvidenceType = "pdf" | "image" | "audio" | "video" | "link";

export const nominationStatusLabels: Record<AwardNominationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  needs_clarification: "Needs clarification",
  needs_third_review: "Needs third review",
  judged: "Judged",
  approved: "Approved",
  rejected: "Rejected",
  published: "Published",
};

export interface AwardEvidenceFile {
  id: string;
  fileType: AwardEvidenceType;
  fileUrl: string;
  sizeBytes: number | null;
  pageCount: number | null;
}

export interface AwardEventRecord {
  id?: string;
  sport: string;
  event: string;
  organizer: string;
  level: string;
  role: string;
  result: string;
  evidenceNote: string;
  orderIndex: number;
}

export interface AwardNomination {
  id: string;
  nominationNumber: string;
  categoryId: string;
  categorySlug: string;
  categoryTitle: string;
  nominatorProfileId: string;
  schoolId: string | null;
  schoolName: string | null;
  nomineeName: string;
  nomineeRelationship: string | null;
  route: AwardRoute | null;
  formData: Record<string, string>;
  verifierName: string | null;
  verifierContact: string | null;
  status: AwardNominationStatus;
  submittedAt: string | null;
  createdAt: string;
  evidenceFiles: AwardEvidenceFile[];
  eventRecords: AwardEventRecord[];
  /** Direct admin scoring — the "hardcoded" per-category rubric scored by an
   * admin rather than a two-judge assignment. Drives automatic winner
   * ranking (see domain/award-nominations/service.ts#recomputeCategoryWinners). */
  adminCriteriaScores: Record<string, number>;
  adminTotalScore: number | null;
  /** Set by recomputeCategoryWinners — true only while this nomination is
   * the current top-ranked, threshold-meeting entry (within max_winners) in
   * its category. Recomputed every time any nomination in the category is
   * (re)scored, so it always reflects the latest standings. */
  isWinner: boolean;
  winnerPhotoUrl: string | null;
}

export interface SubmitNominationInput {
  categoryId: string;
  categorySlug: string;
  schoolId: string | null;
  nomineeName: string;
  nomineeRelationship: string | null;
  route: AwardRoute | null;
  formData: Record<string, string>;
  verifierName: string | null;
  verifierContact: string | null;
  eventRecords: Omit<AwardEventRecord, "id">[];
  consent: { terms: boolean; privacy: boolean; resultPublication: boolean; photoPublication: boolean };
}
