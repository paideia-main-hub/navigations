"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  createSchoolWideTeamAction,
  updateSchoolTeamAction,
} from "@/domain/teams/actions";
import type { Team } from "@/domain/teams/types";
import type { StudentProfile } from "@/domain/students/types";
import { AnimatedModal, ModalCloseButton, useAnimatedModalClose } from "@/ui/components/AnimatedModal";
import { AddStudentForm } from "@/ui/components/dashboard/AddStudentForm";
import { StudentMultiSelect } from "@/ui/components/registration/StudentMultiSelect";
import { RequiredMark } from "@/ui/components/RequiredMark";

const MIN_MEMBERS = 2;

type Mode = { kind: "create" } | { kind: "edit"; team: Team };

export function SchoolTeamEditor({
  roster: initialRoster,
  mode,
  trigger,
  triggerClassName,
  triggerDisabled,
  triggerDisabledReason,
}: {
  roster: StudentProfile[];
  mode: Mode;
  trigger: ReactNode;
  triggerClassName?: string;
  triggerDisabled?: boolean;
  triggerDisabledReason?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [roster, setRoster] = useState(initialRoster);
  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const titleId = useId();
  const closeModal = useRef<() => void>(() => {});

  useEffect(() => {
    setRoster(initialRoster);
  }, [initialRoster]);

  const isEdit = mode.kind === "edit";
  const canSubmit = Boolean(name.trim()) && memberIds.length >= MIN_MEMBERS;

  function openEditor() {
    if (triggerDisabled) return;
    if (isEdit) {
      setName(mode.team.name);
      setMemberIds(mode.team.members.map((member) => member.studentId));
    } else {
      setName("");
      setMemberIds([]);
    }
    setError(null);
    setPending(false);
    setOpen(true);
  }

  function dismiss() {
    setOpen(false);
    setError(null);
    setPending(false);
  }

  function addStudent(student: StudentProfile) {
    setRoster((current) => (current.some((row) => row.id === student.id) ? current : [...current, student]));
    setMemberIds((current) => (current.includes(student.id) ? current : [...current, student.id]));
  }

  async function save() {
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    const result = isEdit
      ? await updateSchoolTeamAction({
          teamId: mode.team.id,
          name,
          memberStudentIds: memberIds,
        })
      : await createSchoolWideTeamAction({ name, memberStudentIds: memberIds });
    setPending(false);
    if (result.error || !result.team) {
      setError(result.error ?? (isEdit ? "Could not update the team." : "Could not create the team."));
      return;
    }
    closeModal.current();
    router.refresh();
  }

  return (
    <>
      {triggerDisabled && triggerDisabledReason ? (
        <p className="max-w-xs text-right text-sm text-muted">{triggerDisabledReason}</p>
      ) : (
        <button type="button" onClick={openEditor} disabled={triggerDisabled} className={triggerClassName}>
          {trigger}
        </button>
      )}
      {open
        ? createPortal(
            <AnimatedModal
              onClose={dismiss}
              labelledBy={titleId}
              panelClassName="flex max-h-[min(92vh,720px)] max-w-2xl flex-col overflow-hidden"
            >
              <div className="flex shrink-0 items-start justify-between gap-3 bg-brand-deep px-5 py-5 sm:px-6">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-black tracking-[0.16em] text-accent uppercase">Teams</p>
                  <h3 id={titleId} className="mt-1 text-xl font-extrabold tracking-tight text-brand-deep-foreground sm:text-2xl">
                    {isEdit ? "Edit team" : "Add team"}
                  </h3>
                  <p className="mt-1 text-sm text-brand-deep-muted">
                    {isEdit
                      ? "Update the team name and members."
                      : "Provide the team details. You can enter this team in competitions later."}
                  </p>
                </div>
                <ModalCloseButton className="bg-white/10 text-brand-deep-foreground hover:bg-white/20 hover:text-brand-deep-foreground" />
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 sm:px-6">
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
                      Team members (at least {MIN_MEMBERS})
                      <RequiredMark />
                    </label>
                    <AddStudentForm
                      onAdded={addStudent}
                      triggerLabel="Add student"
                      triggerClassName="cursor-pointer text-sm font-semibold text-accent hover:underline"
                    />
                  </div>
                  {roster.length === 0 ? (
                    <p className="mt-1 text-sm text-muted">No students yet. Add a student first.</p>
                  ) : (
                    <div className="mt-1">
                      <StudentMultiSelect
                        variant="panel"
                        ariaLabel="Team members"
                        students={roster.map((student) => ({
                          id: student.id,
                          name: student.fullName,
                          grade: student.grade,
                        }))}
                        selectedIds={memberIds}
                        onChange={setMemberIds}
                      />
                    </div>
                  )}
                  <p className="mt-2 text-sm text-muted">
                    {memberIds.length} selected
                    {memberIds.length < MIN_MEMBERS ? ` · select at least ${MIN_MEMBERS}` : ""}
                  </p>
                </div>
                {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
              </div>

              <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4">
                <ModalCancel closeModal={closeModal} />
                <button
                  type="button"
                  onClick={save}
                  disabled={pending || !canSubmit}
                  className="cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? (isEdit ? "Saving…" : "Adding…") : isEdit ? "Save team" : "Add team"}
                </button>
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
      className="cursor-pointer rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong"
    >
      Cancel
    </button>
  );
}
