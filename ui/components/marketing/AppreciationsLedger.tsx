"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { sourceSerif as serif } from "@/app/fonts";
import type { Appreciation } from "@/domain/appreciations/types";
import { useSwipeNavigation } from "@/ui/hooks/useSwipeNavigation";
import { BandDivider } from "./BandDivider";

const THEMES = [
  { sheet: "#b14e2c", pill: "bg-[#f6e4d6] text-[#b14e2c]", school: "text-[#b14e2c]" },
  { sheet: "#186064", pill: "bg-[#d7efec] text-[#186064]", school: "text-[#186064]" },
  { sheet: "#165091", pill: "bg-[#dce7f5] text-[#165091]", school: "text-[#165091]" },
  { sheet: "#b87a1c", pill: "bg-[#f7ecd0] text-[#a56c14]", school: "text-[#b87a1c]" },
] as const;

const LABELS = ["Participation", "Preparation", "Coordination", "Communication"] as const;

const SLIDE_MS = 550;

function labelFor(heading: string, index: number): string {
  const found = LABELS.find((label) => heading.toLowerCase().includes(label.toLowerCase()));
  return (found ?? LABELS[index % LABELS.length]).toUpperCase();
}

function useVisibleCount(): number {
  const [visible, setVisible] = useState(3);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setVisible(width >= 1024 ? 3 : width >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return visible;
}

function Paperclip() {
  const id = useId().replace(/:/g, "");
  // The outer loop stays in front of the sheets. The inner wire runs behind
  // them, so only the short length that sticks up above the paper is drawn.
  const front = "M26 100 C26 116 7 116 7 98 L7 18 C7 5 33 5 33 18 L33 88";
  const back = "M33 88 C33 104 15 104 15 86 L15 30 C15 20 25 20 25 32 L25 64";

  return (
    <svg viewBox="0 0 40 124" aria-hidden="true" className="h-[4.5rem] w-6">
      <defs>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="0.15">
          <stop offset="0%" stopColor="#fff8e8" />
          <stop offset="16%" stopColor="#f2d48a" />
          <stop offset="38%" stopColor="#b8883a" />
          <stop offset="54%" stopColor="#fff3cc" />
          <stop offset="74%" stopColor="#d7b15e" />
          <stop offset="100%" stopColor="#6d4c1e" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-60%" y="-15%" width="220%" height="150%">
          <feDropShadow dx="0.4" dy="1.3" stdDeviation="0.7" floodColor="#3a2410" floodOpacity="0.38" />
        </filter>
        <clipPath id={`${id}-above`}>
          <rect x="-6" y="-6" width="52" height="45" />
        </clipPath>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <g clipPath={`url(#${id}-above)`}>
          <path d={back} fill="none" stroke="#5c3d16" strokeWidth="3.9" strokeLinecap="round" strokeLinejoin="round" transform="translate(0.45 0.55)" />
          <path d={back} fill="none" stroke={`url(#${id}-brass)`} strokeWidth="3.05" strokeLinecap="round" strokeLinejoin="round" />
          <path d={back} fill="none" stroke="#fffaf0" strokeWidth="0.75" strokeLinecap="round" strokeOpacity="0.55" transform="translate(-0.28 0)" />
        </g>
        <path d={front} fill="none" stroke="#5c3d16" strokeWidth="3.9" strokeLinecap="round" strokeLinejoin="round" transform="translate(0.45 0.55)" />
        <path d={front} fill="none" stroke={`url(#${id}-brass)`} strokeWidth="3.05" strokeLinecap="round" strokeLinejoin="round" />
        <path d={front} fill="none" stroke="#fffaf0" strokeWidth="0.75" strokeLinecap="round" strokeOpacity="0.55" transform="translate(-0.28 0)" />
      </g>
    </svg>
  );
}

function LedgerCard({ item, index }: { item: Appreciation; index: number }) {
  const theme = THEMES[index % THEMES.length];

  return (
    <article className="relative flex h-full w-full flex-col pt-10">
      <div aria-hidden="true" className="absolute inset-x-0 top-0" style={{ bottom: "0.85rem" }}>
        <svg className="block h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            fill={theme.sheet}
            d="M0 4.8 Q50 0 93 0 C100 26 100 68 94 100 L0 100 Z"
          />
        </svg>
      </div>
      <div
        className="relative z-0 ml-4 mr-6 flex flex-1 flex-col px-4 pt-12 pb-12"
        style={{ transform: "perspective(720px) rotateX(5deg)", transformOrigin: "center top" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[#fbf8f3]"
        />
        <span aria-hidden="true" className="absolute top-0 left-[10%] z-10 -translate-y-[58%] rotate-[-8deg]">
          <Paperclip />
        </span>
        <span
          aria-hidden="true"
          className={`${serif.className} pointer-events-none absolute top-5 right-4 text-5xl leading-none text-transparent`}
          style={{ textShadow: "-1px -1px 0 rgba(255,255,255,0.95), 1px 1px 1px rgba(31,32,65,0.14)" }}
        >
          ”
        </span>
        <p className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] ${theme.pill}`}>
          {labelFor(item.heading, index)}
        </p>
        <h3 className={`${serif.className} mt-4 text-[1.65rem] leading-[1.15] font-semibold tracking-tight text-[#1a2744]`}>
          {item.heading}
        </h3>
        <span aria-hidden="true" className="mt-4 block h-px w-10" style={{ backgroundColor: theme.sheet }} />
        <p className={`mt-4 text-[11px] font-bold tracking-[0.14em] uppercase ${theme.school}`}>{item.schoolNames}</p>
        <p className="mt-3 text-sm leading-relaxed text-[#5c6570]">{item.description}</p>
        <p className="mt-6 text-sm text-[#1a2744]">
          <span className="italic">With appreciation</span>
          <span className="mt-0.5 block text-[11px] font-bold tracking-[0.12em] uppercase">{item.byLine}</span>
        </p>
      </div>
    </article>
  );
}

export function AppreciationsLedger({ appreciations }: { appreciations: Appreciation[] }) {
  const visible = useVisibleCount();
  const count = appreciations.length;
  // Copies of the edge cards sit on both ends so a step past either
  // end can slide, then the track jumps back to the same cards.
  const lead = count === 0 ? 0 : Math.min(visible, count);
  const slides =
    count > 0
      ? [...appreciations.slice(count - lead), ...appreciations, ...appreciations.slice(0, lead)]
      : [];
  const [index, setIndex] = useState(lead);
  const [from, setFrom] = useState(lead);
  const [moving, setMoving] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const start = count === 0 ? 0 : Math.min(visible, count);
    setMoving(false);
    setFrom(start);
    setAnimate(false);
    setIndex(start);
  }, [visible, count]);

  useEffect(() => {
    if (!moving) return;
    const id = window.setTimeout(() => setMoving(false), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [index, moving]);

  useEffect(() => {
    if (count === 0) return;
    const start = Math.min(visible, count);
    const needsSnap = index >= start + count || index < start;
    if (!needsSnap) return;
    const id = window.setTimeout(() => {
      const snapped = index >= start + count ? index - count : index + count;
      setMoving(false);
      setFrom(snapped);
      setAnimate(false);
      setIndex(snapped);
    }, SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [index, count, visible]);

  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  const swipe = useSwipeNavigation(
    useCallback(
      (direction) => {
        if (moving || count === 0) return;
        setFrom(index);
        setMoving(true);
        setAnimate(true);
        setIndex(index + direction);
      },
      [moving, count, index],
    ),
    { enabled: count > 1 },
  );

  if (count === 0) return null;

  function begin(next: number) {
    setFrom(index);
    setMoving(true);
    setAnimate(true);
    setIndex(next);
  }

  function go(direction: 1 | -1) {
    if (moving) return;
    begin(index + direction);
  }

  const active = ((index - lead) % count + count) % count;

  return (
    <section className="relative mx-4 overflow-x-clip rounded-[2rem] bg-[#f0e0d2] px-6 pt-16 pb-20 touch-pan-y sm:mx-6 sm:rounded-[2.5rem] sm:pt-20 sm:pb-24 lg:mx-10 lg:pt-28 lg:pb-32 dark:bg-[#181428]">
      <BandDivider shape="curve" side="top" color="text-background" />
      <BandDivider shape="curve" side="bottom" color="text-background" flip />

      {/* Same warm fill and dotted net as Announcements. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <svg className="absolute inset-0 h-full w-full dark:hidden">
          <defs>
            <pattern id="appreciate-net-light" width="45" height="45" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0.8" x2="45" y2="0.8" stroke="#d8c0ac" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 5" />
              <line x1="0.8" y1="0" x2="0.8" y2="45" stroke="#d8c0ac" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#appreciate-net-light)" />
        </svg>
        <svg className="absolute inset-0 hidden h-full w-full dark:block">
          <defs>
            <pattern id="appreciate-net-dark" width="45" height="45" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0.8" x2="45" y2="0.8" stroke="#2c2640" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 5" />
              <line x1="0.8" y1="0" x2="0.8" y2="45" stroke="#2c2640" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#appreciate-net-dark)" />
        </svg>
      </div>

      <div className="relative mx-auto flex max-w-7xl items-stretch gap-5 lg:gap-6">
        <aside className="relative hidden w-36 shrink-0 bg-[#1a2744] text-white lg:block">
          <div className="absolute inset-0 flex flex-col items-center px-3 py-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <span className="h-px w-8 bg-white/75" />
              <p className="text-[11px] font-medium tracking-[0.28em]">NAVIGATIONS</p>
            </div>
            <span className="my-4 w-px flex-1 bg-white/30" />
            <p className="text-[12px] leading-[1.65] font-semibold tracking-[0.18em]">
              SCHOOL
              <br />
              PARTNER
              <br />
              APPRECIATION
              <br />
              LEDGER
            </p>
            <span className="my-4 w-px flex-1 bg-white/30" />
            <div className="flex flex-col items-center gap-3">
              <span className="h-px w-8 bg-white/55" />
              <p className="text-[10px] leading-[1.7] font-medium tracking-[0.16em] text-white/80">
                SHARED
                <br />
                JOURNEYS
                <br />
                BRIGHTER
                <br />
                POSSIBILITIES
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-[#1a2744] sm:text-4xl lg:text-5xl">
                Appreciating Our School Partners
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[#5c6570] sm:text-base">
                Recognising the commitment and collaboration of schools in creating opportunities for learners to develop and demonstrate future competencies.
              </p>
            </div>
            <p className="inline-flex items-center gap-2 rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent">
              View all appreciations
              <span aria-hidden="true">→</span>
            </p>
          </div>

          {/* The clip is on the inner box, so a card sliding in never
              paints outside this column. The shadow is a filter on the
              outer box, taken from those already-clipped cards, so it can
              fade past the clip the way the Explore Competitions fan does. */}
          <div
            className="mt-10 touch-pan-y pb-16 max-sm:-mx-4 max-sm:pb-4"
            onTouchStart={swipe.onTouchStart}
            onTouchEnd={swipe.onTouchEnd}
            style={{
              filter:
                "drop-shadow(18px 14px 16px rgba(40, 28, 12, 0.2)) drop-shadow(6px 20px 12px rgba(40, 28, 12, 0.16))",
            }}
          >
            <div className="overflow-hidden">
              <div
                className="flex"
                style={{
                  width: `${(slides.length / visible) * 100}%`,
                  transform: `translate3d(-${(index * 100) / slides.length}%, 0, 0)`,
                  transition: animate ? `transform ${SLIDE_MS}ms cubic-bezier(0.22, 0.8, 0.24, 1)` : "none",
                }}
              >
                {slides.map((item, slideIndex) => {
                  const rangeStart = moving ? Math.min(from, index) : index;
                  const rangeEnd = moving ? Math.max(from, index) + visible : index + visible;
                  const onStage = slideIndex >= rangeStart && slideIndex < rangeEnd;
                  return (
                    <div
                      key={`${item.id}-${slideIndex}`}
                      aria-hidden={onStage ? undefined : true}
                      className={`flex pt-8 max-sm:px-0 sm:pr-2 sm:pl-4 ${onStage ? "" : "invisible"}`}
                      style={{ width: `${100 / slides.length}%` }}
                    >
                      <LedgerCard item={item} index={slideIndex % count} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative mt-2 flex items-center justify-center sm:mt-4">
            {/* Mobile: slide counter. Desktop: dots. */}
            <p
              aria-live="polite"
              className="rounded-full bg-foreground/8 px-3 py-1 text-center text-[11px] font-bold tracking-wide text-foreground tabular-nums sm:hidden"
            >
              {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
            <div className="hidden items-center gap-3 sm:flex">
              <span aria-hidden="true" className="h-px w-10 bg-[#8a8174] dark:bg-[#6a6478]" />
              <div className="flex items-center gap-2">
                {appreciations.map((item, dotIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Show appreciation ${dotIndex + 1}`}
                    aria-current={dotIndex === active}
                    onClick={() => {
                      if (moving) return;
                      begin(lead + dotIndex);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      dotIndex === active ? "w-2 bg-accent" : "w-2 bg-[#6f675c] dark:bg-[#8a8498]"
                    }`}
                  />
                ))}
              </div>
              <span aria-hidden="true" className="h-px w-10 bg-[#8a8174] dark:bg-[#6a6478]" />
            </div>
            <div className="absolute right-0 hidden gap-2 sm:flex">
              <button
                type="button"
                aria-label="Previous appreciation"
                onClick={() => go(-1)}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[#e4dfd6] bg-white text-[#1a2744] shadow-sm transition-colors hover:border-accent hover:text-accent"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-3.5">
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next appreciation"
                onClick={() => go(1)}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-accent text-accent-foreground shadow-sm transition-colors hover:bg-accent/90"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-3.5">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
