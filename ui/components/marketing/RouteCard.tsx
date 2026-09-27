"use client";

import Link from "next/link";
import { useCallback, useRef, type ReactNode } from "react";

/** One "Ways to Participate" card: idles in a slow float (paused on hover so
 * the tilt below isn't fighting it), and while hovered tilts in 3D toward the
 * cursor with a spotlight that follows the pointer — a tactile, "this is a
 * physical object" hover rather than a flat lift. Reduced-motion visitors
 * still get the border/shadow/icon changes, just no tilt or float.
 *
 * The float (translate) lives on the wrapper div; the tilt (transform) lives
 * on the link itself — two different CSS properties on two different
 * elements, so neither ever overwrites the other's inline style. */
export function RouteCard({
  href,
  label,
  icon,
  className = "",
  floatDelay = 0,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  className?: string;
  floatDelay?: number;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const reducedMotionRef = useRef<boolean | null>(null);

  const prefersReducedMotion = useCallback(() => {
    if (reducedMotionRef.current === null) {
      reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return reducedMotionRef.current;
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      const card = linkRef.current;
      if (!card || prefersReducedMotion()) return;
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--rx", `${(0.5 - py) * 14}deg`);
      card.style.setProperty("--ry", `${(px - 0.5) * 14}deg`);
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
      card.style.setProperty("--glow", "1");
    },
    [prefersReducedMotion],
  );

  const handleMouseLeave = useCallback(() => {
    const card = linkRef.current;
    if (!card) return;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--glow", "0");
  }, []);

  return (
    <div
      className={`hover:[animation-play-state:paused] animate-wave-float ${className}`}
      style={{ animationDelay: `${floatDelay}s` }}
    >
      <Link
        ref={linkRef}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform: "perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" }}
        className="group relative flex h-full w-full flex-col items-center gap-4 overflow-hidden rounded-[1.75rem] border border-white/10 bg-brand-deep-foreground px-5 py-7 text-center shadow-[0_18px_38px_-20px_rgba(0,0,0,0.55)] transition-[transform,box-shadow,border-color] duration-150 ease-out will-change-transform hover:border-accent/50 hover:shadow-[0_30px_60px_-22px_rgba(255,105,31,0.4)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep focus-visible:outline-none"
      >
        {/* Cursor-tracking spotlight. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[var(--glow,0)] transition-opacity duration-300"
          style={{ background: "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(255,105,31,0.18), transparent 70%)" }}
        />
        {/* Top edge sheen — a hairline of light across the card's top, as if it
            were catching an overhead light source. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
        />

        <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent/10 text-brand-deep-accent transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-[0_0_0_8px_rgba(255,105,31,0.14)]">
          {icon}
        </span>
        <span className="relative z-10 flex-1 text-sm leading-snug font-semibold text-balance text-brand-deep">
          {label}
        </span>
        <span
          aria-hidden="true"
          className="relative z-10 flex items-center gap-1.5 text-xs font-bold tracking-wide text-brand-deep-accent uppercase opacity-0 transition-all duration-300 ease-out group-hover:opacity-100"
        >
          Explore
          <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
        </span>
      </Link>
    </div>
  );
}
