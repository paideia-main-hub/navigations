"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StudentProfile } from "@/domain/students/types";
import { AddStudentForm } from "@/ui/components/dashboard/AddStudentForm";
import { BulkAddStudentsButton } from "@/ui/components/registration/BulkAddStudentsButton";

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function StudentRoster({ students }: { students: StudentProfile[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = students.find((student) => student.id === editingId) ?? null;

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Students</h2>
        <BulkAddStudentsButton
          label="Add students"
          buttonClassName="shrink-0 cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white"
          onAdded={() => router.refresh()}
        />
      </div>
      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center text-sm text-muted">
          No students added yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {students.map((student) => (
            <article
              key={student.id}
              className="rounded-2xl border border-border bg-surface p-4 shadow-[0_18px_40px_-36px_rgba(31,32,65,0.55)] sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="min-w-0 truncate text-base font-extrabold tracking-tight text-foreground">{student.fullName}</h3>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-strong">
                    {student.grade ? `Grade ${student.grade}` : "No grade"}
                  </span>
                  <button
                    type="button"
                    aria-label={`Edit ${student.fullName}`}
                    onClick={() => setEditingId(student.id)}
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent"
                  >
                    <EditIcon />
                  </button>
                </div>
              </div>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                <li className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-3 py-2.5">
                  <span className="text-sm font-medium text-foreground">Guardian</span>
                  <span className="min-w-0 truncate text-xs text-muted">{student.guardianName ?? "—"}</span>
                </li>
                <li className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-3 py-2.5">
                  <span className="text-sm font-medium text-foreground">Contact</span>
                  <span className="min-w-0 truncate text-xs text-muted">{student.guardianMobile ?? student.guardianEmail ?? "—"}</span>
                </li>
              </ul>
            </article>
          ))}
        </div>
      )}
      {editing ? <AddStudentForm key={editing.id} student={editing} onClose={() => setEditingId(null)} /> : null}
    </>
  );
}
