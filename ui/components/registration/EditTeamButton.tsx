"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { CompetitionSummary } from "@/domain/competitions/types";
import { competitionGradeLabel, competitionTeamSize, teamRosterGuidance } from "@/domain/competitions/types";
import { isGradeEligible } from "@/domain/competitions/service";
import { updateSchoolTeamAction } from "@/domain/teams/actions";
import { DUPLICATE_TEAM_NAME, teamNameTaken, type Team } from "@/domain/teams/types";
import type { StudentProfile } from "@/domain/students/types";
import { AnimatedModal, ModalCloseButton, useAnimatedModalClose } from "@/ui/components/AnimatedModal";
import { AddStudentForm } from "@/ui/components/dashboard/AddStudentForm";
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

export function EditTeamButton({
  teams,
  roster,
  eligibility,
  listedMembers,
  selectedTeamIds,
  team,
  nameTeams,
  competitionId,
  competitionSlug,
  label = "Edit team",
  ariaLabel,
  buttonClassName = "cursor-pointer rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:border-accent disabled:cursor-not-allowed disabled:opacity-50",
  onStudentAdded,
  onSaved,
}: {
  teams: Team[];
  roster: StudentProfile[];
  eligibility: CompetitionSummary["eligibility"];
  listedMembers: { studentId: string; teamId?: string }[];
  selectedTeamIds: string[];
  /** When set, this button edits that team only. */
  team?: Team;
  /** Teams already set for this competition. Defaults to `teams`. */
  nameTeams?: { id: string; name: string }[];
  competitionId?: string;
  competitionSlug?: string;
  label?: ReactNode;
  ariaLabel?: string;
  buttonClassName?: string;
  onStudentAdded?: (student: StudentProfile) => void;
  onSaved: (team: Team) => void;
}) {
  const [open, setOpen] = useState(false);
  const [teamId, setTeamId] = useState("");
  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const titleId = useId();
  const closeModal = useRef<() => void>(() => {});
  const onSavedRef = useRef(onSaved);
  const onStudentAddedRef = useRef(onStudentAdded);
  onSavedRef.current = onSaved;
  onStudentAddedRef.current = onStudentAdded;

  function addStudent(student: StudentProfile) {
    onStudentAddedRef.current?.(student);
    const rule = ruleForGrade(eligibility, student.grade);
    const { max } = competitionTeamSize(eligibility);
    if (!rule || takenStudentIds.has(student.id)) return;
    setMemberIds((current) => (current.includes(student.id) || current.length >= max ? current : [...current, student.id]));
  }

  const takenStudentIds = useMemo(() => {
    const taken = new Set<string>();
    for (const team of teams) {
      if (team.id === teamId) continue;
      const chosen = selectedTeamIds.includes(team.id) || listedMembers.some((member) => member.teamId === team.id);
      if (!chosen) continue;
      for (const member of team.members) taken.add(member.studentId);
    }
    for (const member of listedMembers) {
      if (member.teamId && member.teamId === teamId) continue;
      taken.add(member.studentId);
    }
    return taken;
  }, [teams, teamId, selectedTeamIds, listedMembers]);

  function loadTeam(team: Team) {
    setTeamId(team.id);
    setName(team.name);
    setMemberIds(team.members.map((member) => member.studentId));
    setError(null);
  }

  function openEditor() {
    const target = team ?? teams[0];
    if (!target) return;
    loadTeam(target);
    setOpen(true);
  }

  function dismiss() {
    setOpen(false);
    setError(null);
    setPending(false);
  }

  const { min, max } = competitionTeamSize(eligibility);
  const gradeLabel = competitionGradeLabel(eligibility);
  const selectedRules = memberIds.map((id) => ruleForGrade(eligibility, roster.find((student) => student.id === id)?.grade));
  const eligibleSelection = selectedRules.length > 0 && selectedRules.every(Boolean);
  const sizeLabel = memberSpan(min, max);
  const guidance = teamRosterGuidance({
    students: roster.map((student) => ({ id: student.id, fullName: student.fullName })),
    takenIds: [...takenStudentIds],
    selectedCount: memberIds.length,
    min,
    max,
    gradeLabel,
  });

  async function save() {
    if (!teamId || !name.trim() || !eligibleSelection || memberIds.length < min || memberIds.length > max) return;
    if (memberIds.some((id) => takenStudentIds.has(id))) {
      setError("A student already on a team for this competition cannot join another.");
      return;
    }
    const currentName = teams.find((item) => item.id === teamId)?.name ?? "";
    if (currentName.trim().toLowerCase() !== name.trim().toLowerCase() && teamNameTaken(name, nameTeams ?? teams, teamId)) {
      setError(DUPLICATE_TEAM_NAME);
      return;
    }
    setPending(true);
    setError(null);
    const result = await updateSchoolTeamAction({
      teamId,
      name,
      memberStudentIds: memberIds,
      competitionId,
      competitionSlug,
    });
    setPending(false);
    if (result.error || !result.team) {
      setError(result.error ?? "Could not update the team.");
      return;
    }
    onSavedRef.current(result.team);
    closeModal.current();
  }

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        disabled={!team && teams.length === 0}
        aria-label={ariaLabel ?? (typeof label === "string" ? label : "Edit team")}
        className={buttonClassName}
      >
        {label}
      </button>
      {open
        ? createPortal(
            <AnimatedModal onClose={dismiss} labelledBy={titleId} panelClassName="max-h-[min(92vh,860px)] max-w-2xl">
              <div className="max-h-[min(92vh,860px)] space-y-3 overflow-y-auto p-5 text-left">
                <div className="flex items-start justify-between gap-3">
                  <h3 id={titleId} className="text-lg font-extrabold tracking-tight text-foreground">
                    Edit team
                  </h3>
                  <ModalCloseButton />
                </div>
                {team ? null : (
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Team
                      <RequiredMark />
                    </label>
                    <div className="mt-1 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                      {teams.map((item) => (
                        <label key={item.id} className="flex items-center gap-2 text-sm text-foreground">
                          <input type="radio" name="edit-existing-team" checked={item.id === teamId} onChange={() => loadTeam(item)} />
                          {item.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Team name
                    <RequiredMark />
                  </label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-sm font-medium text-foreground">
                      Team members ({sizeLabel})
                      <RequiredMark />
                    </label>
                    {onStudentAdded ? (
                      <AddStudentForm
                        onAdded={addStudent}
                        triggerLabel="Add student"
                        triggerClassName="cursor-pointer text-sm font-semibold text-accent hover:underline"
                      />
                    ) : null}
                  </div>
                  <div className="mt-1">
                    <StudentMultiSelect
                      ariaLabel="Team members"
                      students={roster.map((student) => {
                        const taken = takenStudentIds.has(student.id);
                        const checked = memberIds.includes(student.id);
                        return {
                          id: student.id,
                          name: student.fullName,
                          grade: student.grade,
                          note: taken ? "already on another team" : undefined,
                          disabled: taken || (!checked && memberIds.length >= max),
                        };
                      })}
                      selectedIds={memberIds}
                      onChange={(ids) => setMemberIds(ids.slice(0, max))}
                    />
                  </div>
                  {guidance ? <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{guidance}</p> : null}
                </div>
                {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
                <div className="flex gap-3">
                  <ModalCancel closeModal={closeModal} />
                  <button
                    type="button"
                    onClick={save}
                    disabled={pending || !name.trim() || !eligibleSelection || memberIds.length < min || memberIds.length > max}
                    className="cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending ? "Saving…" : "Save team"}
                  </button>
                </div>
              </div>
            </AnimatedModal>,
            document.body,
          )
        : null}
    </>
  );
}

function ModalCancel({ closeModal }: { closeModal: { current: () => void } }) {
  const requestClose = useAnimatedModalClose();

  useEffect(() => {
    closeModal.current = requestClose;
  }, [closeModal, requestClose]);

  return (
    <button
      type="button"
      onClick={() => closeModal.current()}
      className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground"
    >
      Cancel
    </button>
  );
}
