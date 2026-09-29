"use client";

import { useActionState, useState } from "react";
import { deleteCompetitionAction, type ActionState } from "@/domain/competitions/actions";

const initialState: ActionState = { error: null };

/** Danger zone at the bottom of the competition editor. Deleting is
 * permanent, so the admin types the exact title to arm the button; a
 * competition with registrations can't be deleted at all and points to
 * archiving instead (the server re-checks both). */
export function DeleteCompetitionPanel({
  competitionId,
  title,
  registrationCount,
}: {
  competitionId: string;
  title: string;
  registrationCount: number | null;
}) {
  const [state, formAction, pending] = useActionState(deleteCompetitionAction, initialState);
  const [typed, setTyped] = useState("");
  const blocked = registrationCount === null || registrationCount > 0;
  const armed = !blocked && typed.trim() === title.trim();

  return (
    <section id="delete" className="mt-12 scroll-mt-24 rounded-xl border border-red-300 bg-surface p-5 dark:border-red-900">
      <h2 className="text-base font-bold text-red-700 dark:text-red-400">Delete competition</h2>

      {blocked ? (
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {registrationCount === null
            ? "Couldn't check this competition's registrations, so it can't be deleted right now."
            : `This competition has ${registrationCount} registration${registrationCount === 1 ? "" : "s"}, so it can't be deleted — that would erase those entries, their payments and results.`}{" "}
          To hide it from the public site, set its status to <span className="font-semibold text-foreground">Archived</span>{" "}
          instead.
        </p>
      ) : (
        <form action={formAction} className="mt-2 max-w-2xl space-y-3">
          <input type="hidden" name="competition_id" value={competitionId} />
          <p className="text-sm text-muted">
            Permanently removes this competition and everything attached to it — eligibility, stages, rubrics, manuals,
            resources, FAQs, dates, winners and announcements. This can&apos;t be undone. To hide it without deleting,
            set its status to <span className="font-semibold text-foreground">Draft</span> or{" "}
            <span className="font-semibold text-foreground">Archived</span>.
          </p>
          <label className="block text-sm text-foreground">
            Type <span className="font-semibold">{title}</span> to confirm
            <input
              name="confirm_title"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-red-500"
            />
          </label>
          <button
            type="submit"
            disabled={!armed || pending}
            className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "Deleting…" : "Delete permanently"}
          </button>
        </form>
      )}

      {state.error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </section>
  );
}
