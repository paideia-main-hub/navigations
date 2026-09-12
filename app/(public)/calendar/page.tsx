import { createClient } from "@/data/supabase/server";
import { upcomingDates } from "@/domain/competitions/service";

export const metadata = { title: "Competition Calendar | Future Competence Series" };

export default async function CalendarPage() {
  const supabase = await createClient();
  const dates = await upcomingDates(supabase);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground">Competition Calendar</h1>
      <p className="mt-2 text-muted">
        Registration deadlines, rounds, finals and result dates across all competitions.
      </p>
      <ul className="mt-8 divide-y divide-border">
        {dates.map((d, i) => (
          <li key={i} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-foreground">{d.competition}</p>
              <p className="text-sm text-muted">{d.label}</p>
            </div>
            <p className="text-sm font-semibold text-accent">
              {new Date(d.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </li>
        ))}
        {dates.length === 0 && <li className="py-8 text-center text-muted">No dates scheduled yet.</li>}
      </ul>
    </div>
  );
}
