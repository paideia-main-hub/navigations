"use client";

import { useState } from "react";

/** Soft-to-strong Atomic Tangerine tints — same family as the calendar
 * strapline chips (Registration / Submissions / League begins). */
const SHADES = [
  {
    card: "bg-accent-soft",
    border: "border-accent/20",
    hoverBorder: "border-accent/50",
    label: "text-accent-strong",
    bubbleA: "bg-accent/30",
    bubbleB: "bg-accent/15",
  },
  {
    card: "bg-[#ffe8d4] dark:bg-orange-500/15",
    border: "border-orange-300/50 dark:border-orange-400/25",
    hoverBorder: "border-orange-400/60 dark:border-orange-300/40",
    label: "text-[#b03a08] dark:text-orange-200",
    bubbleA: "bg-orange-300/55 dark:bg-orange-400/35",
    bubbleB: "bg-accent/20",
  },
  {
    card: "bg-[#fff4ea] dark:bg-accent/10",
    border: "border-accent/15",
    hoverBorder: "border-accent/45",
    label: "text-accent-strong",
    bubbleA: "bg-accent/25",
    bubbleB: "bg-orange-200/60 dark:bg-orange-400/25",
  },
  {
    card: "bg-[#ffdcc0] dark:bg-orange-500/18",
    border: "border-orange-300/60 dark:border-orange-400/30",
    hoverBorder: "border-accent/55",
    label: "text-[#9a3208] dark:text-orange-100",
    bubbleA: "bg-accent/35",
    bubbleB: "bg-orange-300/45 dark:bg-orange-400/30",
  },
  {
    card: "bg-[#fff1e0] dark:bg-orange-500/[0.12]",
    border: "border-accent/18",
    hoverBorder: "border-accent/48",
    label: "text-accent-strong",
    bubbleA: "bg-orange-200/70 dark:bg-orange-400/30",
    bubbleB: "bg-accent/20",
  },
  {
    card: "bg-[#ffebda] dark:bg-accent/[0.14]",
    border: "border-orange-200/80 dark:border-orange-400/20",
    hoverBorder: "border-accent/50",
    label: "text-[#c4400a] dark:text-orange-200",
    bubbleA: "bg-accent/28",
    bubbleB: "bg-orange-300/50 dark:bg-orange-400/28",
  },
] as const;

export function KeyDateCard({
  milestone,
  date,
  note,
  shadeIndex = 0,
}: {
  milestone: string;
  date: string;
  note: string;
  shadeIndex?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const shade = SHADES[shadeIndex % SHADES.length];

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border p-5 ${shade.card} ${
        hovered ? shade.hoverBorder : shade.border
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 18px 40px -28px rgba(196,64,10,0.35)"
          : "0 18px 40px -28px rgba(196,64,10,0)",
        transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out, border-color 0.3s ease-out",
      }}
    >
      {/* Corner bubbles — clipped by the card, swell on hover. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-70 transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-150 ${shade.bubbleA}`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute -bottom-6 -left-5 h-20 w-20 rounded-full opacity-60 transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-125 ${shade.bubbleB}`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute top-1/2 -right-3 h-10 w-10 -translate-y-1/2 rounded-full opacity-50 transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-150 ${shade.bubbleA}`}
      />

      <div className="relative z-10">
        <p className={`text-xs font-semibold tracking-wide uppercase ${shade.label}`}>{milestone}</p>
        <p className="mt-2 font-bold text-foreground">{date}</p>
        <p className="mt-2 text-sm text-muted">{note}</p>
      </div>
    </div>
  );
}
