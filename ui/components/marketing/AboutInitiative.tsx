import Link from "next/link";
import { BandDivider } from "./BandDivider";

/** Closing band of the About page: the current initiative.
 *
 * The photograph is the section — it runs the whole width and very nearly the
 * whole viewport height, with a scrim that is heaviest on the left so the
 * headline has something solid to sit on and thins out to the right where the
 * picture should show.
 *
 * Photo lives in public/about. */

const PHOTO = {
  src: "/about/initiative.jpg?v=3",
  alt: "Four school students at quiz desks on stage, with a judge, in a packed auditorium",
};

/** Small caps down the right, as in the reference. */
const PROMISE = ["People", "Skills", "Ideas", "A brighter tomorrow"];

/** From the published 2026 calendar (ui/components/calendar/calendar2026.ts). */
const DATES = [
  { label: "Registration", value: "8 Oct – 10 Nov 2026" },
  { label: "Activity period", value: "23 Nov – 4 Dec 2026" },
  { label: "Finals & recognition", value: "12 – 13 Dec 2026" },
];

export function AboutInitiative() {
  return (
    <section className="relative isolate flex min-h-[72vh] flex-col overflow-hidden bg-brand-deep py-20 sm:py-24 lg:py-28">
      {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder host, not in next.config's image remotePatterns */}
      <img
        src={PHOTO.src}
        alt={PHOTO.alt}
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      {/* Two scrims: one across for the headline, one up from the floor for
          the date strip. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-deep via-brand-deep/85 to-brand-deep/40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-brand-deep to-transparent"
      />
      {/* Same dune as the top of Who it is for, filled with that band's colour
          so it spills onto the photograph. */}
      <BandDivider shape="dune" side="top" color="text-surface-alt" className="h-14 sm:h-18 lg:h-22" flip />
      {/* Same dune along the floor, filled with the page colour below. */}
      <BandDivider shape="dune" side="bottom" color="text-background" className="h-14 sm:h-18 lg:h-22" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-6 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-10 sm:gap-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.3em] text-accent uppercase">Our current initiative</p>

            <h2 className="mt-5 text-4xl leading-[0.95] font-black tracking-tight text-brand-deep-foreground sm:text-6xl lg:text-7xl">
              Future Ready
              <br />
              League
            </h2>

            <p className="mt-7 inline-flex items-center rounded-full bg-accent/35 px-4 py-1.5 text-sm font-bold text-brand-deep-foreground">
              Lahore Edition 2026
            </p>

            <div className="mt-5 max-w-lg space-y-2 text-lg leading-relaxed text-brand-deep-muted">
              <p>Aligned with Globally Recognised Future Competence Frameworks</p>
              <p>Connected with the United Nations Sustainable Development Goals (SDGs)</p>
            </div>

            <Link
              href="/competitions"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep focus-visible:outline-none"
            >
              Explore Future Ready League
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* The promise, set small down the right as in the reference. */}
          <ul className="hidden lg:block">
            {PROMISE.map((word) => (
              <li
                key={word}
                className="text-sm leading-loose font-bold tracking-[0.22em] text-brand-deep-foreground uppercase"
              >
                {word}
              </li>
            ))}
            <li aria-hidden="true" className="mt-4 h-0.5 w-10 rounded-full bg-accent" />
          </ul>
        </div>
      </div>

      {/* Dates along the floor — kept close under the headline block. */}
      <div className="relative mx-auto w-full max-w-7xl px-6 pt-4 pb-2 sm:pt-6">
        <dl className="grid gap-px overflow-hidden rounded-2xl bg-white/15 sm:grid-cols-3">
          {DATES.map((date) => (
            <div key={date.label} className="bg-brand-deep/80 px-6 py-5 backdrop-blur-sm">
              <dt className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase">{date.label}</dt>
              <dd className="mt-1.5 font-bold text-brand-deep-foreground">{date.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
