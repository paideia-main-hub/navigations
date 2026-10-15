"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { formatFee } from "@/domain/competitions/types";
import { submitCompetitionBasketAction } from "@/domain/registrations/actions";
import {
  studentEntryFee,
  studentEntryMemberCount,
} from "@/domain/registrations/studentEntries";
import type { PaymentAccount } from "@/domain/payments/types";
import { withFileUploadProgress, type UploadProgressState } from "@/ui/lib/fileUploadProgress";
import { CopyButton } from "@/ui/components/CopyButton";
import { PaymentInstructions } from "@/ui/components/PaymentInstructions";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { UploadProgress } from "@/ui/components/UploadProgress";
import { useStudentHamper } from "@/ui/components/registration/StudentHamperList";

export function StudentHamperPayment({ paymentAccount }: { paymentAccount: PaymentAccount }) {
  const { entries, clearEntries } = useStudentHamper();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptProgress, setReceiptProgress] = useState<number | null>(null);
  const [transfer, setTransfer] = useState<UploadProgressState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    frlId: string | null;
    lines: { competitionTitle: string; registrationNumber: string; fee: number }[];
    total: number;
  } | null>(null);
  const readerRef = useRef<FileReader | null>(null);

  const fees = entries.map(studentEntryFee);
  const total = fees.every((fee) => fee != null) ? fees.reduce<number>((sum, fee) => sum + (fee ?? 0), 0) : null;
  const people = entries.reduce((sum, entry) => sum + studentEntryMemberCount(entry), 0);

  function onReceiptChange(event: ChangeEvent<HTMLInputElement>) {
    readerRef.current?.abort();
    readerRef.current = null;
    setReceiptProgress(null);
    const file = event.target.files?.[0] ?? null;
    setReceiptFile(file);
    if (!file || file.size === 0) return;
    const reader = new FileReader();
    readerRef.current = reader;
    setReceiptProgress(0);
    reader.onprogress = (progressEvent) => {
      if (!progressEvent.lengthComputable || progressEvent.total === 0) return;
      setReceiptProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
    };
    reader.onload = () => setReceiptProgress(100);
    reader.onerror = () => setReceiptProgress(null);
    reader.readAsArrayBuffer(file);
  }

  async function submit() {
    if (!receiptFile || entries.length === 0 || total == null) return;
    setSubmitting(true);
    setError(null);

    const items = entries.map((entry) =>
      entry.entryType === "team"
        ? {
            competitionSlug: entry.competitionSlug,
            entryType: "team" as const,
            teamName: entry.teamName ?? undefined,
            teammateNames: entry.teammateNames,
          }
        : { competitionSlug: entry.competitionSlug, entryType: "individual" as const },
    );
    const consent = entries[0]?.consent;
    const grade = entries[0]?.grade ?? "";

    const formData = new FormData();
    formData.set("items", JSON.stringify(items));
    formData.set("grade", grade);
    formData.set("consent", JSON.stringify(consent));
    formData.set("receipt", receiptFile);

    const res = await withFileUploadProgress(setTransfer, () => submitCompetitionBasketAction(formData));
    setTransfer(null);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    clearEntries();
    setResult({ frlId: res.frlId, lines: res.lines, total: res.total });
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <div className="rounded-2xl border border-accent/40 bg-accent-soft p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight text-accent-foreground">You&apos;re registered</h2>
          {result.frlId ? (
            <p className="mt-2 text-sm text-accent-foreground">
              All under League ID <span className="font-semibold">{result.frlId}</span>.
            </p>
          ) : null}
          <ul className="mt-4 divide-y divide-accent/30 text-left">
            {result.lines.map((line) => (
              <li key={line.registrationNumber} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0 truncate text-sm font-semibold text-foreground">{line.competitionTitle}</span>
                <span className="flex shrink-0 items-center gap-1">
                  <span className="font-mono text-xs font-bold text-foreground sm:text-sm">{line.registrationNumber}</span>
                  <CopyButton text={line.registrationNumber} label={`${line.competitionTitle} registration number`} />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-accent/30 pt-4 text-sm font-medium leading-relaxed text-accent-foreground">
            Total paid {formatFee(result.total)}. Your receipt is under review — you&apos;ll see it approved on your
            dashboard once an admin has checked it.
          </p>
        </div>
        <Link
          href="/dashboard/competitions"
          className="inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white"
        >
          Go to My Competitions
        </Link>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">Hamper is empty</h2>
        <p className="mt-2 text-sm text-muted">Add competitions first, then come back here to pay once for all of them.</p>
        <Link href="/dashboard/register" className="mt-4 inline-block text-sm font-semibold text-accent-strong">
          ← Back to competitions
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Register - Checkout</h2>
        <Link href="/dashboard/register" className="shrink-0 text-sm font-semibold text-accent-strong">
          ← Back to competitions
        </Link>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => {
          const fee = studentEntryFee(entry);
          const members = studentEntryMemberCount(entry);
          return (
            <article key={entry.competitionSlug} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-extrabold tracking-tight text-foreground">{entry.competitionTitle}</h3>
                  {entry.entryType === "team" && entry.teamName ? (
                    <p className="mt-1 text-xs font-semibold tracking-wide text-muted uppercase">{entry.teamName}</p>
                  ) : null}
                  <p className="mt-2 text-sm text-muted">
                    {members} {members === 1 ? "entrant" : "entrants"}
                    {entry.feeAmount != null ? ` · ${formatFee(entry.feeAmount)} each` : ""}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-foreground">{fee != null ? formatFee(fee) : "—"}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-accent/35 bg-accent-soft px-4 py-3">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-accent-strong uppercase">Total due</p>
          <p className="mt-0.5 text-xs text-muted">
            {entries.length} competition{entries.length === 1 ? "" : "s"} · {people} paid place
            {people === 1 ? "" : "s"}
          </p>
        </div>
        <p className="text-xl font-extrabold text-foreground">{total != null ? formatFee(total) : "—"}</p>
      </div>

      <PaymentInstructions account={paymentAccount} />

      <label className="block">
        <span className="text-sm font-medium text-foreground">
          Payment receipt
          <RequiredMark />
        </span>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={onReceiptChange}
          className="mt-1 block w-full text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent-strong"
        />
      </label>
      {receiptProgress != null ? <p className="text-xs text-muted">File ready ({receiptProgress}%)</p> : null}
      {transfer ? <UploadProgress phase={transfer.phase} percent={transfer.percent} /> : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <button
        type="button"
        onClick={submit}
        disabled={submitting || !receiptFile || total == null}
        className="w-full cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Submitting…"
          : `Submit ${entries.length} registration${entries.length === 1 ? "" : "s"} · ${total != null ? formatFee(total) : ""}`}
      </button>
    </div>
  );
}
