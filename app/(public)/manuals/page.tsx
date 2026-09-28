import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { listCompetitionIndex } from "@/domain/competitions/service";
import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = { title: "Manuals & Guidelines | Navigations" };

export default async function ManualsPage() {
  const supabase = await createClient();
  const competitions = await listCompetitionIndex(supabase);

  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Manuals & Rulebook"
        title="Manuals & Guidelines"
        subtitle="Official registration rules, guiding principles and complete manuals for every competition. Open a competition's page for its downloadable manual and judging rubric."
      />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {competitions.map((c) => (
            <div key={c.slug} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">{c.title}</p>
                <p className="text-sm text-muted">{c.domain}</p>
              </div>
              <Link href={`/competitions/${c.slug}#manual`} className="text-sm font-semibold text-accent-strong hover:underline">
                View manual →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
