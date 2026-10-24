"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/data/supabase/server";
import { createAdminClient } from "@/data/supabase/admin";
import { getCurrentUser } from "@/domain/auth/session";
import { getPublicCompetitionBySlug, isGradeEligible } from "@/domain/competitions/service";
import { categoryLabels, competitionTeamSize, type AgeCategory, type Competition } from "@/domain/competitions/types";
import { submitPaymentAction } from "@/domain/payments/actions";
import { insertPaymentAndLink, isSchoolReceiptWaived } from "@/domain/payments/service";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { isSchoolEntryDraft, schoolEntryFee, type SchoolEntryDraft } from "./schoolEntries";
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
    if (input.entryType === "individual" && !competition.supportsIndividual) {
      return { registration: null, error: `${competition.title} needs a team. Enter the team name and choose its members.` };
    }
    if (input.entryType === "team" && !competition.supportsTeam) {
      return { registration: null, error: `${competition.title} does not take team entries.` };
    }

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
      const matched = rules.filter((rule): rule is NonNullable<(typeof rules)[number]> => Boolean(rule));
      const counts = new Map<AgeCategory, number>();
      for (const rule of matched) counts.set(rule.category, (counts.get(rule.category) ?? 0) + 1);
      const categoryEntry = [...counts.entries()].sort((left, right) => right[1] - left[1])[0];
      if (categoryEntry) category = categoryEntry[0];
      if (input.entryType === "team") {
        const { min, max } = competitionTeamSize(competition.eligibility);
        if (gradeIds.length < min || gradeIds.length > max) {
          const size = min === max ? `${min}` : `${min}–${max}`;
          return { registration: null, error: `${competition.title} teams need ${size} members.` };
        }
      }
    }
  }

  if (input.entryType === "team") {
    if (!input.teamName) return { registration: null, error: "Team name is required." };
    studentId = undefined;
    if (input.teamId) {
      teamId = input.teamId;
    } else {
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
    }
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
    const memberCount =
      item.entryType === "team" ? 1 + (item.teammateNames ?? []).filter((name) => name.trim()).length : 1;
    planned.push({ item, competition, rule, fee: competition.feeAmount * memberCount });
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
      entryCount: planned.reduce(
        (sum, row) =>
          sum +
          (row.item.entryType === "team"
            ? 1 + (row.item.teammateNames ?? []).filter((name) => name.trim()).length
            : 1),
        0,
      ),
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
  revalidatePath("/dashboard/register");
  return { ok: true, frlId: student.frlId, lines, total };
}

export type SchoolEntrySubmitResult =
  | { ok: true; registrations: { registrationNumber: string; competitionTitle: string }[]; total: number }
  | { ok: false; error: string };

/** Registers every competition on a coordinator's entry list and attaches
 * one receipt to all of them. Fees are read from the competitions, not from
 * the browser. */
export async function submitSchoolEntriesAction(formData: FormData): Promise<SchoolEntrySubmitResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be logged in to register." };
  if (user.role !== "school_coordinator") return { ok: false, error: "Only a school coordinator can register students this way." };

  let entries: SchoolEntryDraft[];
  try {
    const parsed = JSON.parse(String(formData.get("entries") ?? "[]")) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isSchoolEntryDraft)) {
      return { ok: false, error: "Your hamper couldn't be read. Add the competitions again." };
    }
    entries = parsed;
  } catch {
    return { ok: false, error: "Your hamper couldn't be read. Add the competitions again." };
  }

  const receipt = formData.get("receipt");
  const requestWaived =
    formData.get("receipt_waived") === "on" || formData.get("receipt_waived") === "true";
  const seenStudents = new Set<string>();
  for (const entry of entries) {
    for (const student of entry.students) {
      const key = `${entry.competitionSlug}:${student.id}`;
      if (seenStudents.has(key)) {
        return { ok: false, error: `${student.fullName} is listed more than once for ${entry.competitionTitle}.` };
      }
      seenStudents.add(key);
    }
  }

  const supabase = await createClient();
  const school = await getCoordinatorSchool(supabase, user.id);
  if (!school) return { ok: false, error: "No school found for this coordinator account." };

  const schoolWaived = await isSchoolReceiptWaived(supabase, school.id);
  const receiptWaived = requestWaived && schoolWaived;
  if (!receiptWaived && (!(receipt instanceof File) || receipt.size === 0)) {
    return { ok: false, error: "Attach the fee receipt." };
  }

  const createdIds: string[] = [];
  const registrations: { registrationNumber: string; competitionTitle: string }[] = [];
  const titles: string[] = [];
  let total = 0;

  async function rollback() {
    if (createdIds.length === 0) return;
    await createAdminClient().from("registrations").delete().in("id", createdIds);
  }

  for (const entry of entries) {
    const competition = await getPublicCompetitionBySlug(supabase, entry.competitionSlug);
    if (!competition || (competition.status !== "open" && competition.status !== "upcoming")) {
      await rollback();
      return { ok: false, error: `${entry.competitionTitle} is not open for registration. Nothing was saved.` };
    }
    if (competition.feeAmount == null) {
      await rollback();
      return { ok: false, error: `${competition.title} does not have a fee yet. Nothing was saved.` };
    }
    if (entry.students.length === 0) {
      await rollback();
      return { ok: false, error: `Choose at least one student for ${competition.title}.` };
    }
    if (entry.entryType === "individual" && !competition.supportsIndividual) {
      await rollback();
      return { ok: false, error: `${competition.title} needs a team. Enter the team name and choose its members.` };
    }
    if (entry.entryType === "team") {
      if (!competition.supportsTeam) {
        await rollback();
        return { ok: false, error: `${competition.title} does not take team entries.` };
      }
      const { min, max } = competitionTeamSize(competition.eligibility);
      if (entry.students.length < min || entry.students.length > max) {
        await rollback();
        const size = min === max ? `${min}` : `${min}–${max}`;
        return { ok: false, error: `${entry.teamName?.trim() || competition.title} needs ${size} members.` };
      }
    }

    const fee = schoolEntryFee({ ...entry, feeAmount: competition.feeAmount });
    if (fee == null) {
      await rollback();
      return { ok: false, error: `${competition.title} does not have a fee yet. Nothing was saved.` };
    }
    total += fee;
    titles.push(competition.title);

    if (entry.entryType === "team") {
      if (!entry.teamName?.trim()) {
        await rollback();
        return { ok: false, error: `Enter a team name for ${competition.title}.` };
      }
      const { registration, error } = await submitRegistrationAction({
        competitionSlug: competition.slug,
        competitionTitle: competition.title,
        category: entry.students[0]?.category ?? "primary",
        entryType: "team",
        schoolId: school.id,
        teamName: entry.teamName.trim(),
        teamId: entry.teamId,
        existingMemberIds: entry.students.map((student) => student.id),
        entrantNameForDisplay: entry.teamName.trim(),
        consent: entry.consent,
      });
      if (error || !registration) {
        await rollback();
        return { ok: false, error: error ?? `Registering for ${competition.title} failed. Nothing was saved.` };
      }
      createdIds.push(registration.id);
      registrations.push({ registrationNumber: registration.registrationNumber, competitionTitle: competition.title });
      continue;
    }

    for (const student of entry.students) {
      const { registration, error } = await submitRegistrationAction({
        competitionSlug: competition.slug,
        competitionTitle: competition.title,
        category: student.category,
        entryType: "individual",
        schoolId: school.id,
        studentId: student.id,
        entrantNameForDisplay: student.fullName,
        consent: entry.consent,
      });
      if (error || !registration) {
        await rollback();
        return { ok: false, error: error ?? `Registering ${student.fullName} failed. Nothing was saved.` };
      }
      createdIds.push(registration.id);
      registrations.push({ registrationNumber: registration.registrationNumber, competitionTitle: competition.title });
    }
  }

  const { error: paymentError } = await submitPaymentAction({
    competitionSlug: new Set(entries.map((entry) => entry.competitionSlug)).size === 1 ? entries[0].competitionSlug : "multiple",
    competitionTitle: (() => {
      const unique = [...new Set(titles)];
      return unique.length === 1 ? unique[0] : `${unique.length} competitions: ${unique.join(", ")}`;
    })(),
    schoolId: school.id,
    schoolName: school.officialName,
    entryCount: entries.reduce((sum, entry) => sum + Math.max(entry.students.length, 1), 0),
    amountExpected: total,
    registrationIds: createdIds,
    receiptFile: receiptWaived ? null : (receipt as File),
    receiptWaived,
  });
  if (paymentError) {
    await rollback();
    return { ok: false, error: paymentError };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/register");
  revalidatePath("/dashboard/competitions");
  revalidatePath("/dashboard/registrations");
  return { ok: true, registrations, total };
}
