import { createClient } from "@/data/supabase/server";
import { listPublishedWinners } from "@/domain/competitions/service";
import { ResultsSearch } from "./ResultsSearch";

export const metadata = { title: "Results & Winners | Future Competence Series" };

export default async function ResultsPage() {
  const supabase = await createClient();
  const winners = await listPublishedWinners(supabase);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground">Results & Winners</h1>
      <p className="mt-2 text-muted">
        Published after admin approval, with student name, school name, competition, award and
        approved photograph where consent has been captured.
      </p>
      <ResultsSearch winners={winners} />
    </div>
  );
}
