import { createClient } from "@/data/supabase/server";
import { listCompetitions } from "@/domain/competitions/service";
import type { AgeCategory, CompetitionStatus } from "@/domain/competitions/types";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { CompetitionsDirectory } from "./CompetitionsDirectory";

export const metadata = {
  title: "Competitions | Future Competence Series",
};

const AGE_CATEGORIES: AgeCategory[] = ["primary", "middle", "secondary"];
const STATUSES: CompetitionStatus[] = ["draft", "upcoming", "open", "closed", "archived"];

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const { q, category, status } = await searchParams;
  const supabase = await createClient();
  const competitions = await listCompetitions(supabase);

  const initialCategory = AGE_CATEGORIES.includes(category as AgeCategory) ? (category as AgeCategory) : "all";
  const initialStatus = STATUSES.includes(status as CompetitionStatus) ? (status as CompetitionStatus) : "all";

  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Competition Directory"
        title="Competitions"
        subtitle="Browse all competitions in the Future Competence Series. Filter by age category, participation type or status, or search by name."
      />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <CompetitionsDirectory
          initialQuery={q ?? ""}
          initialCategory={initialCategory}
          initialStatus={initialStatus}
          competitions={competitions}
        />
      </div>
    </div>
  );
}
