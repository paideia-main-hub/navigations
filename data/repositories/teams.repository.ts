import type { Team } from "@/domain/teams/types";

const teams: Team[] = [
  {
    id: "team-1",
    name: "Circuit Breakers",
    competitionSlug: "young-innovators-challenge",
    members: [
      { studentName: "Amara Khan", grade: "8" },
      { studentName: "Bilal Ahmed", grade: "8" },
    ],
  },
  {
    id: "team-2",
    name: "EcoWatch",
    competitionSlug: "environmental-science-fair",
    members: [
      { studentName: "Layla Hassan", grade: "10" },
      { studentName: "Zain Malik", grade: "10" },
    ],
  },
];

export function getSchoolTeams(): Team[] {
  return teams;
}
