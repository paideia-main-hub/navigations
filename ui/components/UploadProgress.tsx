"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  beginFileUploadTracking,
  endFileUploadTracking,
  formHasFile,
  type UploadProgressState,
} from "@/ui/lib/fileUploadProgress";

export function UploadProgress({
  phase,
  percent,
  uploadingLabel = "Uploading…",
  savingLabel = "Saving…",
}: {
  phase: UploadProgressState["phase"];
  percent: number;
  uploadingLabel?: string;
  savingLabel?: string;
}) {
  const label = phase === "saving" ? savingLabel : uploadingLabel;
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex items-center justify-between text-[0.7rem] font-medium text-muted">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={label}
        className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className={`h-full rounded-full bg-accent transition-[width] duration-150 ease-out ${
            phase === "saving" ? "animate-pulse" : ""
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/** Shows upload then save progress for a form whose server action sends a file. */
export function useFileFormProgress(pending: boolean) {
  const [progress, setProgress] = useState<UploadProgressState | null>(null);
  const tracking = useRef(false);

  useEffect(() => {
    if (pending || !tracking.current) return;
    tracking.current = false;
    endFileUploadTracking();
    setProgress(null);
  }, [pending]);

  useEffect(
    () => () => {
      if (!tracking.current) return;
      tracking.current = false;
      endFileUploadTracking();
    },
    [],
  );

  function onSubmitCapture(event: FormEvent<HTMLFormElement>) {
    if (!formHasFile(event.currentTarget)) return;
    tracking.current = true;
    beginFileUploadTracking(setProgress);
  }

  return { onSubmitCapture, progress };
}
