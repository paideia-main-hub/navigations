"use client";

import { useActionState } from "react";
import { uploadNominationWinnerPhotoAction, type ActionState } from "@/domain/award-nominations/actions";

const initialState: ActionState = { error: null };

export function NominationWinnerPhotoForm({ nominationId, currentPhotoUrl }: { nominationId: string; currentPhotoUrl: string | null }) {
  const [state, formAction, pending] = useActionState(uploadNominationWinnerPhotoAction, initialState);

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
      <p className="font-semibold text-foreground">🏆 This nomination is the current winner</p>
      <p className="mt-1 text-sm text-muted">Upload a photo before publishing — it appears on the public Award Results page.</p>

      <div className="mt-3 flex items-center gap-4">
        {currentPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage URL
          <img src={currentPhotoUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-xs text-muted">No photo</div>
        )}
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="nomination_id" value={nominationId} />
          <input type="file" name="file" accept="image/*" className="text-sm text-muted" />
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-accent disabled:opacity-60"
          >
            {pending ? "Uploading…" : currentPhotoUrl ? "Replace photo" : "Upload photo"}
          </button>
          {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
        </form>
      </div>
    </div>
  );
}
