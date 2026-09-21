import { Fragment, type ReactNode } from "react";

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
  { icon: "chart", line1: "Demonstrate", line2: "strengths" },
  { icon: "people", line1: "Build", line2: "confidence" },
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

export function AboutJourney() {
  return (
    <section className="relative overflow-hidden bg-brand-deep px-6 py-20">
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

                <p className="mt-5 text-sm leading-snug font-bold text-brand-deep-foreground transition-colors duration-300 group-hover:text-accent">
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
  );
}
