"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addReceiptExemptionAction,
  removeReceiptExemptionAction,
} from "@/domain/payments/actions";
import type { ReceiptExemption } from "@/domain/payments/types";

export type ExemptionSchoolOption = {
  id: string;
  name: string;
  coordinatorLabel: string | null;
};

export function ReceiptExemptionPanel({
  exemptions,
  schools,
}: {
  exemptions: ReceiptExemption[];
  schools: ExemptionSchoolOption[];
}) {
  const router = useRouter();
  const [schoolId, setSchoolId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const exemptIds = new Set(exemptions.map((row) => row.schoolId));
  const available = schools.filter((school) => !exemptIds.has(school.id));

  function add() {
    if (!schoolId) {
      setError("Choose a school to exempt.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const { error: err } = await addReceiptExemptionAction(schoolId);
      if (err) {
        setError(err);
        return;
      }
      setSchoolId("");
      router.refresh();
    });
  }

  function remove(id: string) {
    setError(null);
    startTransition(async () => {
      const { error: err } = await removeReceiptExemptionAction(id);
      if (err) {
        setError(err);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="mt-8 max-w-xl space-y-4 rounded-xl border border-border bg-surface p-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Receipt upload exemptions</h2>
        <p className="mt-1 text-sm text-muted">
          Exempted coordinators skip bank details, receipt upload, and OCR on the hamper checkout. Add one school
          at a time; several schools can be exempt at once. Payments still appear under Directory for approval.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1 text-sm">
          <span className="mb-1.5 block font-medium text-foreground">School</span>
          <select
            value={schoolId}
            onChange={(event) => setSchoolId(event.target.value)}
            disabled={pending || available.length === 0}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground"
          >
            <option value="">{available.length === 0 ? "All schools are already exempt" : "Choose a school…"}</option>
            {available.map((school) => (
              <option key={school.id} value={school.id}>
                {school.coordinatorLabel
                  ? `${school.name} — ${school.coordinatorLabel}`
                  : school.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={add}
          disabled={pending || !schoolId}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Add exemption"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {exemptions.length === 0 ? (
        <p className="text-sm text-muted">No schools are exempt yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {exemptions.map((row) => (
            <li key={row.schoolId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{row.schoolName}</p>
                {row.coordinatorName ? (
                  <p className="truncate text-xs text-muted">{row.coordinatorName}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => remove(row.schoolId)}
                disabled={pending}
                className="shrink-0 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-500/20 disabled:opacity-50 dark:text-red-400"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
