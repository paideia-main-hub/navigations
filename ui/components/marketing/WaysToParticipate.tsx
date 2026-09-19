import Link from "next/link";
import type { ReactNode } from "react";

// Inline so the section carries no icon-library dependency. 24x24, drawn in
// currentColor so each card controls its own tint.
const icons: Record<string, ReactNode> = {
  bulb: (
    <path d="M9 18h6m-5 3h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" />
  ),
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
      className="h-7 w-7"
    >
      {icons[name]}
    </svg>
  );
}

// Route 1's four cards are the competition categories. They all point at the
// directory until the categories exist in the data model and can be filtered.
const ROUTES = [
  {
    number: 1,
    title: "Choose a Competition Pathway",
    cards: [
      { label: "Applied Skills Challenges", icon: "bulb", href: "/competitions" },
      { label: "Independent Submission Challenges", icon: "document", href: "/competitions" },
      { label: "Project Showcase Challenges", icon: "people", href: "/competitions" },
      { label: "Live Response Challenges", icon: "bolt", href: "/competitions" },
    ],
  },
  {
    number: 2,
    title: "Apply for Special Recognition Awards",
    cards: [
      { label: "Spotlight Awards", icon: "trophy", href: "/awards#spotlight" },
      { label: "Future Readiness School Awards", icon: "star", href: "/awards#school_award" },
      { label: "Sports Recognition Awards", icon: "medal", href: "/awards#sports" },
    ],
  },
] as const;

export function WaysToParticipate() {
  return (
    <section className="bg-brand-deep px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <h2 className="flex items-center gap-3 text-sm font-bold tracking-wider text-brand-deep-foreground uppercase">
          <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
          Ways to Participate
        </h2>

        {/* Route 1 carries four cards to Route 2's three, so the split is
            weighted rather than even. */}
        <div className="mt-7 grid gap-8 lg:grid-cols-[4fr_3fr] lg:gap-10">
          {ROUTES.map((route, i) => (
            <div key={route.number} className={i === 1 ? "lg:border-l lg:border-white/15 lg:pl-10" : undefined}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-brand-deep-muted">Route</span>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {route.number}
                </span>
                <span className="text-base font-bold text-brand-deep-foreground">{route.title}</span>
              </div>

              <ul
                className={`mt-4 grid gap-3 sm:grid-cols-2 ${
                  route.cards.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
                }`}
              >
                {route.cards.map((card) => (
                  <li key={card.label}>
                    <Link
                      href={card.href}
                      // The band stays dark in both themes, so these use the
                      // theme-independent brand pair rather than surface/foreground.
                      className="flex h-full flex-col items-center gap-3 rounded-xl bg-brand-deep-foreground px-3 py-5 text-center transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep focus-visible:outline-none"
                    >
                      <span className="text-accent-strong">
                        <Icon name={card.icon} />
                      </span>
                      <span className="text-sm leading-snug font-semibold text-brand-deep">{card.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
