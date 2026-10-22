"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { UploadProgress } from "@/ui/components/UploadProgress";
import {
  RECEIPT_ACCEPT,
  isAllowedReceiptFile,
  verifyReceiptFile,
  type ReceiptOcrResult,
} from "@/ui/lib/receiptOcr";

const fileInputClass =
  "student-photo-file mt-1 block h-[38px] w-full cursor-pointer rounded-lg border border-border bg-background px-1.5 text-sm text-foreground outline-none file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent-soft file:px-3 file:text-sm file:font-semibold file:text-accent-strong hover:file:bg-accent-soft/80 focus:border-accent";

export type ReceiptValidation = {
  /** False while OCR runs, on type error, or when OCR checks fail (if required). */
  canSubmit: boolean;
  busy: boolean;
  message: string | null;
};

type Props = {
  label?: string;
  amountExpected: number | null;
  requireOcr: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onValidationChange?: (state: ReceiptValidation) => void;
  prepareProgress?: number | null;
  disabled?: boolean;
};

function emit(
  onValidationChange: Props["onValidationChange"],
  state: ReceiptValidation,
) {
  onValidationChange?.(state);
}

/** Fee receipt picker: image/PDF only, optional OCR hard-block before submit. */
export function ReceiptFileField({
  label = "Fee receipt",
  amountExpected,
  requireOcr,
  file,
  onFileChange,
  onValidationChange,
  prepareProgress = null,
  disabled = false,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const statusEndRef = useRef<HTMLDivElement>(null);
  const onValidationRef = useRef(onValidationChange);
  onValidationRef.current = onValidationChange;
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocr, setOcr] = useState<ReceiptOcrResult | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);
  const requestId = useRef(0);

  const statusVisible =
    prepareProgress != null || ocrBusy || Boolean(typeError) || Boolean(ocr?.error) || Boolean(ocr?.ok);

  useEffect(() => {
    if (!statusVisible) return;
    const node = statusEndRef.current;
    if (!node) return;
    // Let layout paint the new progress/error row before scrolling.
    const id = window.requestAnimationFrame(() => {
      node.scrollIntoView({ block: "end", inline: "nearest", behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [statusVisible, prepareProgress, ocrBusy, typeError, ocr?.error, ocr?.ok]);

  useEffect(() => {
    if (!file) {
      setOcr(null);
      setOcrBusy(false);
      emit(onValidationRef.current, { canSubmit: false, busy: false, message: typeError });
      return;
    }
    if (typeError) {
      emit(onValidationRef.current, { canSubmit: false, busy: false, message: typeError });
      return;
    }
    if (!requireOcr) {
      setOcr(null);
      setOcrBusy(false);
      emit(onValidationRef.current, { canSubmit: true, busy: false, message: null });
      return;
    }

    const id = ++requestId.current;
    setOcrBusy(true);
    setOcr(null);
    emit(onValidationRef.current, { canSubmit: false, busy: true, message: null });
    void verifyReceiptFile(file, amountExpected).then((result) => {
      if (id !== requestId.current) return;
      setOcr(result);
      setOcrBusy(false);
      emit(onValidationRef.current, {
        canSubmit: result.ok,
        busy: false,
        message: result.error,
      });
    });
  }, [file, amountExpected, requireOcr, typeError]);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    setTypeError(null);
    setOcr(null);
    if (!next) {
      onFileChange(null);
      emit(onValidationRef.current, { canSubmit: false, busy: false, message: null });
      return;
    }
    if (!isAllowedReceiptFile(next)) {
      const message = "Only image or PDF receipts are accepted.";
      setTypeError(message);
      onFileChange(null);
      if (inputRef.current) inputRef.current.value = "";
      emit(onValidationRef.current, { canSubmit: false, busy: false, message });
      return;
    }
    onFileChange(next);
  }

  return (
    <div>
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
        <RequiredMark />
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={RECEIPT_ACCEPT}
        disabled={disabled || ocrBusy}
        onChange={onChange}
        className={fileInputClass}
      />
      <p className="mt-1 text-xs text-muted">Images or PDF only.</p>
      {prepareProgress != null ? (
        <div className="mt-2">
          <UploadProgress
            phase="uploading"
            percent={prepareProgress}
            uploadingLabel={prepareProgress >= 100 ? "Receipt ready" : "Preparing receipt…"}
          />
        </div>
      ) : null}
      {ocrBusy ? <p className="mt-2 text-sm text-muted">Checking receipt…</p> : null}
      {typeError ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{typeError}</p> : null}
      {!ocrBusy && ocr?.error ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{ocr.error}</p> : null}
      {!ocrBusy && ocr?.ok ? (
        <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">Receipt checks passed.</p>
      ) : null}
      <div ref={statusEndRef} aria-hidden="true" className="h-px w-full scroll-mt-4" />
    </div>
  );
}
