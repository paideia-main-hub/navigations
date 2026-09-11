import { competitions } from "@/lib/data/competitions";
import Link from "next/link";

export const metadata = { title: "Manuals & Guidelines | Future Competence Series" };

export default function ManualsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Manuals & Guidelines</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Official registration rules, guiding principles and complete manuals for every competition.
        Open a competition&apos;s page for its downloadable manual and judging rubric.
      </p>
      <ul className="mt-8 divide-y divide-black/5 dark:divide-white/5">
        {competitions.map((c) => (
          <li key={c.slug} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">{c.title}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{c.domain}</p>
            </div>
            <Link
              href={`/competitions/${c.slug}#manual`}
              className="text-sm font-semibold text-teal-700 dark:text-teal-400"
            >
              View manual →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
