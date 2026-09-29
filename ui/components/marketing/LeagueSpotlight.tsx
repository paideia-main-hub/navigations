"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const slideTitleFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
});

/** Landing-page slider copy. Each slide carries its own light, dark-mode-aware
 * tint (same "bg-X-50 / dark:bg-X-500/10" pattern used for the announcement
 * categories) so the rotating panel picks up a bit of colour on every turn
 * instead of sitting on the same plain card every time. `hue` picks which
 * BUBBLE_TINTS entry the background bubbles use, so they stay coordinated
 * with whichever tint is currently showing instead of a single fixed colour
 * regardless of slide. */
const SLIDE_ICONS = {
  formats: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <path d="M15 17h6M18 14v6" />
    </>
  ),
  participants: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19.5v-1.2A4.3 4.3 0 0 1 7.8 14h2.4a4.3 4.3 0 0 1 4.3 4.3v1.2" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path d="M16.2 14.2a3.6 3.6 0 0 1 3.8 3.6v1.7" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.8 8.2-1.7 5.2-5.2 1.7 1.7-5.2 5.2-1.7Z" />
      <path d="M12 3.5v1.6M12 18.9v1.6M3.5 12h1.6M18.9 12h1.6" />
    </>
  ),
  skills: (
    <>
      <path d="M12 3.2 13.6 8l4.9.4-3.8 3.2 1.2 4.8L12 13.8 8.1 16.4l1.2-4.8L5.5 8.4 10.4 8 12 3.2Z" />
      <path d="M5 19.5h14" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.4 3.4 5.3 3.4 8.5s-1.2 6.1-3.4 8.5c-2.2-2.4-3.4-5.3-3.4-8.5s1.2-6.1 3.4-8.5Z" />
    </>
  ),
  certificate: (
    <>
      <path d="M7 3.5h7.2L18.5 8v12.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path d="M14 3.5V8h4.5M8.5 12h5M8.5 15h3" />
      <circle cx="15.5" cy="16.2" r="2.3" />
      <path d="m14.6 18.2-1 2.3 1.9-1 1.9 1-1-2.3" />
    </>
  ),
  medal: (
    <>
      <path d="m8 3.5 4 6.5 4-6.5" />
      <circle cx="12" cy="14.5" r="5" />
      <path d="m10.4 14.5 1.2 1.2 2.2-2.4" />
    </>
  ),
  educator: (
    <>
      <path d="m3 9 9-4.5L21 9l-9 4.5L3 9Z" />
      <path d="M7 11.2V15c0 1.8 2.2 3.2 5 3.2s5-1.4 5-3.2v-3.8" />
      <path d="M21 9v6" />
    </>
  ),
  parents: (
    <>
      <path d="M12 5.4c-.6-1.2-2.2-1.5-3-.7s-.6 1.9.3 2.7L12 9.6l2.7-2.2c.9-.8 1.1-1.9.3-2.7s-2.4-.5-3 .7Z" />
      <circle cx="7.2" cy="13" r="2" />
      <path d="M3.2 20.8c0-2.5 1.8-4.3 4-4.3s4 1.8 4 4.3" />
      <circle cx="16.6" cy="14.2" r="1.55" />
      <path d="M14 20.8c0-2 1.2-3.3 2.6-3.3s2.6 1.3 2.6 3.3" />
    </>
  ),
  school: (
    <>
      <path d="M4 20.5V10L12 5l8 5v10.5" />
      <path d="M9.5 20.5v-4.5h5V20.5" />
      <path d="m12 11.2.5 1 1.1.1-.8.7.3 1.1-1.1-.6-1.1.6.3-1.1-.8-.7 1.1-.1.5-1Z" />
    </>
  ),
} satisfies Record<string, ReactNode>;

type SlideIcon = keyof typeof SLIDE_ICONS;
type SlideCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const CORNERS: Record<SlideCorner, string> = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-12 left-4",
  "bottom-right": "bottom-12 right-4",
};

/** A step darker than each slide wash, so the mark reads as part of the
 * card rather than a separate badge. */
const INK = {
  accent: "text-[#e8b394] dark:text-[#d48962]",
  blue: "text-blue-300 dark:text-blue-300/70",
  emerald: "text-emerald-300 dark:text-emerald-300/70",
  violet: "text-violet-300 dark:text-violet-300/70",
} as const;

/** Active dot is a solid step darker than the slide wash; idle dots are the
 * same hue, lighter, so the row still reads against that background. */
const DOT = {
  accent: {
    active: "bg-[#d4652e] dark:bg-[#ff8a4a]",
    idle: "bg-[#e8b394] hover:bg-[#d4956e] dark:bg-[#d48962]/55 dark:hover:bg-[#d48962]",
  },
  blue: {
    active: "bg-blue-600 dark:bg-blue-400",
    idle: "bg-blue-300 hover:bg-blue-400 dark:bg-blue-400/40 dark:hover:bg-blue-400/70",
  },
  emerald: {
    active: "bg-emerald-600 dark:bg-emerald-400",
    idle: "bg-emerald-300 hover:bg-emerald-400 dark:bg-emerald-400/40 dark:hover:bg-emerald-400/70",
  },
  violet: {
    active: "bg-violet-600 dark:bg-violet-400",
    idle: "bg-violet-300 hover:bg-violet-400 dark:bg-violet-400/40 dark:hover:bg-violet-400/70",
  },
} as const;

const SLIDES: { title: string; body: string; bg: string; icon: SlideIcon; corner: SlideCorner; ink: string; hue: keyof typeof INK }[] = [
  {
    title: "25+ Competitions & Challenges",
    body: "Diverse opportunities across multiple challenge formats.",
    bg: "bg-accent-soft",
    icon: "formats",
    corner: "top-right",
    ink: INK.accent,
    hue: "accent",
  },
  {
    title: "1,500+ Participants",
    body: "City-wide participation by students from across Lahore.",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    icon: "participants",
    corner: "bottom-left",
    ink: INK.blue,
    hue: "blue",
  },
  {
    title: "40+ Future Competencies",
    body: "Grounded in recognised Future Competence Frameworks.",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    icon: "compass",
    corner: "top-left",
    ink: INK.emerald,
    hue: "emerald",
  },
  {
    title: "100+ Skills Being Demonstrated",
    body: "Making students' abilities visible beyond academic grades.",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    icon: "skills",
    corner: "bottom-right",
    ink: INK.violet,
    hue: "violet",
  },
  {
    title: "Connected with the United Nations SDGs",
    body: "Challenges linked with global priorities and real-world issues.",
    bg: "bg-accent-soft",
    icon: "globe",
    corner: "bottom-left",
    ink: INK.accent,
    hue: "accent",
  },
  {
    title: "Every Participant Recognised",
    body: "Digital certificate and badge for every eligible participant.",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    icon: "certificate",
    corner: "top-right",
    ink: INK.blue,
    hue: "blue",
  },
  {
    title: "Awards & Distinctions for Students",
    body: "Competition Distinctions, Spotlight and Sports Recognition Awards.",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    icon: "medal",
    corner: "bottom-right",
    ink: INK.emerald,
    hue: "emerald",
  },
  {
    title: "Recognition for Educators",
    body: "Honouring educators who guide and enable participation.",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    icon: "educator",
    corner: "top-left",
    ink: INK.violet,
    hue: "violet",
  },
  {
    title: "Honouring Parent Support",
    body: "Valuing parents who encourage participation and growth.",
    bg: "bg-accent-soft",
    icon: "parents",
    corner: "top-left",
    ink: INK.accent,
    hue: "accent",
  },
  {
    title: "School Excellence Awards",
    body: "Recognising achievement, participation and activity diversity.",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    icon: "school",
    corner: "bottom-right",
    ink: INK.blue,
    hue: "blue",
  },
];

/** [saturated tint, softer tint] per hue — two shades of the same slide
 * colour, mixed in with a couple of plain white "glossy highlight" bubbles
 * below so the cluster reads as coloured light rather than a flat wash. */
const BUBBLE_TINTS: Record<string, [string, string]> = {
  accent: ["bg-accent/35", "bg-accent/20"],
  blue: ["bg-blue-400/40", "bg-blue-300/25"],
  emerald: ["bg-emerald-400/40", "bg-emerald-300/25"],
  violet: ["bg-violet-400/40", "bg-violet-300/25"],
};

function SlideGlyph({ name, corner, ink }: { name: SlideIcon; corner: SlideCorner; ink: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute z-0 animate-spotlight-mark-in ${CORNERS[corner]} ${ink}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-20 w-20 animate-spotlight-mark-float sm:h-24 sm:w-24"
      >
        {SLIDE_ICONS[name]}
      </svg>
    </span>
  );
}

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
          {/* Static half — the League poster fills this card. */}
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/10 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.6)] sm:min-h-[420px] lg:h-full">
            <img
              src="/future-ready-league-lahore-2026.png"
              alt="Future Ready League, a citywide initiative by Navigations. Lahore Edition 2026."
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {/* Rotating half. */}
          <div
            className={`relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-tl-[2rem] rounded-tr-2xl rounded-br-[2rem] rounded-bl-2xl border border-border px-14 py-10 text-center transition-colors duration-500 sm:min-h-[420px] ${slide.bg}`}
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

            <SlideGlyph key={index} name={slide.icon} corner={slide.corner} ink={slide.ink} />

            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous highlight"
              className="absolute top-1/2 left-3 z-10 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <span aria-hidden="true">‹</span>
            </button>

            <div aria-live="polite" aria-atomic="true" className="relative z-10 mx-auto w-full max-w-xs">
              {/* Keying on the index replays the entrance on every change.
                  Title and body each run the same blur-to-focus entrance
                  (animate-spotlight-text-in, app/globals.css), with the body
                  starting slightly after the title so the two cascade in
                  rather than materialising as one flat block. */}
              <div key={index}>
                <p
                  className={`${slideTitleFont.className} animate-spotlight-text-in text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl`}
                  style={{ animationDelay: "0ms" }}
                >
                  {slide.title}
                </p>
                <p
                  className="animate-spotlight-text-in mx-auto mt-4 text-base text-muted sm:text-lg"
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
              className="absolute top-1/2 right-3 z-10 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
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
                  className={`h-2 cursor-pointer rounded-full transition-all focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none ${
                    i === index ? `w-6 ${DOT[slide.hue].active}` : `w-2 ${DOT[slide.hue].idle}`
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
