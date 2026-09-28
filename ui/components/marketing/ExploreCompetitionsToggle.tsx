"use client";

import { useState } from "react";
import { pathwayLabels, type CompetitionSummary } from "@/domain/competitions/types";
import { layerLabels, type AwardCategory } from "@/domain/awards/types";
import { OrbitCardStack, type OrbitStackItem } from "@/ui/components/marketing/OrbitCardStack";
import { SectionHeading } from "@/ui/components/marketing/SectionHeading";

type Route = 1 | 2;

function entryTypeLabel(competition: CompetitionSummary): string {
  if (competition.supportsIndividual && competition.supportsTeam) return "Individual & Team";
  if (competition.supportsTeam) return "Team";
  return "Individual";
}

/** An admin-set image wins. Otherwise fall back to the real artwork shipped
 * at public/competitions/<slug>.webp — same convention as CompetitionCard.tsx. */
function competitionToItem(competition: CompetitionSummary): OrbitStackItem {
  return {
    id: competition.id,
    href: `/competitions/${competition.slug}`,
    name: competition.title,
    eyebrow: competition.pathway ? pathwayLabels[competition.pathway] : competition.domain || "Competition",
    description: competition.shortDescription,
    stat: entryTypeLabel(competition),
    image: competition.imageUrl || `/competitions/${competition.slug}.webp`,
  };
}

/** Real artwork shipped at public/awards/<slug>.webp — not every category has
 * one yet (see Competition_Card_Artwork_Index.docx), so OrbitCardStack falls
 * back to an initials tile when the image 404s. */
function awardToItem(category: AwardCategory): OrbitStackItem {
  return {
    id: category.id,
    href: `/awards/${category.slug}`,
    name: category.title,
    eyebrow: layerLabels[category.layer],
    description: category.description,
    stat: category.allowsIndependent ? "School & Independent" : "School Only",
    image: `/awards/${category.slug}.webp`,
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

  return (
    <div>
      <SectionHeading
        eyebrow="Competition Directory"
        title="Explore Competitions"
        action={
          route === 1
            ? { href: "/competitions", label: "View all competitions" }
            : { href: "/awards", label: "View all awards" }
        }
      />
      <div
        role="tablist"
        aria-label="Ways to participate"
        className="inline-flex rounded-lg border border-border bg-surface p-1"
      >
        {([1, 2] as Route[]).map((r) => (
          <button
            key={r}
            role="tab"
            type="button"
            aria-selected={route === r}
            onClick={() => setRoute(r)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
              route === r ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            Route {r}
            <span className="hidden sm:inline">{r === 1 ? " · Competitions" : " · Nominee Submissions"}</span>
          </button>
        ))}
      </div>

      {route === 1 ? (
        <OrbitCardStack ariaLabel="Featured competitions" items={competitions.map(competitionToItem)} />
      ) : (
        <>
          <p className="mt-5 text-sm text-muted">
            {awardCategories.length} award{awardCategories.length === 1 ? "" : "s"} open for nomination
          </p>
          <OrbitCardStack ariaLabel="Open award nominations" items={awardCategories.map(awardToItem)} />
          {awardCategories.length === 0 && (
            <p className="py-12 text-center text-sm text-muted">No award categories are open for submissions right now.</p>
          )}
        </>
      )}
    </div>
  );
}
