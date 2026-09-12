import type { SupabaseClient } from "@supabase/supabase-js";
import * as repo from "@/data/repositories/judge-applications.repository";
import type { AdminJudgeApplication, InterviewMode, JudgeApplication } from "./types";

export async function listMyApplications(supabase: SupabaseClient, profileId: string): Promise<JudgeApplication[]> {
  const judge = await repo.findJudgeByProfile(supabase, profileId);
  if (!judge) return [];
  return repo.listMyApplications(supabase, judge.id);
}

export async function applyToJudge(
  supabase: SupabaseClient,
  profileId: string,
  competitionId: string,
): Promise<{ error: string | null }> {
  const judge = await repo.findJudgeByProfile(supabase, profileId);
  if (!judge) return { error: "No judge profile found for this account." };
  return repo.applyToCompetition(supabase, judge.id, competitionId);
}

// --- Admin ---

export async function adminListApplications(admin: SupabaseClient): Promise<AdminJudgeApplication[]> {
  return repo.adminListApplications(admin);
}

export async function scheduleInterview(
  admin: SupabaseClient,
  id: string,
  input: { mode: InterviewMode; at: string; location: string },
): Promise<{ error: string | null }> {
  return repo.scheduleInterview(admin, id, input);
}

export async function approveApplication(
  admin: SupabaseClient,
  id: string,
  reviewedBy: string | null,
): Promise<{ error: string | null }> {
  const application = await repo.adminGetApplicationById(admin, id);
  if (!application) return { error: "Application not found." };

  const { error: approveError } = await repo.approveApplication(admin, id, reviewedBy);
  if (approveError) return { error: approveError };

  return repo.grantCompetitionAccess(admin, application.judgeId, application.competitionId);
}

export async function rejectApplication(
  admin: SupabaseClient,
  id: string,
  notes: string | null,
  reviewedBy: string | null,
): Promise<{ error: string | null }> {
  return repo.rejectApplication(admin, id, notes, reviewedBy);
}
