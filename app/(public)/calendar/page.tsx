import { competitions } from "@/lib/data/competitions";

export const metadata = { title: "Competition Calendar | Future Competence Series" };

export default function CalendarPage() {
  const dates = competitions
    .flatMap((c) => [
      { competition: c.title, label: "Registration closes", date: c.registrationDeadline },
      { competition: c.title, label: "Final event", date: c.eventDate },
    ])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Competition Calendar</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Registration deadlines, rounds, finals and result dates across all competitions.
      </p>
      <ul className="mt-8 divide-y divide-black/5 dark:divide-white/5">
        {dates.map((d, i) => (
          <li key={i} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">{d.competition}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{d.label}</p>
            </div>
            <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">
              {new Date(d.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
