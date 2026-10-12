"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import type { AgeCategory, CompetitionSummary } from "@/domain/competitions/types";
import { categoryLabels, competitionGradeLabel, formatFee } from "@/domain/competitions/types";
import { teamIsSetForCompetition, teamVisibleForCompetition, type Team } from "@/domain/teams/types";
import { isGradeEligible } from "@/domain/competitions/service";
import type { StudentProfile } from "@/domain/students/types";
import type { SchoolEntryDraft } from "@/domain/registrations/schoolEntries";
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
import { AddStudentForm } from "@/ui/components/dashboard/AddStudentForm";
import { AddTeamButton } from "@/ui/components/registration/AddTeamButton";
import { EditTeamButton } from "@/ui/components/registration/EditTeamButton";
import { AddToEntryListButton } from "@/ui/components/registration/SchoolEntryList";
import { StudentMultiSelect } from "@/ui/components/registration/StudentMultiSelect";
import { PaymentInstructions } from "@/ui/components/PaymentInstructions";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { StepMotion } from "@/ui/components/StepMotion";
import { UploadProgress } from "@/ui/components/UploadProgress";

type Step = "eligibility" | "entry" | "consent" | "review" | "payment" | "success";

function ruleForGrade(eligibility: CompetitionSummary["eligibility"], grade: string | null | undefined) {
  const value = grade?.trim() ?? "";
  if (!value) return null;
  return eligibility.find((rule) => isGradeEligible(rule.minGrade, rule.maxGrade, value)) ?? null;
}

function teamBounds(rules: CompetitionSummary["eligibility"]): { min: number; max: number } {
  const mins = rules.map((rule) => rule.teamMinSize).filter((size): size is number => size != null && size > 0);
  const maxes = rules.map((rule) => rule.teamMaxSize).filter((size): size is number => size != null && size > 0);
  const min = mins.length > 0 ? Math.min(...mins) : 2;
  const max = maxes.length > 0 ? Math.max(...maxes) : min;
  return { min, max: Math.max(min, max) };
}

function memberSpan(min: number, max: number): string {
  return min === max ? `${min}` : `${min}–${max}`;
}

/** The registration steps choose teams. Student shortages stay on the add-team form. */
function registrationTeamNote(input: {
  teams: Team[];
  selectedTeamIds: string[];
  reservedTeamIds: string[];
  reservedStudentIds: string[];
  eligibility: CompetitionSummary["eligibility"];
  readyTeams: number;
  gradeLabel: string;
}): string | null {
  const { min, max } = teamBounds(input.eligibility);
  const size = memberSpan(min, max);
  const mix = `A team can mix any ${input.gradeLabel}.`;
  const chosen = input.teams.filter((team) => input.selectedTeamIds.includes(team.id));
  const taken = [
    ...input.reservedStudentIds,
    ...chosen.flatMap((team) => team.members.map((member) => member.studentId)),
  ];
  const selectable = input.teams.some((team) => {
    if (input.selectedTeamIds.includes(team.id)) return false;
    const listed =
      input.reservedTeamIds.includes(team.id) || input.reservedTeamIds.includes(team.name.trim().toLowerCase());
    if (listed) return false;
    return teamFit(team, input.eligibility, taken).ok;
  });

  if (input.readyTeams > 0) {
    if (selectable) return null;
    return `The selected team can be registered. Add another team of ${size}. ${mix}`;
  }
  if (input.teams.length === 0) return `Add a team of ${size}. ${mix}`;
  if (selectable) return `Select a team of ${size}, or add another team. ${mix}`;
  return `Add another team of ${size}. ${mix}`;
}

function nameList(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "A member";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function teamFit(
  team: Team,
  eligibility: CompetitionSummary["eligibility"],
  reservedStudentIds: string[],
):
  | { ok: true; students: { id: string; fullName: string; grade: string | null; category: AgeCategory }[] }
  | { ok: false; reason: string } {
  if (team.members.length === 0) return { ok: false, reason: "This team has no members." };
  const assessed = team.members.map((member) => ({ member, rule: ruleForGrade(eligibility, member.grade) }));
  if (assessed.some((item) => !item.rule)) {
    return { ok: false, reason: "A member's grade is not open for this competition." };
  }
  const first = assessed[0]?.rule;
  if (!first) return { ok: false, reason: "A member's grade is not open for this competition." };
  const taken = assessed
    .filter((item) => reservedStudentIds.includes(item.member.studentId))
    .map((item) => item.member.studentName);
  if (taken.length > 0) {
    const names = nameList(taken);
    return {
      ok: false,
      reason: `${names} ${taken.length === 1 ? "is" : "are"} already on another team for this competition.`,
    };
  }
  const { min, max } = teamBounds(eligibility);
  if (team.members.length < min || team.members.length > max) {
    return { ok: false, reason: `Needs ${memberSpan(min, max)} members.` };
  }
  return {
    ok: true,
    students: assessed.flatMap((item) =>
      item.rule
        ? [{ id: item.member.studentId, fullName: item.member.studentName, grade: item.member.grade, category: item.rule.category }]
        : [],
    ),
  };
}

export function RegistrationWizard({
  competition,
  mode,
  studentName,
  studentId,
  schoolId,
  schoolName,
  roster: initialRoster = [],
  paymentAccount,
  teams: initialTeams = [],
  reservedStudentIds = [],
  reservedTeamIds = [],
  listedMembers = [],
  onTeamUpdated,
  onAddedToList,
}: {
  competition: CompetitionSummary;
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
  /** School teams the coordinator can enter. */
  teams?: Team[];
  /** Students already placed on a team for this competition in the entry list. */
  reservedStudentIds?: string[];
  /** Team ids or names already on the entry list for this competition. */
  reservedTeamIds?: string[];
  /** Students already entered for this competition, with the team they belong to. */
  listedMembers?: { studentId: string; teamId?: string }[];
  /** Called after a team is edited so the entry list can show the new members. */
  onTeamUpdated?: (team: Team) => void;
  /** School flow: called after the competition is added, so a popup can close. */
  onAddedToList?: () => void;
}) {
  const [roster, setRoster] = useState(initialRoster);
  const [teams, setTeams] = useState(initialTeams);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [alreadyEntered, setAlreadyEntered] = useState<string | null>(null);
  const [standingPending, setStandingPending] = useState(false);
  const [step, setStep] = useState<Step>(mode === "school" ? "entry" : "eligibility");
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  function appendStudent(student: StudentProfile) {
    setRoster((current) => {
      if (current.some((item) => item.id === student.id)) {
        return current.map((item) => (item.id === student.id ? student : item));
      }
      return [...current, student].sort((a, b) => a.fullName.localeCompare(b.fullName));
    });
    if (entryType === "individual" && ruleForGrade(competition.eligibility, student.grade)) {
      setSelectedIndividualIds((current) => (current.includes(student.id) ? current : [...current, student.id]));
    }
  }

  function replaceStudent(student: StudentProfile) {
    setRoster((current) =>
      current
        .map((item) => (item.id === student.id ? { ...item, ...student } : item))
        .sort((a, b) => a.fullName.localeCompare(b.fullName)),
    );
    const nextTeams = teams.map((item) => ({
      ...item,
      members: item.members.map((member) =>
        member.studentId === student.id ? { ...member, studentName: student.fullName, grade: student.grade } : member,
      ),
    }));
    setTeams(nextTeams);
    for (const item of nextTeams) {
      if (item.members.some((member) => member.studentId === student.id)) onTeamUpdated?.(item);
    }
  }

  function appendTeam(team: Team) {
    setTeams((current) => {
      if (current.some((item) => item.id === team.id)) return current;
      return [...current, team].sort((a, b) => a.name.localeCompare(b.name));
    });
    setSelectedTeamIds((current) => (current.includes(team.id) ? current : [...current, team.id]));
  }

  function applyTeamUpdate(team: Team) {
    setTeams((current) => current.map((item) => (item.id === team.id ? team : item)));
    onTeamUpdated?.(team);
  }

  function moveTo(next: Step) {
    const order: Step[] = ["eligibility", "entry", "consent", "review", "payment", "success"];
    setDirection(order.indexOf(next) < order.indexOf(step) ? "back" : "forward");
    setStep(next);
  }
  const [grade, setGrade] = useState("");
  const [matchedRule, setMatchedRule] = useState<CompetitionSummary["eligibility"][number] | null>(null);
  const [ineligible, setIneligible] = useState(false);

  const allowIndividual = competition.supportsIndividual;
  const allowTeam = competition.supportsTeam;
  const teamOnly = allowTeam && !allowIndividual;
  const [entryType, setEntryType] = useState<"individual" | "team">(teamOnly ? "team" : "individual");

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
    if (!first || rules.some((rule) => !rule)) return null;
    return first;
  }, [mode, selectedRosterIds, roster, competition]);

  const activeTeamRule = mode === "school" ? schoolTeamRule : matchedRule;
  const fallbackTeam = teamBounds(competition.eligibility);
  const teamMin =
    activeTeamRule?.teamMinSize && activeTeamRule.teamMinSize > 0
      ? activeTeamRule.teamMinSize
      : entryType === "team"
        ? fallbackTeam.min
        : 1;
  const teamMax =
    activeTeamRule?.teamMaxSize && activeTeamRule.teamMaxSize > 0
      ? activeTeamRule.teamMaxSize
      : entryType === "team"
        ? fallbackTeam.max
        : 10;

  const chosenTeams = useMemo(
    () => teams.filter((team) => selectedTeamIds.includes(team.id)),
    [teams, selectedTeamIds],
  );
  const chosenFits = useMemo(
    () => chosenTeams.map((team) => ({ team, fit: teamFit(team, competition.eligibility, reservedStudentIds) })),
    [chosenTeams, competition.eligibility, reservedStudentIds],
  );
  const schoolTeamOverlap = useMemo(() => {
    const seen = new Map<string, string>();
    for (const { team, fit } of chosenFits) {
      if (!fit.ok) continue;
      for (const student of fit.students) {
        const previous = seen.get(student.id);
        if (previous) return `${student.fullName} is on both ${previous} and ${team.name}.`;
        seen.set(student.id, team.name);
      }
    }
    return null;
  }, [chosenFits]);

  const isCoordinatorIndividualBatch = mode === "school" && entryType === "individual";
  const standingIds = useMemo(() => {
    if (mode !== "school") return "";
    const ids =
      entryType === "team"
        ? chosenTeams.flatMap((team) => team.members.map((member) => member.studentId))
        : selectedIndividualIds;
    return [...new Set(ids.filter(Boolean))].sort().join(",");
  }, [mode, entryType, chosenTeams, selectedIndividualIds]);

  useEffect(() => {
    if (mode !== "school" || standingIds.length === 0) {
      setAlreadyEntered(null);
      setStandingPending(false);
      return;
    }
    let cancelled = false;
    setStandingPending(true);
    existingEntryStandingAction(standingIds.split(","), competition.slug).then(({ lines, error }) => {
      if (cancelled) return;
      setStandingPending(false);
      setAlreadyEntered(error ? error : lines.length > 0 ? alreadyEnteredMessage(competition.title, lines) : null);
    });
    return () => {
      cancelled = true;
    };
  }, [mode, standingIds, competition.slug, competition.title]);

  const schoolEntryBlocked =
    mode === "school" &&
    (Boolean(alreadyEntered) ||
      standingPending ||
      (entryType === "team" &&
        (chosenTeams.length === 0 || chosenFits.some((item) => !item.fit.ok) || Boolean(schoolTeamOverlap))) ||
      (isCoordinatorIndividualBatch && selectedIndividualIds.length === 0));
  const schoolTeamStudentCount =
    mode === "school" && entryType === "team"
      ? chosenFits.reduce((sum, item) => sum + (item.fit.ok ? item.fit.students.length : 0), 0)
      : 0;
  const gradeLabel = competitionGradeLabel(competition.eligibility);
  const readyTeams = chosenFits.filter((item) => item.fit.ok).length;
  const competitionTeams = useMemo(
    () => teams.filter((team) => teamVisibleForCompetition(team, competition.id, reservedTeamIds)),
    [teams, competition.id, reservedTeamIds],
  );
  const journeyGuidance =
    mode !== "school"
      ? null
      : entryType === "team"
        ? registrationTeamNote({
            teams: competitionTeams,
            selectedTeamIds,
            reservedTeamIds,
            reservedStudentIds,
            eligibility: competition.eligibility,
            readyTeams,
            gradeLabel,
          })
        : eligibleRoster.length === 0
          ? `Add a student in ${gradeLabel} before registering.`
          : selectedIndividualIds.length === 0
            ? `Select at least 1 student. Any ${gradeLabel} can register.`
            : null;
  const schoolJourneyNote = journeyGuidance ? (
    <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-800 dark:text-amber-300">{journeyGuidance}</p>
  ) : null;
  /** The competition fee is per student. A team of 3 pays fee x 3. */
  const entryCount = isCoordinatorIndividualBatch
    ? Math.max(1, selectedIndividualIds.length)
    : schoolTeamStudentCount > 0
      ? schoolTeamStudentCount
      : 1;
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
    if (mode === "school") {
      if (chosenTeams.length === 1) return chosenTeams[0]?.name ?? "";
      if (chosenTeams.length > 1) return `${chosenTeams.length} teams`;
      return "";
    }
    return teamName;
  }, [entryType, mode, studentName, roster, selectedIndividualIds, teamName, chosenTeams]);

  const consentComplete = consent.terms && consent.privacy && consent.results && consent.photo;

  async function createRegistrations(): Promise<{ registrations: Registration[]; error: string | null }> {
    if (mode === "school" && entryType === "team" && !schoolTeamRule) {
      return {
        registrations: [],
        error: "Choose a complete team before continuing.",
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
    mode === "school" ? ["entry", "consent", "review"] : ["eligibility", "entry", "consent", "review", "payment"];

  function buildSchoolDrafts(): SchoolEntryDraft[] {
    if (mode !== "school" || !consentComplete) return [];
    if (entryType === "team") {
      if (schoolTeamOverlap || chosenFits.length === 0 || chosenFits.some((item) => !item.fit.ok)) return [];
      return chosenFits.flatMap(({ team, fit }) =>
        fit.ok
          ? [
              {
                competitionSlug: competition.slug,
                competitionTitle: competition.title,
                feeAmount: competition.feeAmount,
                entryType: "team" as const,
                teamName: team.name,
                teamId: team.id,
                students: fit.students,
                consent,
              },
            ]
          : [],
      );
    }
    const students = selectedIndividualIds.flatMap((id) => {
      const student = roster.find((item) => item.id === id);
      const rule = ruleForGrade(competition.eligibility, student?.grade);
      if (!student || !rule) return [];
      return [{ id: student.id, fullName: student.fullName, grade: student.grade, category: rule.category as AgeCategory }];
    });
    if (students.length !== selectedIndividualIds.length || students.length === 0) return [];
    return [
      {
        competitionSlug: competition.slug,
        competitionTitle: competition.title,
        feeAmount: competition.feeAmount,
        entryType: "individual",
        teamName: null,
        students,
        consent,
      },
    ];
  }
  const stepLabels: Record<Step, string> = {
    eligibility: "Eligibility",
    entry: "Entry",
    consent: "Consent",
    review: "Review",
    payment: "Payment",
    success: "Done",
  };
  const stepIndex = steps.indexOf(step);

  const schoolEntryEditor =
    mode === "school" ? (
      <SchoolEntryEditor
        competition={competition}
        entryType={entryType}
        roster={roster}
        eligibleRoster={eligibleRoster}
        teams={competitionTeams}
        selectedTeamIds={selectedTeamIds}
        selectedIndividualIds={selectedIndividualIds}
        reservedStudentIds={reservedStudentIds}
        reservedTeamIds={reservedTeamIds}
        listedMembers={listedMembers}
        schoolTeamStudentCount={schoolTeamStudentCount}
        schoolTeamOverlap={schoolTeamOverlap}
        alreadyEntered={alreadyEntered}
        onToggleTeam={(id, selected) =>
          setSelectedTeamIds((current) => (selected ? [...current, id] : current.filter((item) => item !== id)))
        }
        onToggleStudent={(id, selected) =>
          setSelectedIndividualIds((current) => (selected ? [...current, id] : current.filter((item) => item !== id)))
        }
        onRemoveTeam={(id) => setSelectedTeamIds((current) => current.filter((item) => item !== id))}
        onRemoveStudent={(id) => setSelectedIndividualIds((current) => current.filter((item) => item !== id))}
        onStudentAdded={appendStudent}
        onStudentUpdated={replaceStudent}
        onTeamAdded={appendTeam}
        onTeamUpdated={applyTeamUpdate}
      />
    ) : null;

  return (
    <div className="form-actions mx-auto max-w-2xl">
      <ol className={`mb-5 grid gap-3 ${steps.length === 3 ? "grid-cols-3" : steps.length === 4 ? "grid-cols-4" : "grid-cols-5"}`}>
        {steps.map((s, i) => {
          const active = step === s;
          const done = stepIndex > i;
          return (
            <li key={s} className="min-w-0">
              <div className={`h-1 rounded-full ${active || done ? "bg-accent" : "bg-border"}`} />
              <p className={`mt-2 truncate text-xs font-semibold ${active ? "text-accent-strong" : "text-muted"}`}>
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

      {step === "entry" && mode === "school" && (
        <div className="space-y-5 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          {schoolEntryEditor}
          <div className="space-y-3 border-t border-border pt-4">
            {schoolJourneyNote}
            <button
              onClick={() => moveTo("consent")}
              disabled={schoolEntryBlocked}
              className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "entry" && mode !== "school" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Entry details</h2>
          </div>

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

          {entryType === "team" && mode === "student" && (
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
              <div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Teammates ({memberSpan(teamMin, teamMax)} members total, including you)
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
              </div>
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
              disabled={entryType === "team" && !teamName.trim()}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "consent" && (
        <div className="space-y-5 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          {schoolEntryEditor}
          <div className="space-y-3 border-t border-border pt-5">
            <h2 className="text-xl font-bold text-foreground">Consent</h2>
            <div className="space-y-2">
              {[
                { key: "terms" as const, label: "I accept the competition rules and code of conduct." },
                { key: "privacy" as const, label: "I consent to the site's data privacy policy." },
                { key: "results" as const, label: "I consent to result publication if qualified." },
                { key: "photo" as const, label: "I consent to photo publication for winners, where applicable." },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={consent[item.key]}
                    onChange={(e) => setConsent((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                  />
                  <span>
                    {item.label}
                    <RequiredMark />
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-3 border-t border-border pt-4">
            {schoolJourneyNote}
            <div className="flex items-center gap-3">
              <button
                onClick={() => moveTo("entry")}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
              >
                Back
              </button>
              <button
                onClick={() => moveTo("review")}
                disabled={!consentComplete || schoolEntryBlocked}
                className="min-w-0 flex-1 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-5 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          {schoolEntryEditor}
          <div className="space-y-3 border-t border-border pt-5">
            <h2 className="text-xl font-bold text-foreground">Review & submit</h2>
            <div className="overflow-hidden rounded-2xl border border-border bg-background text-sm">
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
            {mode === "school" ? null : (
            <div className="px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                {entryType === "team" ? (chosenTeams.length > 1 ? "Teams" : "Team") : isCoordinatorIndividualBatch && selectedIndividualIds.length > 1 ? "Students" : "Entrant"}
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
            )}
            <div className="flex items-center justify-between gap-3 border-t border-border bg-accent-soft px-4 py-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">Fee due</p>
                {entryCount > 1 && competition.feeAmount != null ? (
                  <p className="mt-0.5 text-xs text-muted">
                    {formatFee(competition.feeAmount)} × {entryCount} students
                  </p>
                ) : null}
              </div>
              <p className="text-lg font-extrabold text-foreground">
                {amountExpected != null ? formatFee(amountExpected) : "To be confirmed"}
              </p>
            </div>
          </div>
          </div>
          <div className="space-y-3 border-t border-border pt-4">
            {schoolJourneyNote}
            {mode === "school" ? (
            <AddToEntryListButton
              disabled={buildSchoolDrafts().length === 0 || Boolean(alreadyEntered) || standingPending}
              onBack={() => moveTo("consent")}
              onAdded={onAddedToList}
              buildDrafts={buildSchoolDrafts}
            />
          ) : (
            <>
              <p className="text-xs text-muted">
                Nothing is saved on this step. Continue to transfer the fee and submit the registration with your receipt.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => moveTo("consent")}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
                >
                  Back
                </button>
                <button
                  onClick={() => moveTo("payment")}
                  disabled={!entrantName}
                  className="min-w-0 flex-1 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </>
          )}
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

const linkActionClass =
  "cursor-pointer text-sm font-semibold text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline";
const iconActionClass =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent";
const iconDeleteClass =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-600";

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function SchoolEntryEditor({
  competition,
  entryType,
  roster,
  eligibleRoster,
  teams,
  selectedTeamIds,
  selectedIndividualIds,
  reservedStudentIds,
  reservedTeamIds,
  listedMembers,
  schoolTeamStudentCount,
  schoolTeamOverlap,
  alreadyEntered = null,
  onToggleTeam,
  onToggleStudent,
  onRemoveTeam,
  onStudentAdded,
  onStudentUpdated,
  onTeamAdded,
  onTeamUpdated,
}: {
  competition: CompetitionSummary;
  entryType: "individual" | "team";
  roster: StudentProfile[];
  eligibleRoster: StudentProfile[];
  teams: Team[];
  selectedTeamIds: string[];
  selectedIndividualIds: string[];
  reservedStudentIds: string[];
  reservedTeamIds: string[];
  listedMembers: { studentId: string; teamId?: string }[];
  schoolTeamStudentCount: number;
  schoolTeamOverlap: string | null;
  alreadyEntered?: string | null;
  onToggleTeam: (id: string, selected: boolean) => void;
  onToggleStudent: (id: string, selected: boolean) => void;
  onRemoveTeam: (id: string) => void;
  onRemoveStudent: (id: string) => void;
  onStudentAdded: (student: StudentProfile) => void;
  onStudentUpdated: (student: StudentProfile) => void;
  onTeamAdded: (team: Team) => void;
  onTeamUpdated: (team: Team) => void;
}) {
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const editingStudent = roster.find((student) => student.id === editingStudentId) ?? null;
  const fallbackTeam = teamBounds(competition.eligibility);
  const chosenTeams = teams.filter((team) => selectedTeamIds.includes(team.id));
  const teamsSetHere = teams.filter(
    (team) => selectedTeamIds.includes(team.id) || teamIsSetForCompetition(team, competition.id, reservedTeamIds),
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">{entryType === "team" ? "Team" : "Students"}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {entryType === "team"
            ? `Each team needs ${memberSpan(fallbackTeam.min, fallbackTeam.max)} members. They can be any ${competitionGradeLabel(competition.eligibility)}, and a school can register more than one team.`
            : "Select the students to register. Each one is filed in their own grade band."}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {competition.eligibility.map((rule) => (
          <span key={rule.id} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
            {categoryLabels[rule.category]} · grades {rule.minGrade}–{rule.maxGrade}
          </span>
        ))}
      </div>

      {entryType === "individual" ? (
        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-foreground">
              Select students
              <RequiredMark /> <span className="font-normal text-muted">(one registration per student selected)</span>
            </label>
            <AddStudentForm triggerClassName={linkActionClass} triggerLabel="Add student" onAdded={onStudentAdded} />
          </div>
          {roster.length === 0 ? (
            <p className="mt-1 text-sm text-muted">No students in your roster yet. Add a student to continue.</p>
          ) : eligibleRoster.length === 0 ? (
            <p className="mt-1 text-sm text-muted">None of the students on your roster are in an open grade for this competition.</p>
          ) : (
            <div className="mt-1">
              <StudentMultiSelect
                ariaLabel="Select students"
                students={eligibleRoster.map((student) => ({
                  id: student.id,
                  name: student.fullName,
                  grade: student.grade,
                }))}
                selectedIds={selectedIndividualIds}
                onChange={(ids) => {
                  const next = new Set(ids);
                  for (const id of selectedIndividualIds) if (!next.has(id)) onToggleStudent(id, false);
                  for (const id of ids) if (!selectedIndividualIds.includes(id)) onToggleStudent(id, true);
                }}
                onEdit={setEditingStudentId}
              />
            </div>
          )}
          {selectedIndividualIds.length > 0 && competition.feeAmount != null ? (
            <p className="mt-2 text-sm text-muted">
              {selectedIndividualIds.length} student{selectedIndividualIds.length === 1 ? "" : "s"} selected — fee due:{" "}
              <span className="font-semibold text-foreground">
                {formatFee(competition.feeAmount * selectedIndividualIds.length)}
              </span>{" "}
              ({formatFee(competition.feeAmount)} × {selectedIndividualIds.length}).
            </p>
          ) : null}
          {alreadyEntered ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{alreadyEntered}</p> : null}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-foreground">
              Teams
              <RequiredMark />
            </label>
            <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
              <AddStudentForm triggerClassName={linkActionClass} triggerLabel="Add student" onAdded={onStudentAdded} />
              <AddTeamButton
                roster={eligibleRoster}
                eligibility={competition.eligibility}
                teams={teamsSetHere}
                competitionId={competition.id}
                competitionSlug={competition.slug}
                takenStudentIds={[
                  ...reservedStudentIds,
                  ...chosenTeams.flatMap((team) => team.members.map((member) => member.studentId)),
                ]}
                onStudentAdded={onStudentAdded}
                onAdded={onTeamAdded}
                label="Add team"
                buttonClassName={linkActionClass}
              />
              <EditTeamButton
                teams={teams}
                nameTeams={teamsSetHere}
                competitionId={competition.id}
                competitionSlug={competition.slug}
                roster={eligibleRoster}
                eligibility={competition.eligibility}
                listedMembers={listedMembers}
                selectedTeamIds={selectedTeamIds}
                onStudentAdded={onStudentAdded}
                onSaved={onTeamUpdated}
                label="Edit team"
                buttonClassName={linkActionClass}
              />
            </div>
          </div>
          <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
            {teams.length === 0 ? (
              <p className="text-sm text-muted">No teams yet. Add a team to continue.</p>
            ) : (
              teams.map((team) => {
                const fit = teamFit(team, competition.eligibility, reservedStudentIds);
                const listed = reservedTeamIds.includes(team.id) || reservedTeamIds.includes(team.name.trim().toLowerCase());
                const selected = selectedTeamIds.includes(team.id);
                const clashing = selected
                  ? []
                  : team.members.filter((member) =>
                      teams.some(
                        (other) =>
                          other.id !== team.id &&
                          selectedTeamIds.includes(other.id) &&
                          other.members.some((item) => item.studentId === member.studentId),
                      ),
                    );
                const nameTaken =
                  !selected &&
                  teamsSetHere.some(
                    (other) => other.id !== team.id && other.name.trim().toLowerCase() === team.name.trim().toLowerCase(),
                  );
                const disabled = !fit.ok || listed || clashing.length > 0 || nameTaken;
                const status = listed
                  ? `already added to ${competition.title}`
                  : nameTaken
                    ? `already used for ${competition.title}`
                    : clashing.length > 0
                    ? `${nameList(clashing.map((member) => member.studentName))} ${clashing.length === 1 ? "is" : "are"} already on another team`
                    : !fit.ok
                      ? fit.reason
                      : "";
                return (
                  <div key={team.id} className="flex items-start justify-between gap-3 rounded-xl bg-surface-muted px-3 py-2.5">
                    <label className={`flex min-w-0 flex-1 items-start gap-2 text-sm ${disabled ? "text-muted" : "text-foreground"}`}>
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={disabled}
                        onChange={(event) => onToggleTeam(team.id, event.target.checked)}
                        className="mt-1"
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-baseline gap-x-3">
                          <span className="font-semibold">{team.name}</span>
                          {status ? <span className="text-muted">{status}</span> : null}
                        </span>
                        <span className="mt-0.5 block text-muted">
                          {team.members.map((member) => member.studentName).join(", ") || "No members"}
                        </span>
                      </span>
                    </label>
                    <span className="flex shrink-0 items-center gap-1">
                      <EditTeamButton
                        team={team}
                        label={<EditIcon />}
                        ariaLabel={`Edit ${team.name}`}
                        buttonClassName={iconActionClass}
                        teams={teams}
                        nameTeams={teamsSetHere}
                        competitionId={competition.id}
                        competitionSlug={competition.slug}
                        roster={eligibleRoster}
                        eligibility={competition.eligibility}
                        listedMembers={listedMembers}
                        selectedTeamIds={selectedTeamIds}
                        onStudentAdded={onStudentAdded}
                        onSaved={onTeamUpdated}
                      />
                      {selected ? (
                        <button
                          type="button"
                          aria-label={`Remove ${team.name}`}
                          onClick={() => onRemoveTeam(team.id)}
                          className={iconDeleteClass}
                        >
                          <DeleteIcon />
                        </button>
                      ) : null}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted">
            <p>
              {chosenTeams.length} team{chosenTeams.length === 1 ? "" : "s"} selected
            </p>
            {competition.feeAmount != null && schoolTeamStudentCount > 0 ? (
              <p className="text-right font-semibold text-foreground">
                {formatFee(competition.feeAmount * schoolTeamStudentCount)}
                <span className="ml-1 font-normal text-muted">
                  ({formatFee(competition.feeAmount)} × {schoolTeamStudentCount})
                </span>
              </p>
            ) : null}
          </div>
          {schoolTeamOverlap ? <p className="text-sm text-amber-700 dark:text-amber-400">{schoolTeamOverlap}</p> : null}
          {alreadyEntered ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{alreadyEntered}</p> : null}
        </div>
      )}

      {editingStudent ? (
        <AddStudentForm
          key={editingStudent.id}
          student={editingStudent}
          onClose={() => setEditingStudentId(null)}
          onAdded={(student) => {
            onStudentUpdated(student);
            setEditingStudentId(null);
          }}
        />
      ) : null}
    </div>
  );
}
