"use client";

import { useActionState } from "react";
import {
  approveNominationAction,
  rejectNominationAction,
  publishNominationAction,
  requestClarificationAction,
  type ActionState,
} from "@/domain/award-nominations/actions";

const initialState: ActionState = { error: null };

function ActionButton({
  action,
  nominationId,
  label,
  tone = "border",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  nominationId: string;
  label: string;
  tone?: "border" | "accent" | "danger";
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const classes =
    tone === "accent"
      ? "bg-accent text-accent-foreground hover:opacity-90"
      : tone === "danger"
        ? "border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        : "border border-border text-foreground hover:border-accent";

  return (
    <form action={formAction}>
      <input type="hidden" name="nomination_id" value={nominationId} />
      <button type="submit" disabled={pending} className={`rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60 ${classes}`}>
        {pending ? "…" : label}
      </button>
      {state.error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

function ClarificationForm({ nominationId }: { nominationId: string }) {
  const [state, formAction, pending] = useActionState(requestClarificationAction, initialState);
  return (
    <form action={formAction} className="flex flex-wrap items-start gap-2">
      <input type="hidden" name="nomination_id" value={nominationId} />
      <textarea
        name="message"
        required
        rows={2}
        placeholder="What do you need the nominator to clarify or fix?"
        className="min-w-[240px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-accent disabled:opacity-60"
      >
        {pending ? "Sending…" : "Request clarification"}
      </button>
      {state.error && <p className="w-full text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

export function NominationReviewPanel({ nominationId, status }: { nominationId: string; status: string }) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-foreground">Decision</h3>
      <div className="flex flex-wrap gap-3">
        <ActionButton action={approveNominationAction} nominationId={nominationId} label="Approve" tone="accent" />
        <ActionButton action={publishNominationAction} nominationId={nominationId} label="Publish" />
        <ActionButton action={rejectNominationAction} nominationId={nominationId} label="Reject" tone="danger" />
      </div>
      <div className="border-t border-border pt-4">
        <p className="mb-2 text-sm font-medium text-foreground">Request clarification</p>
        <ClarificationForm nominationId={nominationId} />
      </div>
      <p className="text-xs text-muted">Current status: {status}</p>
    </div>
  );
}
