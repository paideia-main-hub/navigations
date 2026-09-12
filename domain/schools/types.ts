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
