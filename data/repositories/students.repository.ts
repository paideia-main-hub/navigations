// Mock roster for the (single, demo) school used by the School dashboard.
// Swap for a real query against `students` scoped to the coordinator's
// school_id once Supabase is wired up.

import type { StudentProfile } from "@/domain/students/types";

const roster: StudentProfile[] = [
  { id: "stu-1", fullName: "Amara Khan", grade: "8", guardianName: "Farah Khan" },
  { id: "stu-2", fullName: "Bilal Ahmed", grade: "8", guardianName: "Nadia Ahmed" },
  { id: "stu-3", fullName: "Layla Hassan", grade: "10", guardianName: "Omar Hassan" },
  { id: "stu-4", fullName: "Zain Malik", grade: "10", guardianName: "Sana Malik" },
  { id: "stu-5", fullName: "Meera Patel", grade: "5", guardianName: "Raj Patel" },
  { id: "stu-6", fullName: "Yusuf Siddiqui", grade: "5", guardianName: "Aisha Siddiqui" },
];

export function getSchoolRoster(): StudentProfile[] {
  return roster;
}
