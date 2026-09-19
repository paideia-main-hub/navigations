import type { UpcomingDate } from "@/domain/competitions/service";
import { ArenaBadge } from "./ArenaBadge";

export function FixturesList({ dates }: { dates: UpcomingDate[] }) {
  const upcoming = dates.slice(0, 5);

  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
      {upcoming.map((d, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-surface-muted py-2">
            <span className="text-lg font-bold text-foreground">
              {new Date(d.date).getDate()}
            </span>
            <span className="text-xs text-muted uppercase">
              {new Date(d.date).toLocaleDateString(undefined, { month: "short" })}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <ArenaBadge tone="blue">{d.label}</ArenaBadge>
            <p className="mt-1 truncate font-semibold text-foreground">{d.competition}</p>
          </div>
        </div>
      ))}
      {upcoming.length === 0 && <p className="p-6 text-center text-sm text-muted">No dates scheduled yet.</p>}
    </div>
  );
}
