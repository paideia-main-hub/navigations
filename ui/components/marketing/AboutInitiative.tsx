import Link from "next/link";
import { BandDivider } from "./BandDivider";

/** Closing band of the About page: the current initiative, full bleed.
 *
 * The photograph is the section — it runs the whole width and very nearly the
 * whole viewport height, with a scrim that is heaviest on the left so the
 * headline has something solid to sit on and thins out to the right where the
 * picture should show.
 *
 * Photo is an Unsplash placeholder; swap the `src` for a real one. */

const PHOTO = {
  src: "https://images.unsplash.com/photo-1773829020694-413e879d2957?auto=format&fit=crop&w=2000&q=68",
  alt: "A student presenting to an audience in a large auditorium",
};

/** Small caps down the right, as in the reference. */
const PROMISE = ["People", "Skills", "Ideas", "A brighter tomorrow"];

/** From the published 2026 calendar (ui/components/calendar/calendar2026.ts). */
const DATES = [
  { label: "Registration", value: "1 – 10 Oct 2026" },
  { label: "Activity period", value: "26 Oct – 5 Nov 2026" },
  { label: "Finals & recognition", value: "6 – 7 Nov 2026" },
];

export function AboutInitiative() {
  return (
    <section className="relative isolate flex min-h-[90vh] flex-col justify-center overflow-hidden bg-brand-deep">
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
        className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t from-brand-deep to-transparent"
      />
      {/* The cool band above spills over the photograph rather than meeting
          it on a rule. Above the image, so it reads as an overlap. */}
      <BandDivider shape="blob" side="top" color="text-surface-alt" className="z-10 h-24 sm:h-32 lg:h-40" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-24">
        <div className="flex flex-wrap items-start justify-between gap-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.3em] text-accent uppercase">Our current initiative</p>

            <h2 className="mt-5 text-4xl leading-[0.95] font-black tracking-tight text-brand-deep-foreground sm:text-6xl lg:text-7xl">
              Future Ready
              <br />
              League
            </h2>

            <p className="mt-7 inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground">
              Lahore Edition 2026
            </p>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-brand-deep-muted">
              Academically grounded in Future Competence Frameworks.
            </p>

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

      {/* Dates along the floor — the height this section asks for should pay
          for itself with something worth reading. */}
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-12">
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
