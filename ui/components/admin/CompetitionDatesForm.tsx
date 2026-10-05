"use client";

import { useActionState, useEffect, useState } from "react";
import { saveEventsAction, type ActionState } from "@/domain/competitions/actions";
import {
  eventTypeAdminLabels,
  eventTypeHints,
  type Competition,
  type CompetitionEvent,
  type EventType,
} from "@/domain/competitions/types";

const initialState: ActionState = { error: null };

type DraftEvent = Partial<CompetitionEvent>;

function toLocalInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CompetitionDatesForm({ competition }: { competition: Competition }) {
  const [state, formAction, pending] = useActionState(saveEventsAction, initialState);
  const [rows, setRows] = useState<DraftEvent[]>(
    competition.events.length > 0 ? competition.events : [{ type: "registration_close", title: "Registration closes" }],
  );

  useEffect(() => {
    setRows(competition.events.length > 0 ? competition.events : [{ type: "registration_close", title: "Registration closes" }]);
  }, [competition]);

  function updateRow(i: number, patch: Partial<DraftEvent>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <input type="hidden" name="competition_id" value={competition.id} />

      <div className="rounded-xl border border-border bg-surface-muted/60 px-4 py-3 text-sm text-muted">
        <p className="font-medium text-foreground">Each card is one date for this competition only.</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <span className="font-medium text-foreground">Type</span> — what kind of date it is (drives deadlines and labels in the system).
          </li>
          <li>
            <span className="font-medium text-foreground">Title</span> — wording shown on the public competition page.
          </li>
          <li>
            <span className="font-medium text-foreground">Date &amp; time</span> — when that milestone happens.
          </li>
          <li>
            <span className="font-medium text-foreground">Description</span> — optional short note under the title on the public page.
          </li>
        </ul>
      </div>

      {rows.map((row, i) => {
        const type = (row.type ?? "other") as EventType;
        return (
          <div key={i} className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">Date {i + 1}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Type (what this date is for)</label>
              <select
                name={`events[${i}][type]`}
                value={type}
                onChange={(e) => updateRow(i, { type: e.target.value as EventType })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {Object.entries(eventTypeAdminLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted">{eventTypeHints[type]}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Title (shown on the competition page)</label>
              <input
                name={`events[${i}][title]`}
                value={row.title ?? ""}
                onChange={(e) => updateRow(i, { title: e.target.value })}
                placeholder="e.g. Registration closes"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Date &amp; time</label>
              <input
                name={`events[${i}][eventDate]`}
                type="datetime-local"
                defaultValue={toLocalInputValue(row.eventDate)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description (optional note)</label>
              <input
                name={`events[${i}][description]`}
                value={row.description ?? ""}
                onChange={(e) => updateRow(i, { description: e.target.value })}
                placeholder="Short note under the title"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <button
              type="button"
              onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
              className="col-span-full justify-self-start text-sm font-medium text-red-600 dark:text-red-400"
            >
              Remove date
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { type: "other", title: "" }])}
        className="text-sm font-semibold text-accent"
      >
        + Add date
      </button>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">Saved.</p>}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save important dates"}
        </button>
      </div>
    </form>
  );
}
