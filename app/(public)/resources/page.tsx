import Link from "next/link";
import { listCompetitions } from "@/domain/competitions/service";

export const metadata = { title: "Practice & Resource Centre | Future Competence Series" };

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground">Practice / Resource Centre</h1>
      <p className="mt-2 text-muted">
        Practice questions, sample tasks and videos, viewable directly inside the website for
        each competition.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {listCompetitions().map((c) => (
          <li key={c.slug} className="rounded-xl border border-border bg-surface p-4">
            <p className="font-medium text-foreground">{c.title}</p>
            <p className="mt-1 text-sm text-muted">{c.domain}</p>
            <Link href={`/competitions/${c.slug}#practice`} className="mt-2 inline-block text-sm font-semibold text-accent">
              Open practice pack →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
