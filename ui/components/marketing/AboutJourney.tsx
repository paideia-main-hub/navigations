import { Fragment, type ReactNode } from "react";
import { BLOB_PATH, BandDivider } from "./BandDivider";
import { BandTexture } from "./BandTexture";

/** "Why we exist" — the four steps a student moves through, on a dark band.
 *
 * Each circle runs the same float, offset by a fixed delay, so the row reads
 * as one wave travelling left to right rather than four things bobbing
 * together. The float drives `translate` and the hover drives `scale`, which
 * are separate CSS properties, so the pop does not fight the wave; hovering
 * also holds that circle still so it can be looked at. */

const icons: Record<string, ReactNode> = {
  compass: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm3.5-13.5-2 5.5-5.5 2 2-5.5 5.5-2Z" />,
  bulb: <path d="M9 18h6m-5 3h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" />,
  chart: <path d="M4 20V10m6 10V4m6 16v-7m6 7V8M2 20h20" />,
  people: (
    <path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm12.5 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
  ),
};

const STEPS = [
  { icon: "compass", line1: "Discover", line2: "interests" },
  { icon: "bulb", line1: "Apply", line2: "learning" },
  { icon: "chart", line1: "Demonstrate", line2: "skills" },
  { icon: "people", line1: "Develop", line2: "competencies" },
] as const;

/** Seconds between one circle starting its float and the next — small enough
 * that the crests overlap, so it reads as a wave rather than a queue. */
const STAGGER = 0.38;

function Connector() {
  return (
    <span aria-hidden="true" className="mt-9 hidden shrink-0 items-center px-1 sm:flex lg:px-2">
      <svg
        viewBox="0 0 64 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-10 text-accent/60 lg:w-16"
      >
        <path d="M2 18C14 4 40 4 58 12" />
        <path d="M50 14.5 58 12l-2.5-8" />
      </svg>
    </span>
  );
}

/** Shadow that follows the bottom blob, rather than the section's straight box. */
function CurveShadow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 108"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-12 w-full overflow-visible sm:h-16 lg:h-20"
    >
      <defs>
        <mask id="journey-curve-above" maskUnits="userSpaceOnUse">
          <rect width="1440" height="108" fill="white" />
          <path d={BLOB_PATH} transform="translate(0 108) scale(1 -1)" fill="black" />
        </mask>
        <filter id="journey-curve-shadow" x="-8%" y="-30%" width="116%" height="220%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="12" stdDeviation="7" floodColor="#1f2041" floodOpacity="0.55" />
        </filter>
        {/* Keeps the shadow under the curve and off the straight side edges. */}
        <clipPath id="journey-curve-below" clipPathUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1440" height="200" />
        </clipPath>
      </defs>
      <g clipPath="url(#journey-curve-below)">
        <g filter="url(#journey-curve-shadow)">
          <rect width="1440" height="108" fill="#1f2041" mask="url(#journey-curve-above)" />
        </g>
      </g>
    </svg>
  );
}

export function AboutJourney() {
  return (
    <div className="relative z-10 mx-4 mt-8 sm:mx-6 sm:mt-10 lg:mx-10 lg:mt-12">
      {/* Same curve as the top of the second section: this band's colour rises into the one above. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-full z-10 h-12 sm:h-16 lg:h-20">
        <div className="relative h-full">
          <BandDivider shape="blob" side="bottom" color="text-brand-deep" className="h-full" />
        </div>
      </div>
    <section className="relative overflow-hidden bg-brand-deep px-6 pt-16 pb-36 sm:pt-20 sm:pb-40 lg:pt-24 lg:pb-44">
      <BandDivider shape="blob" side="bottom" color="text-background" className="h-12 sm:h-16 lg:h-20" />
      <BandTexture pattern="grid" className="text-brand-deep-foreground/[0.05]" />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-accent/10 blur-[130px]" />
        <div className="absolute right-1/3 -bottom-28 h-96 w-96 rounded-full bg-accent/[0.06] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl text-center">
        <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">Why we exist</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-balance text-brand-deep-foreground sm:text-4xl lg:text-5xl">
          Learning needs room to grow.
        </h2>

        <ol className="mx-auto mt-16 flex max-w-5xl flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
          {STEPS.map((step, i) => (
            <Fragment key={step.line1}>
              <li className="group flex shrink-0 flex-col items-center text-center sm:flex-1">
                {/* Wrapper carries the wave; the circle carries the pop, so
                    neither overwrites the other. */}
                <div
                  className="animate-wave-float group-hover:[animation-play-state:paused]"
                  style={{ animationDelay: `${i * STAGGER}s` }}
                >
                  <span className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full border-2 border-accent/45 bg-accent/10 text-accent shadow-[0_0_0_0_rgba(255,105,31,0)] transition-[scale,background-color,color,border-color,box-shadow] duration-300 ease-out group-hover:scale-115 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-[0_0_0_12px_rgba(255,105,31,0.16)]">
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
                      {icons[step.icon]}
                    </svg>
                  </span>
                </div>

                <p className="mt-5 text-base leading-snug font-bold text-brand-deep-foreground transition-colors duration-300 group-hover:text-accent sm:text-lg">
                  {step.line1}
                  <br />
                  {step.line2}
                </p>
              </li>

              {i < STEPS.length - 1 && <Connector />}
            </Fragment>
          ))}
        </ol>
      </div>
    </section>
      <CurveShadow />
    </div>
  );
}
