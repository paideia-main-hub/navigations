import { getSchoolTeams } from "@/data/repositories/teams.repository";
import type { Team } from "./types";

export function listSchoolTeams(): Team[] {
  return getSchoolTeams();
}
