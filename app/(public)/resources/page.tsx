import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { listCompetitionIndex } from "@/domain/competitions/service";
import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = { title: "Practice & Resource Centre | Navigations" };

export default async function ResourcesPage() {
  const supabase = await createClient();
  const competitions = await listCompetitionIndex(supabase);

  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Practice & Resource Centre"
        title="Practice / Resource Centre"
        subtitle="Practice questions, sample tasks and videos, viewable directly inside the website for each competition."
      />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <ul className="grid gap-4 sm:grid-cols-2">
          {competitions.map((c) => (
            <li key={c.slug} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-medium text-foreground">{c.title}</p>
              <p className="mt-1 text-sm text-muted">{c.domain}</p>
              <Link
                href={`/competitions/${c.slug}#practice`}
                className="mt-2 inline-block text-sm font-semibold text-accent-strong hover:underline"
              >
                Open practice pack →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
