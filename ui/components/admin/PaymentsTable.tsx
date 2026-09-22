"use client";

import { useState } from "react";
import type { RegistrationPayment } from "@/domain/payments/types";
import { paymentStatusLabels } from "@/domain/payments/types";
import { approvePaymentAction, getReceiptViewUrlAction, rejectPaymentAction } from "@/domain/payments/actions";
import { Badge } from "@/ui/components/Badge";
import { DataTable } from "@/ui/components/DataTable";

const statusTone: Record<string, "success" | "warning" | "neutral"> = {
  approved: "success",
  pending_review: "warning",
  rejected: "neutral",
};

function ReceiptLink({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);
    const { url, error: err } = await getReceiptViewUrlAction(path);
    setLoading(false);
    if (err || !url) {
      setError(err ?? "Could not open the receipt.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <button type="button" onClick={open} disabled={loading} className="text-sm font-semibold text-accent-strong hover:underline disabled:opacity-50">
        {loading ? "Opening…" : "View receipt"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function ReviewActions({ payment }: { payment: RegistrationPayment }) {
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(payment.status !== "pending_review");

  async function approve() {
    setPending("approve");
    setError(null);
    const { error: err } = await approvePaymentAction(payment.id);
    setPending(null);
    if (err) setError(err);
    else setDone(true);
  }

  async function reject() {
    const note = window.prompt("Optional note for the coordinator/student on why this receipt was rejected:") ?? null;
    setPending("reject");
    setError(null);
    const { error: err } = await rejectPaymentAction(payment.id, note);
    setPending(null);
    if (err) setError(err);
    else setDone(true);
  }

  if (done) return <span className="text-xs text-muted">Reviewed</span>;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={approve}
          disabled={pending !== null}
          className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-400"
        >
          {pending === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={reject}
          disabled={pending !== null}
          className="rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 disabled:opacity-50 dark:text-red-400"
        >
          {pending === "reject" ? "Rejecting…" : "Reject"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function PaymentsTable({ payments }: { payments: RegistrationPayment[] }) {
  return (
    <DataTable
      rows={payments}
      searchPlaceholder="Search by competition, name or school…"
      searchFields={(p) => [p.competitionTitle, p.submittedByName, p.schoolName]}
      filters={[
        {
          label: "Status",
          options: Object.entries(paymentStatusLabels).map(([value, label]) => ({ value, label })),
          predicate: (p, value) => p.status === value,
        },
      ]}
      emptyMessage="No fee receipts submitted yet."
    >
      {(pageRows) => (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">Competition</th>
                <th className="px-4 py-3 font-medium">Submitted by</th>
                <th className="px-4 py-3 font-medium">Entries</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Receipt</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Review</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{p.competitionTitle}</td>
                  <td className="px-4 py-3 text-muted">
                    {p.submittedByName}
                    {p.schoolName && <span className="block text-xs">{p.schoolName}</span>}
                  </td>
                  <td className="px-4 py-3 text-muted">{p.entryCount}</td>
                  <td className="px-4 py-3 text-muted">{p.amountExpected ?? "—"}</td>
                  <td className="px-4 py-3">
                    <ReceiptLink path={p.receiptPath} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[p.status] ?? "neutral"}>{paymentStatusLabels[p.status]}</Badge>
                    {p.reviewNote && <p className="mt-1 max-w-[16rem] text-xs text-muted">{p.reviewNote}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <ReviewActions payment={p} />
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
