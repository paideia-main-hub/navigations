import { createClient } from "@/data/supabase/server";
import { listOpenAndUpcoming, listPublishedWinners, groupWinnersByCompetition, upcomingDates } from "@/domain/competitions/service";
import { listAllAnnouncements } from "@/domain/announcements/service";
import { listSubmittableCategories } from "@/domain/awards/service";
import { ExploreCompetitionsToggle } from "@/ui/components/marketing/ExploreCompetitionsToggle";
import { LeagueSpotlight } from "@/ui/components/marketing/LeagueSpotlight";
import { WaysToParticipate } from "@/ui/components/marketing/WaysToParticipate";
import { ImportantDates } from "@/ui/components/marketing/ImportantDates";
import { RecognitionStrip } from "@/ui/components/marketing/RecognitionStrip";
import { WhyTheLeague } from "@/ui/components/marketing/WhyTheLeague";
import { UpcomingEventsBoard } from "@/ui/components/marketing/UpcomingEventsBoard";
import { ChampionsPodium } from "@/ui/components/marketing/ChampionsPodium";
import { AnnouncementsBoard } from "@/ui/components/marketing/AnnouncementsBoard";
import { QuickLinksGrid } from "@/ui/components/marketing/QuickLinksGrid";
import { ClosingCta } from "@/ui/components/marketing/ClosingCta";
import { HeroVideo } from "@/ui/components/marketing/HeroVideo";

export default async function HomePage() {
  const supabase = await createClient();
  const [featured, winners, dates, announcements, submittableAwards] = await Promise.all([
    listOpenAndUpcoming(supabase),
    listPublishedWinners(supabase),
    upcomingDates(supabase),
    listAllAnnouncements(supabase),
    listSubmittableCategories(supabase),
  ]);

  const winnerGroups = groupWinnersByCompetition(winners);

  return (
    <div>
      {/* Hero animation — the very first thing on the page, filling the full
          viewport behind the floating header (the -mt cancels out <main>'s
          top padding, which every other page needs to clear the fixed
          header). Pinned via `sticky` inside a taller runway, so it holds
          still while the next section rises over it below — a deliberate
          reveal instead of the default "everything scrolls together". */}
      <div className="relative -mt-24 h-[200dvh] sm:-mt-28">
        <section className="sticky top-0 h-dvh w-full overflow-hidden bg-background">
          <HeroVideo />
        </section>
      </div>

      {/* Curtain — rises over the pinned hero as the user scrolls (see the
          runway above), landing with a rounded top edge like a sheet
          settling into place rather than just sliding up flush behind it.
          The extra pt- here (matching <main>'s own header clearance) keeps
          the rounded edge flush at the very top while still giving the
          first heading room to clear the floating header once the curtain
          finishes rising — without it, LeagueSpotlight's heading lands
          right under the header at exactly the scroll position where the
          reveal completes. */}
      <div className="relative z-10 -mt-[100dvh] overflow-hidden rounded-t-[2.5rem] bg-background pt-24 shadow-[0_-25px_50px_-12px_rgba(0,0,0,0.25)] sm:rounded-t-[4rem] sm:pt-28">
        {/* 2. Featuring Now — static League billboard beside a rotating panel. */}
        <LeagueSpotlight />

        {/* 3. Ways to participate */}
        <WaysToParticipate />

        <div className="bg-background">
          <div className="mx-auto max-w-7xl px-6 py-16">
            {/* 4. Explore — Route 1 is a hand-fanned stack of featured
                competitions (the full filterable directory lives at
                /competitions); Route 2 is the open award nominations (full
                list at /awards). ExploreCompetitionsToggle owns its own
                SectionHeading so the "View all" link can point at whichever
                page matches the selected route. */}
            <ExploreCompetitionsToggle competitions={featured} awardCategories={submittableAwards} />
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
        <AnnouncementsBoard announcements={announcements} />

        {/* 10. Champions podium — same light/dark-aware section shell as
            everything around it (a permanent full-bleed dark band here read
            as inconsistent with the rest of the page). The podium itself
            (ChampionsPodium.tsx) already carries its own gold/silver/bronze
            step treatment, so the wrapper just needs a heading to match. */}
        <div className="relative overflow-hidden bg-background py-20 sm:py-24">
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <h2 className="flex items-center justify-center gap-3 text-sm font-bold tracking-wider text-foreground uppercase">
                <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
                Results &amp; Winners
                <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
              </h2>
              <p className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Winners{" "}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent dark:from-amber-300 dark:to-yellow-200">
                  Showcase
                </span>
              </p>
            </div>
            <ChampionsPodium groups={winnerGroups} />
          </div>
        </div>

        {/* 11. Portals grid */}
        <QuickLinksGrid />

        {/* 12. Bottom CTA */}
        <ClosingCta />
      </div>
    </div>
  );
}
