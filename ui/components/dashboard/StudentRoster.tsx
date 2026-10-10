"use client";

import { useState } from "react";
import type { StudentProfile } from "@/domain/students/types";
import { AddStudentForm } from "@/ui/components/dashboard/AddStudentForm";

export function StudentRoster({ students }: { students: StudentProfile[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = students.find((student) => student.id === editingId) ?? null;

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-accent-soft text-xs font-semibold tracking-wide text-accent-strong uppercase">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3">Guardian</th>
              <th className="px-4 py-3 text-right">Edit</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-border last:border-0 hover:bg-accent-soft/50">
                <td className="px-4 py-3.5 font-medium text-foreground">{student.fullName}</td>
                <td className="px-4 py-3.5 text-muted">{student.grade ?? "—"}</td>
                <td className="px-4 py-3.5 text-muted">{student.guardianName ?? "—"}</td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => setEditingId(student.id)}
                    className="cursor-pointer text-sm font-semibold text-accent-strong hover:text-accent"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing ? (
        <div className="mt-4">
          <AddStudentForm key={editing.id} student={editing} onClose={() => setEditingId(null)} />
        </div>
      ) : null}
      <div className="mt-4">
        <AddStudentForm />
      </div>
    </>
  );
}
