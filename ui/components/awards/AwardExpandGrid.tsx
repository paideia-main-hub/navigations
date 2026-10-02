"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";
import type { AwardDetail } from "@/ui/components/awards/awardDetails";

type ExpandContextValue = {
  openSlug: string | null;
  toggle: (slug: string) => void;
};

const AwardsExpandContext = createContext<ExpandContextValue | null>(null);

/** One open card across every awards band — opening another collapses the previous. */
export function AwardsExpandProvider({ children }: { children: ReactNode }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const toggle = useCallback((slug: string) => {
    setOpenSlug((current) => (current === slug ? null : slug));
  }, []);
  const value = useMemo(() => ({ openSlug, toggle }), [openSlug, toggle]);
  return <AwardsExpandContext.Provider value={value}>{children}</AwardsExpandContext.Provider>;
}

export function useAwardsExpand() {
  return useContext(AwardsExpandContext);
}

function artworkFor(slug: string): string {
  return `/awards/${slug}.webp`;
}

function mechanismLabel(award: AwardDetail): string {
  if (award.layer === "competition_distinction") return "Automatic — from results";
  if (award.layer === "school_award") return award.criteria ? "Organizer-scored" : "Computed automatically";
  return award.criteria ? "Nominate — judged" : "Nominate — no scoring";
}

const EASE = "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

type Phase = "closed" | "opening" | "open" | "closing";

function CardFace({
  award,
  imageFailed,
  onImageError,
  expanded,
  equalizeBody,
}: {
  award: AwardDetail;
  imageFailed: boolean;
  onImageError: () => void;
  expanded: boolean;
  /** Stretch text block so closed cards in the same grid row share one height. */
  equalizeBody?: boolean;
}) {
  return (
    <div className={equalizeBody ? "flex h-full min-h-0 flex-1 flex-col" : undefined}>
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-brand-deep">
        {imageFailed ? (
          <span className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-brand-deep-foreground/70">
            {award.title}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- static asset in public/
          <img
            src={artworkFor(award.slug)}
            alt=""
            aria-hidden
            loading="lazy"
            onError={onImageError}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className={`flex items-start gap-3 p-5 ${equalizeBody ? "min-h-0 flex-1" : ""}`}>
        <span className="flex-1">
          <span className="text-[0.68rem] font-semibold tracking-[0.16em] text-accent-strong uppercase">
            {mechanismLabel(award)}
          </span>
          <span className="mt-1 block leading-snug font-bold text-foreground">{award.title}</span>
          <span className="mt-1.5 block text-sm text-muted">{award.awardedTo}</span>
        </span>
        <span
          aria-hidden="true"
          className={`relative mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
            expanded ? "border-accent text-accent" : "border-border text-muted"
          }`}
        >
          <span className={`absolute h-2.5 w-px bg-current transition-transform duration-300 ${expanded ? "rotate-90" : ""}`} />
          <span className="absolute h-px w-2.5 bg-current" />
        </span>
      </div>
    </div>
  );
}

function AwardCard({
  award,
  isOpenForSubmission,
  panelId,
  isOpen,
  onToggle,
}: {
  award: AwardDetail;
  isOpenForSubmission: boolean;
  panelId: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [phase, setPhase] = useState<Phase>("closed");
  /** After collapse, skip hover lift/shadow until the pointer leaves — avoids a flash while still over the card. */
  const [hoverLift, setHoverLift] = useState(true);
  const wasOpenRef = useRef(false);
  const overlaying = phase !== "closed";
  const fullyOpen = phase === "open";

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) setHoverLift(false);
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setPhase("opening");
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setPhase("open"));
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }
    setPhase((current) => (current === "closed" ? "closed" : "closing"));
  }, [isOpen]);

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.propertyName !== "grid-template-rows") return;
    if (phase === "closing") setPhase("closed");
  }

  const hoverCard =
    hoverLift && !overlaying
      ? "hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_40px_-28px_rgba(31,32,65,0.45)]"
      : "";

  return (
    <li
      className="relative flex h-full min-h-0 flex-col"
      onMouseLeave={() => setHoverLift(true)}
    >
      {/* Collapsed footprint stays in the grid — expansion overlays content below. */}
      {overlaying ? (
        <div className="invisible pointer-events-none flex min-h-0 flex-1 flex-col" aria-hidden="true">
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface">
            <CardFace
              award={award}
              imageFailed={imageFailed}
              onImageError={() => setImageFailed(true)}
              expanded={false}
              equalizeBody
            />
          </div>
        </div>
      ) : null}

      <div
        className={`overflow-hidden rounded-2xl border bg-surface transition-[border-color,box-shadow] ${EASE} ${
          overlaying
            ? `absolute inset-x-0 top-0 z-50 ${
                fullyOpen
                  ? "border-accent/60 shadow-[0_28px_60px_-24px_rgba(31,32,65,0.55)]"
                  : "border-accent/40 shadow-[0_20px_45px_-28px_rgba(31,32,65,0.4)]"
              }`
            : `relative z-0 flex h-full min-h-0 flex-1 flex-col border-border transition-[transform,box-shadow,border-color] ${EASE} ${hoverCard}`
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen || fullyOpen}
          aria-controls={panelId}
          className={`w-full cursor-pointer text-left ${
            overlaying ? "block" : "flex min-h-0 flex-1 flex-col"
          }`}
        >
          <CardFace
            award={award}
            imageFailed={imageFailed}
            onImageError={() => setImageFailed(true)}
            expanded={fullyOpen || isOpen}
            equalizeBody={!overlaying}
          />
        </button>

        <div
          id={panelId}
          onTransitionEnd={handleTransitionEnd}
          className={`grid transition-[grid-template-rows] ${EASE}`}
          style={{ gridTemplateRows: fullyOpen ? "1fr" : "0fr" }}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-4 border-t border-border px-5 py-5">
              <p className="text-sm leading-relaxed text-muted">{award.description}</p>

              {award.criteria && (
                <div className="flex flex-wrap gap-2">
                  {award.criteria.map((c) => (
                    <span
                      key={c.label}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs"
                    >
                      <span className="text-foreground">{c.label}</span>
                      <span className="font-bold text-accent-strong">{c.weight}</span>
                    </span>
                  ))}
                </div>
              )}

              {isOpenForSubmission ? (
                <Link
                  href={`/awards/${award.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong hover:underline"
                >
                  View eligibility &amp; submit →
                </Link>
              ) : (
                <p className="text-xs font-medium text-muted italic">
                  {award.layer === "competition_distinction" || award.layer === "school_award"
                    ? "No submission needed — published with the season's results."
                    : "Not currently open for nomination."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export function AwardExpandGrid({
  awards,
  openSlugs,
}: {
  awards: AwardDetail[];
  openSlugs: Set<string>;
}) {
  const groupId = useId();
  const shared = useAwardsExpand();
  const [localOpenSlug, setLocalOpenSlug] = useState<string | null>(null);
  const openSlug = shared?.openSlug ?? localOpenSlug;

  function toggle(slug: string) {
    if (shared) {
      shared.toggle(slug);
      return;
    }
    setLocalOpenSlug((current) => (current === slug ? null : slug));
  }

  return (
    <ul className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {awards.map((award, i) => (
        <AwardCard
          key={award.slug}
          award={award}
          isOpenForSubmission={openSlugs.has(award.slug)}
          panelId={`${groupId}-panel-${i}`}
          isOpen={openSlug === award.slug}
          onToggle={() => toggle(award.slug)}
        />
      ))}
    </ul>
  );
}
