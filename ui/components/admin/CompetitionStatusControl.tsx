"use client";

import { useActionState } from "react";
import { updateCompetitionStatusAction, type ActionState } from "@/domain/competitions/actions";
import { statusLabels, type CompetitionStatus } from "@/domain/competitions/types";

const initialState: ActionState = { error: null };

export function CompetitionStatusControl({
  competitionId,
  status,
}: {
  competitionId: string;
  status: CompetitionStatus;
}) {
  const [state, formAction, pending] = useActionState(updateCompetitionStatusAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="competition_id" value={competitionId} />
      <select
        name="status"
        defaultValue={status}
        className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground"
      >
        {Object.entries(statusLabels).map(([value, label]) => (
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
