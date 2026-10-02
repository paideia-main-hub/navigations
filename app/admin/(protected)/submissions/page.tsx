import { createAdminClient } from "@/data/supabase/admin";
import { adminListSubmissions } from "@/data/repositories/submissions.repository";
import { SUBMISSION_COMPETITIONS } from "@/domain/submissions/config";
import { SubmissionsTable } from "@/ui/components/admin/SubmissionsTable";

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: Promise<{ competition?: string }> }) {
  const { competition } = await searchParams;
  const submissions = await adminListSubmissions(createAdminClient());
  const awaiting = submissions.filter((s) => s.status === "submitted").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Work Submissions</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Entries for the Independent Submission competitions — {SUBMISSION_COMPETITIONS.map((c) => c.title).join(", ")}. Open one to
            view the work and score it against its published rubric. Drafts students haven&apos;t submitted yet aren&apos;t listed.
          </p>
        </div>
        {awaiting > 0 && (
          <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
            {awaiting} awaiting review
          </span>
        )}
      </div>

      <div className="mt-6">
        <SubmissionsTable
          submissions={submissions}
          initialCompetition={SUBMISSION_COMPETITIONS.some((c) => c.slug === competition) ? competition! : SUBMISSION_COMPETITIONS[0].slug}
        />
      </div>
    </div>
  );
}
