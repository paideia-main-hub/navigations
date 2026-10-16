"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CompetitionSummary } from "@/domain/competitions/types";
import { competitionGradeLabel, competitionTeamSize, teamRosterGuidance } from "@/domain/competitions/types";
import { isGradeEligible } from "@/domain/competitions/service";
import { createSchoolTeamAction } from "@/domain/teams/actions";
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

export function AddTeamButton({
  roster,
  eligibility,
  teams = [],
  takenStudentIds = [],
  competitionId,
  competitionSlug,
  onStudentAdded,
  onAdded,
  label = "+ Add team",
  buttonClassName = "cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white",
}: {
  roster: StudentProfile[];
  eligibility: CompetitionSummary["eligibility"];
  /** Teams already set for this competition. The same name is allowed for a different competition. */
  teams?: { id: string; name: string }[];
  /** Students already on a team for this competition. */
  takenStudentIds?: string[];
  competitionId: string;
  competitionSlug: string;
  onStudentAdded: (student: StudentProfile) => void;
  onAdded: (team: Team) => void;
  label?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const titleId = useId();
  const closeModal = useRef<() => void>(() => {});
  const onAddedRef = useRef(onAdded);
  const onStudentAddedRef = useRef(onStudentAdded);
  onAddedRef.current = onAdded;
  onStudentAddedRef.current = onStudentAdded;

  function addStudent(student: StudentProfile) {
    onStudentAddedRef.current(student);
    const rule = ruleForGrade(eligibility, student.grade);
    const { max } = competitionTeamSize(eligibility);
    if (!rule || takenStudentIds.includes(student.id)) return;
    setMemberIds((current) => {
      if (current.includes(student.id) || current.length >= max) return current;
      return [...current, student.id];
    });
  }

  const { min, max } = competitionTeamSize(eligibility);
  const gradeLabel = competitionGradeLabel(eligibility);
  const selectedRules = memberIds.map((id) => ruleForGrade(eligibility, roster.find((student) => student.id === id)?.grade));
  const eligibleSelection = selectedRules.length > 0 && selectedRules.every(Boolean);
  const sizeLabel = memberSpan(min, max);
  const guidance = teamRosterGuidance({
    students: roster.map((student) => ({ id: student.id, fullName: student.fullName })),
    takenIds: takenStudentIds,
    selectedCount: memberIds.length,
    min,
    max,
    gradeLabel,
  });

  function dismiss() {
    setOpen(false);
    setName("");
    setMemberIds([]);
    setError(null);
    setPending(false);
  }

  async function save() {
    if (!name.trim() || !eligibleSelection || memberIds.length < min || memberIds.length > max) return;
    if (memberIds.some((id) => takenStudentIds.includes(id))) {
      setError("A student already on a team for this competition cannot join another.");
      return;
    }
    if (teamNameTaken(name, teams)) {
      setError(DUPLICATE_TEAM_NAME);
      return;
    }
    setPending(true);
    setError(null);
    const result = await createSchoolTeamAction({
      name,
      memberStudentIds: memberIds,
      competitionId,
      competitionSlug,
    });
    setPending(false);
    if (result.error || !result.team) {
      setError(result.error ?? "Could not create the team.");
      return;
    }
    onAddedRef.current(result.team);
    closeModal.current();
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClassName}>
        {label}
      </button>
      {open
        ? createPortal(
            <AnimatedModal onClose={dismiss} labelledBy={titleId} panelClassName="max-w-2xl">
              <div className="text-left">
                <div className="flex items-start justify-between gap-3 px-5 pt-5">
                  <div className="min-w-0">
                    <h3 id={titleId} className="text-lg font-extrabold tracking-tight text-foreground">
                      Add team
                    </h3>
                    <p className="mt-1 text-sm text-muted">This competition is team-based. Provide the team details.</p>
                  </div>
                  <ModalCloseButton />
                </div>

                <div className="space-y-3 px-5 py-4">
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
                      <AddStudentForm
                        onAdded={addStudent}
                        triggerLabel="Add student"
                        triggerClassName="cursor-pointer text-sm font-semibold text-accent hover:underline"
                      />
                    </div>
                    {roster.length === 0 ? (
                      <p className="mt-1 text-sm text-muted">No students in an open grade yet. Add a student first.</p>
                    ) : (
                      <div className="mt-1">
                        <StudentMultiSelect
                          variant="panel"
                          ariaLabel="Team members"
                          students={roster.map((student) => {
                            const taken = takenStudentIds.includes(student.id);
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
                    )}
                    <p className="mt-2 text-sm text-muted">
                      {memberIds.length}
                      {sizeLabel ? ` of ${sizeLabel}` : ""} selected
                    </p>
                    {guidance ? <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{guidance}</p> : null}
                  </div>
                  {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
                </div>

                <div className="flex gap-3 border-t border-border px-5 py-4">
                  <ModalCancel closeModal={closeModal} />
                  <button
                    type="button"
                    onClick={save}
                    disabled={pending || !name.trim() || !eligibleSelection || memberIds.length < min || memberIds.length > max}
                    className="cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending ? "Adding…" : "Add team"}
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
