"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import type { CompetitionSummary } from "@/domain/competitions/types";
import { BandDivider } from "./BandDivider";

/** Same face as the Featuring Now slide titles. */
const cardTitleFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["800"],
});

/** The published 2026 programme, from ui/components/calendar/calendar2026.ts. */
const MILESTONES = [
  {
    label: "Registration",
    display: "8 Oct – 10 Nov 2026",
    note: "School and individual registration is open for both routes.",
    from: "2026-10-08",
    to: "2026-11-10",
    icon: "document",
  },
  {
    label: "Activity Period",
    display: "23 Nov – 4 Dec 2026",
    note: "Applied Skills Challenges run on weekdays only.",
    from: "2026-11-23",
    to: "2026-12-04",
    icon: "calendar",
  },
  {
    label: "Finals, Showcases & Recognition",
    display: "12-13 Dec 2026",
    note: "Live challenge finals and project showcases, followed by the awards and recognition ceremony.",
    from: "2026-12-12",
    to: "2026-12-13",
    icon: "trophy",
  },
] as const;

const icons: Record<string, ReactNode> = {
  document: <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Zm0 0v5h5M9 13h6M9 17h4" />,
  calendar: <path d="M8 2v4m8-4v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />,
  trophy: <path d="M8 21h8m-4-4v4m-6-17h12v5a6 6 0 0 1-12 0V4Zm0 2H4a2 2 0 0 0 0 4h2m12-4h2a2 2 0 0 1 0 4h-2" />,
  check: <path d="M20 6 9 17l-5-5" />,
};

type Status = "done" | "now" | "next" | "later";

const DAY = 86_400_000;

function statusesAt(now: number): { statuses: Status[]; progress: number; daysToNext: number | null } {
  const spans = MILESTONES.map((m) => ({
    from: Date.parse(`${m.from}T00:00:00`),
    // inclusive of the closing day
    to: Date.parse(`${m.to}T00:00:00`) + DAY - 1,
  }));

  const statuses: Status[] = spans.map((s) => (now > s.to ? "done" : now >= s.from ? "now" : "later"));
  const firstLater = statuses.indexOf("later");
  // Mark the soonest upcoming milestone unless something is already running.
  if (firstLater !== -1 && !statuses.includes("now")) statuses[firstLater] = "next";

  // Fill the rail to the active node, plus however far through it we are, so
  // the line lands on a node rather than at an arbitrary point between two.
  const last = MILESTONES.length - 1;
  let filled = 0;
  const activeIndex = statuses.findIndex((s) => s === "now");
  if (activeIndex !== -1) {
    const span = spans[activeIndex];
    const within = (now - span.from) / (span.to - span.from);
    filled = (activeIndex + Math.min(1, Math.max(0, within))) / last;
  } else if (statuses.every((s) => s === "done")) {
    filled = 1;
  } else {
    const upcoming = statuses.findIndex((s) => s === "next");
    filled = Math.max(0, upcoming - 1) / last;
    if (upcoming <= 0) filled = 0;
  }

  const nextIndex = statuses.findIndex((s) => s === "next" || s === "now");
  const daysToNext =
    nextIndex === -1 || statuses[nextIndex] === "now"
      ? null
      : Math.ceil((spans[nextIndex].from - now) / DAY);

  return { statuses, progress: Math.min(1, Math.max(0, filled)) * 100, daysToNext };
}

/** Today, as a whole-day number. Day granularity is all the comparisons need,
 * and it keeps the snapshot stable between renders — Date.now() would change
 * on every read and spin. The server snapshot is null so the first client
 * render matches the server's, then the real value arrives. */
const clock = {
  subscribe(onChange: () => void) {
    const id = setInterval(onChange, 3_600_000);
    return () => clearInterval(id);
  },
  getSnapshot: () => Math.floor(Date.now() / DAY),
  getServerSnapshot: () => null,
};

/** Same "don't animate for someone who asked the OS not to" check already
 * used in OrbitCardStack.tsx/LeagueSpotlight.tsx. */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function closingDateOf(item: CompetitionSummary): string | undefined {
  return item.events.find((event) => event.type === "registration_close")?.eventDate;
}

function formatClosingDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function SpotlightFace({ item }: { item: CompetitionSummary }) {
  const closingDate = closingDateOf(item);
  const notes = [item.datesCardOne, item.datesCardTwo].map((text) => text.trim()).filter((text) => text.length > 0);

  return (
    <div className="relative flex h-full w-full flex-1 flex-col items-center text-center">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 animate-pulse rounded-full bg-accent/20 blur-[90px]"
        style={{ animationDuration: "4s" }}
      />
      <div className="relative">
        <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-brand-deep-muted uppercase">Registration closes</p>
        <p className="mt-1 text-xl font-black tracking-tight text-accent sm:text-2xl">
          {closingDate ? formatClosingDate(closingDate) : "Date to be confirmed"}
        </p>
      </div>
      <div className="flex w-full flex-1 items-center justify-center px-1">
        <p className={`${cardTitleFont.className} line-clamp-3 text-2xl font-extrabold tracking-tight text-balance text-brand-deep-foreground sm:text-3xl`}>
          {item.title}
        </p>
      </div>
      {notes.length > 0 && (
        <div className="flex w-full justify-center gap-2">
          {notes.map((text, noteIndex) => (
            <div
              key={noteIndex}
              className={`flex h-[72px] min-w-0 flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] px-2.5 text-center text-xs leading-snug font-semibold text-brand-deep-foreground sm:text-sm ${notes.length === 1 ? "max-w-[50%]" : ""}`}
            >
              <span className="line-clamp-3">{text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const STACK_CARD =
  "absolute top-2 right-3 bottom-1 left-12 flex flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/15 p-6 text-center shadow-[0_16px_36px_rgba(0,0,0,0.35)] sm:left-14 sm:p-8";

/** Dark schemes far enough apart to read as different cards, still deep
 * enough for the white title and the orange date. */
const STACK_SHADES = [
  ["#343764", "#1c1e3c"],
  ["#4b2c5e", "#301a3d"],
  ["#254365", "#162a41"],
  ["#5b2f4e", "#3b1c32"],
  ["#364054", "#202837"],
  ["#22414f", "#142a33"],
] as const;

/** Every card in the deck keeps the same lean. Only position and size change,
 * so a step forward never rocks through upright. */
const STACK_EASE = "cubic-bezier(0.22, 0.8, 0.24, 1)";
const STACK_TILT = "rotate(-6deg)";

/** Two peeks stay visible. One more card waits inside the lower peek, then
 * steps out with the others so the bottom edge never pops in afterwards. */
const STACK_PEEKS = 2;

function stackPose(fromFront: number, scaleOverride?: number): string {
  const tx = fromFront * 16;
  const ty = fromFront * 20;
  const scale = (scaleOverride ?? 1 - fromFront * 0.06).toFixed(2);
  return `translate3d(${tx}px, ${ty}px, 0px) ${STACK_TILT} scale(${scale})`;
}

/** A short lift, not a flight past the section's top edge. The card fades
 * while it rises, so it is gone before it can leave the band. */
const STACK_EXIT = `translate3d(0px, -96px, 0px) ${STACK_TILT} scale(1.00)`;

function restTransform(fromFront: number): string {
  if (fromFront > STACK_PEEKS) return stackPose(STACK_PEEKS, 0.8);
  return stackPose(fromFront);
}

/** Cards waiting behind the front, in list order, including one tucked under the last peek. */
function cardsBehind(front: number, length: number): number[] {
  if (length <= 1) return [];
  const count = Math.min(STACK_PEEKS + 1, length - 1);
  return Array.from({ length: count }, (_, i) => (front + 1 + i) % length);
}

const ARROW_BUTTON =
  "grid h-7 w-7 cursor-pointer place-items-center rounded-full border border-white/30 bg-[#14152c]/80 text-brand-deep-foreground shadow-md transition-[background-color,border-color,color,scale] duration-300 hover:scale-110 hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none";

type Move = "idle" | "up" | "down";

function layerMotion(fromFront: number, move: Move, animate: boolean): { transform: string; opacity: number } {
  if (move === "up") {
    if (fromFront === 0) return { transform: STACK_EXIT, opacity: 0 };
    return { transform: restTransform(fromFront - 1), opacity: 1 };
  }
  if (move === "down") {
    // First paint parks the returning card above the deck. The next frame
    // lets it drop into front while the others step back.
    if (fromFront === -1) {
      return animate ? { transform: restTransform(0), opacity: 1 } : { transform: STACK_EXIT, opacity: 0 };
    }
    if (!animate) return { transform: restTransform(fromFront), opacity: 1 };
    return { transform: restTransform(Math.min(fromFront + 1, STACK_PEEKS)), opacity: 1 };
  }
  return { transform: restTransform(fromFront), opacity: 1 };
}

/** Front card fades upward. The cards behind step one place forward together.
 * Down brings the previous competition back in from above. */
function StackSpotlight({ competitions }: { competitions: CompetitionSummary[] }) {
  const reduceMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [move, setMove] = useState<Move>("idle");
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const length = competitions.length;

  const canPlay = !reduceMotion && length > 1;

  useEffect(() => {
    if (!canPlay || move !== "idle" || !animate || paused) return;
    const id = window.setTimeout(() => setMove("up"), 4200);
    return () => window.clearTimeout(id);
  }, [canPlay, move, animate, paused, index]);

  useEffect(() => {
    if (move === "idle") return;
    const id = window.setTimeout(() => {
      const step = move === "up" ? 1 : -1;
      setAnimate(false);
      setIndex((current) => (current + step + length) % length);
      setMove("idle");
    }, 900);
    return () => window.clearTimeout(id);
  }, [move, length]);

  useEffect(() => {
    if (animate) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [animate]);

  if (length === 0) return null;

  const previous = (index - 1 + length) % length;
  const behind = cardsBehind(index, length).filter((itemIndex) => move !== "down" || itemIndex !== previous);
  const layers = [
    ...(move === "down" ? [{ fromFront: -1, itemIndex: previous }] : []),
    { fromFront: 0, itemIndex: index },
    ...behind.map((itemIndex, position) => ({ fromFront: position + 1, itemIndex })),
  ];
  const motion = animate ? `transform 0.85s ${STACK_EASE}` : "none";
  const leave = animate ? `${motion}, opacity 0.55s ease` : "none";

  function step(direction: "up" | "down") {
    if (length < 2 || move !== "idle") return;
    if (direction === "down") setAnimate(false);
    setMove(direction);
  }

  return (
    <div
      className="relative h-full min-h-[300px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {layers
        .slice()
        .reverse()
        .map((layer) => {
          const item = competitions[layer.itemIndex] ?? competitions[0]!;
          const [from, to] = STACK_SHADES[layer.itemIndex % STACK_SHADES.length]!;
          const posed = layerMotion(layer.fromFront, move, animate);
          const clickable = layer.fromFront === 0 && move === "idle";
          const style = {
            zIndex: 10 - layer.fromFront,
            backgroundImage: `linear-gradient(to right bottom, ${from}, ${to})`,
            transition: layer.fromFront === 0 || layer.fromFront === -1 ? leave : motion,
            transform: posed.transform,
            opacity: posed.opacity,
          };
          return (
            <div
              key={layer.itemIndex}
              aria-hidden={!clickable}
              className={`${STACK_CARD} ${clickable ? "" : "pointer-events-none"}`}
              style={style}
            >
              {clickable ? (
                <Link href={`/competitions/${item.slug}`} aria-label={`View ${item.title}`} className="flex h-full w-full cursor-pointer">
                  <SpotlightFace item={item} />
                </Link>
              ) : (
                <SpotlightFace item={item} />
              )}
            </div>
          );
        })}
      {length > 1 && (
        <div className="absolute bottom-3 left-0 z-30 flex flex-col gap-1.5">
          <button type="button" aria-label="Next competition" className={ARROW_BUTTON} onClick={() => step("up")}>
            <svg viewBox="4 6 16 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-2.5 w-2.5">
              <path d="m6 14 6-6 6 6" />
            </svg>
          </button>
          <button type="button" aria-label="Previous competition" className={ARROW_BUTTON} onClick={() => step("down")}>
            <svg viewBox="4 6 16 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-2.5 w-2.5">
              <path d="m6 8 6 6 6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export function ImportantDates({ competitions }: { competitions: CompetitionSummary[] }) {
  const today = useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getServerSnapshot);
  const live = today === null ? null : statusesAt(today * DAY);

  const statuses = live?.statuses ?? (MILESTONES.map(() => "later") as Status[]);

  return (
    <section className="relative mx-4 overflow-hidden bg-[linear-gradient(100deg,#14152c_0%,#1f2041_50%,#3d4173_100%)] bg-[length:200%_200%] animate-gradient-travel px-6 pt-32 pb-36 sm:mx-6 lg:mx-10 lg:pt-36 lg:pb-40">
      {/* Same travelling indigo fill as Ways to Participate. Both edges use
          the same dome, which is a different curve from that section's wave. */}
      <BandDivider shape="curve" side="top" color="text-background" />
      <BandDivider shape="curve" side="bottom" color="text-background" flip />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/4 h-80 w-80 rounded-full bg-accent/10 blur-[130px]" />
        <div className="absolute right-0 -bottom-32 h-96 w-96 rounded-full bg-accent/[0.06] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <h2 className="flex items-center gap-3 text-sm font-bold tracking-wider text-brand-deep-foreground uppercase">
          <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
          Important Dates
        </h2>

        {/* Spotlight (a rotating competition) beside the full schedule,
            instead of four equal boxes in a row. */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-stretch">
          <StackSpotlight competitions={competitions} />

          {/* Full schedule — a compact vertical stepper rather than the old
              four-across row, so it reads as a list to scan next to the
              spotlight rather than needing its own separate width budget. */}
          <ol className="relative flex flex-col gap-1 rounded-[2rem] border border-white/10 bg-white/[0.03] p-3 sm:p-4">
            {MILESTONES.map((m, i) => {
              const status = statuses[i];
              const active = status === "now" || status === "next";
              return (
                <li
                  key={m.label}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-2xl px-3 py-3.5 transition-colors duration-200 hover:bg-white/[0.06] sm:px-4"
                >
                  {/* Giant faint step number, same trick as the About page's
                      audience cards — a shape behind the words, not a second
                      thing to read. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-3 right-2 text-[5rem] leading-none font-black tabular-nums text-brand-deep-foreground/[0.04] select-none"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span
                    className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full ring-4 ring-brand-deep transition-all duration-300 sm:h-13 sm:w-13 ${
                      status === "done"
                        ? "bg-accent/70 text-accent-foreground"
                        : active
                          ? "bg-accent text-accent-foreground shadow-[0_0_0_6px_rgba(255,105,31,0.18)]"
                          : "bg-white/10 text-brand-deep-foreground"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      {icons[status === "done" ? "check" : m.icon]}
                    </svg>
                  </span>

                  <div className="relative z-10 min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p className={`text-base font-extrabold ${active ? "text-accent" : "text-brand-deep-foreground"}`}>
                        {m.display}
                      </p>
                      <p className="text-base font-semibold text-brand-deep-muted">{m.label}</p>
                    </div>
                    {/* The finals note is long enough to cover the step number,
                        so it wraps onto two lines and stops short of that digit.
                        The shorter notes stay on one line. */}
                    <p
                      className={`mt-0.5 text-sm text-brand-deep-muted/80 ${
                        i === MILESTONES.length - 1
                          ? "line-clamp-2 pr-32"
                          : "truncate group-hover:text-clip group-hover:whitespace-normal"
                      }`}
                    >
                      {m.note}
                    </p>
                  </div>

                  {active && (
                    <span className="relative z-10 hidden shrink-0 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold tracking-wide text-accent uppercase sm:inline-block">
                      {status === "now" ? "Now" : "Next"}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
