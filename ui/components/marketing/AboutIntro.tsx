import type { ReactNode } from "react";

/** "What is Navigations?" — the explainer under the About hero.
 *
 * Two panels inside one rounded card: a photograph carrying the promise as an
 * inscription, and the definition beside it. The reference's closing line
 * ("explore interests, apply learning and demonstrate strengths") is three
 * things in a sentence, so it is set as three, each with its own mark.
 *
 * Photo lives in public/about. */

const PHOTO = {
  // h is set as well as w so the crop is taken portrait at the source; a
  // landscape frame squeezed into this tall panel crops to a face and loses
  // the room around it.
  src: "/about/intro.jpg",
  alt: "A school student looking up, thinking",
};

const icons: Record<string, ReactNode> = {
  compass: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm3.5-13.5-2 5.5-5.5 2 2-5.5 5.5-2Z" />,
  spark: <path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />,
  badge: <path d="M12 2.8 14.2 7l4.8.7-3.5 3.3.8 4.7-4.3-2.3-4.3 2.3.8-4.7L5 7.7 9.8 7 12 2.8Zm-4 13.4L6.6 22 12 19.1 17.4 22 16 16.2" />,
};

const STRANDS = [
  { icon: "compass", label: "Explore interests", note: "Try a domain before committing to it." },
  { icon: "spark", label: "Apply learning", note: "Put classroom skills to work on a real task." },
  { icon: "badge", label: "Demonstrate strengths", note: "Leave with evidence, not just a memory." },
] as const;

export function AboutIntro() {
  return (
    <section className="relative overflow-hidden bg-surface-alt px-6 pt-16 pb-28 sm:pt-20 sm:pb-32 lg:pt-24 lg:pb-36">
      <div className="relative mx-auto max-w-7xl">
        <div className="grid overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_30px_70px_-45px_rgba(31,32,65,0.55)] lg:grid-cols-[5fr_7fr]">
          {/* Photo panel — the promise inscribed on the image, as in the
              reference, rather than set as a caption beneath it. */}
          <div className="relative min-h-[20rem] lg:min-h-[28rem]">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder host, not in next.config's image remotePatterns */}
            <img src={PHOTO.src} alt={PHOTO.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            {/* Scrim reads left-to-right so the inscription sits on the dense
                side and the face stays clear. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-brand-deep/20 via-brand-deep/70 to-brand-deep/90"
            />

            <div className="relative flex h-full flex-col items-end justify-center gap-5 p-8 text-right lg:p-10">
              <p className="text-2xl leading-[1.15] font-light tracking-[0.18em] text-brand-deep-foreground uppercase italic sm:text-3xl">
                A brighter
                <br />
                future
              </p>
              <svg
                viewBox="0 0 120 60"
                fill="none"
                aria-hidden="true"
                className="h-12 w-24 text-accent"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 52C26 52 62 46 92 14" />
                <path d="M74 12h20v20" />
              </svg>
            </div>
          </div>

          {/* Copy panel */}
          <div className="p-8 sm:p-10 lg:p-14">
            <p className="text-xs font-bold tracking-[0.22em] text-accent-strong uppercase">What is Navigations?</p>

            <p className="mt-5 text-xl leading-snug font-semibold text-balance text-foreground sm:text-2xl">
              Navigations connects school-age students with meaningful co-curricular opportunities, competitions and
              challenges beyond classroom learning.
            </p>

            <span aria-hidden="true" className="mt-7 block h-1 w-14 rounded-full bg-accent" />

            <ul className="mt-7 grid gap-5 sm:grid-cols-3">
              {STRANDS.map((strand) => (
                <li key={strand.label}>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent-strong">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      {icons[strand.icon]}
                    </svg>
                  </span>
                  <p className="mt-3 font-bold text-foreground">{strand.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{strand.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
