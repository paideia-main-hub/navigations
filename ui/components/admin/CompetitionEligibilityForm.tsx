"use client";

import { useActionState, useEffect, useState } from "react";
import { saveEligibilityAction, type ActionState } from "@/domain/competitions/actions";
import { categoryLabels, type AgeCategory, type Competition, type EligibilityRule } from "@/domain/competitions/types";

const initialState: ActionState = { error: null };

type DraftRule = Partial<EligibilityRule> & { category: AgeCategory };

function blankRule(): DraftRule {
  return { category: "primary", minGrade: "", maxGrade: "" };
}

export function CompetitionEligibilityForm({ competition }: { competition: Competition }) {
  const [state, formAction, pending] = useActionState(saveEligibilityAction, initialState);
  const [rows, setRows] = useState<DraftRule[]>(competition.eligibility.length > 0 ? competition.eligibility : [blankRule()]);

  // Resync local rows whenever the server-fetched competition data actually
  // changes (i.e. after a successful save triggers Next's automatic route
  // refresh) — otherwise the freshly-assigned row ids never reach local
  // state, and the next save would treat every row as new (delete + insert
  // instead of update). Reference-stable across unrelated client re-renders
  // (tab switches, local typing), so this doesn't clobber in-progress edits.
  useEffect(() => {
    setRows(competition.eligibility.length > 0 ? competition.eligibility : [blankRule()]);
  }, [competition]);

  function updateRow(i: number, patch: Partial<DraftRule>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <input type="hidden" name="competition_id" value={competition.id} />

      {rows.map((row, i) => (
        <div key={i} className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              name={`eligibility[${i}][category]`}
              value={row.category}
              onChange={(e) => updateRow(i, { category: e.target.value as AgeCategory })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium text-foreground">Min grade</label>
              <input
                name={`eligibility[${i}][minGrade]`}
                value={row.minGrade ?? ""}
                onChange={(e) => updateRow(i, { minGrade: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Max grade</label>
              <input
                name={`eligibility[${i}][maxGrade]`}
                value={row.maxGrade ?? ""}
                onChange={(e) => updateRow(i, { maxGrade: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium text-foreground">Team min size</label>
              <input
                name={`eligibility[${i}][teamMinSize]`}
                type="number"
                value={row.teamMinSize ?? ""}
                onChange={(e) => updateRow(i, { teamMinSize: Number(e.target.value) || undefined })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Team max size</label>
              <input
                name={`eligibility[${i}][teamMaxSize]`}
                type="number"
                value={row.teamMaxSize ?? ""}
                onChange={(e) => updateRow(i, { teamMaxSize: Number(e.target.value) || undefined })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Notes</label>
            <input
              name={`eligibility[${i}][notes]`}
              value={row.notes ?? ""}
              onChange={(e) => updateRow(i, { notes: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <button
            type="button"
            onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
            className="justify-self-start text-sm font-medium text-red-600 dark:text-red-400"
          >
            Remove rule
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, blankRule()])}
        className="text-sm font-semibold text-accent"
      >
        + Add eligibility rule
      </button>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</p>}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save eligibility rules"}
        </button>
      </div>
    </form>
  );
}
