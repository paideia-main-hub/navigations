import { Fragment, type ReactNode } from "react";
import { BandDivider } from "./BandDivider";
import { RouteCard } from "./RouteCard";

// Inline so the section carries no icon-library dependency. 24x24, drawn in
// currentColor so each card controls its own tint.
const icons: Record<string, ReactNode> = {
  bulb: <path d="M9 18h6m-5 3h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" />,
  document: (
    <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Zm0 0v5h5M9 13h6M9 17h4" />
  ),
  people: (
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  trophy: (
    <path d="M8 21h8m-4-4v4m-6-17h12v5a6 6 0 0 1-12 0V4Zm0 2H4a2 2 0 0 0 0 4h2m12-4h2a2 2 0 0 1 0 4h-2" />
  ),
  star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2Z" />,
  medal: (
    <path d="M12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 0v-2m-4.5-8.5L5 3h5l2 4m2.5 3.5L19 3h-5l-2 4" />
  ),
};

function Icon({ name }: { name: keyof typeof icons }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-6 w-6"
    >
      {icons[name]}
    </svg>
  );
}

// Route 1's four cards are the competition categories. They all point at the
// directory until the categories exist in the data model and can be filtered.
// Each card carries its own coordinated card/bubble tint — different hues so
// the section reads as colourful rather than a wall of identical white
// tiles, with the bubble a more saturated shade of the same card colour.
const ROUTES = [
  {
    number: 1,
    title: "Choose a Competition Pathway",
    blurb: "Pick the kind of challenge that suits how you work best.",
    // Explicit placement on lg: header across tracks 1-4, cards one per track.
    headerClass: "lg:col-start-1 lg:col-span-4 lg:row-start-1",
    cards: [
      {
        label: "Applied Skills Challenges",
        icon: "bulb",
        href: "/competitions?pathway=applied_skills",
        col: "lg:col-start-1",
        bg: "bg-blue-50 dark:bg-blue-500/10",
        bubble: "bg-blue-200 dark:bg-blue-400/40",
      },
      {
        label: "Independent Submission",
        icon: "document",
        href: "/competitions?pathway=independent_submission",
        col: "lg:col-start-2",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        bubble: "bg-emerald-200 dark:bg-emerald-400/40",
      },
      {
        label: "Project Showcasing",
        icon: "people",
        href: "/competitions?pathway=project_showcase",
        col: "lg:col-start-3",
        bg: "bg-amber-50 dark:bg-amber-500/10",
        bubble: "bg-amber-200 dark:bg-amber-400/40",
      },
      {
        label: "Live Performances",
        icon: "bolt",
        href: "/competitions?pathway=live_response",
        col: "lg:col-start-4",
        bg: "bg-rose-50 dark:bg-rose-500/10",
        bubble: "bg-rose-200 dark:bg-rose-400/40",
      },
    ],
  },
  {
    number: 2,
    title: "Apply/Nominate for Special Recognition",
    blurb: "Put forward an individual, submission, school or sporting achievement for a League award.",
    // Track 5 is the rule, so this group starts at 6.
    headerClass: "lg:col-start-6 lg:col-span-3 lg:row-start-1",
    cards: [
      {
        label: "Spotlight Awards",
        icon: "trophy",
        href: "/awards#spotlight",
        col: "lg:col-start-6",
        bg: "bg-violet-50 dark:bg-violet-500/10",
        bubble: "bg-violet-200 dark:bg-violet-400/40",
      },
      {
        label: "School Awards",
        icon: "star",
        href: "/awards#school_award",
        col: "lg:col-start-7",
        bg: "bg-cyan-50 dark:bg-cyan-500/10",
        bubble: "bg-cyan-200 dark:bg-cyan-400/40",
      },
      {
        label: "Sports Recognition Awards",
        icon: "medal",
        href: "/awards#sports",
        col: "lg:col-start-8",
        bg: "bg-accent-soft",
        bubble: "bg-accent/30",
      },
    ],
  },
] as const;

export function WaysToParticipate() {
  return (
    <section
      // Same-family gradient instead of a flat fill — three shades of the
      // Space Indigo brand colour, darkest on the left rising to a clearly
      // lighter shade on the right. Fixed (no dark: variant) to match
      // bg-brand-deep's own "stays dark in both themes" behaviour, which
      // this replaces. background-size 200% 200% + animate-gradient-travel
      // (app/globals.css) slides that gradient back and forth so the light
      // slowly travels across the band instead of sitting static.
      className="relative mx-4 overflow-hidden rounded-[2rem] bg-[linear-gradient(100deg,#14152c_0%,#1f2041_50%,#3d4173_100%)] bg-[length:200%_200%] animate-gradient-travel px-6 pt-[calc(7rem+30px)] pb-[calc(7rem+50px)] sm:mx-6 sm:pt-[calc(8rem+30px)] lg:mx-10 lg:pt-[calc(10rem+30px)] lg:pb-[calc(8rem+50px)] sm:rounded-[2.5rem]"
    >
      {/* Same wave on both edges, so the page colour spills in at the top
          the way it already does along the bottom. */}
      <BandDivider shape="wave" side="top" color="text-background" />
      <BandDivider shape="wave" side="bottom" color="text-background" flip />

      {/* Depth behind the cards, so the band reads as lit rather than flat. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -right-24 -bottom-28 h-96 w-96 rounded-full bg-accent/[0.07] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <h2 className="flex items-center gap-3 text-sm font-bold tracking-wider text-brand-deep-foreground uppercase">
          <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
          Ways to Participate
        </h2>

        {/* One grid for everything. Tracks 1-4 and 6-8 are equal 1fr columns
            with the rule in the auto track between them, and every card is
            pinned to row 2 — so all seven come out the same width, and the row
            stretches them all to the tallest. DOM order still reads
            header, cards, header, cards, which is the order small screens
            stack in once the explicit placement stops applying. */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto_repeat(3,minmax(0,1fr))] lg:grid-rows-[auto_1fr] lg:gap-x-5 lg:gap-y-14">
          {ROUTES.map((route) => (
            <Fragment key={route.number}>
              <div className={`sm:col-span-2 ${route.headerClass} ${route.number === 2 ? "mt-6 lg:mt-0" : ""}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {route.number}
                  </span>
                  <span className="text-xs font-semibold tracking-wider text-brand-deep-muted uppercase">
                    Route {route.number}
                  </span>
                </div>
                <p className="mt-3 text-lg font-bold text-brand-deep-foreground sm:text-xl">{route.title}</p>
                <p className="mt-1 text-sm text-brand-deep-muted">{route.blurb}</p>
              </div>

              {route.cards.map((card, cardIndex) => (
                <RouteCard
                  key={card.label}
                  href={card.href}
                  label={card.label}
                  icon={<Icon name={card.icon} />}
                  number={cardIndex + 1}
                  bgClassName={card.bg}
                  bubbleClassName={card.bubble}
                  className={`${card.col} max-lg:mt-4 lg:row-start-2`}
                  // Route 2 continues the wave rather than restarting it, so
                  // the whole row reads as one motion, not two groups.
                  floatDelay={(route.number === 1 ? cardIndex : 4 + cardIndex) * 0.12}
                />
              ))}
            </Fragment>
          ))}

          <div
            aria-hidden="true"
            className="hidden w-px bg-gradient-to-b from-transparent via-white/25 to-transparent lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:block"
          />
        </div>
      </div>
    </section>
  );
}
