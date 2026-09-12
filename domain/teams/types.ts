export interface TeamMember {
  studentName: string;
  grade: string;
}

export interface Team {
  id: string;
  name: string;
  competitionSlug: string;
  members: TeamMember[];
}
