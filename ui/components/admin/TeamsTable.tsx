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
      searchPlaceholder="Search by team, school, member or competition…"
      searchFields={(t) => [
        t.name,
        t.schoolName,
        ...t.members.map((m) => m.studentName),
        ...(t.competitionTitles ?? []),
      ]}
      filters={[
        {
          label: "School",
          options: schoolOptions.map((s) => ({ value: s, label: s })),
          predicate: (t, value) => (t.schoolName ?? "Independent") === value,
        },
      ]}
      dateField={(t) => t.createdAt}
      emptyMessage="No teams created yet."
    >
      {(pageRows) => (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium">School</th>
                <th className="px-4 py-3 font-medium">Members</th>
                <th className="px-4 py-3 font-medium">Competitions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                  <td className="px-4 py-3 text-muted">{t.schoolName ?? "Independent"}</td>
                  <td className="px-4 py-3 text-muted">
                    {t.members.length > 0 ? (
                      <ol className="list-decimal space-y-0.5 pl-4">
                        {t.members.map((m) => (
                          <li key={m.studentId}>{m.studentName}</li>
                        ))}
                      </ol>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {(t.competitionTitles ?? []).length > 0 ? (
                      <ol className="list-decimal space-y-0.5 pl-4">
                        {(t.competitionTitles ?? []).map((title) => (
                          <li key={title}>{title}</li>
                        ))}
                      </ol>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DataTable>
  );
}
