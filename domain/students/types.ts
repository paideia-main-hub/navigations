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
  /** Populated only by admin-overview reads (adminListAllStudents). */
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
