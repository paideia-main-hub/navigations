"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Competition } from "@/domain/competitions/types";
import { categoryLabels, formatFee } from "@/domain/competitions/types";
import { isGradeEligible } from "@/domain/competitions/service";
import type { StudentProfile } from "@/domain/students/types";
import type { Registration } from "@/domain/registrations/types";
import { submitRegistrationAction } from "@/domain/registrations/actions";
import { submitPaymentAction } from "@/domain/payments/actions";
import type { PaymentAccount } from "@/domain/payments/types";
import { withFileUploadProgress, type UploadProgressState } from "@/ui/lib/fileUploadProgress";
import { PaymentInstructions } from "@/ui/components/PaymentInstructions";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { StepMotion } from "@/ui/components/StepMotion";
import { UploadProgress } from "@/ui/components/UploadProgress";

type Step = "eligibility" | "entry" | "consent" | "review" | "payment" | "success";

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
  const [step, setStep] = useState<Step>("eligibility");
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
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<Registration[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [transfer, setTransfer] = useState<UploadProgressState | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);

  const teamMin = matchedRule?.teamMinSize ?? 1;
  const teamMax = matchedRule?.teamMaxSize ?? 10;

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

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    const category = matchedRule?.category ?? competition.eligibility[0]?.category ?? "primary";
    const baseInput = {
      competitionSlug: competition.slug,
      competitionTitle: competition.title,
      category,
      schoolId: mode === "school" ? (schoolId ?? null) : null,
      consent,
    };

    if (isCoordinatorIndividualBatch) {
      // One registration per selected student, sharing this one submission —
      // if a middle one fails, stop rather than silently under-reporting how
      // many actually went through.
      const created: Registration[] = [];
      for (const sid of selectedIndividualIds) {
        const student = roster.find((s) => s.id === sid);
        const { registration, error } = await submitRegistrationAction({
          ...baseInput,
          entryType: "individual",
          studentId: sid,
          entrantNameForDisplay: student?.fullName ?? "Student",
        });
        if (error || !registration) {
          setSubmitting(false);
          setSubmitError(
            created.length > 0
              ? `Registered ${created.length} of ${selectedIndividualIds.length} students before this failed: ${error ?? "unknown error"}. The ones already registered are saved — go back and remove them from your selection before retrying the rest.`
              : (error ?? "Something went wrong submitting your registration."),
          );
          return;
        }
        created.push(registration);
      }
      setResults(created);
      setSubmitting(false);
      moveTo("payment");
      return;
    }

    const { registration, error } = await submitRegistrationAction({
      ...baseInput,
      entryType,
      // Reachable only for mode="student" + entryType="individual" — the
      // mode="school" + entryType="individual" case is always handled by the
      // batch branch above, before this call is ever reached.
      studentId: entryType === "individual" ? studentId : undefined,
      teamName: entryType === "team" ? teamName : undefined,
      existingMemberIds:
        entryType === "team" ? (mode === "student" ? (studentId ? [studentId] : []) : selectedRosterIds) : undefined,
      newTeammateNames: entryType === "team" && mode === "student" ? teamMemberNames.filter((n) => n.trim()) : undefined,
      entrantNameForDisplay: entrantName,
    });

    setSubmitting(false);

    if (error || !registration) {
      setSubmitError(error ?? "Something went wrong submitting your registration.");
      return;
    }

    setResults([registration]);
    moveTo("payment");
  }

  async function handlePaymentSubmit() {
    if (!receiptFile) {
      setPaymentError("Please attach your fee receipt before continuing.");
      return;
    }
    setPaymentSubmitting(true);
    setPaymentError(null);

    const { error } = await withFileUploadProgress(setTransfer, () =>
      submitPaymentAction({
        competitionSlug: competition.slug,
        competitionTitle: competition.title,
        schoolId: mode === "school" ? (schoolId ?? null) : null,
        schoolName: mode === "school" ? (schoolName ?? null) : null,
        entryCount,
        amountExpected,
        registrationIds: results.map((r) => r.id),
        receiptFile,
      }),
    );
    setTransfer(null);
    setPaymentSubmitting(false);

    if (error) {
      setPaymentError(error);
      return;
    }

    setPaymentDone(true);
    moveTo("success");
  }

  const steps: Step[] = ["eligibility", "entry", "consent", "review", "payment"];

  return (
    <div className="form-actions mx-auto max-w-2xl">
      <ol className="mb-8 flex flex-wrap gap-2 text-xs font-medium text-muted">
        {steps.map((s, i) => (
          <li
            key={s}
            className={`rounded-full px-3 py-1 ${step === s ? "bg-accent-soft text-accent" : "bg-surface-muted"}`}
          >
            {i + 1}. {s[0].toUpperCase() + s.slice(1)}
          </li>
        ))}
      </ol>

      <StepMotion step={step} direction={direction}>
      {step === "eligibility" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Check eligibility</h2>
          <p className="text-sm text-muted">
            {competition.title} is open to:{" "}
            {competition.eligibility.map((r) => `${categoryLabels[r.category]} (grades ${r.minGrade}–${r.maxGrade})`).join(", ")}.
          </p>
          <div>
            <label className="text-sm font-medium text-foreground">
              {mode === "school" ? "Student's grade" : "Your grade"}
              <RequiredMark />
            </label>
            <input
              type="text"
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                setIneligible(false);
              }}
              placeholder="e.g. 8"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>
          {ineligible && (
            <p className="rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
              This grade doesn&apos;t fall within an eligible category for {competition.title}. Try a different
              competition from the{" "}
              <Link href="/dashboard/register" className="font-semibold underline">
                registration list
              </Link>
              .
            </p>
          )}
          <button
            onClick={checkEligibility}
            disabled={!grade.trim()}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {step === "entry" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Entry details</h2>

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
                  <Link href="/dashboard" className="font-semibold text-accent">
                    Add a student
                  </Link>{" "}
                  first.
                </p>
              ) : (
                <div className="mt-1 max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                  {roster.map((s) => (
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
                      {s.fullName} (Grade {s.grade})
                    </label>
                  ))}
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
                      <Link href="/dashboard" className="font-semibold text-accent">
                        Add students
                      </Link>{" "}
                      first.
                    </p>
                  ) : (
                    <div className="mt-1 space-y-2">
                      {roster.map((s) => (
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
                          {s.fullName} (Grade {s.grade})
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => moveTo("eligibility")}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => moveTo("consent")}
              disabled={
                (entryType === "team" && !teamName.trim()) ||
                (entryType === "team" && mode === "school" && selectedRosterIds.length < 2) ||
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
          <div className="rounded-xl border border-border bg-surface p-4 text-sm">
            <p>
              <span className="text-muted">Competition:</span>{" "}
              <span className="font-medium text-foreground">{competition.title}</span>
            </p>
            <p>
              <span className="text-muted">Entry type:</span>{" "}
              <span className="font-medium text-foreground capitalize">{entryType}</span>
            </p>
            <p>
              <span className="text-muted">Entrant{isCoordinatorIndividualBatch && selectedIndividualIds.length > 1 ? "s" : ""}:</span>{" "}
              <span className="font-medium text-foreground">{entrantName || "—"}</span>
            </p>
            <p>
              <span className="text-muted">Fee due:</span>{" "}
              <span className="font-medium text-foreground">
                {amountExpected != null ? formatFee(amountExpected) : "To be confirmed"}
                {entryCount > 1 && amountExpected != null && competition.feeAmount != null
                  ? ` (${formatFee(competition.feeAmount)} × ${entryCount})`
                  : ""}
              </span>
            </p>
          </div>
          <p className="text-xs text-muted">
            After you submit, you&apos;ll be asked to upload your fee payment receipt. Your registration stays under
            review until an admin approves the payment.
          </p>
          {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => moveTo("consent")}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !entrantName}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit registration"}
            </button>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Pay the entry fee</h2>
          <div className="rounded-xl border border-border bg-surface p-4 text-sm">
            <p>
              <span className="text-muted">Registration{results.length > 1 ? "s" : ""}:</span>{" "}
              <span className="font-medium text-foreground">{results.map((r) => r.registrationNumber).join(", ")}</span>
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
          <PaymentInstructions account={paymentAccount} amount={amountExpected != null ? formatFee(amountExpected) : null} />
          <p className="text-sm text-muted">
            An admin reviews every receipt. The registration stays under review until the payment is approved.
          </p>
          <div>
            <label className="text-sm font-medium text-foreground">
              Fee receipt
              <RequiredMark />
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent-strong hover:file:bg-accent-soft/80"
            />
          </div>
          {transfer ? <UploadProgress phase={transfer.phase} percent={transfer.percent} /> : null}
          {paymentError && <p className="text-sm text-red-600 dark:text-red-400">{paymentError}</p>}
          <div className="flex gap-3">
            <button
              onClick={handlePaymentSubmit}
              disabled={paymentSubmitting || !receiptFile}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              {paymentSubmitting ? "Uploading…" : "Upload receipt"}
            </button>
          </div>
        </div>
      )}

      {step === "success" && results.length > 0 && (
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-bold text-foreground">
            {results.length > 1 ? "Registrations submitted" : "Registration submitted"}
          </h2>
          <p className="text-muted">
            {results.length > 1 ? (
              <>
                Registration numbers:{" "}
                <span className="font-semibold text-foreground">{results.map((r) => r.registrationNumber).join(", ")}</span>.
              </>
            ) : (
              <>
                Your registration number is{" "}
                <span className="font-semibold text-foreground">{results[0].registrationNumber}</span>.
              </>
            )}{" "}
            {paymentDone
              ? "Your receipt has been submitted and is now under review — you'll see it marked approved on your dashboard once an admin has checked it."
              : "It will appear on your dashboard as pending review."}
          </p>
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
