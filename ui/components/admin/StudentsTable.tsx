"use client";

import type { StudentProfile } from "@/domain/students/types";
import { DataTable } from "@/ui/components/DataTable";

export function StudentsTable({ students }: { students: StudentProfile[] }) {
  const schoolOptions = Array.from(new Set(students.map((s) => s.schoolName ?? "Independent"))).sort();

  return (
    <DataTable
      rows={students}
      searchPlaceholder="Search by name, school or guardian…"
      searchFields={(s) => [s.fullName, s.schoolName, s.guardianName]}
      filters={[
        {
          label: "School",
          options: schoolOptions.map((s) => ({ value: s, label: s })),
          predicate: (s, value) => (s.schoolName ?? "Independent") === value,
        },
      ]}
      emptyMessage="No students registered yet."
    >
      {(pageRows) => (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">School</th>
                <th className="px-4 py-3 font-medium">Grade</th>
                <th className="px-4 py-3 font-medium">Guardian</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{s.fullName}</td>
                  <td className="px-4 py-3 text-muted">{s.schoolName ?? "Independent"}</td>
                  <td className="px-4 py-3 text-muted">{s.grade ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{s.guardianName ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DataTable>
  );
}
