"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/** Placeholder copy — real slides to be supplied. Deliberately carries no
 * counters or figures. */
const SLIDES = [
  {
    title: "Compete Beyond the Classroom",
    body: "Where talent meets future-ready opportunities across every discipline in the League.",
  },
  {
    title: "Grounded in Real Competencies",
    body: "Every challenge maps to a published competence framework, so performance means something afterwards.",
  },
  {
    title: "Judged on Evidence, Not Polish",
    body: "Transparent rubrics are shared before the event, and every score traces back to what a student actually produced.",
  },
  {
    title: "Built for Every Tier",
    body: "Primary, Middle and Secondary students each compete against age-appropriate standards.",
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
          {/* Static half — the League billboard. */}
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl sm:min-h-[420px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- static asset in public/, not a remote host Next Image needs configuring for */}
            <img
              src="/depositphotos_4028675-stock-illustration-cheering-crowd.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-deep via-brand-deep/70 to-brand-deep/20" />
            <div className="relative flex h-full flex-col justify-end p-7 sm:p-10">
              <h2 className="text-3xl leading-[1.05] font-extrabold tracking-tight text-white sm:text-5xl">
                FUTURE READY
                <br />
                <span className="text-accent">LEAGUE</span>
              </h2>
              <p className="mt-4 text-xl font-semibold text-white sm:text-2xl">Lahore Edition 2026</p>
              <p className="mt-2 max-w-sm text-sm text-brand-deep-foreground sm:text-base">
                Academically grounded in Future Competence Frameworks
              </p>
            </div>
          </div>

          {/* Rotating half. */}
          <div
            className="relative flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-border bg-surface px-14 py-10 text-center sm:min-h-[420px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            aria-roledescription="carousel"
            aria-label="League highlights"
          >
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous highlight"
              className="absolute top-1/2 left-3 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <span aria-hidden="true">‹</span>
            </button>

            <div aria-live="polite" aria-atomic="true" className="w-full">
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
              className="absolute top-1/2 right-3 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <span aria-hidden="true">›</span>
            </button>

            <div className="absolute bottom-6 flex items-center gap-2">
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
