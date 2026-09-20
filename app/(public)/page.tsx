import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { listOpenAndUpcoming, listPublishedWinners, groupWinnersByCompetition, upcomingDates } from "@/domain/competitions/service";
import { listAllAnnouncements } from "@/domain/announcements/service";
import { announcementCategoryLabels } from "@/domain/announcements/types";
import { listSubmittableCategories } from "@/domain/awards/service";
import { ExploreRoutes } from "@/ui/components/marketing/ExploreRoutes";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";
import { SectionHeading } from "@/ui/components/marketing/SectionHeading";
import { LeagueSpotlight } from "@/ui/components/marketing/LeagueSpotlight";
import { WaysToParticipate } from "@/ui/components/marketing/WaysToParticipate";
import { ImportantDates } from "@/ui/components/marketing/ImportantDates";
import { RoadmapSteps } from "@/ui/components/marketing/RoadmapSteps";
import { FixturesList } from "@/ui/components/marketing/FixturesList";
import { ChampionsPodium } from "@/ui/components/marketing/ChampionsPodium";

const whyParticipate = [
  {
    title: "What You'll Develop",
    body: "Every competition is designed around a skill students actually use — not just a trophy.",
  },
  {
    title: "Certificates & Recognition",
    body: "Certificates, awards and public winner listings for students and their schools.",
  },
  {
    title: "Competency Portfolio",
    body: "A record of participation and achievement across Primary, Middle and Secondary years.",
  },
];

const schoolPoints = [
  "School Leaderboard & Recognition",
  "Downloadable School Participation Guide",
  "Register Multiple Students & Teams",
];

const portals = [
  { href: "/manuals", label: "Manuals & Guidelines" },
  { href: "/resources", label: "Practice / Resource Centre" },
  { href: "/results", label: "Results & Winners" },
  { href: "/schools", label: "For Schools" },
  { href: "/students", label: "For Students" },
];

export default async function HomePage() {
  const supabase = await createClient();
  const [featured, winners, dates, announcements, submittableAwards] = await Promise.all([
    listOpenAndUpcoming(supabase),
    listPublishedWinners(supabase),
    upcomingDates(supabase),
    listAllAnnouncements(supabase),
    listSubmittableCategories(supabase),
  ]);

  const pinnedAnnouncement = announcements.find((a) => a.isImportant) ?? announcements[0];
  const winnerGroups = groupWinnersByCompetition(winners);

  return (
    <div>
      {/* 1. Announcement strip — kept above the spotlight so a pinned
          announcement still surfaces on the landing page. */}
      {pinnedAnnouncement && (
        <div className="border-b border-border bg-surface-muted px-6 py-2 text-center text-sm font-medium text-foreground">
          🏆 {pinnedAnnouncement.title}{" "}
          <Link href="/announcements" className="ml-1 font-semibold text-accent-strong underline underline-offset-2 hover:no-underline">
            View announcement details
          </Link>
        </div>
      )}

      {/* 2. Featuring Now — static League billboard beside a rotating panel. */}
      <LeagueSpotlight />

      {/* 3. Ways to participate */}
      <WaysToParticipate />

      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-12">
          {/* 4. Explore — Route 1 lists competitions with grade and category
              filters, Route 2 lists the awards a student can submit to. */}
          <SectionHeading
            eyebrow="Competition Directory"
            title="Explore Competitions"
            action={{ href: "/competitions", label: "View all competitions" }}
          />
          <ExploreRoutes competitions={featured} awardCategories={submittableAwards} />
        </div>
      </div>

      {/* 5. Important dates — the published 2026 programme. */}
      <ImportantDates />

      <div className="bg-background">

        {/* 6. Roadmap */}
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold tracking-wider text-accent-strong uppercase">
              Getting Started
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              How It Works
            </h2>
          </div>
          <RoadmapSteps />
        </div>

        {/* 7. Fixtures */}
        <div className="mx-auto max-w-7xl px-6 py-12">
          <SectionHeading eyebrow="Competition Calendar" title="Upcoming Events" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <FixturesList dates={dates} />
            </div>
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">
                Stay on Schedule
              </p>
              <p className="mt-2 font-semibold text-foreground">Calendar Sync Available</p>
              <p className="mt-1 text-sm text-muted">
                Track every registration deadline, round and closing date without checking back here.
              </p>
              <Link
                href="/calendar"
                className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
              >
                View Competition Calendar
              </Link>
            </div>
          </div>
        </div>

        {/* 8. Announcements */}
        <div className="mx-auto max-w-7xl px-6 py-12">
          <SectionHeading eyebrow="Announcements" title="Latest Announcements" action={{ href: "/announcements", label: "View all" }} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.slice(0, 6).map((a) => (
              <div key={a.id} className="rounded-2xl border border-border bg-surface p-5">
                <ArenaBadge tone="blue">{announcementCategoryLabels[a.category]}</ArenaBadge>
                <p className="mt-3 font-semibold text-foreground">{a.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{a.body}</p>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-muted">
                No announcements published yet.
              </p>
            )}
          </div>
        </div>

        {/* 9. Champions podium — same light/dark-aware section shell as
            everything around it (a permanent full-bleed dark band here read
            as inconsistent with the rest of the page), distinguished by a
            soft color-tinted glow instead of an always-dark background. */}
        <div className="relative overflow-hidden py-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/10 blur-[110px] dark:bg-amber-500/10" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold tracking-wider text-accent-strong uppercase">Results &amp; Winners</p>
              <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
                Winners{" "}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent dark:from-amber-300 dark:to-yellow-200">
                  Showcase
                </span>
              </h2>
            </div>
            <ChampionsPodium groups={winnerGroups} />
          </div>
        </div>

        {/* 10. For Students / For Schools */}
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 sm:grid-cols-2">
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-transform hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-accent-soft blur-2xl" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-2xl">🎓</span>
            <p className="relative mt-4 text-xs font-semibold tracking-wide text-accent-strong uppercase">For Students</p>
            <h3 className="relative mt-1 text-xl font-bold text-foreground">For Students &amp; Young Innovators</h3>
            <ul className="relative mt-5 space-y-3 text-sm text-muted">
              {whyParticipate.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent-strong">
                    ✓
                  </span>
                  <span>
                    <span className="font-semibold text-foreground">{item.title}:</span> {item.body}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/register/student"
              className="relative mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
            >
              Register as a Student
            </Link>
          </div>
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-transform hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-2xl">🏫</span>
            <p className="relative mt-4 text-xs font-semibold tracking-wide text-violet-600 uppercase dark:text-violet-400">For Schools</p>
            <h3 className="relative mt-1 text-xl font-bold text-foreground">For Schools &amp; Coordinators</h3>
            <ul className="relative mt-5 space-y-3 text-sm text-muted">
              {schoolPoints.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                    ✓
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register/school"
              className="relative mt-6 inline-block rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
            >
              Register Your School
            </Link>
          </div>
        </div>

        {/* 11. Portals grid */}
        <div className="mx-auto max-w-7xl px-6 py-12">
          <SectionHeading eyebrow="Explore the Platform" title="Quick Links" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {portals.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="rounded-xl border border-border bg-surface p-4 text-sm font-semibold text-foreground hover:border-accent hover:text-accent-strong"
              >
                {p.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 12. Bottom CTA */}
      <section className="bg-brand-deep px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">READY TO REGISTER?</h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-deep-muted">
          Join over 14,200 students across the country already registered for this season&apos;s competitions.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90">
            Register Now
          </Link>
          <Link href="/competitions" className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-surface/5">
            Browse Competitions
          </Link>
        </div>
      </section>
    </div>
  );
}
