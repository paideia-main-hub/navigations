"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useSyncExternalStore } from "react";

export interface FlipStackItem {
  eyebrow: string;
  title: string;
  description: string;
  /** Tailwind classes — these cards are deliberately bold, single-tone
   * blocks (like the brand-deep bands elsewhere on the site), so unlike
   * most cards in this project they don't need to flip with dark mode. */
  bgClassName: string;
  textClassName: string;
  badge?: string;
  href?: string;
}

interface FlipStackProps {
  items: FlipStackItem[];
  hint?: string;
}

/** Same OS-level check already used by OrbitCardStack.tsx/ScrollSplitCard.tsx. */
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

/** Piecewise-linear keyframe lookup, clamped at both ends — same
 * plain-JS stand-in for framer-motion's `useTransform` used in
 * ScrollSplitCard.tsx. */
function interpolate(t: number, inputs: readonly number[], outputs: readonly number[]): number {
  const last = inputs.length - 1;
  if (t <= inputs[0]!) return outputs[0]!;
  if (t >= inputs[last]!) return outputs[last]!;
  for (let i = 0; i < last; i++) {
    if (t >= inputs[i]! && t <= inputs[i + 1]!) {
      const span = inputs[i + 1]! - inputs[i]!;
      const localT = span === 0 ? 0 : (t - inputs[i]!) / span;
      return outputs[i]! + localT * (outputs[i + 1]! - outputs[i]!);
    }
  }
  return outputs[last]!;
}

/** Same "how far through its own runway" geometry as ScrollSplitCard.tsx. */
function stageProgress(section: HTMLElement): number {
  const rect = section.getBoundingClientRect();
  const range = rect.height - window.innerHeight;
  if (range <= 0) return 1;
  return Math.min(1, Math.max(0, -rect.top / range));
}

/** Each card gets an equal `1/total` slice of the 0..1 scroll range to
 * exit in (flip up and away, revealing the next one underneath); it
 * spends the last 70% of the PREVIOUS card's slice settling into place
 * first, so it's already in position by the time it's its own turn. */
function cardTiming(index: number, total: number) {
  const segment = 1 / Math.max(total, 1);
  const start = index * segment;
  const end = Math.min(start + segment, 1);
  const entryStart = Math.max(0, start - segment);
  const entryEnd = index === 0 ? 0.0001 : Math.min(start, entryStart + segment * 0.7);
  const stackedOffset = index * Math.min(24, 72 / Math.max(total - 1, 1));
  const restingOffset = Math.min(index * 12, 34);
  const restingScale = 1 - Math.min(index * 0.012, 0.035);
  return { start, end, entryStart, entryEnd, stackedOffset, restingOffset, restingScale };
}

function CardBody({ item, index }: { item: FlipStackItem; index: number }) {
  return (
    <>
      <div className="absolute top-[clamp(20px,2.5vw,32px)] left-[clamp(20px,2.5vw,32px)] flex items-center gap-3">
        <span className="text-[clamp(18px,1.8vw,24px)] leading-none font-medium tracking-[-0.04em] opacity-60">
          {String(index + 1).padStart(2, "0")}
        </span>
        {item.badge && (
          <span className="rounded-full bg-black/15 px-2.5 py-1 text-[10px] font-black tracking-wide uppercase">{item.badge}</span>
        )}
      </div>

      <div className="max-w-3xl">
        <p className="mb-[clamp(8px,1.2vw,14px)] text-[10px] font-semibold tracking-[0.16em] uppercase opacity-70 sm:text-xs">
          {item.eyebrow}
        </p>
        <h3 className="text-[clamp(22px,2.6vw,34px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">{item.title}</h3>
        <p className="mt-[clamp(10px,1.4vw,16px)] line-clamp-3 text-[clamp(13px,1.05vw,15px)] leading-[1.55] opacity-85 sm:line-clamp-4">
          {item.description}
        </p>
      </div>
    </>
  );
}

function FlipCard({
  item,
  index,
  total,
  onOuterRef,
  onInnerRef,
}: {
  item: FlipStackItem;
  index: number;
  total: number;
  onOuterRef: (el: HTMLDivElement | null) => void;
  onInnerRef: (el: HTMLElement | null) => void;
}) {
  const outerStyle: CSSProperties = {
    zIndex: total - index,
    transformOrigin: "50% 50%",
    transformStyle: "preserve-3d",
    backfaceVisibility: "hidden",
  };
  const innerStyle: CSSProperties = { transformOrigin: "50% 100%" };
  const innerClassName = `relative flex h-full w-full flex-col justify-center overflow-hidden rounded-[clamp(18px,2vw,28px)] p-[clamp(24px,3vw,48px)] shadow-[0_16px_50px_rgba(20,17,10,0.25)] ${item.bgClassName} ${item.textClassName}`;

  return (
    <div ref={onOuterRef} className="absolute inset-0 will-change-transform" style={outerStyle}>
      {item.href ? (
        <Link href={item.href} ref={onInnerRef as (el: HTMLAnchorElement | null) => void} className={innerClassName} style={innerStyle}>
          <CardBody item={item} index={index} />
        </Link>
      ) : (
        <div ref={onInnerRef as (el: HTMLDivElement | null) => void} className={innerClassName} style={innerStyle}>
          <CardBody item={item} index={index} />
        </div>
      )}
    </div>
  );
}

/** A stack of wide, text-only cards that, scrubbed by scroll, each flip up
 * and away in turn to reveal the next one underneath. Ported from a
 * framer-motion original into plain scroll-linked style writes, matching
 * ScrollSplitCard.tsx and OrbitCardStack.tsx elsewhere in this project (no
 * new animation-library dependency, no React state on every scroll tick). */
export function FlipStack({ items, hint = "Scroll to see more" }: FlipStackProps) {
  const reduceMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const outerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const innerRefs = useRef<Array<HTMLElement | null>>([]);
  const hintRef = useRef<HTMLParagraphElement>(null);

  const count = items.length;

  useEffect(() => {
    if (reduceMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    let queued = false;
    const apply = () => {
      queued = false;
      const t = stageProgress(section);

      for (let i = 0; i < count; i++) {
        const timing = cardTiming(i, count);
        const exitYPercent = interpolate(t, [timing.start, timing.end], [0, -118]);
        const exitStackPx = interpolate(t, [timing.start, timing.end], [0, timing.stackedOffset]);
        const rotateX = interpolate(t, [timing.start, timing.end], [0, 22]);
        outerRefs.current[i]?.style.setProperty(
          "transform",
          `translateY(calc(${exitYPercent}% + ${exitStackPx}px)) rotateX(${rotateX}deg)`,
        );

        const entryScale = i === 0 ? 1 : interpolate(t, [timing.entryStart, timing.entryEnd], [timing.restingScale, 1]);
        const entryY = i === 0 ? 0 : interpolate(t, [timing.entryStart, timing.entryEnd], [timing.restingOffset, 0]);
        innerRefs.current[i]?.style.setProperty("transform", `translateY(${entryY}px) scale(${entryScale})`);
      }

      if (hintRef.current) {
        hintRef.current.style.opacity = String(interpolate(t, [0, 0.08], [1, 0]));
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduceMotion, count]);

  if (count === 0) return null;

  // Reduced motion: a plain stacked list of the same cards instead of a
  // scroll-jacked reveal — nothing here is only discoverable by scrubbing,
  // so there's no loss skipping straight to the flat version.
  if (reduceMotion) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        {items.map((item, i) => {
          const className = `relative overflow-hidden rounded-2xl p-6 sm:p-8 ${item.bgClassName} ${item.textClassName}`;
          return item.href ? (
            <Link key={item.title} href={item.href} className={className}>
              <CardBody item={item} index={i} />
            </Link>
          ) : (
            <div key={item.title} className={className}>
              <CardBody item={item} index={i} />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="relative" style={{ height: `${(count + 1) * 100}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden px-4 py-8 sm:px-8">
        <p
          ref={hintRef}
          className="absolute top-4 right-0 left-0 text-center text-xs font-semibold tracking-[0.2em] text-foreground/50 uppercase"
        >
          {hint}
        </p>

        <div className="relative mx-auto h-[260px] w-full max-w-5xl [perspective:800px] sm:h-[320px]">
          {items.map((item, i) => (
            <FlipCard
              key={item.title}
              item={item}
              index={i}
              total={count}
              onOuterRef={(el) => {
                outerRefs.current[i] = el;
              }}
              onInnerRef={(el) => {
                innerRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
