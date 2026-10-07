import { createAdminClient } from "@/data/supabase/admin";
import { adminListSubmissions } from "@/data/repositories/submissions.repository";
import { adminListCompetitions } from "@/domain/competitions/service";
import { competitionTakesWorkUpload } from "@/domain/submissions/config";
import { SubmissionsTable } from "@/ui/components/admin/SubmissionsTable";

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: Promise<{ competition?: string }> }) {
  const { competition } = await searchParams;
  const admin = createAdminClient();
  const [submissions, competitions] = await Promise.all([
    adminListSubmissions(admin),
    adminListCompetitions(admin),
  ]);

  const fromFlag = competitions
    .filter((c) => competitionTakesWorkUpload(c))
    .map((c) => ({ slug: c.slug, title: c.title }));
  const listed = new Set(fromFlag.map((c) => c.slug));
  const extraSlugs = [...new Set(submissions.map((s) => s.competitionSlug).filter((slug) => !listed.has(slug)))];
  const extra = extraSlugs.map((slug) => {
    const match = competitions.find((c) => c.slug === slug);
    return { slug, title: match?.title ?? slug };
  });
  const onlineCompetitions = [...fromFlag, ...extra].sort((a, b) => a.title.localeCompare(b.title));

  const awaiting = submissions.filter((s) => s.status === "submitted").length;
  const initial =
    (competition && onlineCompetitions.some((c) => c.slug === competition) ? competition : null) ??
    onlineCompetitions[0]?.slug ??
    "";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Work Submissions</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Entries for every competition with online submission on. Open one to view the work. InquiryQuest,
            CultureScript and Message for Humanity can be scored against their published rubric. Drafts students
            haven&apos;t submitted yet aren&apos;t listed.
          </p>
        </div>
        {awaiting > 0 && (
          <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
            {awaiting} awaiting review
          </span>
        )}
      </div>

      <div className="mt-6">
        {onlineCompetitions.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
            No competitions have online submission enabled yet.
          </p>
        ) : (
          <SubmissionsTable submissions={submissions} competitions={onlineCompetitions} initialCompetition={initial} />
        )}
      </div>
    </div>
  );
}
