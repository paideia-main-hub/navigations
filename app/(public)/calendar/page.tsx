import { createClient } from "@/data/supabase/server";
import { upcomingDates } from "@/domain/competitions/service";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";

export const metadata = { title: "Competition Calendar | Future Competence Series" };

export default async function CalendarPage() {
  const supabase = await createClient();
  const dates = await upcomingDates(supabase);

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <PageBanner
        eyebrow="Important Dates"
        title="Competition Calendar"
        subtitle="Registration deadlines, rounds, finals and result dates across all competitions."
      />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {dates.map((d, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div>
                <ArenaBadge tone="blue">{d.label}</ArenaBadge>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{d.competition}</p>
              </div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {new Date(d.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
          ))}
          {dates.length === 0 && <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No dates scheduled yet.</p>}
        </div>
      </div>
    </div>
  );
}
