import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listRegistrationsBySchool,
  listRegistrationsByRegistrant,
} from "@/data/repositories/registrations.repository";
import type { Competition } from "@/domain/competitions/types";
import type { DisplayStatus, Registration } from "./types";

export async function listSchoolRegistrations(supabase: SupabaseClient, schoolId: string): Promise<Registration[]> {
  return listRegistrationsBySchool(supabase, schoolId);
}

export async function listMyRegistrations(supabase: SupabaseClient, profileId: string): Promise<Registration[]> {
  return listRegistrationsByRegistrant(supabase, profileId);
}

export function generateRegistrationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FCS-${year}-${random}`;
}

/** Business rule: combine the registration's own status with the
 * competition's timing to produce the "My Competitions" status the spec
 * calls for (Registered / Upcoming / In Progress / Qualified / Completed). */
export function deriveDisplayStatus(registration: Registration, competition: Competition | undefined): DisplayStatus {
  if (registration.status === "rejected") return "rejected";
  if (registration.status === "completed") return "completed";
  if (registration.status === "qualified" || registration.status === "finalist") return "qualified";

  if (!competition) return "registered";

  const now = Date.now();
  const deadline = new Date(competition.registrationDeadline).getTime();
  const event = new Date(competition.eventDate).getTime();

  if (now < deadline) return "upcoming";
  if (now <= event) return "in_progress";
  return "completed";
}
