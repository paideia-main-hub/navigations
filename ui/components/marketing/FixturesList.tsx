import type { UpcomingDate } from "@/domain/competitions/service";
import { ArenaBadge } from "./ArenaBadge";

export function FixturesList({ dates }: { dates: UpcomingDate[] }) {
  const upcoming = dates.slice(0, 5);

  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      {upcoming.map((d, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-slate-100 py-2 dark:bg-slate-800">
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {new Date(d.date).getDate()}
            </span>
            <span className="text-xs text-slate-500 uppercase dark:text-slate-400">
              {new Date(d.date).toLocaleDateString(undefined, { month: "short" })}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <ArenaBadge tone="blue">{d.label}</ArenaBadge>
            <p className="mt-1 truncate font-semibold text-slate-900 dark:text-slate-100">{d.competition}</p>
          </div>
        </div>
      ))}
      {upcoming.length === 0 && <p className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No dates scheduled yet.</p>}
    </div>
  );
}
