export interface TeamMember {
  studentId: string;
  studentName: string;
  grade: string | null;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  /** Populated only by admin-overview reads (adminListAllTeams). */
  schoolName?: string | null;
}
