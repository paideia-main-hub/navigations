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
import { RecognitionStrip } from "@/ui/components/marketing/RecognitionStrip";
import { WhyTheLeague } from "@/ui/components/marketing/WhyTheLeague";
import { UpcomingEventsBoard } from "@/ui/components/marketing/UpcomingEventsBoard";
import { ChampionsPodium } from "@/ui/components/marketing/ChampionsPodium";
import { BandDivider } from "@/ui/components/marketing/BandDivider";

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

      <div className="bg-surface-warm">
        <div className="mx-auto max-w-7xl px-6 py-16">
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

      {/* 6. What every participant takes away */}
      <RecognitionStrip />

      {/* 7. Upcoming events — grouped by date, because the whole League shares
          a handful of deadlines and a row per competition was twenty
          identical rows. */}
      <UpcomingEventsBoard dates={dates} />

      {/* 8. Why the League */}
      <WhyTheLeague />

      {/* 9. Announcements */}
      <div className="relative overflow-hidden bg-surface-warm">
        <BandDivider shape="arc" side="top" color="text-background" />
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-16 lg:pt-28">
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
      </div>

      {/* 10. Champions podium — same light/dark-aware section shell as
          everything around it (a permanent full-bleed dark band here read
          as inconsistent with the rest of the page), distinguished by a
          soft color-tinted glow instead of an always-dark background. */}
      <div className="relative overflow-hidden bg-background py-16">
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

      {/* 11. Portals grid */}
      <div className="bg-surface-alt">
        <div className="mx-auto max-w-7xl px-6 py-16">
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
      <section className="relative overflow-hidden bg-brand-deep px-6 pt-28 pb-20 text-center lg:pt-32">
        <BandDivider shape="curve" side="top" color="text-surface-alt" flip />
        {/* Positioned, so the seam above cannot paint over the copy. */}
        <div className="relative">
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
        </div>
      </section>
    </div>
  );
}
