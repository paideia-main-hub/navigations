"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { bulkSaveIndividualEventsAction, type ActionState } from "@/domain/competitions/actions";
import { competitionAllowsEventType } from "@/domain/competitions/pathwayDateRules";
import {
  allEventTypes,
  eventTypeAdminLabels,
  eventTypeHints,
  pathwayLabels,
  statusLabels,
  type CompetitionSummary,
  type EventType,
} from "@/domain/competitions/types";
import { DateField } from "@/ui/components/DateField";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { formatEventDateOnly, toDateInputValue } from "@/ui/components/admin/eventDateFormat";

const initialState: ActionState = { error: null };

const DATE_TYPES: EventType[] = allEventTypes.filter((t) => t !== "other");

export function RandomDatesForm({ competitions }: { competitions: CompetitionSummary[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(bulkSaveIndividualEventsAction, initialState);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<EventType>("registration_close");
  const [title, setTitle] = useState(eventTypeAdminLabels.registration_close);
  const [selected, setSelected] = useState<string[]>([]);
  const [dates, setDates] = useState<Record<string, string>>({});
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
    setSelected([]);
    setDates({});
    setQuery("");
    setType("registration_close");
    setTitle(eventTypeAdminLabels.registration_close);
    setFieldsKey((k) => k + 1);
    router.refresh();
  }, [pending, state.error, state.success, state.message, router]);

  const byId = useMemo(() => new Map(competitions.map((c) => [c.id, c])), [competitions]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return competitions.filter(
      (c) =>
        competitionAllowsEventType(c.pathway, c.hasOnlineSubmission, type) &&
        (c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)),
    );
  }, [competitions, query, type]);

  const selectedCompetitions = useMemo(
    () => selected.map((id) => byId.get(id)).filter((c): c is CompetitionSummary => Boolean(c)),
    [selected, byId],
  );

  function setTypeAndTitle(next: EventType) {
    setType(next);
    setTitle(eventTypeAdminLabels[next]);
    setDates((prev) => {
      const updated = { ...prev };
      for (const id of selected) {
        const existing = byId.get(id)?.events.find((e) => e.type === next);
        updated[id] = toDateInputValue(existing?.eventDate) || prev[id] || "";
      }
      return updated;
    });
  }

  function toggle(id: string) {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((x) => x !== id));
      return;
    }
    const existing = byId.get(id)?.events.find((e) => e.type === type);
    setDates((d) => ({ ...d, [id]: d[id] || toDateInputValue(existing?.eventDate) }));
    setSelected((prev) => [...prev, id]);
  }

  function removeSelected(id: string) {
    setSelected((prev) => prev.filter((x) => x !== id));
  }

  function setDate(id: string, value: string) {
    setDates((prev) => ({ ...prev, [id]: value }));
  }

  const allResultsSelected = results.length > 0 && results.every((c) => selected.includes(c.id));

  function toggleAllResults() {
    if (allResultsSelected) {
      const resultIds = new Set(results.map((c) => c.id));
      setSelected((prev) => prev.filter((id) => !resultIds.has(id)));
      return;
    }
    const nextDates = { ...dates };
    const next = [...selected];
    for (const c of results) {
      if (!next.includes(c.id)) {
        next.push(c.id);
        const existing = c.events.find((e) => e.type === type);
        nextDates[c.id] = nextDates[c.id] || toDateInputValue(existing?.eventDate);
      }
    }
    setDates(nextDates);
    setSelected(next);
  }

  return (
    <form action={formAction} className="space-y-6">
      {flashError && <p className="text-sm text-red-600 dark:text-red-400">{flashError}</p>}
      {flash && <p className="text-sm text-emerald-600 dark:text-emerald-400">{flash}</p>}

      <div className="max-w-2xl space-y-4 rounded-xl border border-border bg-surface p-4">
        <p className="text-sm text-muted">
          Search and pick competitions, then give each one its own date for the same type — useful when dates
          differ and you do not want to open every competition editor.
        </p>

        <div>
          <label className="text-sm font-medium text-foreground">Live search</label>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a competition title or slug…"
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Type (what this date is for)</label>
          <select
            name="type"
            value={type}
            onChange={(e) => setTypeAndTitle(e.target.value as EventType)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            {DATE_TYPES.map((value) => (
              <option key={value} value={value}>
                {eventTypeAdminLabels[value]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">{eventTypeHints[type]}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">
            Title (shown on competition pages)
            <RequiredMark />
          </label>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            <h2 className="text-lg font-semibold text-foreground">Search results</h2>
            <p className="text-sm text-muted">
              {query.trim()
                ? `${results.length} match${results.length === 1 ? "" : "es"} · ${selected.length} selected`
                : "Start typing to find competitions"}
            </p>
          </div>
          {results.length > 0 && (
            <button
              type="button"
              onClick={toggleAllResults}
              className="text-sm font-semibold text-accent"
            >
              {allResultsSelected ? "Clear results selection" : "Select all results"}
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          {!query.trim() ? (
            <p className="px-4 py-8 text-center text-sm text-muted">Type in the search box to list competitions.</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">No competitions match “{query.trim()}”.</p>
          ) : (
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-4 py-3 font-medium">Select</th>
                  <th className="px-4 py-3 font-medium">Competition</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Venue</th>
                  <th className="px-4 py-3 font-medium">Online submission</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Current {eventTypeAdminLabels[type]}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((c) => {
                  const existing = c.events.find((e) => e.type === type);
                  const isSelected = selected.includes(c.id);
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
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
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{c.venue || "—"}</td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">
                        {c.hasOnlineSubmission ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-3 text-muted">{statusLabels[c.status]}</td>
                      <td className="px-4 py-3 text-muted">
                        {existing ? formatEventDateOnly(existing.eventDate) : "Not set"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedCompetitions.length > 0 && (
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Dates to set</h2>
            <p className="text-sm text-muted">
              {selectedCompetitions.length} selected out of {competitions.length} — enter a date for each
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-4 py-3 font-medium">Competition</th>
                  <th className="px-4 py-3 font-medium">
                    Date
                    <RequiredMark />
                  </th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {selectedCompetitions.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <input type="hidden" name="competition_id" value={c.id} />
                      <p className="font-medium text-foreground">{c.title}</p>
                      <p className="text-xs text-muted">/{c.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <DateField
                        name={`eventDate[${c.id}]`}
                        label={`${c.title} date`}
                        required
                        value={dates[c.id] ?? ""}
                        onChange={(next) => setDate(c.id, next)}
                        className="max-w-xs"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeSelected(c.id)}
                        className="text-sm font-medium text-red-600 dark:text-red-400"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={pending || selectedCompetitions.length === 0}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending
          ? "Saving…"
          : `Set dates for ${selectedCompetitions.length || "selected"} competition${selectedCompetitions.length === 1 ? "" : "s"}`}
      </button>
    </form>
  );
}
