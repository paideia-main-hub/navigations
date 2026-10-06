"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { bulkSaveEventsAction, type ActionState } from "@/domain/competitions/actions";
import {
  eventTypeAdminLabels,
  eventTypeHints,
  eventTypeLabels,
  pathwayLabels,
  pathwayOrder,
  statusLabels,
  type CompetitionPathway,
  type CompetitionSummary,
  type EventType,
} from "@/domain/competitions/types";
import { formatEventDateOnly } from "@/ui/components/admin/eventDateFormat";

const initialState: ActionState = { error: null };

const BULK_TYPES: EventType[] = ["registration_close", "round", "result_date", "final_event", "other"];
type PathwayFilter = CompetitionPathway | "regardless";

function datesForType(competition: CompetitionSummary, eventType: EventType): string {
  const matches = competition.events
    .filter((e) => e.type === eventType)
    .map((e) => formatEventDateOnly(e.eventDate))
    .filter(Boolean);
  return matches.length > 0 ? matches.join(", ") : "—";
}

export function BulkDatesForm({ competitions }: { competitions: CompetitionSummary[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(bulkSaveEventsAction, initialState);
  const [type, setType] = useState<EventType>("registration_close");
  const [title, setTitle] = useState(eventTypeAdminLabels.registration_close);
  const [pathway, setPathway] = useState<PathwayFilter>("regardless");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [fieldsKey, setFieldsKey] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [flashError, setFlashError] = useState<string | null>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (pending) {
      wasPending.current = true;
      setFlash(null);
      setFlashError(null);
      return;
    }
    if (!wasPending.current) return;
    wasPending.current = false;

    if (state.error) {
      setFlashError(state.error);
      return;
    }
    if (!state.success) return;

    setFlash(state.message ?? "Saved.");
    setSelected(new Set());
    setPathway("regardless");
    setQuery("");
    setType("registration_close");
    setTitle(eventTypeAdminLabels.registration_close);
    setFieldsKey((k) => k + 1);
    router.refresh();
  }, [pending, state.error, state.success, state.message, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return competitions.filter((c) => {
      const matchesPathway = pathway === "regardless" || c.pathway === pathway;
      if (!matchesPathway) return false;
      if (!q) return true;
      return c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
    });
  }, [competitions, pathway, query]);

  const filteredIds = useMemo(() => filtered.map((c) => c.id), [filtered]);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));

  function setTypeAndTitle(next: EventType) {
    setType(next);
    setTitle(eventTypeAdminLabels[next]);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllFiltered() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        for (const id of filteredIds) next.delete(id);
      } else {
        for (const id of filteredIds) next.add(id);
      }
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      {flashError && <p className="text-sm text-red-600 dark:text-red-400">{flashError}</p>}
      {flash && <p className="text-sm text-emerald-600 dark:text-emerald-400">{flash}</p>}

      <div className="max-w-2xl space-y-4 rounded-xl border border-border bg-surface p-4">
        <p className="text-sm text-muted">
          Set one date type across many competitions at once. Existing dates of that type on the selected
          competitions are replaced; other date types are left unchanged.
        </p>

        <div>
          <label className="text-sm font-medium text-foreground">Participation category</label>
          <select
            value={pathway}
            onChange={(e) => setPathway(e.target.value as PathwayFilter)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="regardless">Regardless of category</option>
            {pathwayOrder.map((value) => (
              <option key={value} value={value}>
                {pathwayLabels[value]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">
            Filters which competitions appear below. “Regardless of category” shows every competition.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Type (what this date is for)</label>
          <select
            name="type"
            value={type}
            onChange={(e) => setTypeAndTitle(e.target.value as EventType)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            {BULK_TYPES.map((value) => (
              <option key={value} value={value}>
                {eventTypeAdminLabels[value]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">{eventTypeHints[type]}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Title (shown on competition pages)</label>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Date</label>
          <input
            key={`eventDate-${fieldsKey}`}
            name="eventDate"
            type="date"
            required
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Description (optional note)</label>
          <input
            key={`description-${fieldsKey}`}
            name="description"
            placeholder="Short note under the title"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Competitions</h2>
            <p className="text-sm text-muted">
              {selected.size} selected out of {competitions.length}
              {filtered.length !== competitions.length ? ` · ${filtered.length} shown` : ""}
            </p>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or slug…"
            className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground sm:w-64"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAllFiltered}
                      className="rounded border-border"
                    />
                    <span>Select</span>
                  </label>
                </th>
                <th className="px-4 py-3 font-medium">Competition</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {BULK_TYPES.map((eventType) => (
                  <th
                    key={eventType}
                    title={eventTypeAdminLabels[eventType]}
                    className={`px-4 py-3 font-medium whitespace-nowrap ${
                      eventType === type ? "bg-accent-soft text-foreground" : ""
                    }`}
                  >
                    {eventTypeLabels[eventType]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4 + BULK_TYPES.length} className="px-4 py-8 text-center text-muted">
                    No competitions match this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        name="competition_id"
                        value={c.id}
                        checked={selected.has(c.id)}
                        onChange={() => toggle(c.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{c.title}</p>
                      <p className="text-xs text-muted">/{c.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {c.pathway ? pathwayLabels[c.pathway] : "Not set"}
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{statusLabels[c.status]}</td>
                    {BULK_TYPES.map((eventType) => (
                      <td
                        key={eventType}
                        className={`px-4 py-3 whitespace-nowrap ${
                          eventType === type ? "bg-accent-soft/50 text-foreground" : "text-muted"
                        }`}
                      >
                        {datesForType(c, eventType)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending || selected.size === 0}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : `Apply to ${selected.size || "selected"} competition${selected.size === 1 ? "" : "s"}`}
      </button>
    </form>
  );
}
