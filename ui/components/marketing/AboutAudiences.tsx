import Link from "next/link";
import type { ReactNode } from "react";

/** "Who it is for" — the four parties the League is built around.
 *
 * No photographs: the structure comes from a ghosted numeral behind each
 * card, so the four read as a set without needing imagery. Every card is a
 * link rather than a caption, because each of these is a way in.
 *
 * Institutional Partners takes the Space Indigo fill — it is the one
 * organisational audience among three personal ones, which is the same
 * distinction the reference draws by pulling it onto its own row. */

const icons: Record<string, ReactNode> = {
  cap: <path d="M12 3 2 8l10 5 10-5-10-5Zm0 10v7m-5-4.6V11m10 4.4V11" />,
  school: <path d="M3 21h18M5 21V10l7-5 7 5v11M10 21v-5h4v5M9 12h1.5M13.5 12H15" />,
  family: (
    <path d="M9 21v-6m6 6v-6M7.5 9.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Zm7 2a2 2 0 1 1 4 0 2 2 0 0 1-4 0ZM5 21v-4a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v4m1-6h1a3 3 0 0 1 3 3v3" />
  ),
  institution: <path d="M3 21h18M4 21V10m4 11V10m8 11V10m4 11V10M2 10h20L12 3 2 10Z" />,
};

const AUDIENCES = [
  {
    icon: "cap",
    title: "Students",
    body: "Explore interests, enter the competitions you are eligible for, and leave with evidence of what you can do.",
    href: "/register/student",
    cta: "Register as a student",
    dark: false,
  },
  {
    icon: "school",
    title: "Schools",
    body: "Extend learning beyond the classroom. Register your school, manage a roster and enter individuals or teams.",
    href: "/register/school",
    cta: "Register your school",
    dark: false,
  },
  {
    icon: "family",
    title: "Parents",
    body: "Support your child's participation and growth — what the League asks of them, and what they take away from it.",
    href: "/faqs",
    cta: "Read the FAQs",
    dark: false,
  },
  {
    icon: "institution",
    title: "Institutional Partners",
    body: "Collaborate to create meaningful opportunities: sponsor a competition, host an activity or judge a round.",
    href: "/contact",
    cta: "Talk to the team",
    dark: true,
  },
] as const;

export function AboutAudiences() {
  return (
    <section className="bg-surface-alt px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.22em] text-accent-strong uppercase">Who it is for</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-balance text-foreground sm:text-4xl">
            A stronger ecosystem for greater possibilities.
          </h2>
        </div>

        <ul className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {AUDIENCES.map((audience, i) => (
            <li key={audience.title}>
              <Link
                href={audience.href}
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border p-8 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_65px_-38px_rgba(31,32,65,0.7)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt focus-visible:outline-none sm:p-10 ${
                  audience.dark
                    ? "border-brand-deep bg-brand-deep hover:border-accent"
                    : "border-border bg-surface hover:border-accent/50"
                }`}
              >
                {/* Standing in for the photograph: big enough to give the card
                    a shape, faint enough to stay behind the words. */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -top-6 right-4 text-[7rem] leading-none font-black tabular-nums select-none ${
                    audience.dark ? "text-brand-deep-foreground/10" : "text-foreground/[0.055]"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span
                  className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition-colors duration-300 ${
                    audience.dark
                      ? "bg-accent/15 text-accent group-hover:bg-accent group-hover:text-accent-foreground"
                      : "bg-accent-soft text-accent-strong group-hover:bg-accent group-hover:text-accent-foreground"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-7 w-7"
                  >
                    {icons[audience.icon]}
                  </svg>
                </span>

                <h3
                  className={`relative mt-6 text-2xl font-bold tracking-tight ${
                    audience.dark ? "text-brand-deep-foreground" : "text-foreground"
                  }`}
                >
                  {audience.title}
                </h3>
                <p
                  className={`relative mt-3 text-[15px] leading-relaxed ${
                    audience.dark ? "text-brand-deep-muted" : "text-muted"
                  }`}
                >
                  {audience.body}
                </p>

                {/* Pushed to the bottom so the four actions line up however
                    long the copy above them runs. */}
                <span
                  aria-hidden="true"
                  className={`relative mt-8 block h-px w-full ${audience.dark ? "bg-white/15" : "bg-border"}`}
                />
                <span
                  className={`relative mt-5 inline-flex items-center gap-2 text-sm font-bold ${
                    audience.dark ? "text-accent" : "text-accent-strong"
                  }`}
                >
                  {audience.cta}
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
