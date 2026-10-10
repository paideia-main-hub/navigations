"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import type { Competition } from "@/domain/competitions/types";
import { categoryLabels, formatFee } from "@/domain/competitions/types";
import { isGradeEligible } from "@/domain/competitions/service";
import type { StudentProfile } from "@/domain/students/types";
import { alreadyEnteredMessage, type Registration } from "@/domain/registrations/types";
import {
  discardDraftRegistrationsAction,
  existingEntryStandingAction,
  submitRegistrationAction,
} from "@/domain/registrations/actions";
import { submitPaymentAction } from "@/domain/payments/actions";
import type { PaymentAccount } from "@/domain/payments/types";
import { withFileUploadProgress, type UploadProgressState } from "@/ui/lib/fileUploadProgress";
import { CopyButton } from "@/ui/components/CopyButton";
import { PaymentInstructions } from "@/ui/components/PaymentInstructions";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { StepMotion } from "@/ui/components/StepMotion";
import { UploadProgress } from "@/ui/components/UploadProgress";

type Step = "eligibility" | "entry" | "consent" | "review" | "payment" | "success";

function ruleForGrade(eligibility: Competition["eligibility"], grade: string | null | undefined) {
  const value = grade?.trim() ?? "";
  if (!value) return null;
  return eligibility.find((rule) => isGradeEligible(rule.minGrade, rule.maxGrade, value)) ?? null;
}

export function RegistrationWizard({
  competition,
  mode,
  studentName,
  studentId,
  schoolId,
  schoolName,
  roster = [],
  paymentAccount,
}: {
  competition: Competition;
  mode: "student" | "school";
  /** Required for mode="student": the logged-in student's own students.id and full name. */
  studentName?: string;
  studentId?: string;
  /** Required for mode="school": the coordinator's schools.id (and, for the
   * payment record's display, the school's name). */
  schoolId?: string;
  schoolName?: string;
  roster?: StudentProfile[];
  paymentAccount: PaymentAccount;
}) {
  const [step, setStep] = useState<Step>(mode === "school" ? "entry" : "eligibility");
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  function moveTo(next: Step) {
    const order: Step[] = ["eligibility", "entry", "consent", "review", "payment", "success"];
    setDirection(order.indexOf(next) < order.indexOf(step) ? "back" : "forward");
    setStep(next);
  }
  const [grade, setGrade] = useState("");
  const [matchedRule, setMatchedRule] = useState<Competition["eligibility"][number] | null>(null);
  const [ineligible, setIneligible] = useState(false);

  const allowIndividual = competition.supportsIndividual;
  const allowTeam = competition.supportsTeam;
  const [entryType, setEntryType] = useState<"individual" | "team">(allowIndividual ? "individual" : "team");

  /** mode="school" + entryType="individual" only: a coordinator can enter
   * more than one student from the roster at once, one registration each,
   * sharing a single fee payment (fee amount x number selected) at the end —
   * this is the "multiply by number of students" the coordinator flow needs
   * and the old single-select dropdown couldn't express. */
  const [selectedIndividualIds, setSelectedIndividualIds] = useState<string[]>([]);
  const [teamName, setTeamName] = useState("");
  const [teamMemberNames, setTeamMemberNames] = useState<string[]>([""]);
  const [selectedRosterIds, setSelectedRosterIds] = useState<string[]>([]);

  const [consent, setConsent] = useState({ terms: false, privacy: false, results: false, photo: false });
  const [results, setResults] = useState<Registration[]>([]);

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptProgress, setReceiptProgress] = useState<number | null>(null);
  const receiptReaderRef = useRef<FileReader | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [transfer, setTransfer] = useState<UploadProgressState | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);

  const eligibleRoster = useMemo(
    () => roster.filter((student) => ruleForGrade(competition.eligibility, student.grade)),
    [roster, competition],
  );

  const schoolTeamRule = useMemo(() => {
    if (mode !== "school" || selectedRosterIds.length === 0) return null;
    const rules = selectedRosterIds.map((id) =>
      ruleForGrade(competition.eligibility, roster.find((student) => student.id === id)?.grade),
    );
    const first = rules[0];
    if (!first || rules.some((rule) => !rule || rule.category !== first.category)) return null;
    return first;
  }, [mode, selectedRosterIds, roster, competition]);

  const schoolTeamMixed =
    mode === "school" &&
    selectedRosterIds.length > 1 &&
    new Set(
      selectedRosterIds.map(
        (id) => ruleForGrade(competition.eligibility, roster.find((student) => student.id === id)?.grade)?.category,
      ),
    ).size > 1;

  const activeTeamRule = mode === "school" ? schoolTeamRule : matchedRule;
  const teamMin = activeTeamRule?.teamMinSize ?? 1;
  const teamMax = activeTeamRule?.teamMaxSize ?? 10;

  const isCoordinatorIndividualBatch = mode === "school" && entryType === "individual";
  /** One "entry" is one registration — a coordinator paying for 3 students
   * pays fee x 3, a team registration is one entry regardless of its size,
   * a student registering themself is always exactly one. */
  const entryCount = isCoordinatorIndividualBatch ? Math.max(1, selectedIndividualIds.length) : 1;
  const amountExpected = competition.feeAmount != null ? competition.feeAmount * entryCount : null;

  function checkEligibility() {
    const numericGrade = grade.trim();
    const match = competition.eligibility.find((rule) => isGradeEligible(rule.minGrade, rule.maxGrade, numericGrade));
    if (match) {
      setMatchedRule(match);
      setIneligible(false);
      moveTo("entry");
    } else {
      setIneligible(true);
    }
  }

  const entrantName = useMemo(() => {
    if (entryType === "individual") {
      if (mode === "student") return studentName ?? "";
      if (selectedIndividualIds.length === 1) {
        return roster.find((s) => s.id === selectedIndividualIds[0])?.fullName ?? "";
      }
      if (selectedIndividualIds.length > 1) return `${selectedIndividualIds.length} students`;
      return "";
    }
    return teamName;
  }, [entryType, mode, studentName, roster, selectedIndividualIds, teamName]);

  const consentComplete = consent.terms && consent.privacy && consent.results && consent.photo;

  async function createRegistrations(): Promise<{ registrations: Registration[]; error: string | null }> {
    if (mode === "school" && entryType === "team" && !schoolTeamRule) {
      return {
        registrations: [],
        error: "A team is filed under one category. Pick students from the same grade band, or register them individually.",
      };
    }

    const idsToCheck = isCoordinatorIndividualBatch
      ? selectedIndividualIds
      : entryType === "team" && mode === "school"
        ? selectedRosterIds
        : studentId
          ? [studentId]
          : [];
    if (idsToCheck.length > 0) {
      const { lines, error } = await existingEntryStandingAction(idsToCheck, competition.slug);
      if (error) return { registrations: [], error };
      if (lines.length > 0) {
        return { registrations: [], error: alreadyEnteredMessage(competition.title, lines) };
      }
    }

    const category =
      mode === "school" && entryType === "team" && schoolTeamRule
        ? schoolTeamRule.category
        : (matchedRule?.category ?? competition.eligibility[0]?.category ?? "primary");
    const baseInput = {
      competitionSlug: competition.slug,
      competitionTitle: competition.title,
      category,
      schoolId: mode === "school" ? (schoolId ?? null) : null,
      consent,
    };

    if (isCoordinatorIndividualBatch) {
      const created: Registration[] = [];
      for (const sid of selectedIndividualIds) {
        const student = roster.find((s) => s.id === sid);
        const rule = ruleForGrade(competition.eligibility, student?.grade);
        if (!student || !rule) {
          if (created.length > 0) await discardDraftRegistrationsAction(created.map((item) => item.id));
          return { registrations: [], error: "One of the selected students is not in an open grade for this competition." };
        }
        const { registration, error } = await submitRegistrationAction({
          ...baseInput,
          category: rule.category,
          entryType: "individual",
          studentId: sid,
          entrantNameForDisplay: student.fullName,
        });
        if (error || !registration) {
          if (created.length > 0) await discardDraftRegistrationsAction(created.map((item) => item.id));
          return { registrations: [], error: error ?? "Something went wrong submitting your registration." };
        }
        created.push(registration);
      }
      return { registrations: created, error: null };
    }

    const { registration, error } = await submitRegistrationAction({
      ...baseInput,
      entryType,
      studentId: entryType === "individual" ? studentId : undefined,
      teamName: entryType === "team" ? teamName : undefined,
      existingMemberIds:
        entryType === "team" ? (mode === "student" ? (studentId ? [studentId] : []) : selectedRosterIds) : undefined,
      newTeammateNames: entryType === "team" && mode === "student" ? teamMemberNames.filter((n) => n.trim()) : undefined,
      entrantNameForDisplay: entrantName,
    });

    if (error || !registration) {
      return { registrations: [], error: error ?? "Something went wrong submitting your registration." };
    }
    return { registrations: [registration], error: null };
  }

  function onReceiptChange(event: ChangeEvent<HTMLInputElement>) {
    receiptReaderRef.current?.abort();
    receiptReaderRef.current = null;
    setReceiptProgress(null);
    const file = event.target.files?.[0] ?? null;
    setReceiptFile(file);
    if (!file || file.size === 0) return;

    const reader = new FileReader();
    receiptReaderRef.current = reader;
    setReceiptProgress(0);
    reader.onprogress = (progressEvent) => {
      if (!progressEvent.lengthComputable || progressEvent.total === 0) return;
      setReceiptProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
    };
    reader.onload = () => setReceiptProgress(100);
    reader.onerror = () => setReceiptProgress(null);
    reader.readAsArrayBuffer(file);
  }

  useEffect(() => () => receiptReaderRef.current?.abort(), []);

  async function handlePaymentSubmit() {
    if (!receiptFile) {
      setPaymentError("Please attach your fee receipt before continuing.");
      return;
    }
    setPaymentSubmitting(true);
    setPaymentError(null);

    const { registrations, error: createError } = await createRegistrations();
    if (createError || registrations.length === 0) {
      setPaymentSubmitting(false);
      setPaymentError(createError ?? "Something went wrong submitting your registration.");
      return;
    }

    const { error } = await withFileUploadProgress(setTransfer, () =>
      submitPaymentAction({
        competitionSlug: competition.slug,
        competitionTitle: competition.title,
        schoolId: mode === "school" ? (schoolId ?? null) : null,
        schoolName: mode === "school" ? (schoolName ?? null) : null,
        entryCount,
        amountExpected,
        registrationIds: registrations.map((item) => item.id),
        receiptFile,
      }),
    );
    setTransfer(null);

    if (error) {
      await discardDraftRegistrationsAction(registrations.map((item) => item.id));
      setPaymentSubmitting(false);
      setPaymentError(error);
      return;
    }

    setResults(registrations);
    setPaymentSubmitting(false);
    setPaymentDone(true);
    moveTo("success");
  }

  const steps: Step[] =
    mode === "school" ? ["entry", "consent", "review", "payment"] : ["eligibility", "entry", "consent", "review", "payment"];
  const stepLabels: Record<Step, string> = {
    eligibility: "Eligibility",
    entry: "Entry",
    consent: "Consent",
    review: "Review",
    payment: "Payment",
    success: "Done",
  };
  const stepIndex = steps.indexOf(step);

  return (
    <div className="form-actions mx-auto max-w-2xl">
      <ol className={`mb-6 grid gap-2 ${steps.length === 4 ? "grid-cols-4" : "grid-cols-5"}`}>
        {steps.map((s, i) => {
          const active = step === s;
          const done = stepIndex > i;
          return (
            <li key={s} className="min-w-0">
              <div className={`h-1 rounded-full ${active || done ? "bg-accent" : "bg-border"}`} />
              <p className={`mt-2 truncate text-[11px] font-semibold ${active ? "text-accent-strong" : "text-muted"}`}>
                {i + 1}. {stepLabels[s]}
              </p>
            </li>
          );
        })}
      </ol>

      <StepMotion step={step} direction={direction}>
      {step === "eligibility" && (
        <div className="space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">Check eligibility</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {mode === "school"
                ? "The grade sets the category this registration is filed under."
                : "Your grade sets the category you compete in."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {competition.eligibility.map((rule) => (
              <span key={rule.id} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
                {categoryLabels[rule.category]} · grades {rule.minGrade}–{rule.maxGrade}
              </span>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">
              {mode === "school" ? "Student's grade" : "Your grade"}
              <RequiredMark />
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                setIneligible(false);
              }}
              placeholder="e.g. 8"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>
          {ineligible && (
            <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
              This grade doesn&apos;t fall within an eligible category for {competition.title}. Try a different
              competition from the{" "}
              <Link href="/dashboard/register" className="font-semibold text-accent-strong underline">
                registration list
              </Link>
              .
            </p>
          )}
          <button
            onClick={checkEligibility}
            disabled={!grade.trim()}
            className="cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {step === "entry" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Entry details</h2>
            {mode === "school" ? (
              <p className="mt-1 text-sm text-muted">
                Select any students from your school who are in an open grade. Each one is filed in their own category.
              </p>
            ) : null}
          </div>
          {mode === "school" ? (
            <div className="flex flex-wrap gap-2">
              {competition.eligibility.map((rule) => (
                <span key={rule.id} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
                  {categoryLabels[rule.category]} · grades {rule.minGrade}–{rule.maxGrade}
                </span>
              ))}
            </div>
          ) : null}

          {allowIndividual && allowTeam && (
            <div className="flex gap-2">
              {(["individual", "team"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setEntryType(t)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium capitalize ${
                    entryType === t ? "border-accent bg-accent-soft text-accent" : "border-border text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {entryType === "individual" && mode === "student" && (
            <div>
              <label className="text-sm font-medium text-foreground">Student name</label>
              <input
                readOnly
                value={studentName ?? ""}
                className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-muted"
              />
            </div>
          )}

          {entryType === "individual" && mode === "school" && (
            <div>
              <label className="text-sm font-medium text-foreground">
                Select students
                <RequiredMark />{" "}
                <span className="font-normal text-muted">(one registration per student selected)</span>
              </label>
              {roster.length === 0 ? (
                <p className="mt-1 text-sm text-muted">
                  No students in your roster yet.{" "}
                  <Link href="/dashboard/students" className="font-semibold text-accent">
                    Add a student
                  </Link>{" "}
                  first.
                </p>
              ) : eligibleRoster.length === 0 ? (
                <p className="mt-1 text-sm text-muted">None of the students on your roster are in an open grade for this competition.</p>
              ) : (
                <div className="mt-1 max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                  {eligibleRoster.map((s) => {
                    const rule = ruleForGrade(competition.eligibility, s.grade);
                    return (
                      <label key={s.id} className="flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={selectedIndividualIds.includes(s.id)}
                          onChange={(e) =>
                            setSelectedIndividualIds((prev) =>
                              e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id),
                            )
                          }
                        />
                        {s.fullName} (Grade {s.grade}
                        {rule ? ` · ${categoryLabels[rule.category]}` : ""})
                      </label>
                    );
                  })}
                </div>
              )}
              {selectedIndividualIds.length > 0 && competition.feeAmount != null && (
                <p className="mt-2 text-sm text-muted">
                  {selectedIndividualIds.length} student{selectedIndividualIds.length === 1 ? "" : "s"} selected — fee
                  due: <span className="font-semibold text-foreground">{formatFee(competition.feeAmount * selectedIndividualIds.length)}</span>{" "}
                  ({formatFee(competition.feeAmount)} × {selectedIndividualIds.length}).
                </p>
              )}
            </div>
          )}

          {entryType === "team" && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Team name
                  <RequiredMark />
                </label>
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                />
              </div>

              {mode === "student" ? (
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Teammates ({teamMin}–{teamMax} members total, including you)
                    <RequiredMark />
                  </label>
                  <div className="mt-1 space-y-2">
                    <input
                      readOnly
                      value={`${studentName ?? ""} (you)`}
                      className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-muted"
                    />
                    {teamMemberNames.map((name, i) => (
                      <input
                        key={i}
                        value={name}
                        placeholder="Teammate name"
                        onChange={(e) =>
                          setTeamMemberNames((prev) => prev.map((n, idx) => (idx === i ? e.target.value : n)))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                      />
                    ))}
                  </div>
                  {teamMemberNames.length + 1 < teamMax && (
                    <button
                      onClick={() => setTeamMemberNames((prev) => [...prev, ""])}
                      className="mt-2 text-sm font-semibold text-accent"
                    >
                      + Add teammate
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Select team members ({teamMin}–{teamMax})
                    <RequiredMark />
                  </label>
                  {roster.length === 0 ? (
                    <p className="mt-1 text-sm text-muted">
                      No students in your roster yet.{" "}
                      <Link href="/dashboard/students" className="font-semibold text-accent">
                        Add students
                      </Link>{" "}
                      first.
                    </p>
                  ) : eligibleRoster.length === 0 ? (
                    <p className="mt-1 text-sm text-muted">None of the students on your roster are in an open grade for this competition.</p>
                  ) : (
                    <div className="mt-1 space-y-2">
                      {eligibleRoster.map((s) => {
                        const rule = ruleForGrade(competition.eligibility, s.grade);
                        return (
                          <label key={s.id} className="flex items-center gap-2 text-sm text-foreground">
                            <input
                              type="checkbox"
                              checked={selectedRosterIds.includes(s.id)}
                              onChange={(e) =>
                                setSelectedRosterIds((prev) =>
                                  e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id),
                                )
                              }
                            />
                            {s.fullName} (Grade {s.grade}
                            {rule ? ` · ${categoryLabels[rule.category]}` : ""})
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {schoolTeamMixed ? (
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      A team is filed under one category. These students are in different bands — register them individually, or pick students from the same band.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            {mode === "student" ? (
              <button
                onClick={() => moveTo("eligibility")}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
              >
                Back
              </button>
            ) : null}
            <button
              onClick={() => moveTo("consent")}
              disabled={
                (entryType === "team" && !teamName.trim()) ||
                (entryType === "team" &&
                  mode === "school" &&
                  (schoolTeamMixed ||
                    !schoolTeamRule ||
                    selectedRosterIds.length < Math.max(teamMin, 2) ||
                    selectedRosterIds.length > teamMax)) ||
                (isCoordinatorIndividualBatch && selectedIndividualIds.length === 0)
              }
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "consent" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Consent</h2>
          {[
            { key: "terms" as const, label: "I accept the competition rules and code of conduct." },
            { key: "privacy" as const, label: "I consent to the site's data privacy policy." },
            { key: "results" as const, label: "I consent to result publication if qualified." },
            { key: "photo" as const, label: "I consent to photo publication for winners, where applicable." },
          ].map((item) => (
            <label key={item.key} className="flex items-start gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={consent[item.key]}
                onChange={(e) => setConsent((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                className="mt-0.5"
              />
              <span>
                {item.label}
                <RequiredMark />
              </span>
            </label>
          ))}
          <div className="flex gap-3">
            <button
              onClick={() => moveTo("entry")}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => moveTo("review")}
              disabled={!consentComplete}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Review & submit</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface text-sm">
            <div className="grid sm:grid-cols-2">
              <div className="border-b border-border px-4 py-3 sm:border-r">
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">Competition</p>
                <p className="mt-1 font-semibold text-foreground">{competition.title}</p>
              </div>
              <div className="border-b border-border px-4 py-3">
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">Entry type</p>
                <p className="mt-1 font-semibold text-foreground capitalize">{entryType}</p>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                {isCoordinatorIndividualBatch && selectedIndividualIds.length > 1 ? "Students" : "Entrant"}
              </p>
              {isCoordinatorIndividualBatch ? (
                <ul className="mt-2 divide-y divide-border">
                  {selectedIndividualIds.map((id) => {
                    const student = roster.find((item) => item.id === id);
                    const rule = ruleForGrade(competition.eligibility, student?.grade);
                    return (
                      <li key={id} className="flex items-center justify-between gap-3 py-2.5">
                        <span className="font-semibold text-foreground">{student?.fullName ?? "Student"}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          {student?.grade ? (
                            <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-muted">
                              Grade {student.grade}
                            </span>
                          ) : null}
                          {rule ? (
                            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-strong">
                              {categoryLabels[rule.category]}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-1 font-semibold text-foreground">{entrantName || "—"}</p>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border bg-accent-soft px-4 py-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">Fee due</p>
                {entryCount > 1 && competition.feeAmount != null ? (
                  <p className="mt-0.5 text-xs text-muted">
                    {formatFee(competition.feeAmount)} × {entryCount}
                  </p>
                ) : null}
              </div>
              <p className="text-lg font-extrabold text-foreground">
                {amountExpected != null ? formatFee(amountExpected) : "To be confirmed"}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted">
            Nothing is saved on this step. Continue to transfer the fee and submit the registration with your receipt.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => moveTo("consent")}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => moveTo("payment")}
              disabled={!entrantName}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Pay the entry fee</h2>
          <div className="rounded-xl border border-border bg-surface p-4 text-sm">
            <p>
              <span className="text-muted">Entrant{entryCount > 1 ? "s" : ""}:</span>{" "}
              <span className="font-medium text-foreground">{entrantName || "—"}</span>
            </p>
            <p className="mt-1">
              <span className="text-muted">Amount due:</span>{" "}
              <span className="font-semibold text-foreground">
                {amountExpected != null ? formatFee(amountExpected) : "See competition rules"}
              </span>
              {entryCount > 1 && amountExpected != null && competition.feeAmount != null && (
                <span className="text-muted">
                  {" "}
                  ({formatFee(competition.feeAmount)} × {entryCount} students)
                </span>
              )}
            </p>
          </div>
          <PaymentInstructions
            account={paymentAccount}
            amount={amountExpected != null ? formatFee(amountExpected) : null}
            prominent
            note="An admin reviews every receipt. The registration stays under review until the payment is approved."
          />
          <div>
            <label className="text-sm font-medium text-foreground">
              Fee receipt
              <RequiredMark />
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={onReceiptChange}
              className="student-photo-file mt-1 block w-full cursor-pointer rounded-lg border border-border bg-background px-1.5 text-sm text-foreground outline-none file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent-soft file:px-3 file:text-sm file:font-semibold file:text-accent-strong hover:file:bg-accent-soft/80 focus:border-accent"
            />
            {transfer ? (
              <div className="mt-2">
                <UploadProgress phase={transfer.phase} percent={transfer.percent} uploadingLabel="Uploading receipt…" savingLabel="Saving receipt…" />
              </div>
            ) : receiptProgress != null ? (
              <div className="mt-2">
                <UploadProgress
                  phase="uploading"
                  percent={receiptProgress}
                  uploadingLabel={receiptProgress >= 100 ? "Receipt ready" : "Preparing receipt…"}
                />
              </div>
            ) : null}
          </div>
          {paymentError && <p className="text-sm text-red-600 dark:text-red-400">{paymentError}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => moveTo("review")}
              disabled={paymentSubmitting}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handlePaymentSubmit}
              disabled={paymentSubmitting || !receiptFile}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              {paymentSubmitting ? "Submitting…" : "Submit registration"}
            </button>
          </div>
        </div>
      )}

      {step === "success" && results.length > 0 && (
        <div className="space-y-4 text-center">
          <div className="rounded-2xl border border-accent/40 bg-accent-soft p-6 shadow-sm">
            <h2 className="text-xl font-extrabold tracking-tight text-accent-foreground">
              {results.length > 1 ? "Registrations submitted" : "Registration submitted"}
            </h2>
            <p className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">
              {results.length > 1 ? "Registration numbers" : "Registration number"}
            </p>
            <div className="mt-1 flex items-center justify-center gap-1">
              <p className="text-lg font-extrabold tracking-tight break-all text-foreground">
                {results.map((item) => item.registrationNumber).join(", ")}
              </p>
              <CopyButton
                text={results.map((item) => item.registrationNumber).join(", ")}
                label={results.length > 1 ? "registration numbers" : "registration number"}
              />
            </div>
            <p className="mt-4 border-t border-accent/30 pt-4 text-sm font-medium leading-relaxed text-accent-foreground">
              {paymentDone
                ? "Your receipt has been submitted and is now under review. You'll see it marked approved on your dashboard once an admin has checked it."
                : "It will appear on your dashboard as pending review."}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            Go to dashboard
          </Link>
        </div>
      )}
      </StepMotion>
    </div>
  );
}
