import { createClient } from "@/data/supabase/server";
import { listSubmittableCategories } from "@/domain/awards/service";
import { routeTwoLayers } from "@/domain/awards/types";
import { listPublicCompetitions } from "@/domain/competitions/service";
import {
  pathwayOrder,
  publicStatuses,
  type AgeCategory,
  type CompetitionPathway,
  type CompetitionStatus,
} from "@/domain/competitions/types";
import { AWARD_DETAILS } from "@/ui/components/awards/awardDetails";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { CompetitionsDirectory } from "./CompetitionsDirectory";

export const metadata = {
  title: "Competitions | Navigations",
};

const AGE_CATEGORIES: AgeCategory[] = ["primary", "middle", "secondary"];

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ route?: string; q?: string; category?: string; pathway?: string; status?: string }>;
}) {
  const { route, q, category, pathway, status } = await searchParams;
  const supabase = await createClient();
  const [competitions, openCategories] = await Promise.all([listPublicCompetitions(supabase), listSubmittableCategories(supabase)]);
  const routeTwoAwards = AWARD_DETAILS.filter((a) => routeTwoLayers.includes(a.layer));

  const initialCategory = AGE_CATEGORIES.includes(category as AgeCategory) ? (category as AgeCategory) : "all";
  const initialPathway = pathwayOrder.includes(pathway as CompetitionPathway) ? (pathway as CompetitionPathway) : "all";
  const initialStatus = publicStatuses.includes(status as CompetitionStatus) ? (status as CompetitionStatus) : "all";

  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Competition Directory"
        title="Competitions"
        subtitle="Browse Route 1 competitions and Route 2 special recognition awards. Switch routes, then filter by category or status, or search by name."
      />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <CompetitionsDirectory
          initialRoute={route === "2" ? "2" : "1"}
          awards={routeTwoAwards}
          openAwardSlugs={openCategories.map((c) => c.slug)}
          initialQuery={q ?? ""}
          initialCategory={initialCategory}
          initialPathway={initialPathway}
          initialStatus={initialStatus}
          competitions={competitions}
        />
      </div>
    </div>
  );
}
