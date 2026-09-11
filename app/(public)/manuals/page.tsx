import Link from "next/link";
import { listCompetitions } from "@/domain/competitions/service";

export const metadata = { title: "Manuals & Guidelines | Future Competence Series" };

export default function ManualsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground">Manuals & Guidelines</h1>
      <p className="mt-2 text-muted">
        Official registration rules, guiding principles and complete manuals for every competition.
        Open a competition&apos;s page for its downloadable manual and judging rubric.
      </p>
      <ul className="mt-8 divide-y divide-border">
        {listCompetitions().map((c) => (
          <li key={c.slug} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-foreground">{c.title}</p>
              <p className="text-sm text-muted">{c.domain}</p>
            </div>
            <Link href={`/competitions/${c.slug}#manual`} className="text-sm font-semibold text-accent">
              View manual →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
