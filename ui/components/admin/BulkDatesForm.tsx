"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { bulkSavePathwayScheduleAction, type ActionState } from "@/domain/competitions/actions";
import {
  allowedEventTypes,
  pathwayAllowsOnlineSubmissionToggle,
  pathwayRequiresOnlineSubmission,
  pathwayRequiresVenue,
} from "@/domain/competitions/pathwayDateRules";
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

type PathwayScope = CompetitionPathway | "all" | "";

const ALL_CATEGORY_DATE_TYPES: EventType[] = [
  "registration_close",
  "round",
  "submission_deadline",
  "result_date",
  "final_event",
];

function datesForType(competition: CompetitionSummary, eventType: EventType): string {
  const matches = competition.events
    .filter((e) => e.type === eventType)
    .map((e) => formatEventDateOnly(e.eventDate))
    .filter(Boolean);
  return matches.length > 0 ? matches.join(", ") : "—";
}

export function BulkDatesForm({ competitions }: { competitions: CompetitionSummary[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(bulkSavePathwayScheduleAction, initialState);
  const [pathway, setPathway] = useState<PathwayScope>("");
  const [hasOnlineSubmission, setHasOnlineSubmission] = useState(false);
  const [applyVenue, setApplyVenue] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [fieldsKey, setFieldsKey] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [flashError, setFlashError] = useState<string | null>(null);
  const wasPending = useRef(false);

  const allCategories = pathway === "all";
  const pathwayOrNull = pathway === "all" || pathway === "" ? null : pathway;
  const showVenue = allCategories || pathwayRequiresVenue(pathwayOrNull);
  const showOnlineToggle = allCategories || pathwayAllowsOnlineSubmissionToggle(pathwayOrNull);
  const onlineForced = !allCategories && pathwayRequiresOnlineSubmission(pathwayOrNull);
  const effectiveOnline = onlineForced || (showOnlineToggle && hasOnlineSubmission);

  const scheduleTypes = useMemo(() => {
    if (allCategories) return ALL_CATEGORY_DATE_TYPES;
    return allowedEventTypes(pathwayOrNull, effectiveOnline).filter((t) => t !== "other");
  }, [allCategories, pathwayOrNull, effectiveOnline]);

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
    setQuery("");
    setApplyVenue(false);
    setHasOnlineSubmission(onlineForced);
    setFieldsKey((k) => k + 1);
    router.refresh();
  }, [pending, state.error, state.success, state.message, onlineForced, router]);

  useEffect(() => {
    if (onlineForced) setHasOnlineSubmission(true);
    else if (pathway === "live_response") setHasOnlineSubmission(false);
    else setHasOnlineSubmission(false);
    setApplyVenue(false);
    setSelected(new Set());
  }, [pathway, onlineForced]);

  const hasSelection = selected.size > 0;

  useEffect(() => {
    if (!hasSelection && !onlineForced) setHasOnlineSubmission(false);
  }, [hasSelection, onlineForced]);

  const filtered = useMemo(() => {
    if (!pathway) return [];
    const q = query.trim().toLowerCase();
    return competitions.filter((c) => {
      if (!allCategories && c.pathway !== pathway) return false;
      if (!q) return true;
      return c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
    });
  }, [competitions, pathway, query, allCategories]);

  const filteredIds = useMemo(() => filtered.map((c) => c.id), [filtered]);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));

  useEffect(() => {
    const allowed = new Set(filteredIds);
    setSelected((prev) => {
      let changed = false;
      const next = new Set<string>();
      for (const id of prev) {
        if (allowed.has(id)) next.add(id);
        else changed = true;
      }
      return changed ? next : prev;
    });
  }, [filteredIds]);

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
    <form action={formAction} className="space-y-4">
      {flashError && <p className="text-sm text-red-600 dark:text-red-400">{flashError}</p>}
      {flash && <p className="text-sm text-emerald-600 dark:text-emerald-400">{flash}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(20rem,26rem)_minmax(0,1fr)] lg:items-start">
        {/* Settings column */}
        <div className="space-y-4 rounded-xl border border-border bg-surface p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <p className="text-sm text-muted">
            Pick a participation category (or all categories), fill the dates and settings that apply, then apply
            everything to the selected competitions in one save. Leave a date blank to leave that milestone unchanged.
          </p>

          <div>
            <label className="text-sm font-medium text-foreground">Participation category</label>
            <select
              name="pathway"
              value={pathway}
              onChange={(e) => setPathway(e.target.value as PathwayScope)}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Choose a category…</option>
              <option value="all">All categories</option>
              {pathwayOrder.map((value) => (
                <option key={value} value={value}>
                  {pathwayLabels[value]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted">
              {allCategories
                ? "Lists every competition. Each date or setting is written only onto competitions whose category allows it."
                : "Only competitions already assigned to this category are listed. Date slots match that category’s rules."}
            </p>
          </div>

          {pathway ? (
            <>
              {showVenue ? (
                <div className="rounded-xl border border-border bg-background p-3">
                  <label className="flex items-start gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      name="apply_venue"
                      checked={applyVenue}
                      onChange={(e) => setApplyVenue(e.target.checked)}
                      className="mt-0.5 rounded border-border"
                    />
                    <span>
                      <span className="font-medium">Apply venue to selected</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {allCategories
                          ? "Writes the venue onto selected competitions that use a physical venue (not Independent Submission)."
                          : "Check this to write the venue below onto every selected competition."}
                      </span>
                    </span>
                  </label>
                  <input
                    name="venue"
                    key={`venue-${fieldsKey}`}
                    disabled={!applyVenue}
                    placeholder="e.g. Expo Centre, Lahore"
                    className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground disabled:opacity-50"
                  />
                </div>
              ) : null}

              {showOnlineToggle ? (
                <div
                  className={`rounded-xl border border-border bg-background p-3 ${
                    hasSelection ? "" : "opacity-60"
                  }`}
                >
                  {hasSelection ? <input type="hidden" name="apply_online" value="on" /> : null}
                  {hasSelection && hasOnlineSubmission ? (
                    <input type="hidden" name="has_online_submission" value="on" />
                  ) : null}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">Online submission for selected</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {!hasSelection
                          ? "Select one or more competitions on the right to turn this on or off."
                          : allCategories
                            ? hasOnlineSubmission
                              ? "On — Applied Skills / Project Showcase get online upload + an online submission date. Independent stays online; Live stays offline."
                              : "Off — clears online upload on Applied Skills / Project Showcase. Independent stays online; Live stays offline."
                            : hasOnlineSubmission
                              ? "On — selected competitions accept online work, and an online submission date is included below."
                              : "Off — no online upload; any existing submission deadlines on selected competitions are cleared."}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={hasOnlineSubmission}
                      aria-disabled={!hasSelection}
                      disabled={!hasSelection}
                      aria-label="Online submission for selected competitions"
                      onClick={() => {
                        if (!hasSelection) return;
                        setHasOnlineSubmission((v) => !v);
                      }}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-not-allowed ${
                        hasOnlineSubmission && hasSelection ? "bg-accent" : "bg-border"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
                          hasOnlineSubmission && hasSelection ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ) : null}

              {onlineForced ? (
                <p className="rounded-xl border border-border bg-surface-muted/60 px-4 py-3 text-sm text-muted">
                  Independent Submission always includes online work upload — no contest venue day.
                </p>
              ) : null}

              {allCategories ? (
                <p className="rounded-xl border border-border bg-surface-muted/60 px-4 py-3 text-sm text-muted">
                  All categories: each filled date is applied only where that category allows it (for example, contest day
                  skips Independent Submission; online submission date skips Live Performances unless online is on for
                  Applied Skills / Project Showcase).
                </p>
              ) : null}

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Dates to apply</p>
                <div className="grid gap-3">
                  {scheduleTypes.map((type) => (
                    <div key={type} className="rounded-xl border border-border bg-background p-3">
                      <label className="text-sm font-medium text-foreground">{eventTypeAdminLabels[type]}</label>
                      <p className="mt-0.5 text-xs text-muted">{eventTypeHints[type]}</p>
                      <input
                        key={`date-${type}-${fieldsKey}`}
                        name={`date[${type}]`}
                        type="date"
                        className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
                      />
                      <input
                        key={`title-${type}-${fieldsKey}`}
                        name={`title[${type}]`}
                        defaultValue={eventTypeAdminLabels[type]}
                        placeholder="Title on competition page"
                        className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Description (optional note)</label>
                <input
                  key={`description-${fieldsKey}`}
                  name="description"
                  placeholder="Short note under each date title you set above"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
            </>
          ) : null}

          <button
            type="submit"
            disabled={pending || !pathway || selected.size === 0}
            className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending
              ? "Saving…"
              : `Apply to ${selected.size || "selected"} competition${selected.size === 1 ? "" : "s"}`}
          </button>
        </div>

        {/* Competitions table column */}
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Competitions</h2>
              <p className="text-sm text-muted">
                {!pathway
                  ? "Choose a category to list competitions."
                  : `${selected.size} selected · ${filtered.length} ${
                      allCategories ? "across all categories" : `in ${pathwayLabels[pathway]}`
                    }`}
              </p>
            </div>
            {pathway ? (
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or slug…"
                className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground sm:w-64"
              />
            ) : null}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            {!pathway ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                Select a participation category to see its competitions and date columns.
              </p>
            ) : (
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
                    <th className="px-4 py-3 font-medium">Venue</th>
                    <th className="px-4 py-3 font-medium">Online submission</th>
                    {ALL_CATEGORY_DATE_TYPES.map((eventType) => (
                      <th
                        key={eventType}
                        title={eventTypeAdminLabels[eventType]}
                        className="px-4 py-3 font-medium whitespace-nowrap"
                      >
                        {eventTypeLabels[eventType]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6 + ALL_CATEGORY_DATE_TYPES.length}
                        className="px-4 py-8 text-center text-muted"
                      >
                        No competitions
                        {allCategories ? "" : " in this category"}
                        {query.trim() ? " match your search" : " yet"}.
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
                        <td className="px-4 py-3 text-muted whitespace-nowrap">{c.venue || "—"}</td>
                        <td className="px-4 py-3 text-muted whitespace-nowrap">
                          {c.hasOnlineSubmission ? "Yes" : "No"}
                        </td>
                        {ALL_CATEGORY_DATE_TYPES.map((eventType) => (
                          <td key={eventType} className="px-4 py-3 text-muted whitespace-nowrap">
                            {datesForType(c, eventType)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
