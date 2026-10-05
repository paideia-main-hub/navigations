"use client";

import Link from "next/link";
import type { CompetitionSummary } from "@/domain/competitions/types";
import { statusLabels } from "@/domain/competitions/types";
import { CompetitionStatusControl } from "@/ui/components/admin/CompetitionStatusControl";
import { DataTable } from "@/ui/components/DataTable";

export function CompetitionsTable({ competitions }: { competitions: CompetitionSummary[] }) {
  return (
    <DataTable
      rows={competitions}
      searchPlaceholder="Search by title or slug…"
      searchFields={(c) => [c.title, c.slug]}
      filters={[
        {
          label: "Status",
          options: Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
          predicate: (c, value) => c.status === value,
        },
      ]}
      emptyMessage="No competitions yet. Create the first one to get started."
    >
      {(pageRows) => (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Entry types</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="text-xs text-muted">/{c.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {c.supportsIndividual && c.supportsTeam ? "Individual & Team" : c.supportsIndividual ? "Individual" : "Team"}
                  </td>
                  <td className="px-4 py-3">
                    <CompetitionStatusControl competitionId={c.id} status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={`/admin/competitions/${c.id}`} className="text-sm font-semibold text-accent">
                      Edit →
                    </Link>
                    <Link
                      href={`/admin/competitions/${c.id}#delete`}
                      className="ml-4 text-sm font-semibold text-red-600 hover:underline dark:text-red-400"
                    >
                      Delete
                    </Link>
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
