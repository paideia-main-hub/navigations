"use client";

import type { Team } from "@/domain/teams/types";
import { DataTable } from "@/ui/components/DataTable";

export function TeamsTable({ teams }: { teams: Team[] }) {
  const schoolOptions = Array.from(
    new Set(teams.map((t) => t.schoolName ?? "Independent")),
  ).sort();

  return (
    <DataTable
      rows={teams}
      searchPlaceholder="Search by team, school or member…"
      searchFields={(t) => [
        t.name,
        t.schoolName,
        ...t.members.map((m) => m.studentName),
      ]}
      filters={[
        {
          label: "School",
          options: schoolOptions.map((s) => ({ value: s, label: s })),
          predicate: (t, value) => (t.schoolName ?? "Independent") === value,
        },
      ]}
      emptyMessage="No teams created yet."
    >
      {(pageRows) => (
        <div className="space-y-3">
          {pageRows.map((t) => (
            <div key={t.id} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-medium text-foreground">{t.name}</p>
              <p className="text-xs text-muted">{t.schoolName ?? "Independent"}</p>
              <p className="mt-1 text-sm text-muted">
                {t.members.map((m) => m.studentName).join(", ") || "No members"}
              </p>
            </div>
          ))}
        </div>
      )}
    </DataTable>
  );
}
