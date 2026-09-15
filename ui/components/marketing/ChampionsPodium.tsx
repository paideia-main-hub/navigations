"use client";

import { useState } from "react";
import Link from "next/link";
import type { CompetitionWinnerGroup, PublishedWinner } from "@/domain/competitions/service";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const TIERS = {
  gold: {
    place: "1ST",
    label: "Gold",
    ring: "ring-amber-400",
    glow: "shadow-[0_0_50px_-8px_rgba(251,191,36,0.55)]",
    chip: "bg-amber-400 text-amber-950",
    stepClass: "bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600",
    stepHeight: 128,
    avatarSize: 108,
    order: 1,
  },
  silver: {
    place: "2ND",
    label: "Silver",
    ring: "ring-slate-300",
    glow: "shadow-[0_0_30px_-10px_rgba(203,213,225,0.4)]",
    chip: "bg-slate-200 text-slate-800",
    stepClass: "bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500",
    stepHeight: 84,
    avatarSize: 76,
    order: 0,
  },
  bronze: {
    place: "3RD",
    label: "Bronze",
    ring: "ring-orange-400",
    glow: "shadow-[0_0_26px_-10px_rgba(251,146,60,0.4)]",
    chip: "bg-orange-400 text-orange-950",
    stepClass: "bg-gradient-to-b from-orange-300 via-orange-400 to-orange-600",
    stepHeight: 60,
    avatarSize: 68,
    order: 2,
  },
} as const;

type Tier = keyof typeof TIERS;

function Avatar({ name, photoUrl, size, ring }: { name: string; photoUrl: string | null; size: number; ring: string }) {
  const common = `rounded-full object-cover ring-4 ${ring} ring-offset-4 ring-offset-white dark:ring-offset-slate-900`;
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage URL
    return <img src={photoUrl} alt={name} className={common} style={{ width: size, height: size }} />;
  }
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-700 font-bold text-slate-100 dark:from-slate-700 dark:to-slate-800 ${common}`}
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {initials(name)}
    </div>
  );
}

function NavButton({ direction, onClick, disabled }: { direction: "prev" | "next"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous competition" : "Next competition"}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-600 transition hover:border-amber-400 hover:text-amber-600 disabled:pointer-events-none disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-400/50 dark:hover:text-amber-300"
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  );
}

function PodiumCard({ winner, tier }: { winner: PublishedWinner; tier: Tier }) {
  const t = TIERS[tier];
  const grand = tier === "gold";

  return (
    <div className="flex flex-col items-center" style={{ order: t.order }}>
      <div
        className={`relative flex flex-col items-center rounded-3xl border border-slate-200 bg-white transition-transform duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900 ${t.glow} ${
          grand ? "w-60 px-6 pt-8 pb-6 sm:w-72" : "w-36 px-3 pt-7 pb-4 sm:w-44"
        }`}
      >
        <span
          className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black tracking-wide whitespace-nowrap uppercase ${t.chip}`}
        >
          {grand ? "🏆 " : ""}
          {t.label}
        </span>
        <Avatar name={winner.studentName} photoUrl={winner.photoUrl} size={t.avatarSize} ring={t.ring} />
        <p className={`mt-4 truncate text-center font-bold text-slate-900 dark:text-slate-100 ${grand ? "text-xl" : "text-sm"}`}>
          {winner.studentName}
        </p>
        <p className={`truncate text-center text-slate-500 dark:text-slate-400 ${grand ? "text-sm" : "text-xs"}`}>{winner.schoolName}</p>
        {winner.entryType === "team" && winner.teamMembers && winner.teamMembers.length > 0 && (
          <p className="mt-1 line-clamp-2 max-w-full text-center text-[11px] text-slate-400 dark:text-slate-500">{winner.teamMembers.join(" · ")}</p>
        )}
      </div>
      <div
        className={`flex w-24 items-center justify-center rounded-b-xl text-lg font-black text-white/90 sm:w-32 ${t.stepClass}`}
        style={{ height: t.stepHeight }}
      >
        {t.place}
      </div>
    </div>
  );
}

export function ChampionsPodium({ groups }: { groups: CompetitionWinnerGroup[] }) {
  const [index, setIndex] = useState(0);

  if (groups.length === 0) {
    return <p className="text-center text-sm text-slate-500 dark:text-slate-400">Winners will appear here once results are published.</p>;
  }

  const current = groups[Math.min(index, groups.length - 1)];
  const tierOrder: Tier[] = ["gold", "silver", "bronze"];
  const seats = current.podium.map((w, i) => ({ w, tier: tierOrder[i] }));

  return (
    <div className="relative">
      <div className="mb-10 flex items-center justify-center gap-4">
        <NavButton direction="prev" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} />
        <div className="min-w-[14rem] text-center">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-amber-600 uppercase dark:text-amber-300/80">
            Competition {index + 1} of {groups.length}
          </p>
          <Link
            href={`/competitions/${current.competitionSlug}`}
            className="text-lg font-bold text-slate-900 transition hover:text-amber-600 dark:text-slate-100 dark:hover:text-amber-300"
          >
            {current.competitionTitle}
          </Link>
        </div>
        <NavButton direction="next" onClick={() => setIndex((i) => Math.min(groups.length - 1, i + 1))} disabled={index === groups.length - 1} />
      </div>

      <div key={current.competitionSlug} className="animate-podium-in flex items-end justify-center gap-3 sm:gap-6">
        {seats.map(({ w, tier }) => (
          <PodiumCard key={`${current.competitionSlug}-${tier}`} winner={w} tier={tier} />
        ))}
      </div>

      {groups.length > 1 && (
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {groups.map((g, i) => (
            <button
              key={g.competitionSlug}
              onClick={() => setIndex(i)}
              aria-label={`Show ${g.competitionTitle}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-7 bg-amber-500 dark:bg-amber-400" : "w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-white/20 dark:hover:bg-white/35"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
