import { getSchoolRoster } from "@/data/repositories/students.repository";
import type { StudentProfile } from "./types";

export function listSchoolRoster(): StudentProfile[] {
  return getSchoolRoster();
}
