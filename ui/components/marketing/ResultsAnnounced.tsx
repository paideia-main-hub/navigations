"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CompetitionWinnerGroup, PublishedWinner } from "@/domain/competitions/service";
import { awardLabels, type AwardType } from "@/domain/competitions/types";
import { ResultsStage } from "@/ui/components/marketing/ResultsStage";

const AUTOPLAY_MS = 5500;

type Place = "runner" | "best" | "distinction";

const PLACES: Record<Place, { title: string; award: AwardType; glass: string; glow: string; lean: string }> = {
  runner: {
    title: "Runner-up",
    award: "silver",
    glass: "linear-gradient(180deg, rgba(214,196,255,0.32) 0%, rgba(124,72,255,0.58) 40%, rgba(62,28,168,0.82) 100%)",
    glow: "inset 0 0 0 1.5px rgba(236,226,255,0.95), inset 10px 0 22px rgba(255,255,255,0.16), 0 0 18px rgba(150,110,255,0.75), 0 18px 40px rgba(40,20,90,0.28)",
    lean: "perspective(1200px) rotateY(18deg)",
  },
  best: {
    title: "Best Performer",
    award: "gold",
    glass: "linear-gradient(180deg, rgba(170,220,255,0.34) 0%, rgba(30,120,255,0.55) 38%, rgba(8,48,140,0.84) 100%)",
    glow: "inset 0 0 0 1.5px rgba(220,245,255,1), inset 0 0 30px rgba(180,230,255,0.32), 0 0 22px rgba(120,210,255,0.95), 0 22px 48px rgba(20,60,140,0.3)",
    lean: "none",
  },
  distinction: {
    title: "Special Distinction",
    award: "bronze",
    glass: "linear-gradient(180deg, rgba(255,210,160,0.34) 0%, rgba(255,120,48,0.58) 40%, rgba(210,70,16,0.84) 100%)",
    glow: "inset 0 0 0 1.5px rgba(255,230,200,0.95), inset -10px 0 22px rgba(255,255,255,0.14), 0 0 18px rgba(255,140,60,0.75), 0 18px 40px rgba(120,40,10,0.25)",
    lean: "perspective(1200px) rotateY(-18deg)",
  },
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function placeLabel(winner: PublishedWinner, place: Place): string {
  if (winner.award === "custom" && winner.customAwardLabel) return winner.customAwardLabel;
  if (winner.award === "gold" || winner.award === "silver" || winner.award === "bronze") return PLACES[place].title;
  return awardLabels[winner.award as AwardType] ?? PLACES[place].title;
}

function slotsFor(podium: PublishedWinner[]): Partial<Record<Place, PublishedWinner>> {
  const best = podium.find((winner) => winner.award === "gold") ?? podium[0];
  const runner = podium.find((winner) => winner.award === "silver") ?? podium.find((winner) => winner !== best);
  const distinction =
    podium.find((winner) => winner.award === "bronze") ?? podium.find((winner) => winner !== best && winner !== runner);
  return { runner, best, distinction };
}

function resolvedPhoto(photoUrl: string | null | undefined, fallbackSrc: string): string {
  const url = photoUrl?.trim() ?? "";
  if (!url) return fallbackSrc;
  if (/\.svg($|\?)/i.test(url)) return fallbackSrc;
  if (/test-e2e/i.test(url)) return fallbackSrc;
  return url;
}

function PhotoFrame({ photoUrl, fallbackSrc }: { photoUrl: string | null; fallbackSrc: string }) {
  const initial = resolvedPhoto(photoUrl, fallbackSrc);
  const [src, setSrc] = useState(initial);
  useEffect(() => {
    setSrc(resolvedPhoto(photoUrl, fallbackSrc));
  }, [photoUrl, fallbackSrc]);

  return (
    <div className="w-[9.25rem] overflow-hidden rounded-[1.05rem] bg-[#e4ebf2] shadow-[0_8px_16px_rgba(15,23,42,0.1)]">
      <div className="grid aspect-[5/4] place-items-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin Storage URL or local fallback */}
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => {
            if (src !== fallbackSrc) setSrc(fallbackSrc);
          }}
        />
      </div>
    </div>
  );
}

function GlassCard({ winner, place, featured }: { winner: PublishedWinner; place: Place; featured?: boolean }) {
  const theme = PLACES[place];
  const fallback =
    place === "runner" ? "/winner-fallback-1.jpg" : place === "best" ? "/winner-fallback-2.jpg" : "/winner-fallback-3.jpg";
  return (
    <div
      className={`relative flex justify-center ${featured ? "z-20 -mx-1 sm:-mx-2" : "z-10"}`}
      style={{ transform: theme.lean, transformStyle: "preserve-3d" }}
    >
      <article
        className={`relative flex flex-col items-center overflow-hidden rounded-[1.35rem] px-5 pt-5 pb-7 text-center text-white ${
          featured ? "aspect-[4/5] w-[min(100%,17.5rem)] min-h-[26rem]" : "w-[min(100%,14.25rem)] min-h-[22.5rem]"
        }`}
        style={{ background: theme.glass, boxShadow: theme.glow }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0.1)_22%,transparent_40%,transparent_72%,rgba(255,255,255,0.12)_100%)]"
        />
        <div className="relative z-10 flex h-full w-full flex-col">
          <PhotoFrame photoUrl={winner.photoUrl} fallbackSrc={fallback} />
          <div className="mt-auto pt-6">
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase">{placeLabel(winner, place)}</p>
            {featured ? <span aria-hidden="true" className="mx-auto mt-2 block h-0.5 w-10 rounded-full bg-accent" /> : null}
            <p className={`mt-3 font-bold tracking-tight ${featured ? "text-[1.4rem]" : "text-xl"}`}>{winner.studentName}</p>
            <p className="mt-1.5 text-sm text-white/85">{winner.schoolName}</p>
          </div>
        </div>
      </article>
    </div>
  );
}

function CardRow({ podium }: { podium: PublishedWinner[] }) {
  const slots = slotsFor(podium);
  const order: Place[] = ["runner", "best", "distinction"];
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 [perspective:1400px]">
      {order.map((place) => {
        const winner = slots[place];
        if (!winner) return null;
        return <GlassCard key={`${place}-${winner.studentName}`} winner={winner} place={place} featured={place === "best"} />;
      })}
    </div>
  );
}

export function ResultsAnnounced({ groups }: { groups: CompetitionWinnerGroup[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (groups.length < 2 || paused) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % groups.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [groups.length, paused]);

  if (groups.length === 0) return null;

  const current = groups[Math.min(index, groups.length - 1)]!;
  const step = (direction: -1 | 1) => setIndex((currentIndex) => (currentIndex + direction + groups.length) % groups.length);

  return (
    <section
      className="relative isolate overflow-hidden px-4 py-12 sm:px-6 sm:py-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <ResultsStage />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="text-center">
          <h2 className="flex items-center justify-center gap-4 text-3xl font-black tracking-tight text-[#163a8c] uppercase sm:text-[2.75rem]">
            <span aria-hidden="true" className="hidden h-px w-20 bg-[#ff691f] sm:block" />
            Results <span className="text-[#ff691f]">Announced</span>
            <span aria-hidden="true" className="hidden h-px w-20 bg-[#ff691f] sm:block" />
          </h2>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#163a8c]">{current.competitionTitle}</p>
          <p className="mx-auto mt-2 w-fit rounded-full bg-[#e7f0ff]/90 px-3 py-0.5 text-[11px] font-semibold text-[#4a5d86]">
            Competition {index + 1} of {groups.length}
          </p>
          <p className="mt-2 text-sm text-[#60708c]">Celebrating outstanding demonstrations of skill, thinking and execution.</p>
        </header>

        <div className="mt-8 pb-20">
          <CardRow podium={current.podium} />
        </div>

        <div className="relative -mt-8 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="hidden sm:block" />
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous competition"
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/80 bg-white text-[#1f2041] shadow-[0_6px_16px_rgba(40,70,120,0.12)]"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5 7 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <p className="min-w-14 text-center text-sm font-bold tracking-wide text-[#1f2041]">
                {pad(index + 1)} / {pad(groups.length)}
              </p>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next competition"
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/80 bg-white text-[#1f2041] shadow-[0_6px_16px_rgba(40,70,120,0.12)]"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              {groups.map((group, dotIndex) => (
                <button
                  key={group.competitionSlug}
                  type="button"
                  aria-label={`Show ${group.competitionTitle}`}
                  aria-current={dotIndex === index}
                  onClick={() => setIndex(dotIndex)}
                  className={`h-1.5 w-1.5 cursor-pointer rounded-full ${dotIndex === index ? "bg-[#ff691f]" : "bg-[#b9cbe6]"}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Link
              href="/results"
              className="inline-flex items-center gap-2 rounded-full bg-[#172033] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(16,24,48,0.25)]"
            >
              View complete results
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
