export interface StudentProfile {
  id: string;
  fullName: string;
  grade: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  guardianName: string | null;
  guardianRelationship: string | null;
  guardianEmail: string | null;
  guardianMobile: string | null;
  /** Collected once, at account self-registration or when a coordinator adds
   * the student, and reused everywhere a photo is needed — the winner
   * publication flow reads this instead of an admin uploading one per
   * result. Null until uploaded. */
  photoUrl: string | null;
  /** Future Ready League student ID (e.g. FRL-2026-00001), assigned by the
   * database when the student record is created — migration 0024. Null only
   * on a database that hasn't had that migration applied yet. */
  frlId: string | null;
  /** Populated by admin-overview reads (adminListAllStudents) and the
   * student's own profile read. */
  schoolId?: string | null;
  schoolName?: string | null;
}

export interface AddStudentInput {
  fullName: string;
  grade: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  guardianName: string | null;
  guardianRelationship: string | null;
  guardianEmail: string | null;
  guardianMobile: string | null;
}
