export interface TeamMember {
  studentId: string;
  studentName: string;
  grade: string | null;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  /** Set when the team was created while registering for one competition. */
  competitionId?: string | null;
  /** Populated only by admin-overview reads (adminListAllTeams). */
  schoolName?: string | null;
  /** Competition titles from the team's competition_id and/or registrations. */
  competitionTitles?: string[];
  /** ISO timestamp; populated by admin-overview reads. */
  createdAt?: string | null;
}

/** True when another team already uses this name. Matching ignores case and surrounding spaces. */
export function teamNameTaken(name: string, teams: { id: string; name: string }[], exceptTeamId?: string): boolean {
  const key = name.trim().toLowerCase();
  if (!key) return false;
  return teams.some((team) => team.id !== exceptTeamId && team.name.trim().toLowerCase() === key);
}

/** A team is set for a competition when it was created for it, or it is already on that competition's entry list. */
export function teamIsSetForCompetition(
  team: { id: string; name: string; competitionId?: string | null },
  competitionId: string,
  reservedTeamIds: string[],
): boolean {
  if (team.competitionId === competitionId) return true;
  return reservedTeamIds.includes(team.id) || reservedTeamIds.includes(team.name.trim().toLowerCase());
}

/** Teams for this competition, plus school teams that are not tied to a different competition. */
export function teamVisibleForCompetition(
  team: { id: string; name: string; competitionId?: string | null },
  competitionId: string,
  reservedTeamIds: string[],
): boolean {
  if (!team.competitionId || team.competitionId === competitionId) return true;
  return reservedTeamIds.includes(team.id) || reservedTeamIds.includes(team.name.trim().toLowerCase());
}

export const DUPLICATE_TEAM_NAME = "Another team already uses this name for this competition.";
