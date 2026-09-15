import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { listCompetitions } from "@/domain/competitions/service";
import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = { title: "Practice & Resource Centre | Future Competence Series" };

export default async function ResourcesPage() {
  const supabase = await createClient();
  const competitions = await listCompetitions(supabase);

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <PageBanner
        eyebrow="Practice & Resource Centre"
        title="Practice / Resource Centre"
        subtitle="Practice questions, sample tasks and videos, viewable directly inside the website for each competition."
      />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <ul className="grid gap-4 sm:grid-cols-2">
          {competitions.map((c) => (
            <li key={c.slug} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-medium text-slate-900 dark:text-slate-100">{c.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.domain}</p>
              <Link
                href={`/competitions/${c.slug}#practice`}
                className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Open practice pack →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
