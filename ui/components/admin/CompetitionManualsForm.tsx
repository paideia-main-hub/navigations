"use client";

import { useActionState } from "react";
import { deleteManualAction, uploadManualAction, type ActionState } from "@/domain/competitions/actions";
import { manualTypeLabels, type Competition, type ManualType } from "@/domain/competitions/types";
import { FormField } from "@/ui/components/FormField";
import { RequiredMark } from "@/ui/components/RequiredMark";

const initialState: ActionState = { error: null };

function DeleteManualButton({ competitionId, manualId }: { competitionId: string; manualId: string }) {
  const [state, formAction, pending] = useActionState(deleteManualAction, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="competition_id" value={competitionId} />
      <input type="hidden" name="manual_id" value={manualId} />
      <button type="submit" disabled={pending} className="text-sm font-medium text-red-600 dark:text-red-400">
        {pending ? "…" : "Delete"}
      </button>
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

export function CompetitionManualsForm({ competition }: { competition: Competition }) {
  const [state, formAction, pending] = useActionState(uploadManualAction, initialState);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        {competition.manuals.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
            <div>
              <p className="font-medium text-foreground">{m.title}</p>
              <p className="text-xs text-muted">
                {manualTypeLabels[m.type]} {m.versionLabel && `· ${m.versionLabel}`}
              </p>
              <a href={m.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-accent">
                View file →
              </a>
            </div>
            <DeleteManualButton competitionId={competition.id} manualId={m.id} />
          </div>
        ))}
        {competition.manuals.length === 0 && <p className="text-sm text-muted">No manuals uploaded yet.</p>}
      </div>

      <form action={formAction} className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <h3 className="font-semibold text-foreground">Upload a manual</h3>
        <input type="hidden" name="competition_id" value={competition.id} />
        <div>
          <label className="text-sm font-medium text-foreground">Type</label>
          <select name="type" defaultValue={"complete_manual" as ManualType} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            {Object.entries(manualTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <FormField label="Title" name="title" required />
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Version label" name="version_label" />
          <FormField label="Version date" name="version_date" type="date" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">
            File (PDF/Word)
            <RequiredMark />
          </label>
          <input
            type="file"
            name="file"
            required
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-600 dark:text-emerald-400">Uploaded.</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Uploading…" : "Upload manual"}
        </button>
      </form>
    </div>
  );
}
