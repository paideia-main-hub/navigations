import { createClient } from "@/data/supabase/server";
import { listPublishedComputedWinners } from "@/domain/results/service";
import { awardLabels } from "@/domain/competitions/types";
import { adminListCategories } from "@/domain/awards/service";
import { listResults } from "@/domain/school-awards/service";
import { listPublishedNominations } from "@/domain/award-nominations/service";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";

const COMPETITION_DISTINCTION_LABEL: Record<string, string> = {
  gold: "Outstanding Performer",
  silver: "Distinguished Finalist",
  bronze: "Emerging Talent",
};

export const metadata = { title: "Award Results | Future Competence Series" };

export default async function AwardResultsPage() {
  const supabase = await createClient();

  const [computedWinners, categories, nominations] = await Promise.all([
    listPublishedComputedWinners(supabase),
    adminListCategories(supabase), // RLS: non-draft categories only for a non-admin caller
    listPublishedNominations(supabase),
  ]);

  const distinctionWinners = computedWinners.filter((w) => w.award === "gold" || w.award === "silver" || w.award === "bronze");
  const schoolAwardCategories = categories.filter((c) => c.layer === "school_award");
  const schoolResultsByCategory = await Promise.all(schoolAwardCategories.map((c) => listResults(supabase, c.id)));

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <PageBanner eyebrow="Awards" title="Award Results" subtitle="Published after admin approval and verification, across every recognition layer." />

      <div className="mx-auto max-w-5xl space-y-12 px-6 py-12">
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Competition Distinctions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {distinctionWinners.map((w, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <ArenaBadge tone="blue">{COMPETITION_DISTINCTION_LABEL[w.award] ?? awardLabels[w.award as keyof typeof awardLabels]}</ArenaBadge>
                <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{w.entrantName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{w.schoolName} · {w.competitionTitle}</p>
              </div>
            ))}
            {distinctionWinners.length === 0 && <p className="col-span-full text-sm text-slate-500 dark:text-slate-400">No distinctions published yet.</p>}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">School Awards</h2>
          <div className="mt-4 space-y-6">
            {schoolAwardCategories.map((c, i) => {
              const rows = (schoolResultsByCategory[i] ?? []).filter((r) => r.isPublished);
              return (
                <div key={c.id}>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{c.title}</h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {rows.map((r) => (
                      <div key={r.schoolId} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {r.schoolName} {r.isWinner && "🏆"}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">{r.computedValue}</span>
                      </div>
                    ))}
                    {rows.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Not yet published.</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Spotlight, Teacher/Parent, Sports &amp; Principal</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nominations.map((n) => (
              <div key={n.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <ArenaBadge tone="blue">{n.categoryTitle}</ArenaBadge>
                <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{n.nomineeName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{n.schoolName ?? "Independent"}</p>
              </div>
            ))}
            {nominations.length === 0 && <p className="col-span-full text-sm text-slate-500 dark:text-slate-400">No nominations published yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
