"use client";

import { useState } from "react";
import { getSubmissionFileUrlAction } from "@/domain/submissions/actions";

/** Opens a privately stored submission file through a short-lived signed URL,
 * generated on click so a link is never left lying around in the page. */
export function SubmissionFileLink({ path, name, size }: { path: string; name: string; size: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setBusy(true);
    setError(null);
    // Open the tab synchronously (popup blockers allow that), then point it at the URL.
    const tab = window.open("about:blank", "_blank");
    const { url, error: err } = await getSubmissionFileUrlAction(path);
    setBusy(false);
    if (!url) {
      tab?.close();
      setError(err ?? "Couldn't open the file.");
      return;
    }
    if (tab) tab.location.href = url;
    else window.location.href = url;
  }

  const mb = size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`;
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button type="button" onClick={open} disabled={busy} className="font-semibold text-accent hover:underline disabled:opacity-60">
        📎 {name}
      </button>
      <span className="text-xs text-muted">
        {mb}
        {busy ? " · opening…" : ""}
      </span>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </span>
  );
}
