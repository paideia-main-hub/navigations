"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CompetitionWinnerGroup, PublishedWinner } from "@/domain/competitions/service";
import { awardLabels } from "@/domain/competitions/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const FIRST_STAND = 140;
const STAND_DEPTH = 40;

const TIERS = {
  gold: {
    place: "★★★",
    label: awardLabels.gold,
    height: FIRST_STAND,
    ring: "ring-amber-400",
    avatarSize: 84,
    number: "1",
    numeral: "#6a4b00",
    stain: "#efd3a8",
    accent: "#f0c14a",
    metal:
      "linear-gradient(90deg, rgba(80,50,0,0.28), transparent 22%, rgba(255,255,255,0.55) 50%, transparent 78%, rgba(80,50,0,0.28)), linear-gradient(180deg, #fff6d2 0%, #f0c14a 42%, #a67c10 100%)",
    chip: "bg-amber-400 text-amber-950",
    glow: "shadow-[0_0_50px_-12px_rgba(251,191,36,0.55)]",
    name: "text-xl",
  },
  silver: {
    place: "★★",
    label: awardLabels.silver,
    height: Math.round(FIRST_STAND * 0.7),
    ring: "ring-slate-300",
    avatarSize: 68,
    number: "2",
    numeral: "#2f3642",
    stain: "#f3e0c0",
    accent: "#d7dee8",
    metal:
      "linear-gradient(90deg, rgba(40,48,60,0.28), transparent 22%, rgba(255,255,255,0.7) 50%, transparent 78%, rgba(40,48,60,0.28)), linear-gradient(180deg, #ffffff 0%, #d5dde6 46%, #8e98a6 100%)",
    chip: "bg-surface-muted text-foreground",
    glow: "shadow-[0_0_30px_-12px_rgba(203,213,225,0.45)]",
    name: "text-base",
  },
  bronze: {
    place: "★",
    label: awardLabels.bronze,
    height: Math.round(FIRST_STAND * 0.5),
    ring: "ring-orange-400",
    avatarSize: 64,
    number: "3",
    numeral: "#5c2e0e",
    stain: "#e8c496",
    accent: "#e3944f",
    metal:
      "linear-gradient(90deg, rgba(70,32,8,0.3), transparent 22%, rgba(255,255,255,0.4) 50%, transparent 78%, rgba(70,32,8,0.3)), linear-gradient(180deg, #ffe1c4 0%, #e3944f 44%, #8a4c22 100%)",
    chip: "bg-orange-400 text-orange-950",
    glow: "shadow-[0_0_26px_-12px_rgba(251,146,60,0.45)]",
    name: "text-base",
  },
} as const;

type Tier = keyof typeof TIERS;

function Avatar({ name, photoUrl, size, ring }: { name: string; photoUrl: string | null; size: number; ring: string }) {
  const common = `rounded-full object-cover ring-4 ${ring} ring-offset-4 ring-offset-surface`;
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage URL
    return <img src={photoUrl} alt={name} className={common} style={{ width: size, height: size }} />;
  }
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-brand-deep to-brand-deep font-bold text-brand-deep-foreground ${common}`}
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {initials(name)}
    </div>
  );
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

function SneakerLeg({ mirror, striped }: { mirror?: boolean; striped?: boolean }) {
  return (
    <svg
      width="40"
      height="58"
      viewBox="0 0 44 54"
      aria-hidden="true"
      className="block"
      style={mirror ? { scale: "-1 1" } : undefined}
    >
      <path d="M27 1C26 10 23 16 22 24" fill="none" stroke="#2c241c" strokeWidth="5" strokeLinecap="round" />
      <path d="M27 1C26 10 23 16 22 24" fill="none" stroke="#f6c9a8" strokeWidth="2.6" strokeLinecap="round" />
      {striped ? (
        <>
          <path d="M23 16C22 19 22 21 21 23" fill="none" stroke="#fb923c" strokeWidth="5.2" strokeLinecap="round" />
          <path d="M21 23C20.6 25 20.4 26.2 20 28" fill="none" stroke="#fff7ed" strokeWidth="5.2" strokeLinecap="round" />
          <path d="M20 28C19.4 30 19 32 18.6 34" fill="none" stroke="#fb923c" strokeWidth="5.2" strokeLinecap="round" />
        </>
      ) : (
        <path d="M23 16C22 22 20 28 18.6 34" fill="none" stroke="#fb923c" strokeWidth="5.2" strokeLinecap="round" />
      )}
      <path d="M18 33C14 34 8 36 7 41C6 46 10 51 20 51C32 51 39 47 38 42C37 37 30 34 22 34" fill="#3b82f6" stroke="#2c241c" strokeWidth="2" />
      <path d="M8 40C6 37 9 34 15 35C13 39 10 42 8 43" fill="#e0f2fe" stroke="#2c241c" strokeWidth="1.6" />
      <path d="M7 46C14 53 30 53 38 45" fill="none" stroke="#f8fafc" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M16 37L19 41M20 36L23 41" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CartoonLegs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute top-[calc(100%-14px)] left-0 right-0 z-30 flex h-[58px] items-end justify-center gap-1">
      <SneakerLeg />
      <SneakerLeg mirror striped />
    </div>
  );
}

function OlympicPlace({ winner, tier }: { winner: PublishedWinner; tier: Tier }) {
  const t = TIERS[tier];

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div className="relative z-10 w-[calc(100%-0.75rem)]">
        {/* Wraps rather than nowrap: the distinction names are long enough to
            overflow the narrower second and third stands. */}
        <span
          className={`absolute -top-3 left-1/2 z-20 w-max max-w-[92%] -translate-x-1/2 rounded-full px-3 py-1 text-center text-[10px] leading-tight font-black tracking-wide uppercase ${t.chip}`}
        >
          {tier === "gold" ? "🏆 " : ""}
          {t.label}
        </span>
        <div className={`relative flex min-h-72 flex-col items-center overflow-hidden rounded-3xl border border-border bg-surface px-3 pt-10 pb-10 ${t.glow}`}>
          <span
            aria-hidden="true"
            className="animate-place-drift pointer-events-none absolute inset-0 flex items-center justify-center text-7xl font-black tracking-tight text-foreground/15 select-none sm:text-8xl"
          >
            {t.place}
          </span>
          <div className="relative z-10 flex w-full flex-1 flex-col items-center">
            <Avatar name={winner.studentName} photoUrl={winner.photoUrl} size={t.avatarSize} ring={t.ring} />
            <div className="mt-auto w-full pt-4">
              <p className={`line-clamp-2 w-full text-center leading-tight font-bold text-foreground ${t.name}`}>
                {winner.studentName}
              </p>
              <p className="mt-2 line-clamp-2 w-full text-center text-sm leading-tight text-muted">{winner.schoolName}</p>
              {winner.entryType === "team" && winner.teamMembers && winner.teamMembers.length > 0 && (
                <p className="mt-1 line-clamp-2 w-full text-center text-[11px] text-muted">{winner.teamMembers.join(" · ")}</p>
              )}
            </div>
          </div>
        </div>
        <CartoonLegs />
      </div>
      <div className="relative z-0 mt-9 w-full" style={{ height: t.height }}>
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateY(-16deg) rotateX(16deg)",
            transformOrigin: "center bottom",
          }}
        >
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              backgroundColor: t.stain,
              backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.22), transparent 30%), url(/wood-grain.jpg)",
              backgroundSize: "auto, 460px",
              backgroundBlendMode: "normal, multiply",
              transform: "translateZ(0px)",
            }}
          >
            <div className="h-1 w-full" style={{ backgroundColor: t.accent }} />
          </div>
          <div
            className="absolute left-0 right-0"
            style={{
              top: 0,
              height: STAND_DEPTH,
              transformOrigin: "top center",
              transform: "rotateX(90deg)",
              backgroundColor: "#f4e2c4",
              backgroundImage:
                "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.15) 40%, rgba(90,55,20,0.18)), url(/wood-grain.jpg)",
              backgroundSize: "auto, 460px",
              backgroundBlendMode: "normal, multiply",
            }}
          />
          <div
            className="absolute left-[10%] w-[80%]"
            style={{
              top: 0,
              height: 26,
              transformOrigin: "top center",
              transform: "rotateX(90deg) translateZ(1px)",
              backgroundImage: t.metal,
            }}
          />
          <div
            className="absolute left-[10%] w-[80%]"
            style={{
              top: 0,
              height: Math.max(26, Math.round(t.height * 0.62)),
              transform: "translateZ(1px)",
              backgroundImage: t.metal,
              borderRadius: "0 0 16px 16px",
              boxShadow: "0 10px 12px rgba(20,10,4,0.28), inset 0 1px 0 rgba(255,255,255,0.75)",
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center font-black leading-none"
            style={{
              transform: "translate3d(0, -14%, 4px)",
              fontSize: Math.max(36, Math.round(t.height * 0.5)),
              color: t.numeral,
              textShadow: "0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            {t.number}
          </div>
          <div
            className="absolute top-0 h-full"
            style={{
              width: STAND_DEPTH,
              left: 0,
              transformOrigin: "left center",
              transform: "rotateY(-90deg)",
              backgroundColor: t.stain,
              backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.35), transparent 55%), url(/wood-grain.jpg)",
              backgroundSize: "auto, 280px",
              backgroundBlendMode: "normal, multiply",
            }}
          />
          <div
            className="absolute top-0 h-full"
            style={{
              width: STAND_DEPTH,
              right: 0,
              transformOrigin: "right center",
              transform: "rotateY(90deg)",
              backgroundColor: t.stain,
              backgroundImage: "linear-gradient(270deg, rgba(255,255,255,0.35), transparent 55%), url(/wood-grain.jpg)",
              backgroundSize: "auto, 280px",
              backgroundBlendMode: "normal, multiply",
            }}
          />
        </div>
      </div>
    </div>
  );
}

const AUTOPLAY_MS = 5500;

export function ChampionsPodium({ groups }: { groups: CompetitionWinnerGroup[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (groups.length < 2 || paused) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % groups.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [groups.length, paused]);

  if (groups.length === 0) {
    return <p className="text-center text-sm text-muted">Winners will appear here once results are published.</p>;
  }

  const step = (direction: -1 | 1) => setIndex((i) => (i + direction + groups.length) % groups.length);
  const current = groups[Math.min(index, groups.length - 1)];
  const tierOrder: Tier[] = ["gold", "silver", "bronze"];
  const byTier = new Map(current.podium.map((w, i) => [tierOrder[i], w] as const));
  const standOrder: Tier[] = ["silver", "gold", "bronze"];

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div key={current.competitionSlug} className="animate-podium-in relative grid items-center gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:gap-8">
        <div className="text-center lg:self-stretch lg:text-left">
          <div className="flex h-full items-center justify-center lg:justify-start">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-amber-600 uppercase dark:text-amber-300/80">
                Competition {index + 1} of {groups.length}
              </p>
              <Link
                href={`/competitions/${current.competitionSlug}`}
                className="mt-3 block text-3xl font-black tracking-tight text-foreground transition hover:text-amber-600 sm:text-4xl dark:hover:text-amber-300"
              >
                {current.competitionTitle}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex w-full min-w-0 items-end gap-3 sm:gap-4">
          <div className="relative flex min-w-0 flex-1 items-end justify-center gap-3 [perspective:1100px]">
            {standOrder.map((tier) => {
              const winner = byTier.get(tier);
              if (!winner) return null;
              return <OlympicPlace key={`${current.competitionSlug}-${tier}`} winner={winner} tier={tier} />;
            })}
          </div>
          {groups.length > 1 && (
            <div className="flex flex-col items-center justify-center gap-2 self-center">
              {groups.map((g, i) => (
                <button
                  key={g.competitionSlug}
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${g.competitionTitle}`}
                  className={`w-1.5 rounded-full transition-all ${
                    i === index ? "h-7 bg-accent" : "h-1.5 bg-border hover:bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-5 lg:absolute lg:bottom-0 lg:left-0 lg:justify-start">
          <NavButton direction="prev" onClick={() => step(-1)} />
          <NavButton direction="next" onClick={() => step(1)} />
        </div>
      </div>
    </div>
  );
}
