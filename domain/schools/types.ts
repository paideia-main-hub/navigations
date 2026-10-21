export const SCHOOL_TYPES = [
  "Government",
  "Private with National Curriculum",
  "Private with Oxford Curriculum",
] as const;

export type SchoolType = (typeof SCHOOL_TYPES)[number];

export function isSchoolType(value: string): value is SchoolType {
  return (SCHOOL_TYPES as readonly string[]).includes(value);
}

export interface School {
  id: string;
  /** Future Ready League school ID (e.g. FRL-S-2026-00001). */
  frlId: string | null;
  officialName: string;
  campusBranch: string | null;
  schoolType: string | null;
  city: string | null;
  country: string | null;
  principalName: string | null;
  schoolPhone: string | null;
  website: string | null;
  studentStrength: number | null;
  /** ISO timestamp; populated by admin-overview reads. */
  createdAt?: string | null;
  /** Populated by admin-overview reads (adminListSchools). */
  coordinators?: SchoolCoordinatorSummary[];
}

export interface SchoolCoordinatorSummary {
  name: string;
  mobile: string | null;
}

export interface SchoolProfileInput {
  officialName: string;
  schoolType: string | null;
  city: string | null;
  country: string | null;
  principalName: string | null;
  schoolPhone: string | null;
  website: string | null;
}
