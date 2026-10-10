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
  officialName: string;
  campusBranch: string | null;
  schoolType: string | null;
  city: string | null;
  country: string | null;
  principalName: string | null;
  schoolPhone: string | null;
  website: string | null;
  studentStrength: number | null;
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
