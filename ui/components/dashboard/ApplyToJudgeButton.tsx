"use client";

import { useActionState } from "react";
import { applyToJudgeAction, type ActionState } from "@/domain/judge-applications/actions";

const initialState: ActionState = { error: null };

export function ApplyToJudgeButton({ competitionId }: { competitionId: string }) {
  const [state, formAction, pending] = useActionState(applyToJudgeAction, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="competition_id" value={competitionId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:opacity-60"
      >
        {pending ? "Applying…" : "Apply to judge"}
      </button>
      {state.error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Application submitted.</p>}
    </form>
  );
}
