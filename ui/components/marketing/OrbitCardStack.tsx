"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type FocusEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export interface OrbitStackItem {
  id: string;
  href: string;
  name: string;
  eyebrow: string;
  description: string;
  stat: string;
  image: string;
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.at(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function inRange(index: number, length: number): number {
  return Math.min(Math.max(0, index), Math.max(0, length - 1));
}

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

/** Falls back to an initials badge on a brand-deep tile if the artwork 404s
 * (not every card — e.g. an award category with no supplied photo yet —
 * has real art), instead of a broken-image icon. */
function OrbitPortrait({ item }: { item: OrbitStackItem }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative flex aspect-[1.36] w-full overflow-hidden rounded-[1.45rem] border border-border bg-surface-muted">
      {failed ? (
        <div className="flex h-full w-full items-center justify-center bg-brand-deep">
          <span className="px-6 text-center text-sm font-semibold text-brand-deep-foreground/70">{item.name}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- static asset in public/ or an already-public storage URL
        <img src={item.image} alt="" aria-hidden="true" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      )}
      <span className="absolute right-4 bottom-4 rounded-full bg-brand-deep px-3 py-1 text-xs font-semibold tracking-[0.18em] text-brand-deep-foreground">
        {initialsFor(item.name)}
      </span>
    </div>
  );
}

/** The card's visual content, shared between the fanned desktop stage and
 * the flat mobile carousel so the two layouts never drift apart. */
function CardBody({ item }: { item: OrbitStackItem }) {
  return (
    <>
      <div className="relative">
        <OrbitPortrait item={item} />
        <Link
          href={item.href}
          aria-label={`View ${item.name}`}
          onClick={(event) => event.stopPropagation()}
          className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-black/20 transition-transform hover:scale-105"
        >
          <ArrowUpRightIcon className="size-4" />
        </Link>
      </div>
      <div className="px-2 pt-6 pb-2">
        <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted uppercase">{item.eyebrow}</p>
        <h3 className="mt-2 text-[2rem] leading-none font-semibold tracking-[-0.04em] text-foreground">{item.name}</h3>
        <p className="mt-4 line-clamp-3 max-w-[17rem] text-[0.98rem] leading-[1.42] font-medium tracking-[-0.01em] text-muted">{item.description}</p>
        <div className="mt-5 border-t border-border pt-4 text-[0.68rem] font-bold tracking-[0.2em] text-muted uppercase">{item.stat}</div>
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
 * used in LeagueSpotlight.tsx, reimplemented here rather than pulling in
 * framer-motion for one boolean. */
function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** The fan's horizontal spread only makes sense as a raw pixel number (it
 * feeds a JS transform, not a class), so the responsive step has to happen
 * in JS too — narrower on tablets so five fanned cards don't run off-screen.
 * (Phones don't use this at all — see the carousel branch below.) */
function useResponsiveSpread(): number {
  const isTablet = useMediaQuery("(max-width: 1023px)");
  return isTablet ? 100 : 168;
}

/** How far up the open (fanned) layout is shifted from the stage's vertical
 * centre, and how much taller the stage box is than it would otherwise need
 * to be — both exist purely to give the outermost cards' rotation-induced
 * sag (see the `open.y` comment below) somewhere to go without the stage's
 * own `overflow-hidden` clipping their bottoms. Verified empirically against
 * the actual rendered card heights at the widest (5-card, desktop) fan;
 * narrower fans and the tablet spread sag less, so this comfortably covers
 * them too. */
const FAN_VERTICAL_SHIFT = 60;
const STAGE_EXTRA_HEIGHT = 120;

/** True from the moment the stage first scrolls into view, and stays true —
 * a one-shot reveal, not a toggle, so the fan doesn't collapse again if the
 * user scrolls a little past it and back. */
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

/** A plain horizontal, swipe-to-scroll row of cards — the fan-out physics
 * don't translate to a touchscreen with no hover, so phones get a simple
 * carousel instead of a shrunk-down version of the desktop stage. */
function MobileCardCarousel({ items, ariaLabel }: { items: OrbitStackItem[]; ariaLabel: string }) {
  return (
    <ul
      role="list"
      aria-label={ariaLabel}
      className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:hidden"
    >
      {items.map((item) => (
        <li
          key={item.id}
          className="w-[78vw] shrink-0 snap-center rounded-[1.9rem] border border-border bg-surface-warm p-4 text-foreground"
        >
          <CardBody item={item} />
        </li>
      ))}
    </ul>
  );
}

function DesktopOrbitStage({
  items,
  ariaLabel,
  defaultActiveIndex,
  lift,
}: {
  items: OrbitStackItem[];
  ariaLabel: string;
  defaultActiveIndex: number;
  lift: number;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const spread = useResponsiveSpread();
  const cards = items;
  const restingIndex = inRange(defaultActiveIndex, cards.length);
  const [activeIndex, setActiveIndex] = useState(restingIndex);
  const [hoverOpen, setHoverOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const scatteredIntoView = useHasScrolledIntoView(stageRef);
  const open = hoverOpen || scatteredIntoView;
  const midpoint = (cards.length - 1) / 2;

  const layouts = useMemo(
    () =>
      cards.map((_, index) => {
        const orbit = index - midpoint;
        const stack = index - restingIndex;
        return {
          open: {
            x: orbit * spread,
            // `origin-bottom` below means rotation pivots on the card's own
            // bottom edge, so the more a card is fanned out the further its
            // bottom corners swing DOWN past where an unrotated card would
            // sit — the outermost cards can sag over 100px past the rest.
            // FAN_VERTICAL_SHIFT (paired with the taller stage box below)
            // moves the whole open fan up to give that sag room without
            // clipping, while barely nudging the resting/closed stack.
            y: Math.abs(orbit) * 30 + Math.max(0, Math.abs(orbit) - 1) * 10 - FAN_VERTICAL_SHIFT,
            rotation: orbit * 8.5,
          },
          closed: {
            x: stack * 10,
            y: Math.abs(stack) * 5,
            rotation: stack * 2.8,
          },
        };
      }),
    [cards, midpoint, restingIndex, spread],
  );

  // Reset to this item set's own resting card whenever the set changes (e.g.
  // switching Route 1 <-> Route 2), rather than keeping a stale index from
  // a differently-sized array.
  const [seenLength, setSeenLength] = useState(cards.length);
  if (cards.length !== seenLength) {
    setSeenLength(cards.length);
    setActiveIndex(restingIndex);
    setHoverOpen(false);
  }

  if (cards.length === 0) return null;

  const activate = (index: number) => {
    setHoverOpen(true);
    setActiveIndex(inRange(index, cards.length));
  };
  const close = () => {
    setHoverOpen(false);
    setActiveIndex(restingIndex);
  };
  const leaveFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) close();
  };
  const focusCard = (index: number) => {
    stageRef.current?.querySelectorAll<HTMLElement>("[role=listitem]")[index]?.focus();
  };

  return (
    <div className="relative hidden w-full items-center justify-center overflow-hidden py-8 sm:flex">
      <div
        ref={stageRef}
        // 640/620 = the original 520/500 plus STAGE_EXTRA_HEIGHT (Tailwind
        // needs the literal value; can't interpolate the constant here).
        className="relative h-[640px] w-full max-w-[980px] sm:h-[620px]"
        onMouseLeave={close}
        onBlur={leaveFocus}
        role="list"
        aria-label={ariaLabel}
      >
        {cards.map((item, index) => {
          const position = open ? layouts[index]!.open : layouts[index]!.closed;
          const active = index === activeIndex;
          const style: CSSProperties = {
            zIndex: active ? 80 : 50 - Math.abs(index - activeIndex),
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${
              position.y - (open && active ? lift : 0)
            }px)) rotate(${position.rotation}deg) scale(${open ? 0.985 : 0.97})`,
            transitionDuration: reduceMotion ? "0ms" : "420ms",
          };

          return (
            <article
              key={item.id}
              role="listitem"
              tabIndex={0}
              aria-current={active ? "true" : undefined}
              className="absolute top-1/2 left-1/2 w-64 origin-bottom cursor-pointer rounded-[1.9rem] border border-border bg-surface-warm p-4 text-foreground outline-none transition-[transform] ease-[cubic-bezier(.2,.8,.2,1)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:w-[21rem]"
              style={style}
              onMouseEnter={() => activate(index)}
              onFocus={() => activate(index)}
              onClick={() => activate(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault();
                  const next = (index + 1) % cards.length;
                  activate(next);
                  focusCard(next);
                }
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault();
                  const next = (index - 1 + cards.length) % cards.length;
                  activate(next);
                  focusCard(next);
                }
                if (event.key === "Escape") {
                  event.currentTarget.blur();
                  close();
                }
              }}
            >
              <CardBody item={item} />
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function OrbitCardStack({
  items,
  ariaLabel,
  defaultActiveIndex = 2,
  lift = 34,
}: {
  items: OrbitStackItem[];
  ariaLabel: string;
  defaultActiveIndex?: number;
  lift?: number;
}) {
  if (items.length === 0) return null;

  return (
    <>
      <MobileCardCarousel items={items} ariaLabel={ariaLabel} />
      <DesktopOrbitStage items={items} ariaLabel={ariaLabel} defaultActiveIndex={defaultActiveIndex} lift={lift} />
    </>
  );
}
