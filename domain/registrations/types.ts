export type RegistrationStatus = "pending" | "approved" | "rejected" | "qualified" | "finalist" | "completed";

export interface Registration {
  id: string;
  registrationNumber: string;
  competitionSlug: string;
  competitionTitle: string;
  entryType: "individual" | "team";
  entrantName: string; // student full name, or team name
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
