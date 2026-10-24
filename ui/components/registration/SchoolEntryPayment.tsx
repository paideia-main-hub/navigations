"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { formatFee } from "@/domain/competitions/types";
import { submitSchoolEntriesAction } from "@/domain/registrations/actions";
import { schoolEntryFee } from "@/domain/registrations/schoolEntries";
import type { PaymentAccount } from "@/domain/payments/types";
import { withFileUploadProgress, type UploadProgressState } from "@/ui/lib/fileUploadProgress";
import { CopyButton } from "@/ui/components/CopyButton";
import { MenuScroll } from "@/ui/components/MenuScroll";
import { PaymentInstructions } from "@/ui/components/PaymentInstructions";
import { ReceiptFileField, type ReceiptValidation } from "@/ui/components/ReceiptFileField";
import { UploadProgress } from "@/ui/components/UploadProgress";
import { useSchoolEntryList } from "@/ui/components/registration/SchoolHamperList";

const sheetFooterClass = "border-t border-border bg-accent-soft px-5 py-4";
const primaryBtnClass =
  "w-full cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-50";
const secondaryBtnClass =
  "w-full rounded-full border border-border bg-surface px-5 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong";

export function SchoolEntryPayment({
  paymentAccount,
  receiptWaived = false,
  variant = "page",
  onBack,
}: {
  paymentAccount: PaymentAccount;
  /** When true, skip bank details, receipt upload, and OCR. */
  receiptWaived?: boolean;
  variant?: "page" | "sheet";
  onBack?: () => void;
}) {
  const { entries, clearEntries } = useSchoolEntryList();
  const sheet = variant === "sheet";
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptProgress, setReceiptProgress] = useState<number | null>(null);
  const [receiptValidation, setReceiptValidation] = useState<ReceiptValidation>({
    canSubmit: false,
    busy: false,
    message: null,
  });
  const [transfer, setTransfer] = useState<UploadProgressState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<{ registrationNumber: string; competitionTitle: string }[] | null>(null);
  const readerRef = useRef<FileReader | null>(null);

  const fees = entries.map(schoolEntryFee);
  const total = fees.every((fee) => fee != null) ? fees.reduce<number>((sum, fee) => sum + (fee ?? 0), 0) : null;
  const canSubmit = receiptWaived
    ? total != null && entries.length > 0
    : Boolean(receiptFile) && total != null && receiptValidation.canSubmit;

  function onReceiptFileChange(file: File | null) {
    readerRef.current?.abort();
    readerRef.current = null;
    setReceiptProgress(null);
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
    if (entries.length === 0 || total == null) return;
    if (!receiptWaived && !receiptFile) return;
    setSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.set("entries", JSON.stringify(entries));
    if (receiptWaived) {
      formData.set("receipt_waived", "on");
    } else if (receiptFile) {
      formData.set("receipt", receiptFile);
    }
    const result = receiptWaived
      ? await submitSchoolEntriesAction(formData)
      : await withFileUploadProgress(setTransfer, () => submitSchoolEntriesAction(formData));
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
    const successBody = (
      <div className="rounded-2xl border border-accent/40 bg-accent-soft p-6 text-center shadow-sm">
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
          {receiptWaived
            ? "Your registration is under review. An admin will approve the payment without a receipt upload for your school."
            : "Your receipt has been submitted and is now under review. You'll see it marked approved on your dashboard once an admin has checked it."}
        </p>
      </div>
    );
    const successCta = (
      <Link href="/dashboard" className={`inline-block text-center ${primaryBtnClass}`}>
        Go to dashboard
      </Link>
    );
    if (sheet) {
      return (
        <div className="flex min-h-0 flex-1 flex-col">
          <MenuScroll frameClassName="flex min-h-0 flex-1 flex-col" className="min-h-0 flex-1 px-5 py-4">
            {successBody}
          </MenuScroll>
          <div className={sheetFooterClass}>{successCta}</div>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        {successBody}
        {successCta}
      </div>
    );
  }

  if (entries.length === 0) {
    const emptyBody = (
      <>
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">Hamper is empty</h2>
        <p className="mt-2 text-sm text-muted">Add competitions first, then come back here to pay once for all of them.</p>
      </>
    );
    if (sheet) {
      return (
        <div className="flex min-h-0 flex-1 flex-col">
          <MenuScroll frameClassName="flex min-h-0 flex-1 flex-col" className="min-h-0 flex-1 px-5 py-4">
            {emptyBody}
          </MenuScroll>
          <div className={sheetFooterClass}>
            {onBack ? (
              <button type="button" onClick={onBack} className={secondaryBtnClass}>
                Back to hamper
              </button>
            ) : null}
          </div>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-6">
        {emptyBody}
        <Link href="/dashboard/register" className="mt-4 inline-block text-sm font-semibold text-accent-strong">
          ← Back to competitions
        </Link>
      </div>
    );
  }

  const body = (
    <>
      {!sheet ? (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Register - Checkout</h2>
          <Link href="/dashboard/register" className="shrink-0 text-sm font-semibold text-accent-strong">
            ← Back to competitions
          </Link>
        </div>
      ) : null}
      <div className="space-y-2">
        {entries.map((entry) => {
          const fee = schoolEntryFee(entry);
          return (
            <article key={entry.id ?? entry.competitionSlug} className="rounded-xl border border-border bg-surface px-3 py-2.5">
              <h3 className="truncate text-sm font-extrabold tracking-tight text-foreground">{entry.competitionTitle}</h3>
              {entry.entryType === "team" && entry.teamName ? (
                <p className="mt-0.5 truncate text-xs font-semibold tracking-wide text-muted uppercase">{entry.teamName}</p>
              ) : null}
              <ul className="mt-1.5 text-xs">
                {entry.students.map((student) => (
                  <li
                    key={student.id}
                    className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-2 border-t border-border/70 py-1 first:border-t-0 first:pt-0"
                  >
                    <span className="truncate font-medium text-foreground">
                      {student.fullName}
                      {student.grade ? <span className="font-normal text-muted"> · Grade {student.grade}</span> : null}
                    </span>
                    <span className="text-right text-foreground">
                      {entry.feeAmount != null ? formatFee(entry.feeAmount) : "—"}
                    </span>
                  </li>
                ))}
                <li className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-2 border-t border-border pt-1.5">
                  <span className="text-muted" aria-hidden="true" />
                  <span className="text-right text-sm font-semibold text-foreground">
                    {fee != null ? formatFee(fee) : "Fee not set"}
                  </span>
                </li>
              </ul>
            </article>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-accent-soft px-4 py-3">
        <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">Total</p>
        <p className="text-lg font-extrabold text-foreground">{total != null ? formatFee(total) : "To be confirmed"}</p>
      </div>
      {receiptWaived ? (
        <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted">
          Receipt upload is not required for your school. Submit to place the registrations under admin review.
        </p>
      ) : (
        <>
          <PaymentInstructions
            account={paymentAccount}
            amount={total != null ? formatFee(total) : null}
            prominent
            horizontal={sheet}
            note="One receipt covers every student in this hamper. An admin reviews it before the registrations are approved."
          />
          <ReceiptFileField
            amountExpected={total}
            requireOcr={paymentAccount.requireReceiptOcr}
            file={receiptFile}
            onFileChange={onReceiptFileChange}
            onValidationChange={setReceiptValidation}
            prepareProgress={transfer ? null : receiptProgress}
            disabled={submitting}
          />
          {transfer ? (
            <div>
              <UploadProgress
                phase={transfer.phase}
                percent={transfer.percent}
                uploadingLabel="Uploading receipt…"
                savingLabel="Saving receipt…"
              />
            </div>
          ) : null}
        </>
      )}
      {!sheet && error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </>
  );

  const actions = (
    <>
      {sheet && error ? <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={submitting || !canSubmit}
          className={primaryBtnClass}
        >
          {submitting ? "Submitting…" : "Submit registration"}
        </button>
        {sheet && onBack ? (
          <button type="button" onClick={onBack} className={secondaryBtnClass}>
            Back to hamper
          </button>
        ) : null}
      </div>
    </>
  );

  if (sheet) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <MenuScroll frameClassName="flex min-h-0 flex-1 flex-col" className="min-h-0 flex-1 space-y-4 px-5 py-4">
          {body}
        </MenuScroll>
        <div className={sheetFooterClass}>{actions}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {body}
      {actions}
    </div>
  );
}
