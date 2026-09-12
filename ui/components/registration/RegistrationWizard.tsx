"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Competition } from "@/domain/competitions/types";
import { categoryLabels } from "@/domain/competitions/types";
import { isGradeEligible } from "@/domain/competitions/service";
import type { StudentProfile } from "@/domain/students/types";
import type { Registration } from "@/domain/registrations/types";
import { submitRegistrationAction } from "@/domain/registrations/actions";

type Step = "eligibility" | "entry" | "consent" | "review" | "success";

export function RegistrationWizard({
  competition,
  mode,
  studentName,
  studentId,
  schoolId,
  roster = [],
}: {
  competition: Competition;
  mode: "student" | "school";
  /** Required for mode="student": the logged-in student's own students.id and full name. */
  studentName?: string;
  studentId?: string;
  /** Required for mode="school": the coordinator's schools.id. */
  schoolId?: string;
  roster?: StudentProfile[];
}) {
  const [step, setStep] = useState<Step>("eligibility");
  const [grade, setGrade] = useState("");
  const [matchedRule, setMatchedRule] = useState<Competition["eligibility"][number] | null>(null);
  const [ineligible, setIneligible] = useState(false);

  const allowIndividual = competition.participationType === "individual" || competition.participationType === "both";
  const allowTeam = competition.participationType === "team" || competition.participationType === "both";
  const [entryType, setEntryType] = useState<"individual" | "team">(allowIndividual ? "individual" : "team");

  const [selectedStudentId, setSelectedStudentId] = useState(roster[0]?.id ?? "");
  const [teamName, setTeamName] = useState("");
  const [teamMemberNames, setTeamMemberNames] = useState<string[]>([""]);
  const [selectedRosterIds, setSelectedRosterIds] = useState<string[]>([]);

  const [consent, setConsent] = useState({ terms: false, privacy: false, results: false, photo: false });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Registration | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const teamMin = matchedRule?.teamMinSize ?? 1;
  const teamMax = matchedRule?.teamMaxSize ?? 10;

  function checkEligibility() {
    const numericGrade = grade.trim();
    const match = competition.eligibility.find((rule) => isGradeEligible(rule.minGrade, rule.maxGrade, numericGrade));
    if (match) {
      setMatchedRule(match);
      setIneligible(false);
      setStep("entry");
    } else {
      setIneligible(true);
    }
  }

  const entrantName = useMemo(() => {
    if (entryType === "individual") {
      return mode === "student" ? studentName ?? "" : roster.find((s) => s.id === selectedStudentId)?.fullName ?? "";
    }
    return teamName;
  }, [entryType, mode, studentName, roster, selectedStudentId, teamName]);

  const consentComplete = consent.terms && consent.privacy && consent.results && consent.photo;

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    const { registration, error } = await submitRegistrationAction({
      competitionSlug: competition.slug,
      competitionTitle: competition.title,
      category: matchedRule?.category ?? competition.eligibility[0]?.category ?? "primary",
      entryType,
      schoolId: mode === "school" ? (schoolId ?? null) : null,
      studentId: entryType === "individual" ? (mode === "student" ? studentId : selectedStudentId) : undefined,
      teamName: entryType === "team" ? teamName : undefined,
      existingMemberIds:
        entryType === "team"
          ? mode === "student"
            ? studentId
              ? [studentId]
              : []
            : selectedRosterIds
          : undefined,
      newTeammateNames: entryType === "team" && mode === "student" ? teamMemberNames.filter((n) => n.trim()) : undefined,
      entrantNameForDisplay: entrantName,
      consent,
    });

    setSubmitting(false);

    if (error || !registration) {
      setSubmitError(error ?? "Something went wrong submitting your registration.");
      return;
    }

    setResult(registration);
    setStep("success");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ol className="mb-8 flex flex-wrap gap-2 text-xs font-medium text-muted">
        {(["eligibility", "entry", "consent", "review"] as Step[]).map((s, i) => (
          <li
            key={s}
            className={`rounded-full px-3 py-1 ${step === s ? "bg-accent-soft text-accent" : "bg-surface-muted"}`}
          >
            {i + 1}. {s[0].toUpperCase() + s.slice(1)}
          </li>
        ))}
      </ol>

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
              <label className="text-sm font-medium text-foreground">Select student</label>
              {roster.length === 0 ? (
                <p className="mt-1 text-sm text-muted">
                  No students in your roster yet.{" "}
                  <Link href="/dashboard" className="font-semibold text-accent">
                    Add a student
                  </Link>{" "}
                  first.
                </p>
              ) : (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  {roster.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} (Grade {s.grade})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {entryType === "team" && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Team name</label>
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
              onClick={() => setStep("eligibility")}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep("consent")}
              disabled={
                (entryType === "team" && !teamName.trim()) ||
                (entryType === "team" && mode === "school" && selectedRosterIds.length < 2) ||
                (entryType === "individual" && mode === "school" && !selectedStudentId)
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
              {item.label}
            </label>
          ))}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("entry")}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep("review")}
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
              <span className="text-muted">Entrant:</span>{" "}
              <span className="font-medium text-foreground">{entrantName || "—"}</span>
            </p>
          </div>
          {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("consent")}
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

      {step === "success" && result && (
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-bold text-foreground">Registration submitted</h2>
          <p className="text-muted">
            Your registration number is <span className="font-semibold text-foreground">{result.registrationNumber}</span>.
            It will appear on your dashboard as pending review.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            Go to dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
