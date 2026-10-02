"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";
import { getCurrentUser } from "@/domain/auth/session";
import { requireAdminSession } from "@/domain/admin-auth/guard";
import { getOwnStudentProfile } from "@/domain/students/service";
import {
  adminGetSubmission,
  adminScoreSubmission,
  getSubmissionForRegistration,
  listOwnRegistrationsIn,
  upsertOwnSubmission,
} from "@/data/repositories/submissions.repository";
import {
  rubricCriteria,
  rubricMax,
  submissionConfigFor,
  SUBMISSION_SLUGS,
  validateForSubmit,
  type SubmissionFile,
} from "./config";

const BUCKET = "work-submissions";

/** Saves the student's entry for one of their Independent Submission
 * registrations — as a draft, or as the final submission once every
 * requirement in the competition's manual is met. Files have already been
 * uploaded straight to storage by the browser (under the student's own
 * folder); this records their paths alongside the typed answers. Editable
 * until an admin scores it. */
export async function saveSubmissionAction(input: {
  registrationId: string;
  answers: Record<string, string>;
  files: Record<string, SubmissionFile>;
  submit: boolean;
}): Promise<{ error: string | null; problems?: string[] }> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in." };

  const supabase = await createClient();
  const student = await getOwnStudentProfile(supabase, user.id);
  const mine = await listOwnRegistrationsIn(supabase, user.id, student?.id ?? null, SUBMISSION_SLUGS);
  const registration = mine.find((r) => r.registrationId === input.registrationId);
  if (!registration) return { error: "You can only submit work for competitions you're registered in." };

  const config = submissionConfigFor(registration.competitionSlug);
  if (!config) return { error: "This competition doesn't take work submissions." };

  const existing = await getSubmissionForRegistration(supabase, input.registrationId);
  if (existing?.status === "scored") return { error: "This entry has already been reviewed and can no longer be changed." };

  // Keep only known fields, and only files inside this student's own folder
  // for this registration.
  const known = new Set(config.fields.map((f) => f.id));
  const answers = Object.fromEntries(
    Object.entries(input.answers ?? {})
      .filter(([k, v]) => known.has(k) && typeof v === "string")
      .map(([k, v]) => [k, v.slice(0, 20000)]),
  );
  const prefix = `${user.id}/${input.registrationId}/`;
  const files: Record<string, SubmissionFile> = {};
  for (const [k, f] of Object.entries(input.files ?? {})) {
    if (!known.has(k) || !f || typeof f.path !== "string" || !f.path.startsWith(prefix)) continue;
    files[k] = { path: f.path, name: String(f.name ?? "").slice(0, 200), size: Number(f.size) || 0 };
  }

  if (input.submit) {
    const problems = validateForSubmit(config, answers, files);
    if (problems.length > 0) return { error: "Some required parts are missing.", problems };
  }

  const { error } = await upsertOwnSubmission(supabase, {
    registrationId: input.registrationId,
    competitionSlug: registration.competitionSlug,
    submittedBy: user.id,
    answers,
    files,
    status: input.submit ? "submitted" : (existing?.status === "submitted" ? "submitted" : "draft"),
  });
  if (error) return { error };

  revalidatePath("/dashboard/submissions");
  revalidatePath(`/dashboard/submissions/${input.registrationId}`);
  revalidatePath("/admin/submissions");
  return { error: null };
}

/** Admin: a short-lived link to open one uploaded file. */
export async function getSubmissionFileUrlAction(path: string): Promise<{ url: string | null; error: string | null }> {
  await requireAdminSession();
  const { data, error } = await createAdminClient().storage.from(BUCKET).createSignedUrl(path, 60 * 10);
  return { url: data?.signedUrl ?? null, error: error?.message ?? null };
}

/** Admin: records a mark for every rubric criterion (0 to the criterion's
 * maximum, half-marks allowed as the manuals permit) and optional feedback.
 * The total is computed here from the rubric, never trusted from the form.
 * Can be re-run to revise a score. */
export async function scoreSubmissionAction(input: {
  submissionId: string;
  scores: Record<string, number>;
  feedback: string;
}): Promise<{ error: string | null; total?: number }> {
  const admin = await requireAdminSession();
  const client = createAdminClient();
  const submission = await adminGetSubmission(client, input.submissionId);
  if (!submission) return { error: "Submission not found." };
  if (submission.status === "draft") return { error: "This entry hasn't been submitted yet." };

  const config = submissionConfigFor(submission.competitionSlug);
  if (!config) return { error: "No rubric is defined for this competition." };

  const scores: Record<string, number> = {};
  for (const c of rubricCriteria(config)) {
    const raw = input.scores?.[c.key];
    const value = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(value)) return { error: `Enter a mark for “${c.label}”.` };
    if (value < 0 || value > c.max) return { error: `“${c.label}” must be between 0 and ${c.max}.` };
    if (Math.round(value * 2) !== value * 2) return { error: `“${c.label}” can only use whole or half marks.` };
    scores[c.key] = value;
  }
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const isUuid = /^[0-9a-f-]{36}$/i.test(admin.id ?? "");

  const { error } = await adminScoreSubmission(client, input.submissionId, {
    scores,
    totalScore: total,
    maxScore: rubricMax(config),
    feedback: input.feedback?.trim() ? input.feedback.trim().slice(0, 5000) : null,
    reviewedBy: isUuid ? admin.id : null,
  });
  if (error) return { error };

  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${input.submissionId}`);
  revalidatePath("/dashboard/submissions");
  return { error: null, total };
}
