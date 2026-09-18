import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { listOpenCategories } from "@/domain/awards/service";
import { layerLabels } from "@/domain/awards/types";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";

export const metadata = { title: "Awards | Future Competence Series" };

const LAYER_SUMMARY: { layer: keyof typeof layerLabels; blurb: string }[] = [
  { layer: "competition_distinction", blurb: "Outstanding Performer, Distinguished Finalist and Emerging Talent — awarded automatically from each competition's own top 3." },
  { layer: "school_award", blurb: "Champion School, School Excellence, Whole School Participation, Diversified School and Collaboration & Integrity. Schools never nominate themselves." },
  { layer: "spotlight", blurb: "Idea of the Year, Story of the Year and Young Changemaker — school-nominated or fully independent. You don't have to win a League competition to submit." },
  { layer: "teacher_parent", blurb: "Supportive Teacher and Supportive Parent — every complete, valid school nomination receives recognition. No competitive scoring." },
  { layer: "sports", blurb: "Excellence Athlete and Blazer Athlete recognise sustained, verified sporting achievement over the last two years." },
];

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

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {LAYER_SUMMARY.map((l) => (
            <div key={l.layer} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <ArenaBadge tone="blue">{layerLabels[l.layer]}</ArenaBadge>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{l.blurb}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Open categories</h2>
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
            {categories.length === 0 && <p className="col-span-full py-8 text-center text-sm text-slate-500 dark:text-slate-400">No award categories are open yet.</p>}
          </div>
        </div>

        <p className="mt-12 text-xs text-slate-500 dark:text-slate-400">
          We also recognise up to 50 participating school principals through the Best Principal of Future Ready
          League Award.
        </p>
      </div>
    </div>
  );
}
