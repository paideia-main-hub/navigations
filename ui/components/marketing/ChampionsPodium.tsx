"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import type { CompetitionWinnerGroup, PublishedWinner } from "@/domain/competitions/service";

const cardFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

/** Same face as Important Dates competition titles. */
const titleFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["800"],
});

type Seat = "left" | "center" | "right";

const CENTER_H = "26rem";

const SEATS: Record<
  Seat,
  {
    tier: "silver" | "gold" | "bronze";
    label: string;
    glass: string;
    glow: string;
    lean: string;
    height: string;
    featured?: boolean;
    delay: string;
    labelBadge: string;
    dividerClass: string;
  }
> = {
  left: {
    tier: "silver",
    label: "Runner-up",
    glass: "linear-gradient(180deg, rgba(214,196,255,0.32) 0%, rgba(124,72,255,0.58) 40%, rgba(62,28,168,0.82) 100%)",
    glow: "inset 0 0 0 1.5px rgba(236,226,255,0.95), inset 10px 0 22px rgba(255,255,255,0.16), 0 0 18px rgba(150,110,255,0.75), 0 18px 40px rgba(40,20,90,0.28)",
    lean: "10deg",
    height: "calc(0.9 * 26rem)",
    delay: "0ms",
    labelBadge:
      "mx-auto inline-block rounded-lg bg-[#4c1d95]/75 px-3 py-1.5 text-[#f5f3ff] ring-1 ring-[#ddd6fe]/40",
    dividerClass: "bg-[#e9d5ff]",
  },
  center: {
    tier: "gold",
    label: "Best Performer",
    glass: "linear-gradient(180deg, rgba(170,220,255,0.34) 0%, rgba(30,120,255,0.55) 38%, rgba(8,48,140,0.84) 100%)",
    glow: "inset 0 0 0 1.5px rgba(220,245,255,1), inset 0 0 30px rgba(180,230,255,0.32), 0 0 22px rgba(120,210,255,0.95), 0 22px 48px rgba(20,60,140,0.3)",
    lean: "0deg",
    height: CENTER_H,
    featured: true,
    delay: "70ms",
    labelBadge: "mx-auto inline-block rounded-lg bg-accent px-3.5 py-1.5 text-accent-foreground ring-1 ring-white/25",
    dividerClass: "bg-accent",
  },
  right: {
    tier: "bronze",
    label: "Special Distinction",
    glass: "linear-gradient(180deg, rgba(255,210,160,0.34) 0%, rgba(255,120,48,0.58) 40%, rgba(210,70,16,0.84) 100%)",
    glow: "inset 0 0 0 1.5px rgba(255,230,200,0.95), inset -10px 0 22px rgba(255,255,255,0.14), 0 0 18px rgba(255,140,60,0.75), 0 18px 40px rgba(120,40,10,0.25)",
    lean: "-10deg",
    height: "calc(0.8 * 26rem)",
    delay: "140ms",
    labelBadge:
      "mx-auto inline-block rounded-lg bg-[#9a3412]/80 px-3 py-1.5 text-[#fff7ed] ring-1 ring-[#fed7aa]/45",
    dividerClass: "bg-[#fed7aa]",
  },
};

const SEAT_ORDER: Seat[] = ["left", "center", "right"];

/** Placeholder portraits until a competition publishes a real student photo. */
const FALLBACK_PHOTOS: Record<Seat, string> = {
  left: "/winner-fallback-1.jpg",
  center: "/winner-fallback-2.jpg",
  right: "/winner-fallback-3.jpg",
};

/** Real published photos only — empty, SVG placeholders and e2e fixtures
 * do not count, so the Pakistani fallback portraits can show. */
function resolvedPhoto(photoUrl: string | null | undefined, fallbackSrc: string): string {
  const url = photoUrl?.trim() ?? "";
  if (!url) return fallbackSrc;
  if (/\.svg($|\?)/i.test(url)) return fallbackSrc;
  if (/test-e2e/i.test(url)) return fallbackSrc;
  return url;
}

function NavButton({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  const prev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={prev ? "Previous competition" : "Next competition"}
      className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-border bg-surface text-foreground shadow-md transition-[background-color,border-color,color,scale] duration-300 hover:scale-110 hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
    >
      <svg
        viewBox={prev ? "5 3 12 18" : "7 3 12 18"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-3.5 w-2.5"
      >
        <path d={prev ? "M15 5 7 12l8 7" : "m9 5 8 7-8 7"} />
      </svg>
    </button>
  );
}

function PhotoFrame({
  name,
  photoUrl,
  featured,
  tall,
  fallbackSrc,
}: {
  name: string;
  photoUrl: string | null;
  featured?: boolean;
  tall?: boolean;
  fallbackSrc: string;
}) {
  const initial = resolvedPhoto(photoUrl, fallbackSrc);
  const [src, setSrc] = useState(initial);
  useEffect(() => {
    setSrc(resolvedPhoto(photoUrl, fallbackSrc));
  }, [photoUrl, fallbackSrc]);

  const ratio = featured ? "aspect-square" : tall ? "aspect-[11/12]" : "aspect-[5/4]";
  return (
    <div
      className={`grid w-full place-items-center overflow-hidden rounded-[1.05rem] bg-[#e4ebf2] text-[#9aa6b4] shadow-[0_8px_16px_rgba(15,23,42,0.12)] ${ratio}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- admin Storage URL or local fallback */}
      <img
        src={src}
        alt={src === fallbackSrc ? "" : name}
        className="h-full w-full object-cover"
        onError={() => {
          if (src !== fallbackSrc) setSrc(fallbackSrc);
        }}
      />
    </div>
  );
}

function GlassCard({
  winner,
  seat,
  flipFrom,
}: {
  winner: PublishedWinner;
  seat: Seat;
  flipFrom: string;
}) {
  const theme = SEATS[seat];
  const featured = Boolean(theme.featured);

  return (
    <div
      className={`relative flex self-end justify-center animate-podium-card-flip ${featured ? "z-20 -mx-1 sm:-mx-2" : "z-10"}`}
      style={
        {
          height: theme.height,
          animationDelay: theme.delay,
          ["--podium-lean" as string]: theme.lean,
          ["--podium-flip-from" as string]: flipFrom,
        } as CSSProperties
      }
    >
      <article
        className={`${cardFont.className} relative flex h-full flex-col overflow-hidden rounded-[1.35rem] px-5 pt-5 pb-6 text-center text-white ${
          featured ? "w-[min(100%,17.5rem)]" : "w-[min(100%,14.25rem)]"
        }`}
        style={{ background: theme.glass, boxShadow: theme.glow }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0.1)_22%,transparent_40%,transparent_72%,rgba(255,255,255,0.12)_100%)]"
        />

        <div className="relative z-10 flex h-full flex-col">
          <PhotoFrame
            name={winner.studentName}
            photoUrl={winner.photoUrl}
            featured={featured}
            tall={seat === "left"}
            fallbackSrc={FALLBACK_PHOTOS[seat]}
          />

          <div className="mt-4 flex min-h-0 flex-1 flex-col justify-between gap-3 pb-0.5">
            <div>
              <p
                className={`font-extrabold tracking-[0.2em] uppercase ${
                  featured ? "text-[0.75rem] sm:text-[0.8rem]" : "text-[0.65rem] sm:text-[0.7rem]"
                } ${theme.labelBadge}`}
              >
                {theme.label}
              </p>
              <span
                aria-hidden="true"
                className={`mx-auto mt-2.5 block h-[3px] rounded-full ${featured ? "w-12" : "w-10"} ${theme.dividerClass}`}
              />
            </div>
            <div>
              <p
                className={`font-extrabold tracking-tight text-white ${
                  featured ? "text-[1.45rem] leading-tight sm:text-[1.55rem]" : "text-[1.2rem] leading-tight"
                }`}
              >
                {winner.studentName}
              </p>
              <p className="mt-1.5 text-[0.8rem] font-semibold tracking-wide text-white/80">{winner.schoolName}</p>
              {winner.entryType === "team" && winner.teamMembers && winner.teamMembers.length > 0 && (
                <p className="mt-1 line-clamp-2 text-[11px] font-medium text-white/65">{winner.teamMembers.join(" · ")}</p>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

const AUTOPLAY_MS = 5500;

export function ChampionsPodium({ groups }: { groups: CompetitionWinnerGroup[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (groups.length < 2 || paused) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = window.setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % groups.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [groups.length, paused]);

  if (groups.length === 0) {
    return <p className="text-center text-sm text-muted">Winners will appear here once results are published.</p>;
  }

  const step = (next: -1 | 1) => {
    setDirection(next);
    setIndex((i) => (i + next + groups.length) % groups.length);
  };
  const goTo = (nextIndex: number) => {
    setDirection(nextIndex >= index ? 1 : -1);
    setIndex(nextIndex);
  };
  const current = groups[Math.min(index, groups.length - 1)]!;
  const byTier = new Map(
    (["gold", "silver", "bronze"] as const).map((tier, i) => [tier, current.podium[i]] as const),
  );
  const flipFrom = direction >= 0 ? "95deg" : "-95deg";

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div key={current.competitionSlug} className="relative flex flex-col gap-10">
        <div className="mx-auto flex w-full max-w-[48rem] flex-col items-center text-center">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-amber-600/80 uppercase dark:text-amber-300/70">
            Competition {index + 1} of {groups.length}
          </p>
          <Link
            href={`/competitions/${current.competitionSlug}`}
            className={`${titleFont.className} animate-podium-in mt-3 block w-full text-5xl leading-none font-extrabold tracking-tight text-balance text-foreground/45 transition hover:text-foreground/70 sm:text-6xl lg:text-7xl dark:text-foreground/50 dark:hover:text-foreground/75`}
          >
            {current.competitionTitle}
          </Link>
        </div>

        <div className="relative flex min-w-0 flex-1 items-end justify-center gap-2 [perspective:1400px] sm:gap-3">
          {SEAT_ORDER.map((seat) => {
            const winner = byTier.get(SEATS[seat].tier);
            if (!winner) return null;
            return (
              <GlassCard
                key={`${current.competitionSlug}-${seat}`}
                winner={winner}
                seat={seat}
                flipFrom={flipFrom}
              />
            );
          })}
        </div>

        <div className="mx-auto grid w-full max-w-[48rem] grid-cols-[auto_1fr_auto] items-center gap-4">
          <NavButton direction="prev" onClick={() => step(-1)} />
          {groups.length > 1 ? (
            <div className="flex items-center justify-center gap-1.5">
              {groups.map((g, i) => (
                <button
                  key={g.competitionSlug}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${g.competitionTitle}`}
                  aria-current={i === index}
                  className={`h-1.5 cursor-pointer rounded-full transition-all ${
                    i === index ? "w-5 bg-accent" : "w-1.5 bg-border hover:bg-muted"
                  }`}
                />
              ))}
            </div>
          ) : (
            <span aria-hidden="true" />
          )}
          <NavButton direction="next" onClick={() => step(1)} />
        </div>
      </div>
    </div>
  );
}
