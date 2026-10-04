"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSwipeNavigation } from "@/ui/hooks/useSwipeNavigation";

const slideTitleFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
});

/** Wordmark blue from the Navigations logo. Same fill on every slide. */
const CARD = "bg-brand-deep";
const ARROW =
  "border-white/45 bg-white/10 text-white hover:border-white hover:bg-white hover:text-brand-deep focus-visible:ring-white";
const DOT = {
  active: "bg-white",
  idle: "bg-white/40 hover:bg-white/70",
} as const;

const SLIDES: { title: string }[] = [
  { title: "25+ Competitions & Challenges" },
  { title: "1500+ Participants" },
  { title: "40+ Future Competencies" },
  { title: "100+ Skills Being Demonstrated" },
  { title: "Connected with the United Nations SDGs" },
  { title: "Every Participant Recognised" },
  { title: "Awards & Distinctions for Students" },
  { title: "Recognition for Educators" },
  { title: "Honouring Parent Support" },
  { title: "School Excellence Awards" },
];

/** Square grid in a quieter step of the card's own indigo, not a second hue. */
function CardNet() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 h-full w-full">
      <defs>
        <pattern id="featuring-net" width="45" height="45" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0.8" x2="45" y2="0.8" stroke="#34375a" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 5" />
          <line x1="0.8" y1="0" x2="0.8" y2="45" stroke="#34375a" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#featuring-net)" />
    </svg>
  );
}

const EMPHASIS = ["Distinctions", "Educators", "Parent", "Excellence", "SDGs", "Participant"] as const;
const FIGURE = "block text-7xl leading-none text-accent sm:text-[5.5rem]";
/** Orange words sit below the figure size. Longer ones scale down to stay on one line. */
const WORD_SIZE: Record<(typeof EMPHASIS)[number], string> = {
  Parent: "block leading-none text-accent text-[length:min(4rem,22cqi)]",
  Educators: "block leading-none text-accent text-[length:min(4rem,18cqi)]",
  Excellence: "block leading-none text-accent text-[length:min(4rem,17cqi)]",
  Distinctions: "block leading-none text-accent text-[length:min(4rem,15.5cqi)]",
  SDGs: "block text-5xl leading-none text-accent sm:text-6xl",
  Participant: "block leading-none text-accent text-[length:min(4rem,16cqi)]",
};
const REST = "block text-3xl sm:text-4xl";

function SlideTitle({ title }: { title: string }) {
  if (title === "40+ Future Competencies") {
    return (
      <>
        <span className={FIGURE}>40+</span>
        <span className={`mt-3 ${REST}`}>Future</span>
        <span className={`mt-1 ${REST}`}>Competencies</span>
      </>
    );
  }

  const figure = /^(\d[\d,]*\+?)\s+(.+)$/.exec(title);
  if (figure) {
    return (
      <>
        <span className={FIGURE}>{figure[1]}</span>
        <span className={`mt-3 ${REST}`}>{figure[2]}</span>
      </>
    );
  }

  const word = EMPHASIS.find((item) => title.includes(item));
  if (!word) return title;
  const [before, after] = title.split(word);
  return (
    <>
      {before.trim() ? <span className={REST}>{before.trim()}</span> : null}
      <span className={`${before.trim() ? "mt-2 " : ""}${WORD_SIZE[word]}`}>{word}</span>
      {after.trim() ? <span className={`mt-3 ${REST}`}>{after.trim()}</span> : null}
    </>
  );
}

const INTERVAL_MS = 3000;

const CTA =
  "inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-sm font-bold transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none";

export function LeagueSpotlight({ nominationsOpen }: { nominationsOpen: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showNominationsClosed, setShowNominationsClosed] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!showNominationsClosed) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowNominationsClosed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showNominationsClosed]);

  const slide = SLIDES[index];
  const swipe = useSwipeNavigation(
    useCallback((direction) => {
      setIndex((current) => ((current + direction) % SLIDES.length + SLIDES.length) % SLIDES.length);
    }, []),
  );

  return (
    <section className="bg-background px-6 pt-8 pb-16 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <p className="flex items-center gap-3 text-sm font-bold tracking-wider text-foreground uppercase">
          <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
          Featuring Now
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          {/* Static half — the League poster fills this card. */}
          <div className="relative grid min-h-[320px] place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_25px_60px_-25px_rgba(0,0,0,0.6)] sm:min-h-[420px] lg:h-full">
            <img
              src="/future-ready-league.png"
              alt="Future Ready League, a citywide initiative by Navigations. Lahore Edition 2026."
              className="h-full w-full object-contain"
            />
          </div>

          {/* Rotating half. */}
          <div
            className={`group relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 px-14 py-10 text-center shadow-[0_28px_64px_-18px_rgba(0,0,0,0.72),0_10px_28px_-8px_rgba(0,0,0,0.4)] touch-pan-y sm:min-h-[420px] ${CARD}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            onTouchStart={swipe.onTouchStart}
            onTouchEnd={swipe.onTouchEnd}
            aria-roledescription="carousel"
            aria-label="League highlights"
          >
            <CardNet />

            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous highlight"
              className={`absolute top-1/2 left-3 z-10 hidden h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border opacity-0 transition-opacity duration-300 sm:grid sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none ${ARROW}`}
            >
              <svg viewBox="5 3 12 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-2.5">
                <path d="M15 5 7 12l8 7" />
              </svg>
            </button>

            <div aria-live="polite" aria-atomic="true" className="@container relative z-10 mx-auto w-full">
              <div key={index}>
                <p className={`${slideTitleFont.className} animate-spotlight-text-in text-3xl font-extrabold tracking-tight text-brand-deep-foreground sm:text-4xl`}>
                  <SlideTitle title={slide.title} />
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
              className={`absolute top-1/2 right-3 z-10 hidden h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border opacity-0 transition-opacity duration-300 sm:grid sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none ${ARROW}`}
            >
              <svg viewBox="7 3 12 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-2.5">
                <path d="m9 5 8 7-8 7" />
              </svg>
            </button>

            <div className="absolute bottom-6 z-10 flex items-center gap-2">
              {SLIDES.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show highlight ${i + 1}: ${s.title}`}
                  aria-current={i === index}
                  className={`h-1.5 cursor-pointer rounded-full transition-all focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none ${
                    i === index ? `w-4 ${DOT.active}` : `w-1.5 ${DOT.idle}`
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className={`${CTA} bg-accent text-accent-foreground hover:bg-brand-deep hover:text-accent`}
          >
            Register Now
            <span aria-hidden="true">→</span>
          </Link>

          {nominationsOpen ? (
            <Link
              href="/dashboard/nominate"
              className={`${CTA} border border-border bg-surface text-foreground hover:border-accent hover:text-accent`}
            >
              Nominate Now
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShowNominationsClosed(true)}
              className={`${CTA} cursor-pointer border border-border bg-surface text-foreground hover:border-accent hover:text-accent`}
            >
              Nominate Now
              <span aria-hidden="true">→</span>
            </button>
          )}

          <Link
            href="/"
            className={`${CTA} border border-border bg-surface text-foreground hover:border-accent hover:text-accent`}
          >
            Submit Now
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {showNominationsClosed ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="nominations-closed-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-deep/55 p-6 backdrop-blur-[2px]"
          onClick={() => setShowNominationsClosed(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-[0_28px_60px_-28px_rgba(31,32,65,0.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="nominations-closed-title" className="text-lg font-bold text-foreground">
              Nominations not open yet
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Nominations date has not come up yet. Please check back when award categories are opened for
              nominations.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                ref={closeRef}
                type="button"
                onClick={() => setShowNominationsClosed(false)}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground hover:opacity-90"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
