"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";
import { getCurrentUser } from "@/domain/auth/session";
import { getPublicCompetitionBySlug, isGradeEligible } from "@/domain/competitions/service";
import { categoryLabels, type Competition } from "@/domain/competitions/types";
import { insertPaymentAndLink } from "@/domain/payments/service";
import { uploadReceiptFile } from "@/domain/storage/actions";
import { createTeam } from "@/domain/teams/service";
import { createAdHocTeammate, getOwnStudentProfile, updateOwnStudentGrade } from "@/domain/students/service";
import {
  insertRegistration,
  insertConsentRecords,
  studentAlreadyRegisteredForCompetition,
} from "@/data/repositories/registrations.repository";
import type { BasketItemInput, BasketLine, BasketResult } from "./basket";
import { generateRegistrationNumber } from "./service";
import { alreadyEnteredMessage, type Registration, type SubmitRegistrationInput } from "./types";

function categoryForGrade(competition: Competition, grade: string | null | undefined) {
  const value = grade?.trim() ?? "";
  if (!value) return null;
  return competition.eligibility.find((rule) => isGradeEligible(rule.minGrade, rule.maxGrade, value)) ?? null;
}

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

  // One student → one active registration per competition (school or self-serve).
  // Checked with the service role so a school-created entry still blocks a
  // later student checkout, and the other way around.
  const studentsToCheck =
    input.entryType === "individual"
      ? studentId
        ? [studentId]
        : []
      : [...new Set((input.existingMemberIds ?? []).filter(Boolean))];
  if (studentsToCheck.length > 0) {
    const admin = createAdminClient();
    for (const sid of studentsToCheck) {
      const { already, competitionTitle, standing, studentName } = await studentAlreadyRegisteredForCompetition(
        admin,
        sid,
        input.competitionSlug,
      );
      if (already) {
        const who = studentName ?? input.entrantNameForDisplay;
        return {
          registration: null,
          error: alreadyEnteredMessage(competitionTitle ?? input.competitionTitle, [
            { name: who, standing: standing ?? "under review" },
          ]),
        };
      }
    }
  }

  let category = input.category;
  if (user.role === "school_coordinator") {
    const competition = await getPublicCompetitionBySlug(supabase, input.competitionSlug);
    if (!competition) return { registration: null, error: "This competition is not open for registration." };

    const gradeIds =
      input.entryType === "individual" && studentId
        ? [studentId]
        : input.entryType === "team"
          ? [...new Set((input.existingMemberIds ?? []).filter(Boolean))]
          : [];

    if (gradeIds.length > 0) {
      const { data: gradeRows } = await supabase.from("students").select("id, grade").in("id", gradeIds);
      const rules = gradeIds.map((id) => {
        const row = gradeRows?.find((item) => item.id === id);
        return categoryForGrade(competition, typeof row?.grade === "string" ? row.grade : null);
      });
      if (rules.some((rule) => !rule)) {
        return { registration: null, error: "A selected student's grade is not open for this competition." };
      }
      const first = rules[0];
      if (!first || rules.some((rule) => rule?.category !== first.category)) {
        return {
          registration: null,
          error: "A team is filed under one category. Register students from different bands individually.",
        };
      }
      category = first.category;
    }
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
    category,
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
      paymentStatus: null,
      entrantName: input.entrantNameForDisplay,
      status: "pending",
      submittedAt: new Date().toISOString(),
    },
    error: null,
  };
}

/** Removes registrations this user just created, before a receipt is attached.
 * Used when the payment step fails so a refresh does not treat them as already entered. */
export async function discardDraftRegistrationsAction(ids: string[]): Promise<{ error: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in." };
  if (ids.length === 0) return { error: null };
  const { error } = await createAdminClient()
    .from("registrations")
    .delete()
    .in("id", ids)
    .eq("registered_by", user.id)
    .is("payment_id", null);
  return { error: error?.message ?? null };
}

/** Live entries for these students in one competition, with approved or under-review standing. */
export async function existingEntryStandingAction(
  studentIds: string[],
  competitionSlug: string,
): Promise<{ lines: { name: string; standing: "approved" | "under review" }[]; error: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { lines: [], error: "You must be logged in." };
  const admin = createAdminClient();
  const lines: { name: string; standing: "approved" | "under review" }[] = [];
  for (const id of [...new Set(studentIds.filter(Boolean))]) {
    const found = await studentAlreadyRegisteredForCompetition(admin, id, competitionSlug);
    if (found.already) {
      lines.push({ name: found.studentName ?? "This student", standing: found.standing ?? "under review" });
    }
  }
  return { lines, error: null };
}

/** The student's multi-competition checkout: registers the signed-in student
 * for every competition they picked, under their one FRL student ID, and
 * records a single fee payment (one receipt for the total) covering all of
 * them.
 *
 * Everything the browser sends is re-checked here — competition status,
 * grade eligibility, team size, duplicates and the fee amounts — so the total
 * is always computed server-side from the competitions themselves. The
 * receipt is uploaded before anything is created, and if any registration in
 * the batch fails, the ones already created in this call are removed, so a
 * retry starts clean instead of leaving half a checkout behind.
 *
 * Expects FormData fields: `items` (JSON BasketItemInput[]), `grade`,
 * `consent` (JSON), `receipt` (File). */
export async function submitCompetitionBasketAction(formData: FormData): Promise<BasketResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be logged in to register." };
  if (user.role !== "student") return { ok: false, error: "Only student accounts can use this checkout." };

  let items: BasketItemInput[];
  let consent: SubmitRegistrationInput["consent"];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
    consent = JSON.parse(String(formData.get("consent") ?? "{}"));
  } catch {
    return { ok: false, error: "Your selection couldn't be read — please try again." };
  }
  const grade = String(formData.get("grade") ?? "").trim();
  const receipt = formData.get("receipt");

  if (!Array.isArray(items) || items.length === 0) return { ok: false, error: "Choose at least one competition." };
  if (new Set(items.map((i) => i.competitionSlug)).size !== items.length) {
    return { ok: false, error: "A competition appears twice in your selection." };
  }
  if (!grade) return { ok: false, error: "Please confirm your grade." };
  if (!(consent?.terms && consent.privacy && consent.results && consent.photo)) {
    return { ok: false, error: "Please accept all four consent statements." };
  }
  if (!(receipt instanceof File) || receipt.size === 0) return { ok: false, error: "Please attach your fee payment receipt." };

  const supabase = await createClient();
  const student = await getOwnStudentProfile(supabase, user.id);
  if (!student) return { ok: false, error: "No student profile found for this account." };

  // --- Validate every pick before creating anything --------------------------
  const admin = createAdminClient();
  const planned: { item: BasketItemInput; competition: Competition; rule: Competition["eligibility"][number]; fee: number }[] = [];
  for (const item of items) {
    const competition = await getPublicCompetitionBySlug(supabase, item.competitionSlug);
    if (!competition || (competition.status !== "open" && competition.status !== "upcoming")) {
      return { ok: false, error: `${competition?.title ?? item.competitionSlug} isn't open for registration.` };
    }
    const { already, standing } = await studentAlreadyRegisteredForCompetition(admin, student.id, competition.slug);
    if (already) {
      const standingLabel = standing ?? "under review";
      return {
        ok: false,
        error:
          standingLabel === "approved"
            ? `You have already registered for ${competition.title}.`
            : `You have already applied for ${competition.title} and can only apply once.`,
      };
    }
    const rule = competition.eligibility.find((r) => isGradeEligible(r.minGrade, r.maxGrade, grade));
    if (!rule) return { ok: false, error: `Grade ${grade} isn't eligible for ${competition.title} — remove it from your selection.` };

    if (item.entryType === "team") {
      if (!competition.supportsTeam) return { ok: false, error: `${competition.title} doesn't take team entries.` };
      if (!item.teamName?.trim()) return { ok: false, error: `Enter a team name for ${competition.title}.` };
      const size = 1 + (item.teammateNames ?? []).filter((n) => n.trim()).length;
      const min = rule.teamMinSize ?? 2;
      const max = rule.teamMaxSize ?? 10;
      if (size < min || size > max) {
        return { ok: false, error: `${competition.title} teams need ${min === max ? min : `${min}–${max}`} members including you (you have ${size}).` };
      }
    } else if (!competition.supportsIndividual) {
      return { ok: false, error: `${competition.title} is a team competition — add your teammates.` };
    }

    if (competition.feeAmount == null) {
      return { ok: false, error: `The entry fee for ${competition.title} has not been set yet.` };
    }
    planned.push({ item, competition, rule, fee: competition.feeAmount });
  }

  // --- Receipt first: nothing is created if the upload fails ----------------
  const { path: receiptPath, error: uploadError } = await uploadReceiptFile(receipt, user.id);
  if (uploadError || !receiptPath) return { ok: false, error: uploadError ?? "Failed to upload the receipt." };

  if (student.grade !== grade) await updateOwnStudentGrade(supabase, student.id, grade);

  // --- Create the registrations ---------------------------------------------
  const created: { id: string; line: BasketLine }[] = [];
  const rollback = async () => {
    if (created.length === 0) return;
    // The student has no delete rights on registrations, so the cleanup of
    // rows this very call just created runs with the service role.
    await createAdminClient().from("registrations").delete().in("id", created.map((c) => c.id));
  };

  for (const { item, competition, rule, fee } of planned) {
    const isTeam = item.entryType === "team";
    const { registration, error } = await submitRegistrationAction({
      competitionSlug: competition.slug,
      competitionTitle: competition.title,
      category: rule.category,
      entryType: item.entryType,
      schoolId: null,
      studentId: isTeam ? undefined : student.id,
      teamName: isTeam ? item.teamName?.trim() : undefined,
      existingMemberIds: isTeam ? [student.id] : undefined,
      newTeammateNames: isTeam ? (item.teammateNames ?? []).filter((n) => n.trim()) : undefined,
      entrantNameForDisplay: isTeam ? (item.teamName ?? "") : student.fullName,
      consent,
    });
    if (error || !registration) {
      await rollback();
      return { ok: false, error: `Registering for ${competition.title} failed: ${error ?? "unknown error"}. Nothing was saved — please try again.` };
    }
    created.push({
      id: registration.id,
      line: {
        competitionTitle: competition.title,
        registrationNumber: registration.registrationNumber,
        categoryLabel: categoryLabels[rule.category],
        entryType: item.entryType,
        fee,
      },
    });
  }

  // --- One payment covering the whole selection ------------------------------
  const lines = created.map((c) => c.line);
  const total = lines.reduce((sum, l) => sum + l.fee, 0);
  const titles = lines.map((l) => l.competitionTitle);
  const { error: paymentError } = await insertPaymentAndLink(
    supabase,
    {
      // A multi-competition payment isn't tied to one competition; the admin
      // payments screen shows the title, which lists every competition paid for.
      competitionSlug: planned.length === 1 ? planned[0].competition.slug : "multiple",
      competitionTitle: titles.length === 1 ? titles[0] : `${titles.length} competitions: ${titles.join(", ")}`,
      submittedBy: user.id,
      submittedByName: student.frlId ? `${user.fullName} (${student.frlId})` : user.fullName,
      schoolId: null,
      schoolName: student.schoolName ?? null,
      entryCount: lines.length,
      amountExpected: total,
      receiptPath,
    },
    created.map((c) => c.id),
  );
  if (paymentError) {
    await rollback();
    return { ok: false, error: `Recording your payment failed: ${paymentError}. Nothing was saved — please try again.` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/competitions");
  return { ok: true, frlId: student.frlId, lines, total };
}
