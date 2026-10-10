"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { PaymentStatus, RegistrationPayment } from "@/domain/payments/types";
import { paymentStatusLabels } from "@/domain/payments/types";
import { approvePaymentAction, getReceiptViewUrlAction, rejectPaymentAction } from "@/domain/payments/actions";
import { AnimatedModal, useAnimatedModalClose } from "@/ui/components/AnimatedModal";
import { Badge } from "@/ui/components/Badge";
import { DataTable } from "@/ui/components/DataTable";
import { RequiredMark } from "@/ui/components/RequiredMark";

const statusTone: Record<string, "success" | "warning" | "neutral"> = {
  approved: "success",
  pending_review: "warning",
  rejected: "neutral",
};

function competitionNames(title: string): string[] {
  const match = title.match(/^\d+ competitions: (.+)$/);
  if (!match?.[1]) return [title];
  return match[1].split(", ").filter(Boolean);
}

function CompetitionLabel({ title }: { title: string }) {
  const names = competitionNames(title);
  if (names.length < 2) return <>{title}</>;
  return (
    <ul className="space-y-1">
      {names.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}

function isPdfPath(path: string) {
  const file = path.split("?")[0]?.split("/").pop() ?? "";
  return file.toLowerCase().endsWith(".pdf");
}

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/** Path → the URL already shown in the modal. Reused so a later render does
 * not request a new link and make the picture load again. */
const shownReceipts = new Map<string, string>();

function printPdf(src: string) {
  const frame = document.createElement("iframe");
  frame.title = "Print receipt";
  frame.style.cssText = "position:fixed;width:0;height:0;border:0";
  frame.src = src;
  document.body.appendChild(frame);
  frame.onload = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    frame.contentWindow?.addEventListener("afterprint", () => frame.remove(), { once: true });
  };
}

function ReviewActions({
  payment,
  onReject,
  onApproved,
}: {
  payment: RegistrationPayment;
  onReject: () => void;
  onApproved: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setPending(true);
    setError(null);
    const { error: err } = await approvePaymentAction(payment.id);
    setPending(false);
    if (err) setError(err);
    else onApproved();
  }

  if (payment.status !== "pending_review") return <span className="text-xs text-muted">Reviewed</span>;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={approve}
          disabled={pending}
          className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-400"
        >
          {pending ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={pending}
          className="rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 disabled:opacity-50 dark:text-red-400"
        >
          Reject
        </button>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function ReceiptReviewModal({
  payment,
  showReason,
  onClose,
  onReviewed,
}: {
  payment: RegistrationPayment;
  showReason: boolean;
  onClose: () => void;
  onReviewed: (status: Extract<PaymentStatus, "approved" | "rejected">, reviewNote: string | null) => void;
}) {
  const titleId = useId();
  const pdf = isPdfPath(payment.receiptPath);

  return (
    <AnimatedModal onClose={onClose} labelledBy={titleId} panelClassName="max-h-[min(92vh,920px)] max-w-3xl">
      <ReceiptReviewBody payment={payment} showReason={showReason} pdf={pdf} titleId={titleId} onReviewed={onReviewed} />
    </AnimatedModal>
  );
}

function ReceiptReviewBody({
  payment,
  showReason,
  pdf,
  titleId,
  onReviewed,
}: {
  payment: RegistrationPayment;
  showReason: boolean;
  pdf: boolean;
  titleId: string;
  onReviewed: (status: Extract<PaymentStatus, "approved" | "rejected">, reviewNote: string | null) => void;
}) {
  const requestClose = useAnimatedModalClose();
  const [url, setUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(showReason);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState<"approve" | "reject" | "print" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const pendingReview = payment.status === "pending_review";

  useEffect(() => {
    if (showReason) setRejecting(true);
  }, [showReason]);

  useEffect(() => {
    const cached = shownReceipts.get(payment.receiptPath);
    if (cached) {
      setUrl(cached);
      return;
    }
    let cancelled = false;
    getReceiptViewUrlAction(payment.receiptPath).then(({ url: nextUrl, error }) => {
      if (cancelled) return;
      if (error || !nextUrl) setLoadError(error ?? "Could not open the receipt.");
      else {
        shownReceipts.set(payment.receiptPath, nextUrl);
        setUrl(nextUrl);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [payment.receiptPath]);

  async function approve() {
    setPending("approve");
    setActionError(null);
    const { error } = await approvePaymentAction(payment.id);
    setPending(null);
    if (error) {
      setActionError(error);
      return;
    }
    onReviewed("approved", null);
    requestClose();
  }

  async function reject() {
    const trimmed = reason.trim();
    if (!trimmed) {
      setActionError("Enter a reason for rejecting this receipt.");
      return;
    }
    setPending("reject");
    setActionError(null);
    const { error } = await rejectPaymentAction(payment.id, trimmed);
    setPending(null);
    if (error) {
      setActionError(error);
      return;
    }
    onReviewed("rejected", trimmed);
    requestClose();
  }

  function print() {
    if (!url) return;
    setActionError(null);
    if (pdf) {
      printPdf(url);
      return;
    }
    window.print();
  }

  return (
    <div className="flex max-h-[min(92vh,920px)] flex-col">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .receipt-print, .receipt-print * { visibility: visible !important; }
          .receipt-print {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            max-height: none !important;
            margin: 0 !important;
            object-fit: contain !important;
            background: white !important;
          }
        }
      `}</style>
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg font-extrabold tracking-tight text-foreground">
            <CompetitionLabel title={payment.competitionTitle} />
          </h2>
          <p className="mt-1 text-sm text-muted">
            {payment.submittedByName}
            {payment.schoolName ? ` · ${payment.schoolName}` : ""} · {payment.entryCount}{" "}
            {payment.entryCount === 1 ? "entry" : "entries"}
            {payment.amountExpected != null ? ` · ${payment.amountExpected}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg text-muted hover:bg-surface-muted hover:text-foreground"
        >
          ×
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-background px-5 py-4">
        {loadError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
        ) : !url ? (
          <p className="text-sm text-muted">Loading receipt…</p>
        ) : pdf ? (
          <iframe title="Fee receipt" src={url} className="receipt-print h-[min(62vh,640px)] w-full rounded-xl border border-border bg-surface" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed receipt URL
          <img src={url} alt="Fee receipt" className="receipt-print mx-auto max-h-[min(62vh,640px)] w-full rounded-xl border border-border bg-surface object-contain" />
        )}
        {!pendingReview && payment.reviewNote ? <p className="mt-3 text-sm text-muted">{payment.reviewNote}</p> : null}
      </div>

      <div className="border-t border-border px-5 py-4">
        {rejecting && pendingReview ? (
          <div className="mb-4">
            <label htmlFor={`${titleId}-reason`} className="text-sm font-medium text-foreground">
              Reason
              <RequiredMark />
            </label>
            <textarea
              id={`${titleId}-reason`}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setActionError(null);
              }}
              required
              rows={3}
              placeholder="Tell them why this receipt was rejected."
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>
        ) : null}
        {actionError ? <p className="mb-3 text-sm text-red-600 dark:text-red-400">{actionError}</p> : null}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={print}
            disabled={!url || pending !== null}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-accent disabled:opacity-50"
          >
            Print receipt
          </button>
          {pendingReview ? (
            <div className="ml-auto flex flex-wrap gap-2">
              {rejecting ? (
                <button
                  type="button"
                  onClick={() => {
                    setRejecting(false);
                    setActionError(null);
                  }}
                  disabled={pending !== null}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={approve}
                  disabled={pending !== null}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {pending === "approve" ? "Approving…" : "Approve"}
                </button>
              )}
              <button
                type="button"
                onClick={rejecting ? reject : () => setRejecting(true)}
                disabled={pending !== null || (rejecting && reason.trim().length === 0)}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {pending === "reject" ? "Rejecting…" : rejecting ? "Confirm rejection" : "Reject"}
              </button>
            </div>
          ) : (
            <Badge tone={statusTone[payment.status] ?? "neutral"}>{paymentStatusLabels[payment.status]}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function PaymentsTable({ payments }: { payments: RegistrationPayment[] }) {
  const router = useRouter();
  const [overrides, setOverrides] = useState<Record<string, { status: PaymentStatus; reviewNote: string | null }>>({});
  const [modal, setModal] = useState<{ id: string; showReason: boolean } | null>(null);
  const rows = payments.map((payment) => {
    const override = overrides[payment.id];
    return override ? { ...payment, status: override.status, reviewNote: override.reviewNote } : payment;
  });
  const active = modal ? (rows.find((payment) => payment.id === modal.id) ?? null) : null;

  function markReviewed(id: string, status: Extract<PaymentStatus, "approved" | "rejected">, reviewNote: string | null) {
    setOverrides((current) => ({ ...current, [id]: { status, reviewNote } }));
    router.refresh();
  }

  return (
    <>
      <DataTable
        rows={rows}
        searchPlaceholder="Search by competition, name or school…"
        searchFields={(payment) => [payment.competitionTitle, payment.submittedByName, payment.schoolName]}
        filters={[
          {
            label: "Status",
            options: Object.entries(paymentStatusLabels).map(([value, label]) => ({ value, label })),
            predicate: (payment, value) => payment.status === value,
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
                {pageRows.map((payment) => (
                  <tr key={payment.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <CompetitionLabel title={payment.competitionTitle} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {payment.submittedByName}
                      {payment.schoolName && <span className="block text-xs">{payment.schoolName}</span>}
                    </td>
                    <td className="px-4 py-3 text-muted">{payment.entryCount}</td>
                    <td className="px-4 py-3 text-muted">{payment.amountExpected ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setModal({ id: payment.id, showReason: false })}
                        className="text-sm font-semibold text-accent-strong hover:underline"
                      >
                        View receipt
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone[payment.status] ?? "neutral"}>{paymentStatusLabels[payment.status]}</Badge>
                      {payment.reviewNote && <p className="mt-1 max-w-[16rem] text-xs text-muted">{payment.reviewNote}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <ReviewActions
                        payment={payment}
                        onReject={() => setModal({ id: payment.id, showReason: true })}
                        onApproved={() => markReviewed(payment.id, "approved", null)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataTable>
      {active
        ? createPortal(
            <ReceiptReviewModal
              key={active.id}
              payment={active}
              showReason={modal?.showReason ?? false}
              onClose={() => setModal(null)}
              onReviewed={(status, reviewNote) => markReviewed(active.id, status, reviewNote)}
            />,
            document.body,
          )
        : null}
    </>
  );
}
