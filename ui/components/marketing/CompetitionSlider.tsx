"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CompetitionSummary } from "@/domain/competitions/types";
import { CompetitionCard } from "@/ui/components/CompetitionCard";

const ADVANCE_MS = 1000;

/** Slides visible at once, by breakpoint. Kept in step with the slide widths
 * below (w-full / sm:w-1/2 / lg:w-1/3) — the track shifts by 100/perView per
 * step, so the two have to agree. */
function slidesPerView(width: number): number {
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

export function CompetitionSlider({ competitions }: { competitions: CompetitionSummary[] }) {
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const read = () => setPerView(slidesPerView(window.innerWidth));
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  const maxIndex = Math.max(0, competitions.length - perView);
  // Filters and resizes change the window under us. Clamping here rather than
  // writing a corrected index back from an effect keeps the render consistent
  // without a second pass.
  const current = Math.min(index, maxIndex);

  // Functional update, so clicking faster than React re-renders still
  // accumulates instead of recomputing from a stale index.
  const step = useCallback(
    (delta: number) =>
      setIndex((i) => {
        const size = maxIndex + 1;
        return (((Math.min(i, maxIndex) + delta) % size) + size) % size;
      }),
    [maxIndex],
  );

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || paused || maxIndex === 0) return;

    timer.current = setInterval(() => setIndex((i) => (Math.min(i, maxIndex) >= maxIndex ? 0 : i + 1)), ADVANCE_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, maxIndex]);

  if (competitions.length === 0) return null;

  const arrow =
    "grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground";

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Competitions"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {competitions.length} competition{competitions.length === 1 ? "" : "s"}
        </p>
        {maxIndex > 0 && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => step(-1)} aria-label="Previous competitions" className={arrow}>
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next competitions" className={arrow}>
              <span aria-hidden="true">›</span>
            </button>
          </div>
        )}
      </div>

      {/* The track slides; nothing scrolls. The negative margin sits on the
          clipping box, not the track — a track wider than its container would
          make each 100/perView% step drift out of step with a card. */}
      <div className="-mx-3 overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(-${current * (100 / perView)}%, 0, 0)` }}
        >
          {competitions.map((c, i) => (
            <div
              key={c.slug}
              className="w-full shrink-0 px-3 sm:w-1/2 lg:w-1/3"
              // Cards scrolled out of the window shouldn't be tab stops.
              aria-hidden={i < current || i >= current + perView}
              inert={i < current || i >= current + perView ? true : undefined}
            >
              <CompetitionCard competition={c} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
