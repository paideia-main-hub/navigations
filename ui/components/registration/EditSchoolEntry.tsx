"use client";

import { useMemo, useState } from "react";
import type { AgeCategory, CompetitionSummary } from "@/domain/competitions/types";
import { competitionGradeLabel, competitionTeamSize, teamRosterGuidance } from "@/domain/competitions/types";
import { isGradeEligible } from "@/domain/competitions/service";
import type { SchoolEntryDraft, SchoolEntryStudent } from "@/domain/registrations/schoolEntries";
import { updateSchoolTeamAction } from "@/domain/teams/actions";
import { DUPLICATE_TEAM_NAME, teamIsSetForCompetition, teamNameTaken, type Team } from "@/domain/teams/types";
import type { StudentProfile } from "@/domain/students/types";
import { StudentMultiSelect } from "@/ui/components/registration/StudentMultiSelect";
import { RequiredMark } from "@/ui/components/RequiredMark";

function ruleForGrade(eligibility: CompetitionSummary["eligibility"], grade: string | null | undefined) {
  const value = grade?.trim() ?? "";
  if (!value) return null;
  return eligibility.find((rule) => isGradeEligible(rule.minGrade, rule.maxGrade, value)) ?? null;
}

function memberSpan(min: number, max: number): string {
  return min === max ? `${min}` : `${min}–${max}`;
}

export function EditSchoolEntry({
  competition,
  draft,
  roster,
  teams,
  reservedStudentIds,
  reservedTeamIds = [],
  onSaved,
  onTeamUpdated,
}: {
  competition: CompetitionSummary;
  draft: SchoolEntryDraft;
  roster: StudentProfile[];
  teams: Team[];
  reservedStudentIds: string[];
  reservedTeamIds?: string[];
  onSaved: (entry: SchoolEntryDraft) => void;
  onTeamUpdated: (team: Team) => void;
}) {
  const eligible = useMemo(
    () => roster.filter((student) => ruleForGrade(competition.eligibility, student.grade)),
    [roster, competition.eligibility],
  );
  const [teamId, setTeamId] = useState(draft.teamId ?? "");
  const [teamName, setTeamName] = useState(draft.teamName ?? "");
  const [memberIds, setMemberIds] = useState(draft.students.map((student) => student.id));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const selectedTeam = teams.find((team) => team.id === teamId) ?? null;
  const teamSize = competitionTeamSize(competition.eligibility);
  const rules = memberIds.map((id) => ruleForGrade(competition.eligibility, roster.find((student) => student.id === id)?.grade));
  const eligibleSelection = rules.length > 0 && rules.every(Boolean);
  const min = teamSize.min;
  const max = teamSize.max;
  const teamReady =
    draft.entryType !== "team" || (Boolean(teamName.trim()) && eligibleSelection && memberIds.length >= min && memberIds.length <= max);
  const individualReady = draft.entryType !== "individual" || memberIds.length > 0;

  function chooseTeam(team: Team) {
    setTeamId(team.id);
    setTeamName(team.name);
    setMemberIds(team.members.map((member) => member.studentId));
    setError(null);
  }

  function toStudents(): SchoolEntryStudent[] | null {
    const students = memberIds.flatMap((id) => {
      const student = roster.find((item) => item.id === id);
      const rule = ruleForGrade(competition.eligibility, student?.grade);
      if (!student || !rule) return [];
      return [{ id: student.id, fullName: student.fullName, grade: student.grade, category: rule.category as AgeCategory }];
    });
    return students.length === memberIds.length ? students : null;
  }

  async function save() {
    const students = toStudents();
    if (!students) {
      setError("Choose students who are in an open grade for this competition.");
      return;
    }
    if (draft.entryType === "team") {
      if (!teamName.trim() || !eligibleSelection || memberIds.length < min || memberIds.length > max) return;
      const currentName = teams.find((item) => item.id === (teamId || draft.teamId))?.name ?? draft.teamName ?? "";
      const setHere = teams.filter((item) => teamIsSetForCompetition(item, competition.id, reservedTeamIds));
      if (
        currentName.trim().toLowerCase() !== teamName.trim().toLowerCase() &&
        teamNameTaken(teamName, setHere, teamId || draft.teamId)
      ) {
        setError(DUPLICATE_TEAM_NAME);
        return;
      }
      const blocked = students.find((student) => reservedStudentIds.includes(student.id));
      if (blocked) {
        setError(`${blocked.fullName} is already on another entry for ${competition.title}.`);
        return;
      }
    }

    setPending(true);
    setError(null);
    let nextTeamId = draft.entryType === "team" ? teamId || draft.teamId : undefined;
    if (draft.entryType === "team" && nextTeamId) {
      const changed =
        teamName.trim() !== (selectedTeam?.name ?? draft.teamName) ||
        memberIds.join(",") !== (selectedTeam?.members.map((member) => member.studentId).join(",") ?? "");
      if (changed) {
        const result = await updateSchoolTeamAction({
          teamId: nextTeamId,
          name: teamName,
          memberStudentIds: memberIds,
          competitionId: competition.id,
          competitionSlug: competition.slug,
        });
        setPending(false);
        if (result.error || !result.team) {
          setError(result.error ?? "Could not update the team.");
          return;
        }
        onTeamUpdated(result.team);
        nextTeamId = result.team.id;
      } else {
        setPending(false);
      }
    } else {
      setPending(false);
    }

    onSaved({
      ...draft,
      teamName: draft.entryType === "team" ? teamName.trim() : null,
      teamId: nextTeamId,
      students,
      feeAmount: competition.feeAmount,
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {draft.entryType === "team"
          ? "Change this team, or the students on it. A school can still enter more than one team for this competition."
          : "Change the students on this entry."}
      </p>
      {draft.entryType === "team" ? (
        <>
          {teams.length > 1 ? (
            <div>
              <label className="text-sm font-medium text-foreground">
                Team
                <RequiredMark />
              </label>
              <div className="mt-1 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                {teams.map((team) => (
                  <label key={team.id} className="flex items-center gap-2 text-sm text-foreground">
                    <input type="radio" name="edit-team" checked={team.id === teamId} onChange={() => chooseTeam(team)} />
                    {team.name}
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          <div>
            <label className="text-sm font-medium text-foreground">
              Team name
              <RequiredMark />
            </label>
            <input
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>
        </>
      ) : null}
      <div>
        <label className="text-sm font-medium text-foreground">
          {draft.entryType === "team" ? `Team members (${memberSpan(min, max)})` : "Students"}
          <RequiredMark />
        </label>
        {eligible.length === 0 ? (
          <p className="mt-1 text-sm text-muted">None of the students on your roster are in an open grade for this competition.</p>
        ) : (
          <div className="mt-1">
            <StudentMultiSelect
              variant="panel"
              ariaLabel={draft.entryType === "team" ? "Team members" : "Students"}
              students={eligible.map((student) => {
                const reserved = reservedStudentIds.includes(student.id);
                const checked = memberIds.includes(student.id);
                const full = draft.entryType === "team" && !checked && memberIds.length >= max;
                return {
                  id: student.id,
                  name: student.fullName,
                  grade: student.grade,
                  note: reserved ? "already on another team" : undefined,
                  disabled: reserved || full,
                };
              })}
              selectedIds={memberIds}
              onChange={(ids) => setMemberIds(draft.entryType === "team" ? ids.slice(0, max) : ids)}
            />
          </div>
        )}
        {draft.entryType === "team"
          ? (() => {
              const guidance = teamRosterGuidance({
                students: eligible.map((student) => ({ id: student.id, fullName: student.fullName })),
                takenIds: reservedStudentIds,
                selectedCount: memberIds.length,
                min,
                max,
                gradeLabel: competitionGradeLabel(competition.eligibility),
              });
              return guidance ? <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{guidance}</p> : null;
            })()
          : null}
      </div>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <button
        type="button"
        onClick={save}
        disabled={pending || !teamReady || !individualReady}
        className="cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
