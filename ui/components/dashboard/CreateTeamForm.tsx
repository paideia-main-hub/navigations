"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { StudentProfile } from "@/domain/students/types";
import { createTeamAction, type ActionState } from "@/domain/teams/actions";
import { RequiredMark } from "@/ui/components/RequiredMark";

const initialState: ActionState = { error: null };

export function CreateTeamForm({ roster }: { roster: StudentProfile[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createTeamAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local "is the form open" UI state to the server action's result, not derivable from props/state alone
      setOpen(false);
    }
  }, [state.success]);

  if (roster.length < 2) {
    return (
      <p className="text-sm text-muted">Add at least 2 students to your roster before creating a team.</p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-accent"
      >
        + Create team
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-foreground">Create team</h3>
      <div>
        <label className="text-sm font-medium text-foreground">
          Team name
          <RequiredMark />
        </label>
        <input
          name="team_name"
          required
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">
          Members (select at least 2)
          <RequiredMark />
        </label>
        <div className="mt-1 max-h-48 space-y-1 overflow-y-auto">
          {roster.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" name="member_ids" value={s.id} />
              {s.fullName} (Grade {s.grade})
            </label>
          ))}
        </div>
      </div>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create team"}
        </button>
      </div>
    </form>
  );
}
