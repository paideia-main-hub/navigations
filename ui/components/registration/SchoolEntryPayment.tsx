"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { formatFee } from "@/domain/competitions/types";
import { submitSchoolEntriesAction } from "@/domain/registrations/actions";
import { schoolEntryFee } from "@/domain/registrations/schoolEntries";
import type { PaymentAccount } from "@/domain/payments/types";
import { withFileUploadProgress, type UploadProgressState } from "@/ui/lib/fileUploadProgress";
import { CopyButton } from "@/ui/components/CopyButton";
import { PaymentInstructions } from "@/ui/components/PaymentInstructions";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { UploadProgress } from "@/ui/components/UploadProgress";
import { useSchoolEntryList } from "@/ui/components/registration/SchoolHamperList";

export function SchoolEntryPayment({ paymentAccount }: { paymentAccount: PaymentAccount }) {
  const { entries, clearEntries } = useSchoolEntryList();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptProgress, setReceiptProgress] = useState<number | null>(null);
  const [transfer, setTransfer] = useState<UploadProgressState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<{ registrationNumber: string; competitionTitle: string }[] | null>(null);
  const readerRef = useRef<FileReader | null>(null);

  const fees = entries.map(schoolEntryFee);
  const total = fees.every((fee) => fee != null) ? fees.reduce<number>((sum, fee) => sum + (fee ?? 0), 0) : null;

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
    if (!receiptFile || entries.length === 0) return;
    setSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.set("entries", JSON.stringify(entries));
    formData.set("receipt", receiptFile);
    const result = await withFileUploadProgress(setTransfer, () => submitSchoolEntriesAction(formData));
    setTransfer(null);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    clearEntries();
    setRegistrations(result.registrations);
  }

  if (registrations) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <div className="rounded-2xl border border-accent/40 bg-accent-soft p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight text-accent-foreground">Registrations submitted</h2>
          <ul className="mt-4 divide-y divide-accent/30 text-left">
            {registrations.map((registration) => (
              <li key={registration.registrationNumber} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0 truncate text-sm font-semibold text-foreground">{registration.competitionTitle}</span>
                <span className="flex shrink-0 items-center gap-1">
                  <span className="font-mono text-xs font-bold text-foreground sm:text-sm">{registration.registrationNumber}</span>
                  <CopyButton text={registration.registrationNumber} label={`${registration.competitionTitle} registration number`} />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-accent/30 pt-4 text-sm font-medium leading-relaxed text-accent-foreground">
            Your receipt has been submitted and is now under review. You&apos;ll see it marked approved on your dashboard once an admin has checked it.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Go to dashboard
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
          const fee = schoolEntryFee(entry);
          return (
            <article key={entry.id ?? entry.competitionSlug} className="rounded-2xl border border-border bg-surface p-4">
              <h3 className="font-extrabold tracking-tight text-foreground">{entry.competitionTitle}</h3>
              {entry.entryType === "team" && entry.teamName ? (
                <p className="mt-1 text-xs font-semibold tracking-wide text-muted uppercase">{entry.teamName}</p>
              ) : null}
              <ul className="mt-3 divide-y divide-border text-sm">
                {entry.students.map((student) => (
                  <li key={student.id} className="grid grid-cols-[minmax(0,1fr)_5.5rem_6.75rem] items-center gap-3 py-2">
                    <span className="truncate font-medium text-foreground">{student.fullName}</span>
                    <span className="text-xs text-muted">{student.grade ? `Grade ${student.grade}` : ""}</span>
                    <span className="text-right font-normal text-foreground">
                      {entry.feeAmount != null ? formatFee(entry.feeAmount) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-right text-sm font-semibold text-foreground">{fee != null ? formatFee(fee) : "Fee not set"}</p>
            </article>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-accent-soft px-4 py-3">
        <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">Total</p>
        <p className="text-lg font-extrabold text-foreground">{total != null ? formatFee(total) : "To be confirmed"}</p>
      </div>
      <PaymentInstructions
        account={paymentAccount}
        amount={total != null ? formatFee(total) : null}
        prominent
        note="One receipt covers every student in this hamper. An admin reviews it before the registrations are approved."
      />
      <div>
        <label className="text-sm font-medium text-foreground">
          Fee receipt
          <RequiredMark />
        </label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={onReceiptChange}
          className="student-photo-file mt-1 block w-full cursor-pointer rounded-lg border border-border bg-background px-1.5 text-sm text-foreground outline-none file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent-soft file:px-3 file:text-sm file:font-semibold file:text-accent-strong hover:file:bg-accent-soft/80 focus:border-accent"
        />
        {transfer ? (
          <div className="mt-2">
            <UploadProgress phase={transfer.phase} percent={transfer.percent} uploadingLabel="Uploading receipt…" savingLabel="Saving receipt…" />
          </div>
        ) : receiptProgress != null ? (
          <div className="mt-2">
            <UploadProgress
              phase="uploading"
              percent={receiptProgress}
              uploadingLabel={receiptProgress >= 100 ? "Receipt ready" : "Preparing receipt…"}
            />
          </div>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <button
        type="button"
        onClick={submit}
        disabled={submitting || !receiptFile || total == null}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit registration"}
      </button>
    </div>
  );
}
