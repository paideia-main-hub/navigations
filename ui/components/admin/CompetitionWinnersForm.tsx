"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteWinnerAction, saveWinnerAction, type ActionState } from "@/domain/competitions/actions";
import { awardLabels, type Competition, type CompetitionWinner, type AwardType } from "@/domain/competitions/types";
import { FormField } from "@/ui/components/FormField";

const initialState: ActionState = { error: null };

function DeleteWinnerButton({ competitionId, winnerId }: { competitionId: string; winnerId: string }) {
  const [state, formAction, pending] = useActionState(deleteWinnerAction, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="competition_id" value={competitionId} />
      <input type="hidden" name="winner_id" value={winnerId} />
      <button type="submit" disabled={pending} className="text-sm font-medium text-red-600 dark:text-red-400">
        {pending ? "…" : "Delete"}
      </button>
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

export function CompetitionWinnersForm({ competition }: { competition: Competition }) {
  const [editing, setEditing] = useState<CompetitionWinner | null>(null);
  const [state, formAction, pending] = useActionState(saveWinnerAction, initialState);

  useEffect(() => {
    if (state.success) setEditing(null);
  }, [state.success]);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        {competition.winners.map((w) => (
          <div key={w.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                {awardLabels[w.award]} {!w.published && "· Hidden"}
              </p>
              <p className="font-medium text-foreground">{w.studentName}</p>
              <p className="text-xs text-muted">{w.schoolName}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setEditing(w)} className="text-sm font-medium text-accent">
                Edit
              </button>
              <DeleteWinnerButton competitionId={competition.id} winnerId={w.id} />
            </div>
          </div>
        ))}
        {competition.winners.length === 0 && <p className="text-sm text-muted">No winners published yet.</p>}
      </div>

      <form key={editing?.id ?? "new"} action={formAction} className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <h3 className="font-semibold text-foreground">{editing ? "Edit winner" : "Add a winner"}</h3>
        <input type="hidden" name="competition_id" value={competition.id} />
        {editing && (
          <>
            <input type="hidden" name="winner_id" value={editing.id} />
            <input type="hidden" name="existing_photo_url" value={editing.photoUrl ?? ""} />
          </>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Student name" name="student_name" required defaultValue={editing?.studentName} />
          <FormField label="School name" name="school_name" required defaultValue={editing?.schoolName} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Award</label>
            <select
              name="award"
              defaultValue={editing?.award ?? ("gold" as AwardType)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {Object.entries(awardLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <FormField label="Custom award label" name="custom_award_label" defaultValue={editing?.customAwardLabel ?? ""} />
        </div>
        <FormField label="Position label (optional)" name="position_label" defaultValue={editing?.positionLabel ?? ""} />
        <div>
          <label className="text-sm font-medium text-foreground">Photo</label>
          <input type="file" name="file" accept="image/*" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
          {editing?.photoUrl && <p className="mt-1 text-xs text-muted">Current photo kept unless a new one is uploaded.</p>}
        </div>
        <div className="flex items-center gap-4">
          <FormField label="Order" name="order_index" type="number" defaultValue={(editing?.orderIndex ?? competition.winners.length).toString()} />
          <label className="mt-6 flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="published" defaultChecked={editing?.published ?? true} />
            Published (visible on public site)
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
            {pending ? "Saving…" : editing ? "Save changes" : "Add winner"}
          </button>
        </div>
      </form>
    </div>
  );
}
