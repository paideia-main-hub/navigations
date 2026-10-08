"use client";

import { useActionState } from "react";
import { assignJudgeAction, type ActionState } from "@/domain/award-judging/actions";
import { RequiredMark } from "@/ui/components/RequiredMark";

const initialState: ActionState = { error: null };

export function AssignAwardJudgeForm({
  categoryId,
  judges,
  assigned,
}: {
  categoryId: string;
  judges: { id: string; fullName: string }[];
  assigned: { id: string; judgeId: string; judgeName: string }[];
}) {
  const [state, formAction, pending] = useActionState(assignJudgeAction, initialState);
  const assignedIds = new Set(assigned.map((a) => a.judgeId));
  const available = judges.filter((j) => !assignedIds.has(j.id));

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-foreground">Judges assigned to this category</h3>
      <ul className="mt-2 space-y-1 text-sm text-muted">
        {assigned.map((a) => (
          <li key={a.id}>{a.judgeName}</li>
        ))}
        {assigned.length === 0 && <li>No judges assigned yet.</li>}
      </ul>

      {available.length > 0 && (
        <form action={formAction} className="mt-4 flex items-center gap-2">
          <input type="hidden" name="category_id" value={categoryId} />
          <label className="text-sm font-medium text-foreground">
            Judge
            <RequiredMark />
            <select name="judge_id" required className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            {available.map((j) => (
              <option key={j.id} value={j.id}>
                {j.fullName}
              </option>
            ))}
          </select>
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Assigning…" : "Assign judge"}
          </button>
        </form>
      )}
      {state.error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </div>
  );
}
