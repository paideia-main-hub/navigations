"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/** Placeholder copy — real slides to be supplied. Deliberately carries no
 * counters or figures. Each slide carries its own light, dark-mode-aware
 * tint (same "bg-X-50 / dark:bg-X-500/10" pattern used for the announcement
 * categories) so the rotating panel picks up a bit of colour on every turn
 * instead of sitting on the same plain card every time. `hue` picks which
 * BUBBLE_TINTS entry the background bubbles use, so they stay coordinated
 * with whichever tint is currently showing instead of a single fixed colour
 * regardless of slide. */
const SLIDES = [
  {
    title: "Compete Beyond the Classroom",
    body: "Where talent meets future-ready opportunities across every discipline in the League.",
    bg: "bg-accent-soft",
    hue: "accent",
  },
  {
    title: "Grounded in Real Competencies",
    body: "Every challenge maps to a published competence framework, so performance means something afterwards.",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    hue: "blue",
  },
  {
    title: "Judged on Evidence, Not Polish",
    body: "Transparent rubrics are shared before the event, and every score traces back to what a student actually produced.",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    hue: "emerald",
  },
  {
    title: "Built for Every Tier",
    body: "Primary, Middle and Secondary students each compete against age-appropriate standards.",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    hue: "violet",
  },
] as const;

/** [saturated tint, softer tint] per hue — two shades of the same slide
 * colour, mixed in with a couple of plain white "glossy highlight" bubbles
 * below so the cluster reads as coloured light rather than a flat wash. */
const BUBBLE_TINTS: Record<string, [string, string]> = {
  accent: ["bg-accent/35", "bg-accent/20"],
  blue: ["bg-blue-400/40", "bg-blue-300/25"],
  emerald: ["bg-emerald-400/40", "bg-emerald-300/25"],
  violet: ["bg-violet-400/40", "bg-violet-300/25"],
};

const INTERVAL_MS = 5000;

export function LeagueSpotlight() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    // Someone who asked the OS for less motion should not get a panel that
    // moves on its own.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || paused) return;

    timer.current = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  const slide = SLIDES[index];
  const [tintStrong, tintSoft] = BUBBLE_TINTS[slide.hue];

  return (
    <section className="bg-background px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <p className="flex items-center gap-3 text-sm font-bold tracking-wider text-foreground uppercase">
          <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
          Featuring Now
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          {/* Static half — the League billboard. A poster composition now:
              a duotone-tinted photo zone with a diagonal ribbon, then a
              solid info panel (title + a real stat row) below it with a
              hard edge — not text floated over a photo gradient. */}
          <div className="relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-white/10 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.6)] sm:min-h-[420px]">
            <div className="relative min-h-0 flex-1 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- directly-hosted external photo, not a domain Next Image needs configuring for */}
              <img
                src="https://images.unsplash.com/photo-1630068846062-3ffe78aa5049?q=80&w=2400&auto=format&fit=crop"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover [filter:saturate(1.2)]"
              />
              {/* Brand duotone over the photo, not just a darkening fade. */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/50 via-transparent to-brand-deep/70 mix-blend-multiply" />
              <div className="absolute inset-0 bg-brand-deep/25" />

              {/* Diagonal ribbon, draped across the top-right corner. */}
              <div className="absolute top-6 -right-12 w-44 rotate-45 bg-accent py-1.5 text-center text-[11px] font-black tracking-[0.2em] text-accent-foreground uppercase shadow-lg">
                2026
              </div>
            </div>

            {/* Info panel — a solid block, not an overlay. */}
            <div className="relative bg-brand-deep px-7 py-6 sm:px-10 sm:py-7">
              <h2 className="text-2xl leading-[1.05] font-extrabold tracking-tight text-white sm:text-4xl">
                FUTURE READY <span className="text-accent">LEAGUE</span>
              </h2>
              <p className="mt-1.5 text-base font-semibold text-brand-deep-foreground sm:text-lg">Lahore Edition 2026</p>

              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                <div>
                  <dt className="text-[10px] font-bold tracking-wider text-brand-deep-muted uppercase">Students</dt>
                  <dd className="text-lg font-black text-white sm:text-xl">14,200+</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold tracking-wider text-brand-deep-muted uppercase">Competitions</dt>
                  <dd className="text-lg font-black text-white sm:text-xl">23</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold tracking-wider text-brand-deep-muted uppercase">Layers</dt>
                  <dd className="text-lg font-black text-white sm:text-xl">6</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Rotating half. */}
          <div
            className={`relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-border px-14 py-10 text-center transition-colors duration-500 sm:min-h-[420px] ${slide.bg}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            aria-roledescription="carousel"
            aria-label="League highlights"
          >
            {/* Decorative bubbles filling the plain space around the text —
                each drifts and breathes on its own timing (animate-bubble-
                drift, staggered via inline duration/delay) so the cluster
                wanders out of sync rather than bobbing in lockstep. Two
                shades of the CURRENT slide's own hue, crossfading via
                transition-colors whenever the slide changes, plus a couple
                of plain white "glossy highlight" bubbles for contrast.
                Purely background: z-0, and the content below is explicit
                z-10 so text always stays legible on top. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
              <span
                className={`absolute -top-12 -left-10 h-44 w-44 rounded-full blur-2xl animate-bubble-drift transition-colors duration-500 sm:h-56 sm:w-56 ${tintStrong}`}
                style={{ animationDuration: "16s" }}
              />
              <span
                className="absolute top-[5%] right-[8%] h-28 w-28 rounded-full bg-white/60 blur-xl animate-bubble-drift sm:h-32 sm:w-32"
                style={{ animationDuration: "11s", animationDelay: "-3s" }}
              />
              <span
                className={`absolute bottom-[10%] left-[6%] h-24 w-24 rounded-full blur-lg animate-bubble-drift transition-colors duration-500 sm:h-28 sm:w-28 ${tintSoft}`}
                style={{ animationDuration: "13s", animationDelay: "-7s" }}
              />
              <span
                className="absolute right-[11%] bottom-[15%] h-16 w-16 rounded-full bg-white/50 blur-md animate-bubble-drift sm:h-20 sm:w-20"
                style={{ animationDuration: "9s", animationDelay: "-1.5s" }}
              />
              <span
                className={`absolute top-[36%] left-[16%] h-14 w-14 rounded-full blur-md animate-bubble-drift transition-colors duration-500 sm:h-16 sm:w-16 ${tintStrong}`}
                style={{ animationDuration: "18s", animationDelay: "-10s" }}
              />
              <span
                className={`absolute top-[16%] left-[40%] h-10 w-10 rounded-full blur-sm animate-bubble-drift transition-colors duration-500 sm:h-12 sm:w-12 ${tintSoft}`}
                style={{ animationDuration: "10s", animationDelay: "-5s" }}
              />
            </div>

            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous highlight"
              className="absolute top-1/2 left-3 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <span aria-hidden="true">‹</span>
            </button>

            <div aria-live="polite" aria-atomic="true" className="relative z-10 w-full">
              {/* Keying on the index replays the entrance on every change.
                  Title and body each run the same blur-to-focus entrance
                  (animate-spotlight-text-in, app/globals.css), with the body
                  starting slightly after the title so the two cascade in
                  rather than materialising as one flat block. */}
              <div key={index}>
                <p
                  className="animate-spotlight-text-in text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                  style={{ animationDelay: "0ms" }}
                >
                  {slide.title}
                </p>
                <p
                  className="animate-spotlight-text-in mx-auto mt-3 max-w-xs text-base text-muted sm:text-lg"
                  style={{ animationDelay: "90ms" }}
                >
                  {slide.body}
                </p>
              </div>
              <span className="sr-only">
                Slide {index + 1} of {SLIDES.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next highlight"
              className="absolute top-1/2 right-3 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <span aria-hidden="true">›</span>
            </button>

            <div className="absolute bottom-6 z-10 flex items-center gap-2">
              {SLIDES.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show highlight ${i + 1}: ${s.title}`}
                  aria-current={i === index}
                  className={`h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                    i === index ? "w-6 bg-accent" : "w-2 bg-border hover:bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            Register for the League
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
