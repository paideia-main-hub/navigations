"use client";

import { useActionState, useEffect, useState } from "react";
import { saveStagesAction, type ActionState } from "@/domain/competitions/actions";
import type { Competition, CompetitionStage } from "@/domain/competitions/types";

const initialState: ActionState = { error: null };

type DraftStage = Partial<CompetitionStage>;

function blankStage(nextNumber: number): DraftStage {
  return { stageNumber: nextNumber, title: "", format: "", duration: "", taskDescription: "", progressionRule: "" };
}

export function CompetitionStagesForm({ competition }: { competition: Competition }) {
  const [state, formAction, pending] = useActionState(saveStagesAction, initialState);
  const [rows, setRows] = useState<DraftStage[]>(
    competition.stages.length > 0 ? competition.stages : [blankStage(1)],
  );

  // See CompetitionEligibilityForm's identical effect for why this matters:
  // without it, a second save (no full page reload in between) would treat
  // every stage as new, deleting the old rows and silently nulling out any
  // resources.stage_id / rubrics.stage_id that pointed at them.
  useEffect(() => {
    setRows(competition.stages.length > 0 ? competition.stages : [blankStage(1)]);
  }, [competition]);

  function updateRow(i: number, patch: Partial<DraftStage>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <input type="hidden" name="competition_id" value={competition.id} />

      {rows.map((row, i) => (
        <div key={row.id ?? `new-${i}`} className="space-y-3 rounded-xl border border-border bg-surface p-4">
          {row.id && <input type="hidden" name={`stages[${i}][id]`} value={row.id} />}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-foreground">Stage number</label>
              <input
                name={`stages[${i}][stageNumber]`}
                type="number"
                value={row.stageNumber ?? i + 1}
                onChange={(e) => updateRow(i, { stageNumber: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Title</label>
              <input
                name={`stages[${i}][title]`}
                value={row.title ?? ""}
                onChange={(e) => updateRow(i, { title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">Format</label>
              <input
                name={`stages[${i}][format]`}
                value={row.format ?? ""}
                onChange={(e) => updateRow(i, { format: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Duration</label>
              <input
                name={`stages[${i}][duration]`}
                value={row.duration ?? ""}
                onChange={(e) => updateRow(i, { duration: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Task description</label>
            <textarea
              name={`stages[${i}][taskDescription]`}
              rows={2}
              value={row.taskDescription ?? ""}
              onChange={(e) => updateRow(i, { taskDescription: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Progression rule</label>
            <input
              name={`stages[${i}][progressionRule]`}
              value={row.progressionRule ?? ""}
              onChange={(e) => updateRow(i, { progressionRule: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <button
            type="button"
            onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
            className="text-sm font-medium text-red-600 dark:text-red-400"
          >
            Remove stage
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, blankStage(prev.length + 1)])}
        className="text-sm font-semibold text-accent"
      >
        + Add stage
      </button>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</p>}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save stages"}
        </button>
      </div>
    </form>
  );
}
