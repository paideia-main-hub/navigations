import { listJudgeAssignments } from "@/data/repositories/judging.repository";
import type { JudgeAssignment } from "./types";

export function listAssignments(): JudgeAssignment[] {
  return listJudgeAssignments();
}
