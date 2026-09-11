import { competitions } from "@/lib/data/competitions";
import Link from "next/link";

export const metadata = { title: "Practice & Resource Centre | Future Competence Series" };

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Practice / Resource Centre</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Practice questions, sample tasks and videos, viewable directly inside the website for
        each competition.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {competitions.map((c) => (
          <li key={c.slug} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">{c.title}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{c.domain}</p>
            <Link
              href={`/competitions/${c.slug}#practice`}
              className="mt-2 inline-block text-sm font-semibold text-teal-700 dark:text-teal-400"
            >
              Open practice pack →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
