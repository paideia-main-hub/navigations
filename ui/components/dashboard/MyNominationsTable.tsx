"use client";

import Link from "next/link";
import type { AwardNomination } from "@/domain/award-nominations/types";
import { nominationStatusLabels } from "@/domain/award-nominations/types";
import { Badge } from "@/ui/components/Badge";
import { DataTable } from "@/ui/components/DataTable";

const statusTone: Record<string, "success" | "warning" | "accent" | "neutral"> = {
  approved: "success",
  published: "success",
  judged: "accent",
  submitted: "warning",
  needs_clarification: "warning",
  needs_third_review: "warning",
  rejected: "neutral",
  draft: "neutral",
};

export function MyNominationsTable({ nominations }: { nominations: AwardNomination[] }) {
  return (
    <DataTable
      rows={nominations}
      searchPlaceholder="Search by nominee or category…"
      searchFields={(n) => [n.nomineeName, n.categoryTitle, n.nominationNumber]}
      filters={[
        {
          label: "Status",
          options: Object.entries(nominationStatusLabels).map(([value, label]) => ({ value, label })),
          predicate: (n, value) => n.status === value,
        },
      ]}
      emptyMessage="No nominations submitted yet."
    >
      {(pageRows) => (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">Nomination #</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Nominee</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((n) => (
                <tr key={n.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{n.nominationNumber}</td>
                  <td className="px-4 py-3 text-muted">{n.categoryTitle}</td>
                  <td className="px-4 py-3 text-muted">{n.nomineeName}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[n.status] ?? "neutral"}>{nominationStatusLabels[n.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/nominations/${n.id}`} prefetch className="text-sm font-semibold text-accent">
                      Track →
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
