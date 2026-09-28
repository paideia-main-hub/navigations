"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/** Placeholder copy — real slides to be supplied. Deliberately carries no
 * counters or figures. Each slide carries its own light, dark-mode-aware
 * tint (same "bg-X-50 / dark:bg-X-500/10" pattern used for the announcement
 * categories) so the rotating panel picks up a bit of colour on every turn
 * instead of sitting on the same plain card every time. */
const SLIDES = [
  {
    title: "Compete Beyond the Classroom",
    body: "Where talent meets future-ready opportunities across every discipline in the League.",
    bg: "bg-accent-soft",
  },
  {
    title: "Grounded in Real Competencies",
    body: "Every challenge maps to a published competence framework, so performance means something afterwards.",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    title: "Judged on Evidence, Not Polish",
    body: "Transparent rubrics are shared before the event, and every score traces back to what a student actually produced.",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    title: "Built for Every Tier",
    body: "Primary, Middle and Secondary students each compete against age-appropriate standards.",
    bg: "bg-violet-50 dark:bg-violet-500/10",
  },
];

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
                src="https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?q=80&w=2400&auto=format&fit=crop"
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
                each drifts on its own timing (animate-bubble-drift, staggered
                via inline duration/delay) so the cluster wanders rather than
                bobbing in lockstep. Purely background: z-0, and the content
                below is explicit z-10 so text always stays legible on top. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
              <span
                className="absolute -top-10 -left-8 h-36 w-36 rounded-full bg-accent/10 blur-2xl animate-bubble-drift sm:h-44 sm:w-44"
                style={{ animationDuration: "16s" }}
              />
              <span
                className="absolute top-[6%] right-[9%] h-20 w-20 rounded-full bg-white/50 blur-xl animate-bubble-drift"
                style={{ animationDuration: "11s", animationDelay: "-3s" }}
              />
              <span
                className="absolute bottom-[12%] left-[7%] h-16 w-16 rounded-full bg-accent/15 blur-lg animate-bubble-drift"
                style={{ animationDuration: "13s", animationDelay: "-7s" }}
              />
              <span
                className="absolute right-[13%] bottom-[16%] h-12 w-12 rounded-full bg-white/40 blur-md animate-bubble-drift"
                style={{ animationDuration: "9s", animationDelay: "-1.5s" }}
              />
              <span
                className="absolute top-[38%] left-[18%] h-10 w-10 rounded-full bg-accent/10 blur-md animate-bubble-drift"
                style={{ animationDuration: "18s", animationDelay: "-10s" }}
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
              {/* Keying on the index replays the entrance on every change. */}
              <div key={index} className="animate-podium-in">
                <p className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{slide.title}</p>
                <p className="mx-auto mt-3 max-w-xs text-sm text-muted sm:text-base">{slide.body}</p>
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
