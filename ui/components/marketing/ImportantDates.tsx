"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { unbounded as dateNumeralFont } from "@/app/fonts";
import { shortLabelForEvent, sortCompetitionEvents } from "@/domain/competitions/dateLabels";
import type { CompetitionSummary } from "@/domain/competitions/types";
import { formatEventDateOnly } from "@/ui/components/admin/eventDateFormat";
import { useSwipeNavigation } from "@/ui/hooks/useSwipeNavigation";
import { BandDivider } from "./BandDivider";

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

function competitionDateOf(item: CompetitionSummary): string | undefined {
  // Competition day is stored as a round. Prefer the earliest round; fall back
  // to the final event only when no live slot exists for this competition.
  const rounds = item.events
    .filter((event) => event.type === "round")
    .map((event) => event.eventDate)
    .sort();
  if (rounds[0]) return rounds[0];
  return item.events.find((event) => event.type === "final_event")?.eventDate;
}

/** Midday local so a date-only ISO string does not slip to the previous day. */
function formatCompetitionDate(iso: string): { day: string; month: string; year: string } {
  const stamp = /^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(0, 10)}T12:00:00` : iso;
  const date = new Date(stamp);
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: date.toLocaleDateString("en-GB", { month: "long" }),
    year: String(date.getFullYear()),
  };
}

/** Same stroke family as the old Featuring Now corner marks. */
const SLIDE_ICONS = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16.2 16.2 4.3 4.3" />
    </>
  ),
  debate: (
    <>
      <path d="M5 5.5h9.5A2.5 2.5 0 0 1 17 8v4.5a2.5 2.5 0 0 1-2.5 2.5H9.5L5.5 18.5V5.5Z" />
      <path d="M17 9.5h1.5A2.5 2.5 0 0 1 21 12v3.5a2.5 2.5 0 0 1-2.5 2.5H16l-2 2v-2" />
    </>
  ),
  code: (
    <>
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 6l-2 12" />
    </>
  ),
  scroll: (
    <>
      <path d="M7 4.5h8.5A2.5 2.5 0 0 1 18 7v12.5H8.5A2.5 2.5 0 0 1 6 17V6.5A2 2 0 0 1 8 4.5" />
      <path d="M9.5 9.5h6M9.5 13h6M9.5 16.5h3.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.8 8.2-1.7 5.2-5.2 1.7 1.7-5.2 5.2-1.7Z" />
      <path d="M12 3.5v1.6M12 18.9v1.6M3.5 12h1.6M18.9 12h1.6" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3.2 13.6 8l4.9.4-3.8 3.2 1.2 4.8L12 13.8 8.1 16.4l1.2-4.8L5.5 8.4 10.4 8 12 3.2Z" />
    </>
  ),
  inquiry: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.4a2.6 2.6 0 1 1 3.8 2.3c-.8.5-1.3 1-1.3 2v.5" />
      <path d="M12 17.2h.01" />
    </>
  ),
  summit: (
    <>
      <path d="m4 17.5 4-7 3 4 3.5-6.5 5.5 9.5" />
      <path d="M3.5 19.5h17" />
    </>
  ),
  heart: (
    <>
      <path d="M12 19.5s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 7.2a3.8 3.8 0 0 1 7 3.1c0 4.8-7 9.2-7 9.2Z" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3.5" width="6" height="10" rx="3" />
      <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5M9 20.5h6" />
    </>
  ),
  pixels: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <path d="M15 17h6M18 14v6" />
    </>
  ),
  flask: (
    <>
      <path d="M10 3.5h4M11 3.5v5.2L6.8 18a2.4 2.4 0 0 0 2.1 3.5h6.2a2.4 2.4 0 0 0 2.1-3.5L13 8.7V3.5" />
      <path d="M8.2 14.5h7.6" />
    </>
  ),
  pen: (
    <>
      <path d="M13.5 5.5 18.5 10.5 9 20H4v-5L13.5 5.5Z" />
      <path d="m12 7 5 5" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 3.5c3.5 2.2 5.5 5.8 5.8 10.2l-2.6 1.1-1.7-1.7-1.5 3.4-1.5-3.4-1.7 1.7-2.6-1.1C6.5 9.3 8.5 5.7 12 3.5Z" />
      <path d="M9.2 17.2 8 20.5l2.2-1.1M14.8 17.2 16 20.5l-2.2-1.1" />
    </>
  ),
  wave: (
    <>
      <path d="M3.5 14c2-3 3.5-3 5.5 0s3.5 3 5.5 0 3.5-3 5.5 0" />
      <path d="M3.5 9c2-3 3.5-3 5.5 0s3.5 3 5.5 0 3.5-3 5.5 0" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.4 3.4 5.3 3.4 8.5s-1.2 6.1-3.4 8.5c-2.2-2.4-3.4-5.3-3.4-8.5s1.2-6.1 3.4-8.5Z" />
    </>
  ),
  microscope: (
    <>
      <path d="M9 4.5h4.5M11.2 4.5v6.5" />
      <path d="M7.5 14.5a4.5 4.5 0 1 0 8.2-2.5L18 9.5" />
      <path d="M5 20.5h14" />
    </>
  ),
  monitor: (
    <>
      <rect x="3.5" y="4.5" width="17" height="11" rx="1.5" />
      <path d="M8 20.5h8M12 15.5v5" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19.5s1.5-9 8.5-12.5C18 4.5 20 5 20 5s.2 2.5-2.8 6.5S8.5 19 5 19.5Z" />
      <path d="M5 19.5c3-1 6-4 8.5-8" />
    </>
  ),
  brain: (
    <>
      <path d="M9.2 5.5a3 3 0 0 0-3 4.2A3.2 3.2 0 0 0 5 13.2 3.3 3.3 0 0 0 8.2 17h1.4M14.8 5.5a3 3 0 0 1 3 4.2A3.2 3.2 0 0 1 19 13.2 3.3 3.3 0 0 1 15.8 17h-1.4" />
      <path d="M12 5v12.5M9.5 9.5h5M9.5 13h5" />
    </>
  ),
  chess: (
    <>
      <path d="M9 8.5h6l-1 4H10L9 8.5Z" />
      <path d="M10.5 8.5V6.2a1.5 1.5 0 0 1 3 0v2.3" />
      <path d="M8 16.5h8l1 3.5H7l1-3.5Z" />
      <path d="M10 12.5h4v4H10v-4Z" />
    </>
  ),
  book: (
    <>
      <path d="M5 5.5h5.5A2.5 2.5 0 0 1 13 8v12.5H7A2 2 0 0 1 5 18.5v-13Z" />
      <path d="M19 5.5h-5.5A2.5 2.5 0 0 0 11 8v12.5h6a2 2 0 0 0 2-2v-13Z" />
    </>
  ),
  numbers: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h8" />
    </>
  ),
} satisfies Record<string, ReactNode>;

type SlideIcon = keyof typeof SLIDE_ICONS;

function iconForTitle(title: string): SlideIcon {
  const t = title.toLowerCase();
  if (t.includes("picture") || t.includes("detective")) return "search";
  if (t.includes("argument") || t.includes("debate")) return "debate";
  if (t.includes("horizon") || t.includes("digital")) return "monitor";
  if (t.includes("code") || t.includes("circuit")) return "code";
  if (t.includes("culture") || t.includes("script") || t.includes("lexi")) return "scroll";
  if (t.includes("ethos")) return "compass";
  if (t.includes("imagin")) return "spark";
  if (t.includes("inquiry")) return "inquiry";
  if (t.includes("lead") || t.includes("summit")) return "summit";
  if (t.includes("humanity") || t.includes("message")) return "heart";
  if (t.includes("orator") || t.includes("oratoris")) return "mic";
  if (t.includes("pixel")) return "pixels";
  if (t.includes("observation") || t.includes("scientist")) return "microscope";
  if (t.includes("sci")) return "flask";
  if (t.includes("story")) return "pen";
  if (t.includes("venture")) return "rocket";
  if (t.includes("word") || t.includes("wave")) return "wave";
  if (t.includes("world") || t.includes("view")) return "globe";
  if (t.includes("eco")) return "leaf";
  if (t.includes("mind") || t.includes("decathlon")) return "brain";
  if (t.includes("think") || t.includes("master")) return "chess";
  if (t.includes("quant")) return "numbers";
  if (t.includes("spark")) return "spark";
  return "spark";
}

/** All admin-set dates + activity name + the two short description cards.
 * Icon is drawn by the parent so it can match that slide’s background family. */
function SpotlightFace({ item }: { item: CompetitionSummary }) {
  const events = sortCompetitionEvents(item.events);
  const heroDate = competitionDateOf(item);
  const parts = heroDate ? formatCompetitionDate(heroDate) : null;
  const notes = [item.datesCardOne, item.datesCardTwo].map((n) => n.trim()).filter(Boolean);

  return (
    <div className="@container relative z-10 flex h-full w-full flex-1 flex-col items-center justify-center px-1 text-center">
      <p className="text-[0.7rem] font-bold tracking-[0.22em] text-brand-deep-foreground/55 uppercase sm:text-xs">
        Contest Date
      </p>
      {parts ? (
        <div className="mt-3 inline-flex items-stretch justify-center gap-3 text-accent text-[length:min(1.62rem,10.5cqi)]">
          <p
            className={`${dateNumeralFont.className} flex items-center leading-none font-extrabold text-[2em]`}
          >
            {parts.day}
          </p>
          <div className="flex flex-col items-start justify-between text-left leading-none text-[0.88em]">
            <p className="font-heading font-extrabold">{parts.month}</p>
            <p className={`${dateNumeralFont.className} w-full text-left font-bold`}>{parts.year}</p>
          </div>
        </div>
      ) : (
        <p className="font-heading mt-3 leading-tight text-accent text-[length:min(1.6rem,11cqi)]">
          Date to be confirmed
        </p>
      )}
      <p
        className="font-heading mt-5 line-clamp-2 leading-tight text-balance text-brand-deep-foreground text-[length:min(1.65rem,11cqi)]"
      >
        {item.title}
      </p>

      {events.length > 0 ? (
        <ul className="mt-4 w-full max-w-[18rem] space-y-1.5 text-left">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-baseline justify-between gap-2 text-[0.7rem] text-brand-deep-foreground/80 sm:text-xs"
            >
              <span className="font-semibold">{shortLabelForEvent(event)}</span>
              <span className="shrink-0 tabular-nums text-brand-deep-muted">
                {formatEventDateOnly(event.eventDate)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {notes.length > 0 ? (
        <div className={`mt-4 grid w-full max-w-[18rem] gap-2 ${notes.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {notes.map((note) => (
            <p
              key={note}
              className="rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-center text-[0.65rem] font-bold tracking-wide text-brand-deep-foreground sm:text-xs"
            >
              {note}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SlideGlyph({ name, ink, corner }: { name: SlideIcon; ink: string; corner: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute z-0 ${corner} ${ink}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-16 w-16 sm:h-20 sm:w-20"
      >
        {SLIDE_ICONS[name]}
      </svg>
    </span>
  );
}

/** Alternate top corners across cards so the mark does not sit in the
 * same spot on every slide. */
const SLIDE_CORNERS = [
  "top-4 left-4 sm:top-5 sm:left-5",
  "top-4 right-4 sm:top-5 sm:right-5",
] as const;

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

/** Lighter step of each slide wash — same family as the card fill, for the
 * corner icon (Featuring Now pattern). */
const STACK_INK = [
  "text-[#9aa3e0]/55",
  "text-[#c4a0e0]/55",
  "text-[#8eb6e0]/55",
  "text-[#e0a0c0]/55",
  "text-[#a8b8cc]/55",
  "text-[#7eb8c4]/55",
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
  "hidden h-7 w-7 cursor-pointer place-items-center rounded-full border border-white/30 bg-[#14152c]/80 text-brand-deep-foreground shadow-md transition-[background-color,border-color,color,scale] duration-300 hover:scale-110 hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none sm:grid";

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

  const swipe = useSwipeNavigation(
    useCallback(
      (direction) => {
        if (length < 2 || move !== "idle") return;
        if (direction < 0) setAnimate(false);
        setMove(direction > 0 ? "up" : "down");
      },
      [length, move],
    ),
    { enabled: length > 1 },
  );

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
      className="relative h-full min-h-[300px] touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={swipe.onTouchStart}
      onTouchEnd={swipe.onTouchEnd}
    >
      {layers
        .slice()
        .reverse()
        .map((layer) => {
          const item = competitions[layer.itemIndex] ?? competitions[0]!;
          const shadeIndex = layer.itemIndex % STACK_SHADES.length;
          const [from, to] = STACK_SHADES[shadeIndex]!;
          const ink = STACK_INK[shadeIndex]!;
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
              <SlideGlyph
                name={iconForTitle(item.title)}
                ink={ink}
                corner={SLIDE_CORNERS[layer.itemIndex % SLIDE_CORNERS.length]!}
              />
              {clickable ? (
                <Link href={`/competitions/${item.slug}`} aria-label={`View ${item.title}`} className="relative z-10 flex h-full w-full cursor-pointer">
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

const SLIDER_MS = 3000;
const SLIDER_ARROW =
  "border-white/45 bg-white/10 text-white hover:border-white hover:bg-white hover:text-brand-deep focus-visible:ring-white";
const SLIDER_DOT = {
  active: "bg-white",
  idle: "bg-white/40 hover:bg-white/70",
} as const;

/** Same change style as Featuring Now: content fades in, arrows appear on
 * hover, and dots sit under the face. */
function SliderSpotlight({ competitions }: { competitions: CompetitionSummary[] }) {
  const reduceMotion = usePrefersReducedMotion();
  const length = competitions.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduceMotion || length < 2 || paused) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, SLIDER_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, length, paused]);

  const swipe = useSwipeNavigation(
    useCallback(
      (direction) => {
        if (length < 1) return;
        setIndex((current) => ((current + direction) % length + length) % length);
      },
      [length],
    ),
    { enabled: length > 1 },
  );

  if (length === 0) return null;

  const item = competitions[index]!;
  const shadeIndex = index % STACK_SHADES.length;
  const [from, to] = STACK_SHADES[shadeIndex]!;
  const ink = STACK_INK[shadeIndex]!;

  function go(next: number) {
    setIndex(((next % length) + length) % length);
  }

  return (
    <div
      className="group relative h-full min-h-[300px] touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={swipe.onTouchStart}
      onTouchEnd={swipe.onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Competition dates"
    >
      <div
        className="absolute inset-0 overflow-hidden rounded-[1.75rem] border border-white/15 shadow-[0_16px_36px_rgba(0,0,0,0.35)]"
        style={{ backgroundImage: `linear-gradient(to right bottom, ${from}, ${to})` }}
      >
        <SlideGlyph
          name={iconForTitle(item.title)}
          ink={ink}
          corner={SLIDE_CORNERS[index % SLIDE_CORNERS.length]!}
        />
        <Link
          href={`/competitions/${item.slug}`}
          aria-label={`View ${item.title}`}
          className="absolute inset-0 z-0 flex cursor-pointer flex-col p-6 pb-14 sm:p-8 sm:pb-16"
        >
          <div key={item.slug} className="animate-spotlight-text-in flex h-full w-full">
            <SpotlightFace item={item} />
          </div>
        </Link>

        {length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous competition"
              onClick={() => go(index - 1)}
              className={`absolute top-1/2 left-3 z-10 hidden h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border opacity-0 transition-opacity duration-300 sm:grid sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none ${SLIDER_ARROW}`}
            >
              <svg viewBox="5 3 12 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-2.5">
                <path d="M15 5 7 12l8 7" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next competition"
              onClick={() => go(index + 1)}
              className={`absolute top-1/2 right-3 z-10 hidden h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border opacity-0 transition-opacity duration-300 sm:grid sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none ${SLIDER_ARROW}`}
            >
              <svg viewBox="7 3 12 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-2.5">
                <path d="m9 5 8 7-8 7" />
              </svg>
            </button>

            {/* Desktop keeps dots. Mobile uses a counter when the row would overflow. */}
            <div className="absolute bottom-5 z-10 flex w-full items-center justify-center px-4">
              <div className={`items-center gap-2 ${length > 7 ? "hidden sm:flex" : "flex"}`}>
                {competitions.map((competition, dotIndex) => (
                  <button
                    key={competition.slug}
                    type="button"
                    onClick={() => go(dotIndex)}
                    aria-label={`Show ${competition.title}`}
                    aria-current={dotIndex === index}
                    className={`h-1.5 cursor-pointer rounded-full transition-all focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none ${
                      dotIndex === index ? `w-4 ${SLIDER_DOT.active}` : `w-1.5 ${SLIDER_DOT.idle}`
                    }`}
                  />
                ))}
              </div>
              {length > 7 && (
                <p
                  aria-live="polite"
                  className="rounded-full bg-black/25 px-3 py-1 text-[11px] font-bold tracking-wide text-white tabular-nums sm:hidden"
                >
                  {String(index + 1).padStart(2, "0")} / {String(length).padStart(2, "0")}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ImportantDates({
  competitions,
  spotlight = "stack",
}: {
  competitions: CompetitionSummary[];
  /** "stack" is the fanned deck. "slider" is one card at a time, moving right to left. */
  spotlight?: "stack" | "slider";
}) {
  const today = useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getServerSnapshot);
  const live = today === null ? null : statusesAt(today * DAY);

  const statuses = live?.statuses ?? (MILESTONES.map(() => "later") as Status[]);

  return (
    <section className="relative mx-4 overflow-hidden bg-[#14152c] px-6 pt-32 pb-36 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] sm:mx-6 lg:mx-10 lg:pt-36 lg:pb-40">
      {/* Same dome on both edges. The fill and dotted net match Ways to Participate. */}
      <BandDivider shape="curve" side="top" color="text-background" />
      <BandDivider shape="curve" side="bottom" color="text-background" flip />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_70%)]" />
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <pattern id="dates-net" width="45" height="45" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0.8" x2="45" y2="0.8" stroke="#2c2f4c" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 5" />
              <line x1="0.8" y1="0" x2="0.8" y2="45" stroke="#2c2f4c" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dates-net)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl">
        <h2 className="font-heading flex items-center gap-3 text-sm font-extrabold tracking-wider text-brand-deep-foreground uppercase">
          <span aria-hidden="true" className="h-0.5 w-8 bg-accent" />
          Important Dates
        </h2>

        {/* Spotlight (a rotating competition) beside the full schedule,
            instead of four equal boxes in a row. */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-stretch">
          {spotlight === "slider" ? (
            <SliderSpotlight competitions={competitions} />
          ) : (
            <StackSpotlight competitions={competitions} />
          )}

          {/* Full schedule — a compact vertical stepper rather than the old
              four-across row, so it reads as a list to scan next to the
              spotlight rather than needing its own separate width budget. */}
          <ol className="relative flex flex-col gap-3 rounded-[2rem] border border-white/10 bg-[#1f2041] p-3 sm:gap-4 sm:p-4">
            {MILESTONES.map((m, i) => {
              const status = statuses[i];
              const active = status === "now" || status === "next";
              return (
                <li
                  key={m.label}
                  className="relative flex items-center gap-4 overflow-hidden rounded-2xl bg-white/[0.06] px-3 py-3.5 sm:px-4"
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
                    className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full ring-4 ring-[#1f2041] transition-all duration-300 sm:h-13 sm:w-13 ${
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
                    {/* Mobile uses full width; desktop keeps clearance for the step numeral. */}
                    <p
                      className={`mt-0.5 text-sm text-brand-deep-muted/80 ${
                        i === MILESTONES.length - 1 ? "sm:line-clamp-2 sm:pr-32" : ""
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
