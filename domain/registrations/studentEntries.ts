/** One competition a student has prepared in the browser hamper until they
 * pay once for the whole list (same pattern as school coordinator entries). */
export interface StudentHamperDraft {
  competitionSlug: string;
  competitionTitle: string;
  /** Per-person fee from the competition; total is fee × memberCount. */
  feeAmount: number | null;
  entryType: "individual" | "team";
  teamName: string | null;
  /** Other members' names (the student is included automatically). */
  teammateNames: string[];
  grade: string;
  consent: StudentHamperConsent;
}

export interface StudentHamperConsent {
  terms: boolean;
  privacy: boolean;
  results: boolean;
  photo: boolean;
}

/** Members paying for this entry: the student plus named teammates. */
export function studentEntryMemberCount(entry: StudentHamperDraft): number {
  if (entry.entryType !== "team") return 1;
  return 1 + entry.teammateNames.filter((name) => name.trim()).length;
}

/** Display rows for the hamper card table — student first, then teammates. */
export function studentEntryEntrantNames(entry: StudentHamperDraft, studentName: string): string[] {
  const self = studentName.trim() || "You";
  if (entry.entryType !== "team") return [self];
  return [self, ...entry.teammateNames.map((name) => name.trim()).filter(Boolean)];
}

export function studentEntryFee(entry: StudentHamperDraft): number | null {
  if (entry.feeAmount == null) return null;
  return entry.feeAmount * studentEntryMemberCount(entry);
}

export function isStudentHamperDraft(value: unknown): value is StudentHamperDraft {
  if (!value || typeof value !== "object") return false;
  const entry = value as StudentHamperDraft;
  return (
    typeof entry.competitionSlug === "string" &&
    typeof entry.competitionTitle === "string" &&
    (entry.entryType === "individual" || entry.entryType === "team") &&
    (entry.teamName === null || typeof entry.teamName === "string") &&
    Array.isArray(entry.teammateNames) &&
    entry.teammateNames.every((name) => typeof name === "string") &&
    typeof entry.grade === "string" &&
    Boolean(entry.consent) &&
    entry.consent.terms === true &&
    entry.consent.privacy === true &&
    entry.consent.results === true &&
    entry.consent.photo === true
  );
}
