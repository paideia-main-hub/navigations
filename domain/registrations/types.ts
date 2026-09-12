import type { AgeCategory } from "@/domain/competitions/types";

export type RegistrationStatus = "pending" | "approved" | "rejected" | "qualified" | "finalist" | "completed";

export interface Registration {
  id: string;
  registrationNumber: string;
  competitionSlug: string;
  competitionTitle: string;
  entryType: "individual" | "team";
  entrantName: string;
  status: RegistrationStatus;
  submittedAt: string;
}

export const registrationStatusLabels: Record<RegistrationStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  qualified: "Qualified",
  finalist: "Finalist",
  completed: "Completed",
};

export interface SubmitRegistrationInput {
  competitionSlug: string;
  competitionTitle: string;
  category: AgeCategory;
  entryType: "individual" | "team";
  schoolId: string | null;
  /** individual entry: the real students.id being registered */
  studentId?: string;
  /** team entry */
  teamName?: string;
  /** real students.id values already known (roster picks, or the registering student's own id) */
  existingMemberIds?: string[];
  /** free-typed teammate names to create as ad-hoc student rows (student self-registration only) */
  newTeammateNames?: string[];
  entrantNameForDisplay: string;
  consent: { terms: boolean; privacy: boolean; results: boolean; photo: boolean };
}
