import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { listOpenCategories } from "@/domain/awards/service";
import { layerLabels, type AwardLayer } from "@/domain/awards/types";
import { AWARD_DETAILS } from "@/ui/components/awards/awardDetails";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";

export const metadata = { title: "Awards | Future Competence Series" };

const LAYER_ORDER: AwardLayer[] = ["competition_distinction", "school_award", "spotlight", "teacher_parent", "sports", "principal"];

const LAYER_INTRO: Record<AwardLayer, string> = {
  competition_distinction: "Awarded automatically from each competition's own results — nobody submits anything for these.",
  school_award: "Computed from League-wide participation and results, or (Collaboration & Integrity) scored directly by the organizer. Schools never nominate themselves.",
  spotlight: "School-nominated or fully independent — you don't have to win a League competition to submit.",
  teacher_parent: "Nomination-based acknowledgements with no competitive scoring. Every complete, valid school nomination receives the award.",
  sports: "School-nominated, evidence-based recognition of sustained achievement over the last two years.",
  principal: "Up to 50 principals recognised for enabling participation and supporting League coordination.",
};

export default async function AwardsLandingPage() {
  const supabase = await createClient();
  const categories = await listOpenCategories(supabase);

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <PageBanner
        eyebrow="Awards and Recognition"
        title="Future Ready League Awards"
        subtitle="Future Ready League celebrates achievement, meaningful ideas, positive influence and the people who make participation possible. Five recognition layers honor competition performers, schools, individual contributors, supportive adults and student athletes."
      />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-wrap gap-3">
          <Link href="/competitions" className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:border-blue-500 dark:border-slate-700 dark:text-slate-100">
            Explore Competitions
          </Link>
          <Link href="/awards/results" className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:border-blue-500 dark:border-slate-700 dark:text-slate-100">
            View Award Criteria &amp; Results
          </Link>
          <Link href="/dashboard/nominations" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
            Start a Nomination
          </Link>
          <Link href="/dashboard/nominations" className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:border-blue-500 dark:border-slate-700 dark:text-slate-100">
            Track My Submission
          </Link>
        </div>

        <div className="mt-12 space-y-10">
          {LAYER_ORDER.map((layer) => {
            const awards = AWARD_DETAILS.filter((a) => a.layer === layer);
            return (
              <section key={layer}>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{layerLabels[layer]}</h2>
                </div>
                <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{LAYER_INTRO[layer]}</p>

                <div className="mt-4 space-y-3">
                  {awards.map((a) => (
                    <details key={a.slug} className="group rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                      <summary className="cursor-pointer">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{a.title}</span>
                      </summary>
                      <p className="mt-1 text-xs font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">Awarded to: {a.awardedTo}</p>
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{a.description}</p>
                      {a.criteria && (
                        <div className="mt-3 space-y-1.5">
                          {a.criteria.map((c) => (
                            <div key={c.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800">
                              <span className="text-slate-900 dark:text-slate-100">{c.label}</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{c.weight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {categories.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Open for nominations now</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/awards/${c.slug}`}
                  className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900"
                >
                  <ArenaBadge tone="neutral">{layerLabels[c.layer]}</ArenaBadge>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{c.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{c.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
