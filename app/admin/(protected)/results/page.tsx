import { createAdminClient } from "@/data/supabase/admin";
import { adminListCompetitions } from "@/domain/competitions/service";
import { listResultsForAdmin } from "@/domain/results/service";
import { CompetitionPicker } from "@/ui/components/admin/CompetitionPicker";
import { ResultsReviewPanel } from "@/ui/components/admin/ResultsReviewPanel";

export default async function AdminResultsPage({ searchParams }: { searchParams: Promise<{ competition?: string }> }) {
  const { competition: competitionId } = await searchParams;
  const admin = createAdminClient();
  const competitions = await adminListCompetitions(admin);

  const selected = competitionId ? (competitions.find((c) => c.id === competitionId) ?? null) : null;
  const rows = selected ? await listResultsForAdmin(admin, selected.id) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Results &amp; Judging</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Pick a competition to see every registered entrant, generate ranked standings from judge scoring, adjust an
        award if needed, and approve &amp; publish — that&apos;s the single moment a result appears on the public
        winners gallery and in the student/school dashboards.
      </p>

      <div className="mt-6">
        <CompetitionPicker competitions={competitions.map((c) => ({ id: c.id, title: c.title }))} selectedId={selected?.id ?? null} />
      </div>

      {selected ? (
        <div className="mt-6">
          <ResultsReviewPanel competitionId={selected.id} competitionSlug={selected.slug} rows={rows} />
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted">Select a competition above to review its results.</p>
      )}
    </div>
  );
}
