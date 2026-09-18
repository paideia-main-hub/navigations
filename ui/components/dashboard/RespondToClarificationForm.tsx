"use client";

import { useActionState } from "react";
import { respondToClarificationAction, type ActionState } from "@/domain/award-nominations/actions";

const initialState: ActionState = { error: null };

export function RespondToClarificationForm({ nominationId, clarificationId }: { nominationId: string; clarificationId: string }) {
  const [state, formAction, pending] = useActionState(respondToClarificationAction, initialState);

  if (state.success) return <p className="text-sm text-emerald-600 dark:text-emerald-400">Response sent.</p>;

  return (
    <form action={formAction} className="mt-2 space-y-2">
      <input type="hidden" name="nomination_id" value={nominationId} />
      <input type="hidden" name="clarification_id" value={clarificationId} />
      <textarea name="response_text" required rows={2} placeholder="Your response…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
      <button type="submit" disabled={pending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60">
        {pending ? "Sending…" : "Send response"}
      </button>
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
