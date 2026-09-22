"use client";

import type { Registration } from "@/domain/registrations/types";
import { registrationStatusLabels } from "@/domain/registrations/types";
import { paymentStatusLabels } from "@/domain/payments/types";
import { Badge } from "@/ui/components/Badge";
import { DataTable } from "@/ui/components/DataTable";

const statusTone: Record<string, "success" | "warning" | "neutral"> = {
  approved: "success",
  qualified: "success",
  finalist: "success",
  completed: "success",
  pending: "warning",
  rejected: "neutral",
};

const paymentTone: Record<string, "success" | "warning" | "neutral"> = {
  approved: "success",
  pending_review: "warning",
  rejected: "neutral",
};

export function RegistrationsTable({
  registrations,
  competitions,
}: {
  registrations: Registration[];
  competitions: { slug: string; title: string }[];
}) {
  return (
    <DataTable
      rows={registrations}
      searchPlaceholder="Search by entrant, registration # or competition…"
      searchFields={(r) => [r.entrantName, r.registrationNumber, r.competitionTitle]}
      filters={[
        {
          label: "Competition",
          options: competitions.map((c) => ({ value: c.slug, label: c.title })),
          predicate: (r, value) => r.competitionSlug === value,
        },
        {
          label: "Status",
          options: Object.entries(registrationStatusLabels).map(([value, label]) => ({ value, label })),
          predicate: (r, value) => r.status === value,
        },
      ]}
      emptyMessage="No registrations yet."
    >
      {(pageRows) => (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">Competition</th>
                <th className="px-4 py-3 font-medium">Entry</th>
                <th className="px-4 py-3 font-medium">Registration #</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{r.competitionTitle}</td>
                  <td className="px-4 py-3 text-muted">
                    {r.entrantName} <span className="capitalize">({r.entryType})</span>
                  </td>
                  <td className="px-4 py-3 text-muted">{r.registrationNumber}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[r.status] ?? "neutral"}>{registrationStatusLabels[r.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {r.paymentStatus ? (
                      <Badge tone={paymentTone[r.paymentStatus] ?? "neutral"}>{paymentStatusLabels[r.paymentStatus]}</Badge>
                    ) : (
                      <span className="text-xs text-muted">—</span>
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
