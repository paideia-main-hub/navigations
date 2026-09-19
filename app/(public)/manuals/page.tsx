import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { listCompetitionIndex } from "@/domain/competitions/service";
import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = { title: "Manuals & Guidelines | Future Competence Series" };

export default async function ManualsPage() {
  const supabase = await createClient();
  const competitions = await listCompetitionIndex(supabase);

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <PageBanner
        eyebrow="Manuals & Rulebook"
        title="Manuals & Guidelines"
        subtitle="Official registration rules, guiding principles and complete manuals for every competition. Open a competition's page for its downloadable manual and judging rubric."
      />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {competitions.map((c) => (
            <div key={c.slug} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{c.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{c.domain}</p>
              </div>
              <Link href={`/competitions/${c.slug}#manual`} className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
                View manual →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
