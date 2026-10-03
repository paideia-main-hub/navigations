"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { pathwayLabels, type CompetitionSummary } from "@/domain/competitions/types";
import { resolveCompetitionCardImage } from "@/domain/competitions/cardImage";
import { resolveAwardCardImage } from "@/domain/awards/cardImage";
import { layerLabels, type AwardCategory } from "@/domain/awards/types";
import { OrbitCardStack, type OrbitStackItem } from "@/ui/components/marketing/OrbitCardStack";
import { SectionHeading } from "@/ui/components/marketing/SectionHeading";

type Route = 1 | 2;

function entryTypeLabel(competition: CompetitionSummary): string {
  if (competition.supportsIndividual && competition.supportsTeam) return "Individual & Team";
  if (competition.supportsTeam) return "Team";
  return "Individual";
}

function competitionToItem(competition: CompetitionSummary): OrbitStackItem {
  return {
    id: competition.id,
    href: `/competitions/${competition.slug}`,
    name: competition.title,
    eyebrow: competition.pathway ? pathwayLabels[competition.pathway] : competition.domain || "Competition",
    description: competition.shortDescription,
    stat: entryTypeLabel(competition),
    image: resolveCompetitionCardImage(competition.imageUrl),
  };
}

function awardToItem(category: AwardCategory): OrbitStackItem {
  return {
    id: category.id,
    href: `/awards/${category.slug}`,
    name: category.title,
    eyebrow: layerLabels[category.layer],
    description: category.description,
    stat: category.allowsIndependent ? "School & Independent" : "School Only",
    image: resolveAwardCardImage(category.imageUrl, category.slug),
  };
}

export function ExploreCompetitionsToggle({
  competitions,
  awardCategories,
}: {
  competitions: CompetitionSummary[];
  awardCategories: AwardCategory[];
}) {
  const [route, setRoute] = useState<Route>(1);
  const tabListRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const list = tabListRef.current;
    if (!list) return;

    const place = () => {
      const selected = list.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!selected) return;
      setPill({ x: selected.offsetLeft, width: selected.offsetWidth });
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [route]);

  return (
    <div>
      <SectionHeading eyebrow="Competition Directory" title="Explore Competitions" />
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="Ways to participate"
        className="relative inline-flex rounded-lg border border-border bg-surface p-1"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1 bottom-1 left-0 rounded-md bg-accent transition-[transform,width] duration-300 ease-out motion-reduce:transition-none"
          style={pill ? { width: pill.width, transform: `translateX(${pill.x}px)` } : { opacity: 0 }}
        />
        {([1, 2] as Route[]).map((r) => (
          <button
            key={r}
            role="tab"
            type="button"
            aria-selected={route === r}
            onClick={() => setRoute(r)}
            className={`relative z-10 cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
              route === r ? "text-accent-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            Route {r}
            <span className="hidden sm:inline">{r === 1 ? " · Competitions" : " · Nominee Submissions"}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" className="pt-12">
        {route === 1 ? (
          <OrbitCardStack
            ariaLabel="Featured competitions"
            items={competitions.map(competitionToItem)}
            viewAllHref="/competitions"
            viewAllLabel="View all competitions"
          />
        ) : (
          <>
            <OrbitCardStack
              ariaLabel="Open award nominations"
              items={awardCategories.map(awardToItem)}
              viewAllHref="/awards"
              viewAllLabel="View all awards"
            />
            {awardCategories.length === 0 && (
              <p className="py-12 text-center text-sm text-muted">No award categories are open for submissions right now.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
