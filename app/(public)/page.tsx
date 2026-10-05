import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listOpenAndUpcoming, listPublishedWinners, groupWinnersByCompetition, upcomingDates } from "@/domain/competitions/service";
import { listAllAnnouncements } from "@/domain/announcements/service";
import { listAppreciations } from "@/domain/appreciations/service";
import { listSubmittableCategories } from "@/domain/awards/service";
import { ExploreCompetitionsToggle } from "@/ui/components/marketing/ExploreCompetitionsToggle";
import { LeagueSpotlight } from "@/ui/components/marketing/LeagueSpotlight";
import { WaysToParticipate } from "@/ui/components/marketing/WaysToParticipate";
import { ImportantDates } from "@/ui/components/marketing/ImportantDates";
import { RecognitionStrip } from "@/ui/components/marketing/RecognitionStrip";
import { UpcomingEventsBoard } from "@/ui/components/marketing/UpcomingEventsBoard";
import { ChampionsPodium } from "@/ui/components/marketing/ChampionsPodium";
import { CheerConfetti } from "@/ui/components/marketing/CheerConfetti";
import { AnnouncementsPress } from "@/ui/components/marketing/AnnouncementsPress";
import { AppreciationsLedger } from "@/ui/components/marketing/AppreciationsLedger";
import { QuickLinksGrid } from "@/ui/components/marketing/QuickLinksGrid";
import { ClosingCta } from "@/ui/components/marketing/ClosingCta";
import { HeroOne } from "@/ui/components/marketing/HeroCollage";
import { HeroTwo } from "@/ui/components/marketing/HeroTwo";

/** Flip between 1 (preserved collage) and 2 (ceremony + collage layered hero). */
const HERO_VARIANT: 1 | 2 = 2;

export default async function HomePage() {
  const supabase = await createClient();
  const [user, featured, winners, dates, announcements, appreciations, submittableAwards] = await Promise.all([
    getCurrentUser(),
    listOpenAndUpcoming(supabase),
    listPublishedWinners(supabase),
    upcomingDates(supabase),
    listAllAnnouncements(supabase),
    listAppreciations(supabase),
    listSubmittableCategories(supabase),
  ]);

  const winnerGroups = groupWinnersByCompetition(winners);

  return (
    <div>
      {/* Kick off hero LCP assets before the client collage hydrates. */}
      <link rel="preload" as="image" href="/hero-script.png?v=4" fetchPriority="high" />
      {HERO_VARIANT === 1 ? (
        <link rel="preload" as="image" href="/hero-collage.png?v=5" fetchPriority="high" />
      ) : (
        <>
          <link rel="preload" as="image" href="/hero-two-bg.jpg" fetchPriority="high" />
          <link rel="preload" as="image" href="/hero-collage.png?v=5" fetchPriority="high" />
        </>
      )}

      {/* Hero — pinned via `sticky` inside a taller runway, so it holds
          still while the next section rises over it below. */}
      <div className="relative -mt-24 h-[200dvh] sm:-mt-28">
        <section
          className="sticky top-0 h-dvh w-full overflow-hidden bg-[#fefffa]"
        >
          {HERO_VARIANT === 1 ? <HeroOne /> : <HeroTwo />}
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
          reveal completes.
          Deliberately no overflow-hidden here even though the rounded top
          edge might suggest it: `overflow` other than visible on ANY
          ancestor — even one that never actually scrolls its own content,
          like this one — breaks `position: sticky` for every descendant on
          the page (confirmed empirically while wiring up a sticky sidebar
          further down). The rounded corner doesn't need it: border-radius
          clips this div's own background regardless of overflow, and
          LeagueSpotlight (the first child) shares this same bg-background,
          so nothing actually bleeds past the corner. Every section below
          that DOES need to clip its own decorative bleed (glow blobs,
          BandDivider seams) still does, via its own `overflow-hidden`. */}
      <div className="relative z-10 -mt-[100dvh] rounded-t-[2.5rem] bg-background pt-14 shadow-[0_-25px_50px_-12px_rgba(0,0,0,0.25)] sm:rounded-t-[4rem] sm:pt-28">
        {/* 2. Featuring Now — static League billboard beside a rotating panel. */}
        <LeagueSpotlight
          nominationsOpen={submittableAwards.length > 0}
          isLoggedIn={Boolean(user)}
        />

        {/* 3. Ways to participate */}
        <WaysToParticipate />

        {/* Clips only past the viewport. The fan's own box is narrower than
            the screen, and clipping there was cutting the outer cards'
            shadows off on the left and right. Off-screen staging cards
            still must not widen the page. */}
        <div className="overflow-x-clip bg-background">
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

        {/* 5. Important dates — the published 2026 programme, with a
            one-card slider beside the schedule. */}
        <ImportantDates competitions={featured} spotlight="slider" />

        {/* 6. 5 Layer Recognition */}
        <RecognitionStrip />

        {/* Competition Calendar — hidden on the home page. The board and
            its data stay so the section can be shown again later. */}
        <div className="hidden" aria-hidden="true">
          <UpcomingEventsBoard dates={dates} />
        </div>

        {/* 7. Announcements — the flip stack stays in the codebase, and is
            not rendered. The press file uses that section's warm band. */}
        <AnnouncementsPress announcements={announcements} />

        {/* 8. Champions podium — above appreciations. */}
        <div className="relative overflow-hidden bg-background py-20 sm:py-24">
          <CheerConfetti />
          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="mb-14 text-center sm:mb-16">
              <h2 className="font-heading flex items-center justify-center gap-3 text-sm font-extrabold tracking-wider text-foreground uppercase">
                <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
                Results &amp; Winners
                <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
              </h2>
              <p className="font-heading mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Winners Showcase
              </p>
            </div>
            <ChampionsPodium groups={winnerGroups} />
          </div>
        </div>

        {/* 9. Appreciations */}
        <AppreciationsLedger appreciations={appreciations} />

        {/* 10. Explore the Platform */}
        <QuickLinksGrid />

        {/* Bottom CTA — sits after the last content section. */}
        <ClosingCta />
      </div>
    </div>
  );
}
