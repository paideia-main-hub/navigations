import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCategoryBySlug } from "@/domain/awards/service";
import { layerLabels, isJudgedLayer } from "@/domain/awards/types";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";

export default async function AwardCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const category = await getCategoryBySlug(supabase, slug);
  if (!category || category.status === "draft") notFound();

  const judged = isJudgedLayer(category.layer);

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <PageBanner eyebrow={layerLabels[category.layer]} title={category.title} subtitle={category.description} />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Who can submit</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {category.requiresSchool
              ? "Nominations must come through a participating school account."
              : category.allowsIndependent
                ? "Submit through your school account, or independently if you don't have one."
                : "Submit through your school account."}
          </p>
        </div>

        {(category.evidencePeriodStart || category.evidencePeriodEnd || category.closingAt) && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Key dates</h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              {category.evidencePeriodStart && category.evidencePeriodEnd && (
                <li>
                  Evidence period: {new Date(category.evidencePeriodStart).toLocaleDateString()} –{" "}
                  {new Date(category.evidencePeriodEnd).toLocaleDateString()}
                </li>
              )}
              {category.closingAt && <li>Nomination deadline: {new Date(category.closingAt).toLocaleString()}</li>}
            </ul>
          </div>
        )}

        {judged && category.rubricCriteria.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">How it&apos;s assessed</h2>
            <div className="mt-2 space-y-2">
              {category.rubricCriteria.map((c) => (
                <div key={c.key} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
                  <span className="text-sm text-slate-900 dark:text-slate-100">{c.label}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{c.weight}%</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Two judges assess independently; at least {category.passThreshold}% is required for recognition.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <ArenaBadge tone={category.status === "open" ? "success" : "neutral"}>{category.status}</ArenaBadge>
        </div>

        <div className="mt-6">
          <Link href={`/dashboard/nominate/${category.slug}`} className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
            Start a Nomination
          </Link>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Sign in to submit — you&apos;ll be asked to log in first if you aren&apos;t already.</p>
        </div>
      </div>
    </div>
  );
}
