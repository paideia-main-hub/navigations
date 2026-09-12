import type { JudgeAssignment } from "@/domain/judging/types";

const assignments: JudgeAssignment[] = [
  {
    id: "assign-1",
    competitionSlug: "young-innovators-challenge",
    competitionTitle: "Young Innovators Challenge",
    stageTitle: "Final Showcase",
    entrantName: "Circuit Breakers",
    criteria: [
      { name: "Originality", weight: 30 },
      { name: "Technical execution", weight: 30 },
      { name: "Real-world impact", weight: 25 },
      { name: "Presentation", weight: 15 },
    ],
    status: "pending",
  },
  {
    id: "assign-2",
    competitionSlug: "young-innovators-challenge",
    competitionTitle: "Young Innovators Challenge",
    stageTitle: "Final Showcase",
    entrantName: "Amara K. (individual)",
    criteria: [
      { name: "Originality", weight: 30 },
      { name: "Technical execution", weight: 30 },
      { name: "Real-world impact", weight: 25 },
      { name: "Presentation", weight: 15 },
    ],
    status: "scored",
    totalScore: 88,
  },
  {
    id: "assign-3",
    competitionSlug: "debate-championship",
    competitionTitle: "Debate Championship",
    stageTitle: "Elimination Rounds",
    entrantName: "Team Orators United",
    criteria: [
      { name: "Argumentation", weight: 40 },
      { name: "Rebuttal", weight: 30 },
      { name: "Style & delivery", weight: 30 },
    ],
    status: "scored",
    totalScore: 91,
  },
];

export function listJudgeAssignments(): JudgeAssignment[] {
  return assignments;
}
