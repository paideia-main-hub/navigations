"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { AwardDetail } from "@/ui/components/awards/awardDetails";

/** Same "pop out of formation and unfold in place" technique as
 * ui/components/marketing/FaqExpandGrid.tsx: opening a card claims the full
 * grid row (col-span-full) and its detail panel animates height via the
 * CSS grid-rows 0fr->1fr trick. Rebuilt here rather than reused because an
 * award card carries a lot more (artwork, mechanism, weighted criteria,
 * a submit link) than a question/answer pair. */

function artworkFor(slug: string): string {
  return `/awards/${slug}.webp`;
}

function initialsFor(title: string): string {
  return title
    .split(/\s+/)
    .map((part) => part.at(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Derived from data already on AWARD_DETAILS rather than a new field: the
 * two computed/organizer-scored layers never take a submission, everything
 * else does — scored against a rubric if it carries criteria, or accepted
 * outright (Teacher/Parent Recognition) if it doesn't. */
function mechanismLabel(award: AwardDetail): string {
  if (award.layer === "competition_distinction") return "Automatic — from results";
  if (award.layer === "school_award") return award.criteria ? "Organizer-scored" : "Computed automatically";
  return award.criteria ? "Nominate — judged" : "Nominate — no scoring";
}

function AwardCard({ award, isOpenForSubmission, panelId }: { award: AwardDetail; isOpenForSubmission: boolean; panelId: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className={isOpen ? "sm:col-span-2 lg:col-span-3" : undefined}>
      <div
        className={`overflow-hidden rounded-2xl border bg-surface transition-[border-color,box-shadow,transform] duration-300 ${
          isOpen
            ? "border-accent/60 shadow-[0_24px_55px_-30px_rgba(31,32,65,0.55)]"
            : "border-border hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_40px_-28px_rgba(31,32,65,0.45)]"
        }`}
      >
        <button type="button" onClick={() => setIsOpen((v) => !v)} aria-expanded={isOpen} aria-controls={panelId} className="block w-full text-left">
          <div className={`grid gap-0 ${isOpen ? "sm:grid-cols-[18rem_1fr]" : ""}`}>
            <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-brand-deep">
              {imageFailed ? (
                <span className="px-6 text-center text-sm font-semibold text-brand-deep-foreground/70">{award.title}</span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- static asset in public/
                <img src={artworkFor(award.slug)} alt="" aria-hidden="true" loading="lazy" onError={() => setImageFailed(true)} className="h-full w-full object-cover" />
              )}
              <span className="absolute right-3 bottom-3 rounded-full bg-brand-deep px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.14em] text-brand-deep-foreground">
                {initialsFor(award.title)}
              </span>
            </div>
            <div className="flex items-start gap-3 p-5">
              <span className="flex-1">
                <span className="text-[0.68rem] font-semibold tracking-[0.16em] text-accent-strong uppercase">{mechanismLabel(award)}</span>
                <span className="mt-1 block leading-snug font-bold text-foreground">{award.title}</span>
                <span className="mt-1.5 block text-sm text-muted">{award.awardedTo}</span>
              </span>
              <span
                aria-hidden="true"
                className={`relative mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                  isOpen ? "border-accent text-accent" : "border-border text-muted group-hover:border-accent"
                }`}
              >
                <span className={`absolute h-2.5 w-px bg-current transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
                <span className="absolute h-px w-2.5 bg-current" />
              </span>
            </div>
          </div>
        </button>

        <div id={panelId} className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
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

export function AwardExpandGrid({ awards, openSlugs }: { awards: AwardDetail[]; openSlugs: Set<string> }) {
  const groupId = useId();

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {awards.map((award, i) => (
        <AwardCard key={award.slug} award={award} isOpenForSubmission={openSlugs.has(award.slug)} panelId={`${groupId}-panel-${i}`} />
      ))}
    </ul>
  );
}
