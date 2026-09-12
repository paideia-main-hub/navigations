import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { listOpenAndUpcoming, listPublishedWinners } from "@/domain/competitions/service";
import { CompetitionCard } from "@/ui/components/CompetitionCard";
import { Badge } from "@/ui/components/Badge";

const steps = ["Sign Up", "Choose Competition", "Register", "Prepare", "Participate", "Results"];

const whyParticipate = [
  {
    title: "Real competencies",
    body: "Every competition is designed around a skill students actually use — not just a trophy.",
  },
  {
    title: "Recognition",
    body: "Certificates, awards and public winner listings for students and their schools.",
  },
  {
    title: "Portfolio building",
    body: "A record of participation and achievement across Primary, Middle and Secondary years.",
  },
];

const quickLinks = [
  { href: "/manuals", label: "Manuals" },
  { href: "/resources", label: "Practice Resources" },
  { href: "/results", label: "Results" },
  { href: "/schools", label: "School Registration" },
  { href: "/students", label: "Student Registration" },
];

export default async function HomePage() {
  const supabase = await createClient();
  const featured = await listOpenAndUpcoming(supabase);
  const winners = await listPublishedWinners(supabase);

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Hero */}
      <section className="flex flex-col items-start gap-6 py-16 sm:py-24">
        <Badge tone="accent">Registration is open for the 2026 season</Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Competitions that build real-world competence, not just certificates.
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          The Future Competence Series brings together competitions across Primary, Middle and
          Secondary levels — with online practice resources, transparent judging, and published
          results.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            Register Now
          </Link>
          <Link
            href="/competitions"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:border-accent"
          >
            Explore Competitions
          </Link>
        </div>

        <form action="/competitions" className="mt-4 flex w-full max-w-xl gap-2">
          <input
            type="search"
            name="q"
            placeholder="Search by competition name, category or keyword…"
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm text-foreground outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background"
          >
            Search
          </button>
        </form>
      </section>

      {/* Featured competitions */}
      <section className="py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-foreground">Open &amp; upcoming competitions</h2>
          <Link href="/competitions" className="text-sm font-semibold text-accent">
            View all →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <CompetitionCard key={c.slug} competition={c} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <h2 className="mb-6 text-2xl font-bold text-foreground">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {steps.map((step, i) => (
            <li key={step} className="rounded-xl border border-border bg-surface p-4 text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                {i + 1}
              </div>
              <p className="text-sm font-medium text-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Winners showcase */}
      {winners.length > 0 && (
        <section className="py-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-foreground">Recent winners</h2>
            <Link href="/results" className="text-sm font-semibold text-accent">
              View all results →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {winners.slice(0, 4).map((w, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
                {w.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage URL, not a Next Image host we need to configure
                  <img src={w.photoUrl} alt={w.studentName} className="h-32 w-full object-cover" />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-surface-muted text-xs text-muted">
                    No photo
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    {w.customAwardLabel ?? w.award}
                  </span>
                  <p className="mt-1 font-semibold text-foreground">{w.studentName}</p>
                  <p className="text-sm text-muted">{w.schoolName}</p>
                  <p className="mt-2 text-xs text-muted">{w.competitionTitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why participate */}
      <section className="py-12">
        <h2 className="mb-6 text-2xl font-bold text-foreground">Why participate</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {whyParticipate.map((item) => (
            <div key={item.title}>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="py-12">
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
