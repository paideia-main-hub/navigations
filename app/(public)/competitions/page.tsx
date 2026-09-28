import { createClient } from "@/data/supabase/server";
import { listCompetitions } from "@/domain/competitions/service";
import { pathwayOrder, type AgeCategory, type CompetitionPathway, type CompetitionStatus } from "@/domain/competitions/types";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { CompetitionsDirectory } from "./CompetitionsDirectory";

export const metadata = {
  title: "Competitions | Navigations",
};

const AGE_CATEGORIES: AgeCategory[] = ["primary", "middle", "secondary"];
const STATUSES: CompetitionStatus[] = ["draft", "upcoming", "open", "closed", "archived"];

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; pathway?: string; status?: string }>;
}) {
  const { q, category, pathway, status } = await searchParams;
  const supabase = await createClient();
  const competitions = await listCompetitions(supabase);

  const initialCategory = AGE_CATEGORIES.includes(category as AgeCategory) ? (category as AgeCategory) : "all";
  const initialPathway = pathwayOrder.includes(pathway as CompetitionPathway) ? (pathway as CompetitionPathway) : "all";
  const initialStatus = STATUSES.includes(status as CompetitionStatus) ? (status as CompetitionStatus) : "all";

  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Competition Directory"
        title="Competitions"
        subtitle="Browse all competitions in Navigations. Filter by Route 1 category, age category, participation type or status, or search by name."
      />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <CompetitionsDirectory
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
