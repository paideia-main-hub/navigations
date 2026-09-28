"use client";

import Link from "next/link";
import { type CSSProperties, type ReactNode, type RefObject, useEffect, useRef, useSyncExternalStore } from "react";

export interface ScrollSplitCardItem {
  title: string;
  description: string;
  /** Tailwind classes for the flipped face's background/foreground — kept as
   * classes (not raw colors) so every card stays on the site's own theme
   * tokens and follows dark mode automatically. */
  bgClassName: string;
  textClassName: string;
  icon?: ReactNode;
  href?: string;
}

interface ScrollSplitCardProps {
  imageSrc: string;
  cards: ScrollSplitCardItem[];
  startLabel?: string;
  endLabel?: string;
  /** Scroll container to track, if this isn't sitting in the normal page
   * scroller (left undefined for a plain page like ours). */
  containerRef?: RefObject<HTMLElement | null>;
}

/** Same "don't animate for someone who asked the OS not to" check already
 * used in OrbitCardStack.tsx/LeagueSpotlight.tsx. */
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

/** Piecewise-linear keyframe lookup, clamped at both ends — a plain-JS
 * stand-in for framer-motion's `useTransform(progress, inputs, outputs)`. */
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

/** How far the scroll-jacked stage has moved through its own runway: 0 the
 * instant its top edge reaches the viewport top, 1 the instant its bottom
 * edge reaches the viewport bottom — exactly the span the `sticky` stage
 * inside stays pinned for (mirrors framer-motion's
 * `offset: ["start start", "end end"]`). */
function stageProgress(section: HTMLElement): number {
  const rect = section.getBoundingClientRect();
  const range = rect.height - window.innerHeight;
  if (range <= 0) return 1;
  return Math.min(1, Math.max(0, -rect.top / range));
}

/** The four corner radii for one panel: flush against its neighbours (only
 * an outer edge rounded on the two end panels, no rounding at all on any
 * interior one) at rest, so the whole row still reads as one flat image —
 * then every corner rounds out together early in the scroll. */
function cornerRadii(index: number, count: number, t: number): string {
  const isFirst = index === 0;
  const isLast = index === count - 1;
  const at = (startsRounded: boolean) => interpolate(t, [0, 0.2], [startsRounded ? 16 : 0, 16]);
  return `${at(isFirst)}px ${at(isLast)}px ${at(isLast)}px ${at(isFirst)}px`;
}

function CardFace({
  card,
  count,
  index,
  imageSrc,
  onCardRef,
  onFrontRef,
  onBackRef,
}: {
  card: ScrollSplitCardItem;
  count: number;
  index: number;
  imageSrc: string;
  onCardRef: (el: HTMLDivElement | null) => void;
  onFrontRef: (el: HTMLDivElement | null) => void;
  /** The back face renders as a `<Link>` (anchor) when the card has an
   * `href`, a plain div otherwise — either way all this needs is the
   * `HTMLElement` style properties both share. */
  onBackRef: (el: HTMLElement | null) => void;
}) {
  const backClassName = `absolute inset-0 flex flex-col justify-end overflow-hidden border border-white/5 bg-gradient-to-br from-white/10 to-transparent p-5 [backface-visibility:hidden] will-change-transform sm:p-7 ${card.bgClassName} ${card.textClassName}`;
  const backStyle: CSSProperties = { transform: "rotateY(180deg)", zIndex: 1 };
  const backContent = (
    <>
      {card.icon && <div className="relative z-10 mb-auto opacity-90">{card.icon}</div>}
      <h3 className="relative z-10 mt-4 text-lg leading-tight font-semibold sm:text-xl">{card.title}</h3>
      <p className="relative z-10 mt-2 text-sm opacity-80">{card.description}</p>
    </>
  );

  return (
    <div ref={onCardRef} className="relative h-full flex-1" style={{ zIndex: index, transformStyle: "preserve-3d" }}>
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden [backface-visibility:hidden]"
        style={{ zIndex: 2 }}
        ref={onFrontRef}
      >
        <div
          className="absolute inset-0 h-full"
          style={{
            width: `${count * 100}%`,
            left: `${-100 * index}%`,
            backgroundImage: `url(${imageSrc})`,
            // `cover` (not a forced 100% 100% stretch) so the source photo's
            // own aspect ratio is preserved — every panel sizes/positions
            // the same underlying image identically, so the crop still
            // tiles into one seamless, undistorted image across all of them.
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      {card.href ? (
        <Link href={card.href} className={backClassName} style={backStyle} ref={onBackRef}>
          {backContent}
        </Link>
      ) : (
        <div className={backClassName} style={backStyle} ref={onBackRef}>
          {backContent}
        </div>
      )}
    </div>
  );
}

/** A flat image that, scrubbed by scroll, cracks into `cards.length` panels,
 * flips each one over in place, and settles into a row of content cards.
 * Ported from a framer-motion original into plain scroll-linked style
 * writes (no new animation-library dependency), matching how
 * OrbitCardStack/RouteCard already drive continuous motion in this
 * project — direct `element.style.x = ...` on refs, not React state, so a
 * scroll tick never triggers a re-render. */
export function ScrollSplitCard({
  imageSrc,
  cards,
  startLabel = "Scroll down",
  endLabel,
  containerRef: externalContainerRef,
}: ScrollSplitCardProps) {
  const reduceMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const frontRefs = useRef<Array<HTMLDivElement | null>>([]);
  const backRefs = useRef<Array<HTMLElement | null>>([]);
  const startTextRef = useRef<HTMLParagraphElement>(null);
  const endTextRef = useRef<HTMLParagraphElement>(null);

  const count = cards.length;
  const center = (count - 1) / 2;

  useEffect(() => {
    if (reduceMotion) return;
    const section = sectionRef.current;
    if (!section) return;
    const scrollTarget: HTMLElement | Window = externalContainerRef?.current ?? window;

    let queued = false;
    const apply = () => {
      queued = false;
      const t = stageProgress(section);

      const scale = interpolate(t, [0, 0.4], [1, 0.9]);
      const cardsY = interpolate(t, [0.8, 1], [0, -200]);
      groupRef.current?.style.setProperty("transform", `scale(${scale}) translateY(${cardsY}px)`);

      const rotateY = interpolate(t, [0.4, 0.8], [0, 180]);
      const borderOpacity = interpolate(t, [0, 0.2], [0, 0.2]);
      const shadowOpacity = interpolate(t, [0, 0.2], [0, 0.4]);
      const boxShadow = `inset 0 1px 1px rgba(255,255,255,${borderOpacity}), inset 0 -24px 48px rgba(0,0,0,${shadowOpacity}), 0 25px 50px -12px rgba(0,0,0,${shadowOpacity})`;

      for (let i = 0; i < count; i++) {
        const offset = i - center;
        const x = interpolate(t, [0, 0.4, 0.8], [0, 48 * offset, 24 * offset]);
        const rotateZ = interpolate(t, [0.4, 0.8], [0, -6 * offset]);
        cardRefs.current[i]?.style.setProperty(
          "transform",
          `translateX(${x}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
        );

        const radius = cornerRadii(i, count, t);
        for (const face of [frontRefs.current[i], backRefs.current[i]]) {
          if (!face) continue;
          face.style.borderRadius = radius;
          face.style.boxShadow = boxShadow;
        }
      }

      const startOpacity = interpolate(t, [0, 0.1], [1, 0]);
      const startY = interpolate(t, [0, 0.1], [0, 20]);
      if (startTextRef.current) {
        startTextRef.current.style.opacity = String(startOpacity);
        startTextRef.current.style.transform = `translateY(${startY}px)`;
      }

      if (endTextRef.current) {
        const endOpacity = interpolate(t, [0.8, 1], [0, 1]);
        const endY = interpolate(t, [0.8, 1], [40, 0]);
        endTextRef.current.style.opacity = String(endOpacity);
        endTextRef.current.style.transform = `translateY(${endY}px)`;
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    };

    apply();
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      scrollTarget.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduceMotion, count, center, externalContainerRef]);

  return (
    <>
      {/* Small screens (no room for five slivers to flip in place) and
          anyone who's asked for less motion both get the plain content
          grid instead of the scroll-jacked version below. */}
      <div className={`mx-auto grid max-w-6xl gap-4 px-6 py-16 sm:grid-cols-2 lg:grid-cols-3 ${reduceMotion ? "" : "sm:hidden"}`}>
        {cards.map((card) => {
          const className = `flex h-52 flex-col justify-end rounded-2xl p-6 ${card.bgClassName} ${card.textClassName}`;
          const body = (
            <>
              {card.icon && <div className="mb-auto opacity-90">{card.icon}</div>}
              <h3 className="mt-4 text-lg font-semibold leading-tight">{card.title}</h3>
              <p className="mt-2 text-sm opacity-80">{card.description}</p>
            </>
          );
          return card.href ? (
            <Link key={card.title} href={card.href} className={className}>
              {body}
            </Link>
          ) : (
            <div key={card.title} className={className}>
              {body}
            </div>
          );
        })}
      </div>

      {!reduceMotion && (
        <div ref={sectionRef} className="relative hidden h-[500vh] w-full sm:block">
          <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden [perspective:1200px]">
            <p
              ref={startTextRef}
              className="absolute top-[20%] right-0 left-0 text-center text-sm font-medium tracking-widest text-foreground/50 uppercase"
            >
              {startLabel}
            </p>

            <div
              ref={groupRef}
              className="relative flex h-[min(60vh,560px)] min-h-[320px] w-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              {cards.map((card, i) => (
                <CardFace
                  key={card.title}
                  card={card}
                  count={count}
                  index={i}
                  imageSrc={imageSrc}
                  onCardRef={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  onFrontRef={(el) => {
                    frontRefs.current[i] = el;
                  }}
                  onBackRef={(el) => {
                    backRefs.current[i] = el;
                  }}
                />
              ))}
            </div>

            {endLabel && (
              <p
                ref={endTextRef}
                className="absolute right-0 bottom-[20%] left-0 text-center text-2xl font-medium tracking-tight text-foreground/80 italic sm:text-3xl"
                style={{ opacity: 0 }}
              >
                {endLabel}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
