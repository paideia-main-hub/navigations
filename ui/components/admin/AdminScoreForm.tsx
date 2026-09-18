"use client";

import { useActionState, useState } from "react";
import { submitAdminScoreAction, type ActionState } from "@/domain/award-nominations/actions";
import type { RubricCriterion } from "@/domain/awards/types";

const initialState: ActionState = { error: null };

export function AdminScoreForm({
  nominationId,
  categoryId,
  criteria,
  passThreshold,
  existingScores,
}: {
  nominationId: string;
  categoryId: string;
  criteria: RubricCriterion[];
  passThreshold: number;
  existingScores: Record<string, number>;
}) {
  const [state, formAction, pending] = useActionState(submitAdminScoreAction, initialState);
  const [values, setValues] = useState<Record<string, number>>(existingScores);

  const total = Math.round(criteria.reduce((sum, c) => sum + ((values[c.key] ?? 50) * c.weight) / 100, 0));

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-surface p-4">
      <input type="hidden" name="nomination_id" value={nominationId} />
      <input type="hidden" name="category_id" value={categoryId} />
      <h3 className="font-semibold text-foreground">Score this nomination</h3>
      <p className="text-xs text-muted">The fixed rubric for this category — {passThreshold}% required to be a winner candidate.</p>

      {criteria.map((c) => (
        <div key={c.key} className="flex items-center gap-4">
          <label className="w-48 shrink-0 text-sm text-foreground">
            {c.label} <span className="text-muted">({c.weight}%)</span>
          </label>
          <input type="hidden" name="criterion_key" value={c.key} />
          <input type="hidden" name="criterion_weight" value={c.weight} />
          <input
            type="range"
            name="criterion_value"
            min={0}
            max={100}
            value={values[c.key] ?? 50}
            onChange={(e) => setValues((prev) => ({ ...prev, [c.key]: Number(e.target.value) }))}
            className="flex-1"
          />
          <span className="w-10 text-right text-sm text-muted">{values[c.key] ?? 50}</span>
        </div>
      ))}

      <p className={`text-sm font-semibold ${total >= passThreshold ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
        Weighted total: {total}% {total >= passThreshold ? "— meets threshold" : "— below threshold"}
      </p>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save score & recompute winners"}
      </button>
    </form>
  );
}
