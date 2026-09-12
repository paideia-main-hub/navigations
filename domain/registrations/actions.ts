"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { createTeam } from "@/domain/teams/service";
import { createAdHocTeammate } from "@/domain/students/service";
import { insertRegistration, insertConsentRecords } from "@/data/repositories/registrations.repository";
import { generateRegistrationNumber } from "./service";
import type { Registration, SubmitRegistrationInput } from "./types";

/** Orchestrates a full registration submission: creates a team (and any
 * ad-hoc teammate rows) if needed, inserts the registration, and records
 * consent — all server-side, against the real database. */
export async function submitRegistrationAction(
  input: SubmitRegistrationInput,
): Promise<{ registration: Registration | null; error: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { registration: null, error: "You must be logged in to register." };

  const supabase = await createClient();

  let studentId: string | undefined = input.studentId;
  let teamId: string | undefined;

  if (input.entryType === "individual" && !studentId) {
    return { registration: null, error: "No student profile found for this account." };
  }

  if (input.entryType === "team") {
    if (!input.teamName) return { registration: null, error: "Team name is required." };

    const memberIds = [...(input.existingMemberIds ?? [])];

    for (const name of input.newTeammateNames ?? []) {
      if (!name.trim()) continue;
      const { id, error } = await createAdHocTeammate(supabase, name.trim());
      if (error || !id) return { registration: null, error: error ?? "Failed to add a teammate." };
      memberIds.push(id);
    }

    if (memberIds.length < 2) {
      return { registration: null, error: "A team needs at least 2 members." };
    }

    const { teamId: newTeamId, error: teamError } = await createTeam(supabase, {
      name: input.teamName,
      schoolId: input.schoolId,
      memberStudentIds: memberIds,
    });
    if (teamError) return { registration: null, error: teamError };
    teamId = newTeamId;
    studentId = undefined;
  }

  const registrationNumber = generateRegistrationNumber();

  const { id: registrationId, error: regError } = await insertRegistration(supabase, {
    registrationNumber,
    competitionSlug: input.competitionSlug,
    competitionTitle: input.competitionTitle,
    category: input.category,
    entryType: input.entryType,
    studentId,
    teamId,
    schoolId: input.schoolId,
    registeredBy: user.id,
  });

  if (regError || !registrationId) {
    return { registration: null, error: regError ?? "Failed to submit registration." };
  }

  await insertConsentRecords(supabase, registrationId, user.id, input.consent);

  revalidatePath("/dashboard");

  return {
    registration: {
      id: registrationId,
      registrationNumber,
      competitionSlug: input.competitionSlug,
      competitionTitle: input.competitionTitle,
      entryType: input.entryType,
      entrantName: input.entrantNameForDisplay,
      status: "pending",
      submittedAt: new Date().toISOString(),
    },
    error: null,
  };
}
