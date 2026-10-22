"use client";

import { useState } from "react";
import type { AgeCategory, CompetitionSummary } from "@/domain/competitions/types";
import { categoryLabels, competitionGradeLabel, formatFee } from "@/domain/competitions/types";
import { isGradeEligible } from "@/domain/competitions/service";
import { teamIsSetForCompetition, type Team } from "@/domain/teams/types";
import type { StudentProfile } from "@/domain/students/types";
import { AddStudentForm } from "@/ui/components/dashboard/AddStudentForm";
import { AddTeamButton } from "@/ui/components/registration/AddTeamButton";
import { BulkAddStudentsButton } from "@/ui/components/registration/BulkAddStudentsButton";
import { EditTeamButton } from "@/ui/components/registration/EditTeamButton";
import { StudentMultiSelect } from "@/ui/components/registration/StudentMultiSelect";
import { RequiredMark } from "@/ui/components/RequiredMark";

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
        ? [
            {
              id: item.member.studentId,
              fullName: item.member.studentName,
              grade: item.member.grade,
              category: item.rule.category,
            },
          ]
        : [],
    ),
  };
}

const primaryBtn =
  "cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white";
const secondaryBtn =
  "cursor-pointer rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong";
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

export type SchoolEntryEditorProps = {
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
};

/** Flow-2 — guided empty/list states + bulk student add. */
export function SchoolEntryEditorFlow2({
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
}: SchoolEntryEditorProps) {
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const editingStudent = roster.find((student) => student.id === editingStudentId) ?? null;
  const fallbackTeam = teamBounds(competition.eligibility);
  const sizeLabel = memberSpan(fallbackTeam.min, fallbackTeam.max);
  const gradeLabel = competitionGradeLabel(competition.eligibility);
  const chosenTeams = teams.filter((team) => selectedTeamIds.includes(team.id));
  const teamsSetHere = teams.filter(
    (team) => selectedTeamIds.includes(team.id) || teamIsSetForCompetition(team, competition.id, reservedTeamIds),
  );
  const readyTeams = chosenTeams.filter((team) => teamFit(team, competition.eligibility, reservedStudentIds).ok).length;

  function handleStudentsAdded(students: StudentProfile[]) {
    for (const student of students) onStudentAdded(student);
  }

  const takenForNewTeam = [
    ...reservedStudentIds,
    ...chosenTeams.flatMap((team) => team.members.map((member) => member.studentId)),
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">{entryType === "team" ? "Assemble teams" : "Select students"}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {entryType === "team"
            ? `Each team needs ${sizeLabel} members from ${gradeLabel}. You can register more than one team.`
            : "Choose who to register. Each selected student gets their own entry."}
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
        <IndividualFlow2
          competition={competition}
          roster={roster}
          eligibleRoster={eligibleRoster}
          selectedIndividualIds={selectedIndividualIds}
          alreadyEntered={alreadyEntered}
          onToggleStudent={onToggleStudent}
          onEditStudent={setEditingStudentId}
          onStudentsAdded={handleStudentsAdded}
        />
      ) : teams.length === 0 ? (
        <EmptyTeamsState
          competition={competition}
          eligibleRoster={eligibleRoster}
          rosterCount={roster.length}
          sizeLabel={sizeLabel}
          gradeLabel={gradeLabel}
          teamsSetHere={teamsSetHere}
          takenStudentIds={takenForNewTeam}
          onStudentAdded={onStudentAdded}
          onStudentsAdded={handleStudentsAdded}
          onTeamAdded={onTeamAdded}
        />
      ) : (
        <TeamsListState
          competition={competition}
          teams={teams}
          eligibleRoster={eligibleRoster}
          selectedTeamIds={selectedTeamIds}
          reservedStudentIds={reservedStudentIds}
          reservedTeamIds={reservedTeamIds}
          listedMembers={listedMembers}
          teamsSetHere={teamsSetHere}
          chosenTeams={chosenTeams}
          readyTeams={readyTeams}
          schoolTeamStudentCount={schoolTeamStudentCount}
          schoolTeamOverlap={schoolTeamOverlap}
          alreadyEntered={alreadyEntered}
          sizeLabel={sizeLabel}
          takenStudentIds={takenForNewTeam}
          onToggleTeam={onToggleTeam}
          onRemoveTeam={onRemoveTeam}
          onStudentAdded={onStudentAdded}
          onStudentsAdded={handleStudentsAdded}
          onTeamAdded={onTeamAdded}
          onTeamUpdated={onTeamUpdated}
        />
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

function IndividualFlow2({
  competition,
  roster,
  eligibleRoster,
  selectedIndividualIds,
  alreadyEntered,
  onToggleStudent,
  onEditStudent,
  onStudentsAdded,
}: {
  competition: CompetitionSummary;
  roster: StudentProfile[];
  eligibleRoster: StudentProfile[];
  selectedIndividualIds: string[];
  alreadyEntered?: string | null;
  onToggleStudent: (id: string, selected: boolean) => void;
  onEditStudent: (id: string) => void;
  onStudentsAdded: (students: StudentProfile[]) => void;
}) {
  if (roster.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-muted/50 px-5 py-8 text-center">
        <p className="text-base font-semibold text-foreground">No students on your roster yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Add the students who will enter this competition, then select them below.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <BulkAddStudentsButton onAdded={onStudentsAdded} label="Add students" buttonClassName={primaryBtn} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          Select students
          <RequiredMark />
        </p>
        <BulkAddStudentsButton onAdded={onStudentsAdded} label="Add students" buttonClassName={secondaryBtn} />
      </div>
      {eligibleRoster.length === 0 ? (
        <p className="text-sm text-muted">None of your students are in an open grade for this competition.</p>
      ) : (
        <StudentMultiSelect
          variant="panel"
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
          onEdit={onEditStudent}
        />
      )}
      {selectedIndividualIds.length > 0 && competition.feeAmount != null ? (
        <p className="text-sm text-muted">
          {selectedIndividualIds.length} selected — fee due:{" "}
          <span className="font-semibold text-foreground">
            {formatFee(competition.feeAmount * selectedIndividualIds.length)}
          </span>
        </p>
      ) : null}
      {alreadyEntered ? <p className="text-sm text-red-600 dark:text-red-400">{alreadyEntered}</p> : null}
    </div>
  );
}

function EmptyTeamsState({
  competition,
  eligibleRoster,
  rosterCount,
  sizeLabel,
  gradeLabel,
  teamsSetHere,
  takenStudentIds,
  onStudentAdded,
  onStudentsAdded,
  onTeamAdded,
}: {
  competition: CompetitionSummary;
  eligibleRoster: StudentProfile[];
  rosterCount: number;
  sizeLabel: string;
  gradeLabel: string;
  teamsSetHere: Team[];
  takenStudentIds: string[];
  onStudentAdded: (student: StudentProfile) => void;
  onStudentsAdded: (students: StudentProfile[]) => void;
  onTeamAdded: (team: Team) => void;
}) {
  const needsRoster = eligibleRoster.length < teamBounds(competition.eligibility).min;

  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-muted/50 px-5 py-8 text-center sm:px-8">
      <p className="text-base font-semibold text-foreground">No teams for {competition.title} yet</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">
        Create a team of {sizeLabel}. Members can be any {gradeLabel}.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {needsRoster ? (
          <>
            <BulkAddStudentsButton onAdded={onStudentsAdded} label="Add students first" buttonClassName={primaryBtn} />
            <AddTeamButton
              roster={eligibleRoster}
              eligibility={competition.eligibility}
              teams={teamsSetHere}
              competitionId={competition.id}
              competitionSlug={competition.slug}
              takenStudentIds={takenStudentIds}
              onStudentAdded={onStudentAdded}
              onAdded={onTeamAdded}
              label="Create team"
              buttonClassName={secondaryBtn}
            />
          </>
        ) : (
          <>
            <AddTeamButton
              roster={eligibleRoster}
              eligibility={competition.eligibility}
              teams={teamsSetHere}
              competitionId={competition.id}
              competitionSlug={competition.slug}
              takenStudentIds={takenStudentIds}
              onStudentAdded={onStudentAdded}
              onAdded={onTeamAdded}
              label="Create team"
              buttonClassName={primaryBtn}
            />
            <BulkAddStudentsButton onAdded={onStudentsAdded} label="Add students" buttonClassName={secondaryBtn} />
          </>
        )}
      </div>
      {rosterCount > 0 && needsRoster ? (
        <p className="mt-4 text-xs text-muted">
          You have {rosterCount} student{rosterCount === 1 ? "" : "s"} on the roster, but not enough in the open grades
          for a full team.
        </p>
      ) : null}
    </div>
  );
}

function TeamsListState({
  competition,
  teams,
  eligibleRoster,
  selectedTeamIds,
  reservedStudentIds,
  reservedTeamIds,
  listedMembers,
  teamsSetHere,
  chosenTeams,
  readyTeams,
  schoolTeamStudentCount,
  schoolTeamOverlap,
  alreadyEntered,
  sizeLabel,
  takenStudentIds,
  onToggleTeam,
  onRemoveTeam,
  onStudentAdded,
  onStudentsAdded,
  onTeamAdded,
  onTeamUpdated,
}: {
  competition: CompetitionSummary;
  teams: Team[];
  eligibleRoster: StudentProfile[];
  selectedTeamIds: string[];
  reservedStudentIds: string[];
  reservedTeamIds: string[];
  listedMembers: { studentId: string; teamId?: string }[];
  teamsSetHere: Team[];
  chosenTeams: Team[];
  readyTeams: number;
  schoolTeamStudentCount: number;
  schoolTeamOverlap: string | null;
  alreadyEntered?: string | null;
  sizeLabel: string;
  takenStudentIds: string[];
  onToggleTeam: (id: string, selected: boolean) => void;
  onRemoveTeam: (id: string) => void;
  onStudentAdded: (student: StudentProfile) => void;
  onStudentsAdded: (students: StudentProfile[]) => void;
  onTeamAdded: (team: Team) => void;
  onTeamUpdated: (team: Team) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            Teams
            <RequiredMark />
          </p>
          <p className="text-xs text-muted">
            Ready to register: {readyTeams} · Need {sizeLabel} members each
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BulkAddStudentsButton onAdded={onStudentsAdded} label="Add students" buttonClassName={secondaryBtn} />
          <AddTeamButton
            roster={eligibleRoster}
            eligibility={competition.eligibility}
            teams={teamsSetHere}
            competitionId={competition.id}
            competitionSlug={competition.slug}
            takenStudentIds={takenStudentIds}
            onStudentAdded={onStudentAdded}
            onAdded={onTeamAdded}
            label="Create team"
            buttonClassName={primaryBtn}
          />
        </div>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto">
        {teams.map((team) => {
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
            <div
              key={team.id}
              className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-3 ${
                selected ? "border-accent/40 bg-accent-soft/40" : "border-transparent bg-surface-muted"
              }`}
            >
              <label className={`flex min-w-0 flex-1 items-start gap-2.5 text-sm ${disabled ? "text-muted" : "text-foreground"}`}>
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
                    <span className="text-xs text-muted">
                      {team.members.length}/{sizeLabel} members
                    </span>
                  </span>
                  <span className="mt-0.5 block text-muted">
                    {team.members.length === 0
                      ? "No members"
                      : team.members.map((member) => (
                          <span key={member.studentId} className="block">
                            {member.studentName}
                          </span>
                        ))}
                  </span>
                  {status ? <span className="mt-1 block text-xs text-amber-700 dark:text-amber-400">{status}</span> : null}
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
        })}
      </div>

      <div className="flex items-center justify-between gap-3 text-sm text-muted">
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
      {alreadyEntered ? <p className="text-sm text-red-600 dark:text-red-400">{alreadyEntered}</p> : null}
    </div>
  );
}
