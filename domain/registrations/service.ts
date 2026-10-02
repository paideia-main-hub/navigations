import type { SupabaseClient } from "@supabase/supabase-js";
import {
  adminListAllRegistrations,
  listRegistrationsBySchool,
  listRegistrationsByRegistrant,
} from "@/data/repositories/registrations.repository";
import type { CompetitionSummary } from "@/domain/competitions/types";
import { registrationDeadlineOf, finalEventDateOf } from "@/domain/competitions/service";
import type { DisplayStatus, Registration } from "./types";

export async function listSchoolRegistrations(supabase: SupabaseClient, schoolId: string): Promise<Registration[]> {
  return listRegistrationsBySchool(supabase, schoolId);
}

export async function listMyRegistrations(supabase: SupabaseClient, profileId: string): Promise<Registration[]> {
  return listRegistrationsByRegistrant(supabase, profileId);
}

export async function listAllRegistrations(
  admin: SupabaseClient,
  filters?: { competitionSlug?: string },
): Promise<Registration[]> {
  return adminListAllRegistrations(admin, filters);
}

/** A registration's own reference, e.g. FRL-2026-R-482913 — Future Ready
 * League, then "R" for registration so it can't be mistaken for a student's
 * FRL ID (FRL-2026-00017), which identifies the person across all their
 * registrations. Six random digits keep collisions with the unique
 * registration_number column vanishingly rare. */
export function generateRegistrationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `FRL-${year}-R-${random}`;
}

/** Business rule: combine the registration's own status with the
 * competition's timing to produce the "My Competitions" status the spec
 * calls for (Registered / Upcoming / In Progress / Qualified / Completed). */
export function deriveDisplayStatus(registration: Registration, competition: CompetitionSummary | undefined): DisplayStatus {
  if (registration.status === "rejected") return "rejected";
  if (registration.status === "completed") return "completed";
  if (registration.status === "qualified" || registration.status === "finalist") return "qualified";

  if (!competition) return "registered";

  const deadlineStr = registrationDeadlineOf(competition);
  const eventStr = finalEventDateOf(competition);
  if (!deadlineStr || !eventStr) return "registered";

  const now = Date.now();
  const deadline = new Date(deadlineStr).getTime();
  const event = new Date(eventStr).getTime();

  if (now < deadline) return "upcoming";
  if (now <= event) return "in_progress";
  return "completed";
}

/** Splits registrations into "current" (still active) and "concluded" —
 * the partition behind the dashboards' current-activity tabs (My
 * Competitions / Registrations) vs their History & Results tab, so the same
 * registration never appears on both.
 *
 * Deliberately keyed off deriveDisplayStatus rather than the raw
 * registration.status column: nothing in the app ever transitions that
 * column away from its "pending" default (there's no approve/reject-
 * registration admin action), so a filter on the raw status would never
 * actually move anything into History for real data — only the
 * competition-dates fallback inside deriveDisplayStatus does. */
export function isConcludedDisplayStatus(status: DisplayStatus): boolean {
  return status === "completed" || status === "rejected";
}

/** The full "is this done" check for the current-vs-history split: either
 * deriveDisplayStatus already says so, or — since a competition's dates are
 * often left unset, which leaves deriveDisplayStatus unable to tell — a
 * result has actually been published for it, which is the one signal that's
 * always a deliberate, reliable admin action regardless of whether dates
 * were ever entered. */
export function isRegistrationConcluded(
  registration: Registration,
  competition: CompetitionSummary | undefined,
  hasPublishedResult: boolean,
): boolean {
  return hasPublishedResult || isConcludedDisplayStatus(deriveDisplayStatus(registration, competition));
}
