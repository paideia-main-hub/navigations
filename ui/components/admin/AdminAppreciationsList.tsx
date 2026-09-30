"use client";

import { useActionState, useState } from "react";
import { deleteAppreciationAction, type ActionState } from "@/domain/appreciations/actions";
import type { Appreciation } from "@/domain/appreciations/types";
import { AppreciationForm } from "./AppreciationForm";

const initialState: ActionState = { error: null };

function RemoveButton({ appreciationId }: { appreciationId: string }) {
  const [state, formAction, pending] = useActionState(deleteAppreciationAction, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="appreciation_id" value={appreciationId} />
      <button type="submit" disabled={pending} className="text-sm font-medium text-red-600 dark:text-red-400">
        {pending ? "…" : "Remove"}
      </button>
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

export function AdminAppreciationsList({ appreciations }: { appreciations: Appreciation[] }) {
  const [editing, setEditing] = useState<Appreciation | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {appreciations.map((item) => (
          <div key={item.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-foreground">{item.heading}</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setEditing(item)} className="text-sm font-medium text-accent">
                  Edit
                </button>
                <RemoveButton appreciationId={item.id} />
              </div>
            </div>
            <p className="mt-2 text-sm text-foreground">{item.description}</p>
            <p className="mt-2 text-sm text-muted">{item.schoolNames}</p>
            <p className="mt-1 text-sm font-medium text-foreground">By {item.byLine}</p>
          </div>
        ))}
        {appreciations.length === 0 && <p className="text-sm text-muted">No appreciations yet.</p>}
      </div>

      {editing ? (
        <AppreciationForm editing={editing} onDone={() => setEditing(null)} />
      ) : creating ? (
        <AppreciationForm editing={null} onDone={() => setCreating(false)} />
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-accent"
        >
          + New appreciation
        </button>
      )}
    </div>
  );
}
