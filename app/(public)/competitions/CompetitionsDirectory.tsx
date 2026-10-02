"use client";

import { useMemo, useState } from "react";
import { layerLabels, routeTwoLayers, type AwardLayer } from "@/domain/awards/types";
import { competencyLabel, sortCompetencies } from "@/domain/competitions/competencies";
import { filterCompetitionsClientSide } from "@/domain/competitions/service";
import {
  categoryLabels,
  pathwayLabels,
  pathwayOrder,
  publicStatuses,
  statusLabels,
  type AgeCategory,
  type CompetitionPathway,
  type CompetitionStatus,
  type CompetitionSummary,
} from "@/domain/competitions/types";
import { CompetitionCard } from "@/ui/components/CompetitionCard";
import { AwardExpandGrid } from "@/ui/components/awards/AwardExpandGrid";
import type { AwardDetail } from "@/ui/components/awards/awardDetails";

type SortOption = "deadline" | "event-date" | "alphabetical";
export type Route = "1" | "2";

type Applicant = "independent" | "school";
type NominationStatus = "open" | "all";

/** Spotlight is the only Route 2 layer that takes independent applications;
 * Teacher & Parent and Sports are school nomination only. */
function applicantsFor(layer: AwardLayer): Applicant[] {
  return layer === "spotlight" ? ["independent", "school"] : ["school"];
}

const selectClass = "rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground";

function RouteToggle({ route, onChange }: { route: Route; onChange: (route: Route) => void }) {
  const options: { value: Route; label: string; hint: string }[] = [
    { value: "1", label: "Route 1", hint: "Competitions" },
    { value: "2", label: "Route 2", hint: "Special recognition awards" },
  ];
  return (
    <div role="tablist" aria-label="Participation route" className="mb-6 inline-flex rounded-full border border-border bg-surface p-1 shadow-sm">
      {options.map((o) => {
        const active = route === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              active ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {o.label}
            <span className={`ml-2 hidden font-medium sm:inline ${active ? "opacity-90" : "opacity-70"}`}>· {o.hint}</span>
          </button>
        );
      })}
    </div>
  );
}

function AwardsDirectory({ awards, openSlugs }: { awards: AwardDetail[]; openSlugs: Set<string> }) {
  const [query, setQuery] = useState("");
  const [layer, setLayer] = useState<AwardLayer | "all">("all");
  const [applicant, setApplicant] = useState<Applicant | "all">("all");
  const [status, setStatus] = useState<NominationStatus>("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return awards.filter(
      (a) =>
        (!q || a.title.toLowerCase().includes(q)) &&
        (layer === "all" || a.layer === layer) &&
        (applicant === "all" || applicantsFor(a.layer).includes(applicant)) &&
        (status === "all" || openSlugs.has(a.slug)),
    );
  }, [awards, openSlugs, query, layer, applicant, status]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by award name…"
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
        <select
          value={layer}
          onChange={(e) => setLayer(e.target.value as AwardLayer | "all")}
          aria-label="Filter by award category"
          className={selectClass}
        >
          <option value="all">All award categories</option>
          {routeTwoLayers.map((l) => (
            <option key={l} value={l}>
              {layerLabels[l]}
            </option>
          ))}
        </select>
        <select
          value={applicant}
          onChange={(e) => setApplicant(e.target.value as Applicant | "all")}
          aria-label="Filter by who can apply"
          className={selectClass}
        >
          <option value="all">Anyone who can apply</option>
          <option value="independent">Open to independent applicants</option>
          <option value="school">School nomination</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as NominationStatus)}
          aria-label="Filter by nomination status"
          className={selectClass}
        >
          <option value="all">Any nomination status</option>
          <option value="open">Open for nomination now</option>
        </select>
      </div>

      <p className="mb-4 text-sm text-muted">
        {results.length} award{results.length === 1 ? "" : "s"} found
      </p>

      {results.length > 0 ? (
        <AwardExpandGrid awards={results} openSlugs={openSlugs} />
      ) : (
        <p className="py-12 text-center text-sm text-muted">No awards match your filters.</p>
      )}
    </div>
  );
}

export function CompetitionsDirectory({
  initialRoute = "1",
  initialQuery,
  initialCategory = "all",
  initialPathway = "all",
  initialStatus = "all",
  competitions,
  awards,
  openAwardSlugs,
}: {
  initialRoute?: Route;
  initialQuery: string;
  initialCategory?: AgeCategory | "all";
  initialPathway?: CompetitionPathway | "all";
  initialStatus?: CompetitionStatus | "all";
  competitions: CompetitionSummary[];
  awards: AwardDetail[];
  openAwardSlugs: string[];
}) {
  const [route, setRoute] = useState<Route>(initialRoute);
  const openSlugs = useMemo(() => new Set(openAwardSlugs), [openAwardSlugs]);

  // Mirrors the chosen route into the URL so a shared or refreshed link lands
  // on the same route, without a navigation (the filters are client-side).
  function changeRoute(next: Route) {
    setRoute(next);
    const url = new URL(window.location.href);
    if (next === "2") url.searchParams.set("route", "2");
    else url.searchParams.delete("route");
    window.history.replaceState(null, "", url);
  }

  return (
    <div>
      <RouteToggle route={route} onChange={changeRoute} />
      {route === "2" ? (
        <AwardsDirectory awards={awards} openSlugs={openSlugs} />
      ) : (
        <CompetitionsGrid
          initialQuery={initialQuery}
          initialCategory={initialCategory}
          initialPathway={initialPathway}
          initialStatus={initialStatus}
          competitions={competitions}
        />
      )}
    </div>
  );
}

function CompetitionsGrid({
  initialQuery,
  initialCategory,
  initialPathway,
  initialStatus,
  competitions,
}: {
  initialQuery: string;
  initialCategory: AgeCategory | "all";
  initialPathway: CompetitionPathway | "all";
  initialStatus: CompetitionStatus | "all";
  competitions: CompetitionSummary[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<AgeCategory | "all">(initialCategory);
  const [pathway, setPathway] = useState<CompetitionPathway | "all">(initialPathway);
  const [competency, setCompetency] = useState<string>("all");
  const [status, setStatus] = useState<CompetitionStatus | "all">(initialStatus);
  const [sort, setSort] = useState<SortOption>("deadline");

  // Only competencies at least one competition is tagged with, so no option
  // leads to an empty result.
  const competencyOptions = useMemo(
    () => sortCompetencies([...new Set(competitions.flatMap((c) => c.competencies))]),
    [competitions],
  );

  const results = useMemo(
    () => filterCompetitionsClientSide(competitions, { query, category, pathway, competency, status, sort }),
    [competitions, query, category, pathway, competency, status, sort],
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by competition name…"
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
        <select
          value={pathway}
          onChange={(e) => setPathway(e.target.value as CompetitionPathway | "all")}
          aria-label="Filter by Route 1 category"
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
        >
          <option value="all">All Route 1 categories</option>
          {pathwayOrder.map((p) => (
            <option key={p} value={p}>
              {pathwayLabels[p]}
            </option>
          ))}
        </select>
        {competencyOptions.length > 0 && (
          <select
            value={competency}
            onChange={(e) => setCompetency(e.target.value)}
            aria-label="Filter by competency"
            className={selectClass}
          >
            <option value="all">All competencies</option>
            {competencyOptions.map((v) => (
              <option key={v} value={v}>
                {competencyLabel(v)}
              </option>
            ))}
          </select>
        )}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as AgeCategory | "all")}
          aria-label="Filter by grade category"
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
        >
          <option value="all">All grade categories</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as CompetitionStatus | "all")}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
        >
          <option value="all">Any status</option>
          {publicStatuses.map((value) => (
            <option key={value} value={value}>
              {statusLabels[value]}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
        >
          <option value="deadline">Registration closing soon</option>
          <option value="event-date">Event date</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      <p className="mb-4 text-sm text-muted">
        {results.length} competition{results.length === 1 ? "" : "s"} found
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((c) => (
          <CompetitionCard key={c.slug} competition={c} />
        ))}
        {results.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted">
            No competitions match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
