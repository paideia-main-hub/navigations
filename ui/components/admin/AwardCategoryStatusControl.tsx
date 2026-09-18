"use client";

import { useActionState } from "react";
import { updateCategoryStatusAction, type ActionState } from "@/domain/awards/actions";
import { categoryStatusLabels, type AwardCategoryStatus } from "@/domain/awards/types";

const initialState: ActionState = { error: null };

export function AwardCategoryStatusControl({ categoryId, status }: { categoryId: string; status: AwardCategoryStatus }) {
  const [state, formAction, pending] = useActionState(updateCategoryStatusAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="category_id" value={categoryId} />
      <select name="status" defaultValue={status} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground">
        {Object.entries(categoryStatusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:border-accent disabled:opacity-60"
      >
        {pending ? "…" : "Set"}
      </button>
      {state.error && <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}
