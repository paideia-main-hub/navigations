"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useSwipeNavigation } from "@/ui/hooks/useSwipeNavigation";

export interface OrbitStackItem {
  id: string;
  href: string;
  name: string;
  eyebrow: string;
  description: string;
  stat: string;
  /** Public image URL, or null when the card should use the initials/name tile. */
  image: string | null;
}

/** Cycled by position so any real list (competitions, award categories —
 * whatever the caller passes, of whatever length) comes out visually
 * distinct, without either caller needing to know or supply a colour. */
const CARD_PALETTE = [
  "bg-blue-50 dark:bg-blue-500/10",
  "bg-emerald-50 dark:bg-emerald-500/10",
  "bg-amber-50 dark:bg-amber-500/10",
  "bg-rose-50 dark:bg-rose-500/10",
  "bg-violet-50 dark:bg-violet-500/10",
];

/** Falls back to a brand-deep tile with the item's name if artwork is missing
 * or 404s, instead of a broken-image icon. */
function OrbitPortrait({ item }: { item: OrbitStackItem }) {
  const [failed, setFailed] = useState(!item.image);

  return (
    <div className="relative flex aspect-[1.36] w-full overflow-hidden rounded-[1.45rem] border border-border bg-surface-muted">
      {failed || !item.image ? (
        <div className="flex h-full w-full items-center justify-center bg-brand-deep">
          <span className="px-6 text-center text-sm font-semibold text-brand-deep-foreground/70">{item.name}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- static asset in public/ or an already-public storage URL
        <img src={item.image} alt="" aria-hidden="true" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover object-top" />
      )}
    </div>
  );
}

/** The card's visual content for the fanned orbit stage. Purely
 * presentational — no link of its own; the whole card is one click target,
 * wrapped by the caller. */
function CardBody({ item }: { item: OrbitStackItem }) {
  return (
    <>
      <div className="relative">
        <OrbitPortrait item={item} />
      </div>
      <div className="px-1.5 pt-4 pb-1.5 sm:px-2 sm:pt-6 sm:pb-2">
        <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-muted uppercase sm:text-[0.72rem]">
          {item.eyebrow}
        </p>
        <h3 className="mt-1.5 text-[1.35rem] leading-none font-semibold tracking-[-0.04em] text-foreground sm:mt-2 sm:text-[1.75rem]">
          {item.name}
        </h3>
        <p className="mt-3 line-clamp-3 max-w-[17rem] text-[0.88rem] leading-[1.42] font-medium tracking-[-0.01em] text-muted sm:mt-4 sm:text-[0.98rem]">
          {item.description}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-[0.68rem] font-bold tracking-[0.2em] text-muted uppercase">{item.stat}</span>
          <span aria-hidden="true" className="text-accent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 translate-y-1 transition-[translate] duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
            >
              <path d="M4 12 12 4" />
              <path d="M6.5 4H12v5.5" />
            </svg>
          </span>
        </div>
      </div>
    </>
  );
}

/** Subscribes to a media query via useSyncExternalStore rather than a
 * setState-in-effect — the canonical way to read a browser API that can
 * change out from under React, and SSR-safe: the server (and the client's
 * first hydration pass) always sees `false`, so there's nothing to mismatch. */
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Same "don't animate for someone who asked the OS not to" check already
 * used in LeagueSpotlight.tsx. */
function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** The fan's horizontal spread only makes sense as a raw pixel number (it
 * feeds a JS transform, not a class), so the responsive step has to happen
 * in JS too. On phones the centre card is ~50% wide with neighbours peeping
 * from each side, so spread tracks the stage width. */
function useResponsiveSpread(stageWidth: number | null): number {
  const isPhone = useMediaQuery("(max-width: 639px)");
  const isTablet = useMediaQuery("(max-width: 1023px)");
  // Centre card is ~90% wide; neighbours sit just off-stage so only a thin
  // sliver peeks on each side.
  if (isPhone) return stageWidth ? Math.round(stageWidth * 0.48) : 180;
  if (isTablet) return 100;
  return 168;
}

/** How far up the fanned layout is shifted from the stage's vertical centre,
 * so the outermost cards' rotation-induced sag (see the position-formula
 * comment below) still lands inside the stage. The wrapper does not clip:
 * a clip was slicing the fan's shadow into a hard edge on the top and on
 * the outer left and right cards. */
const FAN_VERTICAL_SHIFT = 60;

/** True from the moment the stage first scrolls into view, and stays true —
 * a one-shot reveal, not a toggle, so the auto-rotation doesn't start while
 * nobody's looking at it, but also doesn't stop again once it has. */
function useHasScrolledIntoView<T extends HTMLElement>(ref: React.RefObject<T | null>): boolean {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [seen, ref]);

  return seen;
}

/** Visible slots either side of centre on tablet/desktop (5 cards fanned).
 * Phones use MOBILE_VISIBLE_RADIUS so one card leads with peeks beside it. */
const VISIBLE_RADIUS = 2;
const MOBILE_VISIBLE_RADIUS = 1;
/** Slots actually mounted either side of centre — one more than is ever
 * visible, purely so a card already has somewhere to animate from/to when
 * it crosses into or out of the visible range, instead of popping in place.
 * Together with VISIBLE_RADIUS this is the "lazy load" of the carousel:
 * with 23 real competitions, at most 7 are ever in the DOM at once, not 23. */
const RENDER_RADIUS = VISIBLE_RADIUS + 1;
/** How long each competition sits centred before the carousel advances. */
const ROTATE_MS = 4000;
const ARROW_SIZE = 40;
const ARROW_GAP = 32;
/** Fixed distance from the stage bottom. Card heights vary, so the circles
 * stay on this line instead of tracking whichever card is on the outside. */
const ARROW_BOTTOM = 28;

/** Horizontal position of a fanned card's outer bottom corner, in the stage's
 * coordinate space. Width and spread are stable across the carousel, so this
 * does not move when a taller or shorter card rotates into the slot. */
function cardOuterX(el: HTMLElement, offset: number, spread: number, side: "left" | "right") {
  const w = el.offsetWidth;
  const rad = (offset * 8.5 * Math.PI) / 180;
  const scale = 0.985;
  const rx = (side === "left" ? 0 : w) - w / 2;
  const tx = -w / 2 + offset * spread;
  return el.offsetLeft + w / 2 + Math.cos(rad) * rx * scale + tx;
}

function DesktopOrbitStage({
  items,
  ariaLabel,
  defaultActiveIndex,
  lift,
  viewAllHref,
  viewAllLabel,
}: {
  items: OrbitStackItem[];
  ariaLabel: string;
  defaultActiveIndex: number;
  lift: number;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const isPhone = useMediaQuery("(max-width: 639px)");
  const total = items.length;
  const [centerIndex, setCenterIndex] = useState(() => ((defaultActiveIndex % Math.max(total, 1)) + total) % Math.max(total, 1));
  const [paused, setPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useHasScrolledIntoView(stageRef);
  const [stageWidth, setStageWidth] = useState<number | null>(null);
  const [arrowBox, setArrowBox] = useState<{ left: number; right: number } | null>(null);
  const spread = useResponsiveSpread(stageWidth);
  const visibleRadius = isPhone ? MOBILE_VISIBLE_RADIUS : VISIBLE_RADIUS;
  const renderRadius = visibleRadius + 1;

  // Reset to the front of the list whenever the item SET changes identity
  // (e.g. switching Route 1 <-> Route 2), rather than keeping a stale index
  // from a differently-sized array.
  const [seenLength, setSeenLength] = useState(total);
  if (total !== seenLength) {
    setSeenLength(total);
    setCenterIndex(0);
  }

  useEffect(() => {
    if (reduceMotion || paused || !inView || total <= 1) return;
    const id = setInterval(() => setCenterIndex((i) => (i + 1) % total), ROTATE_MS);
    return () => clearInterval(id);
  }, [reduceMotion, paused, inView, total]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const place = () => {
      setStageWidth(stage.clientWidth);
      const cards = [...stage.querySelectorAll<HTMLElement>("article[data-offset]")].filter(
        (el) => Math.abs(Number(el.dataset.offset)) <= visibleRadius,
      );
      if (cards.length === 0) return;
      const leftEl = cards.reduce((a, b) => (Number(a.dataset.offset) < Number(b.dataset.offset) ? a : b));
      const rightEl = cards.reduce((a, b) => (Number(a.dataset.offset) > Number(b.dataset.offset) ? a : b));
      const bl = cardOuterX(leftEl, Number(leftEl.dataset.offset), spread, "left");
      const br = cardOuterX(rightEl, Number(rightEl.dataset.offset), spread, "right");
      setArrowBox({
        left: bl - ARROW_SIZE - ARROW_GAP,
        right: br + ARROW_GAP,
      });
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [spread, visibleRadius, centerIndex]);

  const swipe = useSwipeNavigation(
    useCallback(
      (direction) => {
        if (total < 2) return;
        setCenterIndex((i) => ((i + direction) % total + total) % total);
      },
      [total],
    ),
    { enabled: total > 1 },
  );

  if (total === 0) return null;

  const advance = (delta: number) => setCenterIndex((i) => ((i + delta) % total + total) % total);

  // Only the render window (at most 2*RENDER_RADIUS+1 items) is ever
  // mounted, each mapped circularly back onto the real, full list — the
  // "lazy load" the carousel needs to stay light with dozens of entries.
  const slots: { offset: number; item: OrbitStackItem; itemIndex: number }[] = [];
  const radius = Math.min(isPhone ? renderRadius : RENDER_RADIUS, Math.floor((total - 1) / 2));
  for (let offset = -radius; offset <= radius; offset++) {
    const itemIndex = ((centerIndex - offset) % total + total) % total;
    slots.push({ offset, item: items[itemIndex]!, itemIndex });
  }

  // Phone keeps the same fan formula, with a slightly tighter vertical step
  // so the ~50%-wide centre card and side peeks fit the shorter stage.
  const yStep = isPhone ? 22 : 30;
  const yExtra = isPhone ? 6 : 10;
  const rotationStep = isPhone ? 7 : 8.5;
  const fanShift = isPhone ? 36 : FAN_VERTICAL_SHIFT;
  const activeLift = isPhone ? Math.round(lift * 0.55) : lift;

  const viewAllClassName =
    "rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-foreground shadow-md transition-colors hover:border-accent hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none";

  return (
    <div
      className="relative flex w-full touch-pan-y flex-col items-center py-6 sm:py-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={swipe.onTouchStart}
      onTouchEnd={swipe.onTouchEnd}
    >
      <div
        ref={stageRef}
        className="relative h-[480px] w-full max-w-[980px] overflow-x-clip sm:h-[620px] sm:overflow-visible lg:h-[640px]"
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            advance(1);
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            advance(-1);
          }
        }}
        role="list"
        aria-label={ariaLabel}
      >
        {slots.map(({ offset, item, itemIndex }) => {
          const active = offset === 0;
          const visible = Math.abs(offset) <= visibleRadius;
          const y = Math.abs(offset) * yStep + Math.max(0, Math.abs(offset) - 1) * yExtra - fanShift;
          const rotation = offset * rotationStep;
          const style: CSSProperties = {
            zIndex: active ? 80 : 50 - Math.abs(offset),
            opacity: visible ? 1 : 0,
            pointerEvents: visible ? "auto" : "none",
            transform: `translate(calc(-50% + ${offset * spread}px), calc(-50% + ${
              y - (active ? activeLift : 0)
            }px)) rotate(${rotation}deg) scale(0.985)`,
            transitionProperty: "transform, opacity",
            transitionDuration: reduceMotion ? "0ms" : "900ms",
          };

          return (
            <article
              key={item.id}
              data-offset={offset}
              role="listitem"
              aria-current={active ? "true" : undefined}
              aria-hidden={visible ? undefined : true}
              className="absolute top-1/2 left-1/2 w-[90%] origin-bottom transition-[transform,opacity] ease-[cubic-bezier(.2,.8,.2,1)] sm:w-64 lg:w-[21rem]"
              style={style}
            >
              <Link
                href={item.href}
                aria-label={`View ${item.name}`}
                tabIndex={visible ? 0 : -1}
                className={`group block w-full rounded-[1.9rem] border border-border p-3 text-foreground outline-none transition-[box-shadow] duration-[420ms] ease-[cubic-bezier(.2,.8,.2,1)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-4 ${
                  CARD_PALETTE[itemIndex % CARD_PALETTE.length]
                } ${active ? "shadow-[0_0_40px_10px_rgba(31,32,65,0.42)] dark:shadow-[0_0_40px_10px_rgba(0,0,0,0.65)]" : "shadow-[0_0_26px_6px_rgba(31,32,65,0.3)] dark:shadow-[0_0_26px_6px_rgba(0,0,0,0.5)]"}`}
              >
                <CardBody item={item} />
              </Link>
            </article>
          );
        })}

        {/* Desktop: View-all stays in the fan hollow. Mobile uses the block below. */}
        {viewAllHref && viewAllLabel && (
          <Link href={viewAllHref} className={`absolute -bottom-6 left-1/2 z-[70] hidden -translate-x-1/2 sm:inline-flex ${viewAllClassName}`}>
            {viewAllLabel} →
          </Link>
        )}

        {/* Beside the outer cards, on a fixed vertical line. Horizontal
            position follows the fan; height does not, so a taller card
            rotating into the end slot cannot pull the circles up or down. */}
        <button
          type="button"
          onClick={() => advance(-1)}
          aria-label="Show previous card"
          className="absolute z-[90] hidden h-10 w-10 cursor-pointer place-items-center rounded-full border border-border bg-surface text-foreground shadow-md transition-[background-color,border-color,color,scale] duration-300 hover:scale-110 hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none sm:grid"
          style={arrowBox ? { left: arrowBox.left, bottom: ARROW_BOTTOM } : { left: 0, bottom: ARROW_BOTTOM }}
        >
          <svg viewBox="5 3 12 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-2.5">
            <path d="M15 5 7 12l8 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => advance(1)}
          aria-label="Show next card"
          className="absolute z-[90] hidden h-10 w-10 cursor-pointer place-items-center rounded-full border border-border bg-surface text-foreground shadow-md transition-[background-color,border-color,color,scale] duration-300 hover:scale-110 hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none sm:grid"
          style={arrowBox ? { left: arrowBox.right, bottom: ARROW_BOTTOM } : { right: 0, bottom: ARROW_BOTTOM }}
        >
          <svg viewBox="7 3 12 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-2.5">
            <path d="m9 5 8 7-8 7" />
          </svg>
        </button>
      </div>

      {/* Mobile: slide counter under the stage; View-all sits further below. */}
      <div className="flex w-full max-w-[980px] flex-col items-center sm:hidden">
        {total > 1 && (
          <p
            aria-live="polite"
            className="mt-2 rounded-full bg-foreground/8 px-3 py-1 text-[11px] font-bold tracking-wide text-foreground tabular-nums"
          >
            {String(centerIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
        )}
        {viewAllHref && viewAllLabel && (
          <Link href={viewAllHref} className={`mt-8 ${viewAllClassName}`}>
            {viewAllLabel} →
          </Link>
        )}
      </div>
    </div>
  );
}

export function OrbitCardStack({
  items,
  ariaLabel,
  defaultActiveIndex = 2,
  lift = 34,
  viewAllHref,
  viewAllLabel,
}: {
  items: OrbitStackItem[];
  ariaLabel: string;
  defaultActiveIndex?: number;
  lift?: number;
  /** Rendered as a "view all" link tucked into the fan's own hollow. */
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  if (items.length === 0) return null;

  return (
    <DesktopOrbitStage
      items={items}
      ariaLabel={ariaLabel}
      defaultActiveIndex={defaultActiveIndex}
      lift={lift}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
    />
  );
}
