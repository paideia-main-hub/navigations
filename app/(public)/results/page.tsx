import { createClient } from "@/data/supabase/server";
import { listPublishedWinners } from "@/domain/competitions/service";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { ResultsSearch } from "./ResultsSearch";

export const metadata = { title: "Results & Winners | Navigations" };

export default async function ResultsPage() {
  const supabase = await createClient();
  const winners = await listPublishedWinners(supabase);

  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Results & Winners"
        title="Results & Winners"
        subtitle="Published after admin approval, with student name, school name, competition, award and approved photograph where consent has been captured."
      />
      <div className="mx-auto max-w-5xl px-6 py-12">
        <ResultsSearch winners={winners} />
      </div>
    </div>
  );
}
