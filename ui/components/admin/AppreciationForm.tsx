"use client";

import { useActionState, useEffect } from "react";
import { createAppreciationAction, updateAppreciationAction, type ActionState } from "@/domain/appreciations/actions";
import type { Appreciation } from "@/domain/appreciations/types";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

export function AppreciationForm({
  editing,
  onDone,
}: {
  editing: Appreciation | null;
  onDone: () => void;
}) {
  const action = editing ? updateAppreciationAction : createAppreciationAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form key={editing?.id ?? "new"} action={formAction} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-foreground">{editing ? "Edit appreciation" : "New appreciation"}</h3>
      {editing && <input type="hidden" name="appreciation_id" value={editing.id} />}
      <FormField label="Heading" name="heading" required defaultValue={editing?.heading} />
      <div>
        <label className="text-sm font-medium text-foreground">Description</label>
        <textarea
          name="description"
          rows={4}
          required
          defaultValue={editing?.description}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>
      <FormField label="School names" name="school_names" required defaultValue={editing?.schoolNames} />
      <FormField label="By" name="by_line" required defaultValue={editing?.byLine} />
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <div className="flex gap-3">
        {editing && (
          <button type="button" onClick={onDone} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : editing ? "Save changes" : "Add appreciation"}
        </button>
      </div>
    </form>
  );
}
