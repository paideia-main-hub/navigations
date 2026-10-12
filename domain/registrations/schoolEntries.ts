import type { AgeCategory } from "@/domain/competitions/types";

/** One competition a school coordinator has prepared, held in the browser
 * until they register the whole list with one receipt. */
export interface SchoolEntryDraft {
  /** Set for a team so several teams of one competition can sit on the list. */
  id?: string;
  competitionSlug: string;
  competitionTitle: string;
  feeAmount: number | null;
  entryType: "individual" | "team";
  teamName: string | null;
  /** Existing school team, so registration does not create a second copy. */
  teamId?: string;
  students: SchoolEntryStudent[];
  consent: SchoolEntryConsent;
}

export interface SchoolEntryStudent {
  id: string;
  fullName: string;
  grade: string | null;
  category: AgeCategory;
}

export interface SchoolEntryConsent {
  terms: boolean;
  privacy: boolean;
  results: boolean;
  photo: boolean;
}

/** The admin fee is per student, including each member of a team. */
export function schoolEntryFee(entry: SchoolEntryDraft): number | null {
  if (entry.feeAmount == null) return null;
  return entry.feeAmount * Math.max(entry.students.length, 1);
}

export function isSchoolEntryDraft(value: unknown): value is SchoolEntryDraft {
  if (!value || typeof value !== "object") return false;
  const entry = value as SchoolEntryDraft;
  return (
    (entry.id === undefined || typeof entry.id === "string") &&
    typeof entry.competitionSlug === "string" &&
    typeof entry.competitionTitle === "string" &&
    (entry.entryType === "individual" || entry.entryType === "team") &&
    (entry.teamId === undefined || typeof entry.teamId === "string") &&
    Array.isArray(entry.students) &&
    entry.students.every(
      (student) =>
        student &&
        typeof student.id === "string" &&
        typeof student.fullName === "string" &&
        (student.category === "primary" || student.category === "middle" || student.category === "secondary"),
    ) &&
    Boolean(entry.consent) &&
    entry.consent.terms === true &&
    entry.consent.privacy === true &&
    entry.consent.results === true &&
    entry.consent.photo === true
  );
}
