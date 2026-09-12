"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteResourceAction, saveResourceAction, type ActionState } from "@/domain/competitions/actions";
import { resourceTypeLabels, type Competition, type Resource, type ResourceType } from "@/domain/competitions/types";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

function DeleteResourceButton({ competitionId, resourceId }: { competitionId: string; resourceId: string }) {
  const [state, formAction, pending] = useActionState(deleteResourceAction, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="competition_id" value={competitionId} />
      <input type="hidden" name="resource_id" value={resourceId} />
      <button type="submit" disabled={pending} className="text-sm font-medium text-red-600 dark:text-red-400">
        {pending ? "…" : "Delete"}
      </button>
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

export function CompetitionResourcesForm({ competition }: { competition: Competition }) {
  const [editing, setEditing] = useState<Resource | null>(null);
  const [state, formAction, pending] = useActionState(saveResourceAction, initialState);

  useEffect(() => {
    if (state.success) setEditing(null);
  }, [state.success]);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        {competition.resources.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
            <div>
              <p className="font-medium text-foreground">{r.title}</p>
              <p className="text-xs text-muted">{resourceTypeLabels[r.type]}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setEditing(r)} className="text-sm font-medium text-accent">
                Edit
              </button>
              <DeleteResourceButton competitionId={competition.id} resourceId={r.id} />
            </div>
          </div>
        ))}
        {competition.resources.length === 0 && <p className="text-sm text-muted">No practice resources added yet.</p>}
      </div>

      <form key={editing?.id ?? "new"} action={formAction} className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <h3 className="font-semibold text-foreground">{editing ? "Edit resource" : "Add a resource"}</h3>
        <input type="hidden" name="competition_id" value={competition.id} />
        {editing && <input type="hidden" name="resource_id" value={editing.id} />}
        <div>
          <label className="text-sm font-medium text-foreground">Type</label>
          <select
            name="type"
            defaultValue={editing?.type ?? ("practice_question" as ResourceType)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            {Object.entries(resourceTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <FormField label="Title" name="title" required defaultValue={editing?.title} />
        <div>
          <label className="text-sm font-medium text-foreground">Content</label>
          <textarea
            name="content"
            rows={3}
            defaultValue={editing?.content ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <FormField label="Video / media URL (optional)" name="video_url" defaultValue={editing?.videoUrl ?? ""} />
        <div>
          <label className="text-sm font-medium text-foreground">Or upload a media file</label>
          <input type="file" name="file" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
        </div>
        <div className="flex items-center gap-4">
          <FormField label="Order" name="order_index" type="number" defaultValue={(editing?.orderIndex ?? competition.resources.length).toString()} />
          <label className="mt-6 flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="download_allowed" defaultChecked={editing?.downloadAllowed ?? false} />
            Allow download
          </label>
        </div>
        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
        <div className="flex gap-3">
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Saving…" : editing ? "Save changes" : "Add resource"}
          </button>
        </div>
      </form>
    </div>
  );
}
