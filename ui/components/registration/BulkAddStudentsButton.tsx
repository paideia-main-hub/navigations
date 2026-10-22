"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { addStudentAction } from "@/domain/students/actions";
import type { StudentProfile } from "@/domain/students/types";
import { AnimatedModal, ModalCloseButton, useAnimatedModalClose } from "@/ui/components/AnimatedModal";
import { DateField } from "@/ui/components/DateField";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { SelectField } from "@/ui/components/SelectField";

const today = new Date().toISOString().slice(0, 10);

type Row = {
  key: string;
  fullName: string;
  fatherName: string;
  dateOfBirth: string;
  grade: string;
  gender: "" | "male" | "female";
};

function emptyRow(): Row {
  return { key: crypto.randomUUID(), fullName: "", fatherName: "", dateOfBirth: "", grade: "", gender: "" };
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";

export function BulkAddStudentsButton({
  onAdded,
  label = "Add students",
  buttonClassName = "cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white",
  openOnMount = false,
}: {
  onAdded: (students: StudentProfile[]) => void;
  label?: string;
  buttonClassName?: string;
  /** Open immediately (e.g. empty-roster primary path). */
  openOnMount?: boolean;
}) {
  const [open, setOpen] = useState(openOnMount);
  const [rows, setRows] = useState<Row[]>(() => [emptyRow(), emptyRow(), emptyRow()]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const titleId = useId();
  const closeModal = useRef<() => void>(() => {});
  const onAddedRef = useRef(onAdded);
  onAddedRef.current = onAdded;

  function dismiss() {
    setOpen(false);
    setRows([emptyRow(), emptyRow(), emptyRow()]);
    setError(null);
    setPending(false);
    setSavedCount(0);
  }

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  async function saveAll() {
    const complete = rows.filter((row) => row.fullName.trim().length >= 2);
    if (complete.length === 0) {
      setError("Enter at least one student name to save.");
      return;
    }

    setPending(true);
    setError(null);
    setSavedCount(0);
    const created: StudentProfile[] = [];

    for (const row of complete) {
      const formData = new FormData();
      formData.set("full_name", row.fullName.trim());
      formData.set("grade", row.grade.trim());
      formData.set("date_of_birth", row.dateOfBirth);
      formData.set("gender", row.gender);
      const father = row.fatherName.trim();
      if (father) {
        formData.set("guardian_name", father);
        formData.set("guardian_relationship", "Father");
      }
      const result = await addStudentAction({ error: null }, formData);
      if (result.error || !result.student) {
        setPending(false);
        setError(
          created.length > 0
            ? `Saved ${created.length}, then stopped: ${result.error ?? "Could not add student."}`
            : (result.error ?? "Could not add students."),
        );
        if (created.length > 0) onAddedRef.current(created);
        return;
      }
      created.push(result.student);
      setSavedCount(created.length);
    }

    setPending(false);
    onAddedRef.current(created);
    closeModal.current();
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClassName}>
        {label}
      </button>
      {open
        ? createPortal(
            <AnimatedModal
              onClose={dismiss}
              labelledBy={titleId}
              panelClassName="flex max-h-[min(92vh,900px)] max-w-5xl flex-col overflow-hidden"
            >
              <div className="flex shrink-0 items-start justify-between gap-3 bg-brand-deep px-5 py-5 sm:px-6">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-black tracking-[0.16em] text-accent uppercase">Register</p>
                  <h3 id={titleId} className="mt-1 text-xl font-extrabold tracking-tight text-brand-deep-foreground sm:text-2xl">
                    Add students
                  </h3>
                  <p className="mt-1 text-sm text-brand-deep-muted">
                    Add several students at once. Name is required for each row you want to save.
                  </p>
                </div>
                <ModalCloseButton className="bg-white/10 text-brand-deep-foreground hover:bg-white/20 hover:text-brand-deep-foreground" />
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 sm:px-6">
                <div className="hidden gap-2 text-[11px] font-semibold tracking-wide text-muted uppercase lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_9.5rem_4.5rem_6.5rem_2rem]">
                  <span>
                    Name
                    <RequiredMark />
                  </span>
                  <span>Father&apos;s name</span>
                  <span>Date of birth</span>
                  <span>Grade</span>
                  <span>Gender</span>
                  <span className="sr-only">Remove</span>
                </div>

                {rows.map((row, index) => (
                  <div
                    key={row.key}
                    className="grid gap-2 rounded-xl border border-border bg-surface-muted/40 p-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_9.5rem_4.5rem_6.5rem_2rem] lg:items-center lg:border-0 lg:bg-transparent lg:p-0"
                  >
                    <label className="block lg:contents">
                      <span className="mb-1 block text-xs font-medium text-muted lg:hidden">
                        Student {index + 1}
                        <RequiredMark />
                      </span>
                      <input
                        value={row.fullName}
                        onChange={(e) => updateRow(row.key, { fullName: e.target.value })}
                        placeholder="Name"
                        className={inputClass}
                        aria-label={`Name for row ${index + 1}`}
                      />
                    </label>
                    <input
                      value={row.fatherName}
                      onChange={(e) => updateRow(row.key, { fatherName: e.target.value })}
                      placeholder="Father's name"
                      className={inputClass}
                      aria-label={`Father's name for row ${index + 1}`}
                    />
                    <DateField
                      name={`dob_${row.key}`}
                      label={`Date of birth for row ${index + 1}`}
                      value={row.dateOfBirth}
                      max={today}
                      onChange={(value) => updateRow(row.key, { dateOfBirth: value })}
                      className="w-full"
                    />
                    <input
                      value={row.grade}
                      onChange={(e) => updateRow(row.key, { grade: e.target.value })}
                      placeholder="e.g. 9"
                      inputMode="numeric"
                      className={inputClass}
                      aria-label={`Grade for row ${index + 1}`}
                    />
                    <SelectField
                      name={`gender_${row.key}`}
                      label={`Gender for row ${index + 1}`}
                      placeholder="—"
                      className="w-full"
                      value={row.gender}
                      onValueChange={(value) =>
                        updateRow(row.key, { gender: value === "male" || value === "female" ? value : "" })
                      }
                      options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                      ]}
                    />
                    <button
                      type="button"
                      aria-label={`Remove row ${index + 1}`}
                      disabled={rows.length <= 1}
                      onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-600 disabled:opacity-40"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setRows((current) => [...current, emptyRow()])}
                  className="cursor-pointer text-sm font-semibold text-accent hover:underline"
                >
                  + Add another row
                </button>

                {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
                {pending && savedCount > 0 ? (
                  <p className="text-sm text-muted">Saving… {savedCount} added so far</p>
                ) : null}
              </div>

              <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4 sm:px-6">
                <ModalCancel closeModal={closeModal} />
                <button
                  type="button"
                  onClick={saveAll}
                  disabled={pending}
                  className="cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Saving…" : "Save all"}
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
