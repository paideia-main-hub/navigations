"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { layerLabels, routeTwoLayers, type AwardLayer } from "@/domain/awards/types";
import { competencyName, sortCompetencies } from "@/domain/competitions/competencies";
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
import { FilterSelect, filterInputClass } from "@/ui/components/FilterSelect";
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

function RouteToggle({ route, onChange }: { route: Route; onChange: (route: Route) => void }) {
  const options: { value: Route; label: string; hint: string }[] = [
    { value: "1", label: "Route 1", hint: "Competitions" },
    { value: "2", label: "Route 2", hint: "Special recognition awards" },
  ];
  const tabListRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const list = tabListRef.current;
    if (!list) return;

    const place = () => {
      const selected = list.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!selected) return;
      setPill({
        x: selected.offsetLeft,
        y: selected.offsetTop,
        width: selected.offsetWidth,
        height: selected.offsetHeight,
      });
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [route]);

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-label="Participation route"
      className="relative mb-6 inline-flex items-center rounded-full border border-border bg-surface p-1.5 shadow-sm"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 rounded-full bg-accent transition-[transform,width,height] duration-300 ease-out motion-reduce:transition-none"
        style={
          pill
            ? { width: pill.width, height: pill.height, transform: `translate(${pill.x}px, ${pill.y}px)` }
            : { opacity: 0 }
        }
      />
      {options.map((o) => {
        const active = route === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            style={{ cursor: "pointer" }}
            className={`relative z-10 cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300 ${
              active ? "text-accent-foreground" : "text-muted hover:text-foreground"
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
      <div className="mb-8 space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by award name…"
          className={`w-full ${filterInputClass}`}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FilterSelect
            value={layer}
            onChange={(next) => setLayer(next as AwardLayer | "all")}
            aria-label="Filter by award category"
            className="w-full"
            options={[
              { value: "all", label: "All award categories" },
              ...routeTwoLayers.map((l) => ({ value: l, label: layerLabels[l] })),
            ]}
          />
          <FilterSelect
            value={applicant}
            onChange={(next) => setApplicant(next as Applicant | "all")}
            aria-label="Filter by who can apply"
            className="w-full"
            options={[
              { value: "all", label: "Anyone who can apply" },
              { value: "independent", label: "Open to independent applicants" },
              { value: "school", label: "School nomination" },
            ]}
          />
          <FilterSelect
            value={status}
            onChange={(next) => setStatus(next as NominationStatus)}
            aria-label="Filter by nomination status"
            className="w-full"
            options={[
              { value: "all", label: "Any nomination status" },
              { value: "open", label: "Open for nomination now" },
            ]}
          />
        </div>
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
      <div className="mb-8 space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by competition name…"
          className={`w-full ${filterInputClass}`}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <FilterSelect
            value={pathway}
            onChange={(next) => setPathway(next as CompetitionPathway | "all")}
            aria-label="Filter by Route 1 category"
            className="w-full"
            options={[
              { value: "all", label: "All Route 1 categories" },
              ...pathwayOrder.map((p) => ({ value: p, label: pathwayLabels[p] })),
            ]}
          />
          {competencyOptions.length > 0 && (
            <FilterSelect
              value={competency}
              onChange={setCompetency}
              aria-label="Filter by competency"
              className="w-full"
              searchable
              searchPlaceholder="Search competencies…"
              options={[
                { value: "all", label: "All competencies" },
                ...competencyOptions.map((v) => ({ value: v, label: competencyName(v) })),
              ]}
            />
          )}
          <FilterSelect
            value={category}
            onChange={(next) => setCategory(next as AgeCategory | "all")}
            aria-label="Filter by grade category"
            className="w-full"
            options={[
              { value: "all", label: "All grade categories" },
              ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
            ]}
          />
          <FilterSelect
            value={status}
            onChange={(next) => setStatus(next as CompetitionStatus | "all")}
            aria-label="Filter by status"
            className="w-full"
            options={[
              { value: "all", label: "Any status" },
              ...publicStatuses.map((value) => ({ value, label: statusLabels[value] })),
            ]}
          />
          <FilterSelect
            value={sort}
            onChange={(next) => setSort(next as SortOption)}
            aria-label="Sort competitions"
            className="w-full"
            options={[
              { value: "deadline", label: "Registration closing soon" },
              { value: "event-date", label: "Event date" },
              { value: "alphabetical", label: "Alphabetical" },
            ]}
          />
        </div>
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
