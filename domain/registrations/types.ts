import type { AgeCategory } from "@/domain/competitions/types";
import type { PaymentStatus } from "@/domain/payments/types";

export type RegistrationStatus = "pending" | "approved" | "rejected" | "qualified" | "finalist" | "completed";

export interface Registration {
  id: string;
  registrationNumber: string;
  competitionSlug: string;
  competitionTitle: string;
  entryType: "individual" | "team";
  entrantName: string;
  /** populated for entryType "team": names of every teammate */
  teamMembers?: string[];
  status: RegistrationStatus;
  submittedAt: string;
  /** Null until a receipt has been uploaded for this registration — the fee
   * payment is a separate approval from the registration's own status, so a
   * registration can be "pending" review while its payment is already
   * approved, or vice versa. See domain/payments. */
  paymentStatus: PaymentStatus | null;
}

export type DisplayStatus = "registered" | "upcoming" | "in_progress" | "qualified" | "completed" | "rejected";

export const displayStatusLabels: Record<DisplayStatus, string> = {
  registered: "Registered",
  upcoming: "Upcoming",
  in_progress: "In Progress",
  qualified: "Qualified",
  completed: "Completed",
  rejected: "Rejected",
};

export const registrationStatusLabels: Record<RegistrationStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  qualified: "Qualified",
  finalist: "Finalist",
  completed: "Completed",
};

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "This student";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** Duplicate-entry copy. Under review means they have applied. Approved means they are registered. */
export function alreadyEnteredMessage(
  competitionTitle: string,
  lines: { name: string; standing: "approved" | "under review" }[],
): string {
  const applied = lines.filter((line) => line.standing !== "approved").map((line) => line.name);
  const registered = lines.filter((line) => line.standing === "approved").map((line) => line.name);
  const parts: string[] = [];
  if (applied.length === 1) {
    parts.push(`${applied[0]} has already applied for ${competitionTitle} and can only be applied once.`);
  } else if (applied.length > 1) {
    parts.push(`${joinNames(applied)} have already applied for ${competitionTitle} and can only be applied once.`);
  }
  if (registered.length === 1) {
    parts.push(`${registered[0]} has already registered for ${competitionTitle}.`);
  } else if (registered.length > 1) {
    parts.push(`${joinNames(registered)} have already registered for ${competitionTitle}.`);
  }
  return parts.join(" ");
}

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
