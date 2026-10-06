"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { saveEventsAction, type ActionState } from "@/domain/competitions/actions";
import { allowedEventTypes } from "@/domain/competitions/pathwayDateRules";
import {
  eventTypeAdminLabels,
  eventTypeHints,
  pathwayLabels,
  type Competition,
  type CompetitionEvent,
  type EventType,
} from "@/domain/competitions/types";
const initialState: ActionState = { error: null };

type DraftEvent = Partial<CompetitionEvent> & { type: EventType };

function toLocalInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildRows(competition: Competition): DraftEvent[] {
  const allowed = allowedEventTypes(competition.pathway, competition.hasOnlineSubmission);
  return allowed.map((type) => {
    const existing = competition.events.find((e) => e.type === type);
    return {
      id: existing?.id,
      type,
      title: existing?.title ?? eventTypeAdminLabels[type],
      eventDate: existing?.eventDate,
      description: existing?.description ?? "",
    };
  });
}

export function CompetitionDatesForm({ competition }: { competition: Competition }) {
  const [state, formAction, pending] = useActionState(saveEventsAction, initialState);
  const [rows, setRows] = useState<DraftEvent[]>(() => buildRows(competition));

  const allowed = useMemo(
    () => allowedEventTypes(competition.pathway, competition.hasOnlineSubmission),
    [competition.pathway, competition.hasOnlineSubmission],
  );

  useEffect(() => {
    setRows(buildRows(competition));
  }, [competition]);

  function updateRow(i: number, patch: Partial<DraftEvent>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <input type="hidden" name="competition_id" value={competition.id} />

      <div className="rounded-xl border border-border bg-surface-muted/60 px-4 py-3 text-sm text-muted">
        {!competition.pathway ? (
          <p>
            Assign a <span className="font-medium text-foreground">participation category</span> on the Overview
            tab so the correct date slots appear for this competition.
          </p>
        ) : (
          <>
            <p className="font-medium text-foreground">
              Dates for {pathwayLabels[competition.pathway]}
              {competition.hasOnlineSubmission ? " · includes online submission" : ""}
            </p>
            <p className="mt-1">
              Each row is one milestone. Leave a date blank to skip it for now — blank rows are not saved.
              {competition.pathway === "independent_submission"
                ? " This category has no contest / venue day."
                : null}
            </p>
            {competition.venue ? (
              <p className="mt-2 text-foreground">
                Venue: <span className="font-medium">{competition.venue}</span>
              </p>
            ) : null}
          </>
        )}
      </div>

      {rows.map((row, i) => {
        const type = row.type;
        return (
          <div key={type} className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
            <input type="hidden" name={`events[${i}][type]`} value={type} />
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">
                {eventTypeAdminLabels[type]}
              </p>
              <p className="mt-1 text-xs text-muted">{eventTypeHints[type]}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Title (shown on the competition page)</label>
              <input
                name={`events[${i}][title]`}
                value={row.title ?? ""}
                onChange={(e) => updateRow(i, { title: e.target.value })}
                placeholder={eventTypeAdminLabels[type]}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Date &amp; time</label>
              <input
                name={`events[${i}][eventDate]`}
                type="datetime-local"
                defaultValue={toLocalInputValue(row.eventDate)}
                key={`${type}-${row.eventDate ?? "empty"}-${competition.updatedAt}`}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Description (optional note)</label>
              <input
                name={`events[${i}][description]`}
                value={row.description ?? ""}
                onChange={(e) => updateRow(i, { description: e.target.value })}
                placeholder="Short note under the title"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
        );
      })}

      {allowed.length === 0 ? (
        <p className="text-sm text-muted">No date slots for this category yet.</p>
      ) : null}

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
