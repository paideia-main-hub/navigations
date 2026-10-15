"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { resolveCompetitionCardImage } from "@/domain/competitions/cardImage";
import {
  entryFormatLabel,
  formatFee,
  pathwayLabels,
  statusLabels,
  type CompetitionSummary,
} from "@/domain/competitions/types";
import type { PaymentAccount } from "@/domain/payments/types";
import { Badge } from "@/ui/components/Badge";
import { AnimatedModal, ModalCloseButton } from "@/ui/components/AnimatedModal";
import { MenuScroll } from "@/ui/components/MenuScroll";
import { RegistrationWizard } from "@/ui/components/registration/RegistrationWizard";
import { useStudentHamper } from "@/ui/components/registration/StudentHamperList";
import { dashboardHeroCtaClass } from "@/ui/components/dashboard/DashboardHero";
import { dashboardGlowCardClass, dashboardGlowOrbClass } from "@/ui/components/dashboard/dashboardGlowCard";

interface StudentInfo {
  fullName: string;
  frlId: string | null;
  grade: string | null;
  schoolName: string | null;
  studentId: string | null;
}

function feeLabel(c: CompetitionSummary): string {
  return c.feeAmount == null ? "Fee not set" : formatFee(c.feeAmount);
}

function gradeRange(c: CompetitionSummary): string {
  const grades = c.eligibility.flatMap((e) => [Number(e.minGrade), Number(e.maxGrade)]).filter((n) => Number.isFinite(n) && n > 0);
  if (grades.length === 0) return "";
  const lo = Math.min(...grades);
  const hi = Math.max(...grades);
  return lo === hi ? `Grade ${lo}` : `Grades ${lo}–${hi}`;
}

/** Browse open competitions → complete the form → add to hamper → pay once.
 * Mirrors the school coordinator hamper flow. */
export function CompetitionBasket({
  competitions,
  registeredSlugs,
  student,
  paymentAccount,
}: {
  competitions: CompetitionSummary[];
  registeredSlugs: string[];
  student: StudentInfo;
  paymentAccount: PaymentAccount;
}) {
  const registered = useMemo(() => new Set(registeredSlugs), [registeredSlugs]);
  const hamper = useStudentHamper();
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const titleId = useId();

  const needle = query.trim().toLowerCase();
  const shownCompetitions = needle
    ? competitions.filter((c) => {
        const haystack = [c.title, c.slug, c.domain, c.pathway ? pathwayLabels[c.pathway] : ""]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      })
    : competitions;

  const active = competitions.find((c) => c.slug === activeSlug) ?? null;

  function closeModal() {
    setActiveSlug(null);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard/competitions" prefetch className={`${dashboardHeroCtaClass} w-full sm:w-auto`}>
          My Competitions
        </Link>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search competitions"
          aria-label="Search competitions"
          className="h-[38px] w-full rounded-lg border border-accent/30 bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent sm:max-w-xs sm:flex-1"
        />
      </div>

      {competitions.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
          No competitions are open for registration right now.
        </p>
      ) : shownCompetitions.length === 0 ? (
        <p className="rounded-xl border border-accent/30 bg-surface p-6 text-center text-sm text-muted">
          No competitions match “{query.trim()}”.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shownCompetitions.map((c) => {
            const isRegistered = registered.has(c.slug);
            const inHamper = hamper.hasEntry(c.slug);
            const imageSrc = resolveCompetitionCardImage(c.imageUrl);
            return (
              <li
                key={c.slug}
                className={`${dashboardGlowCardClass} flex flex-col p-4 ${inHamper ? "ring-accent hover:ring-accent" : ""}`}
              >
                {imageSrc ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- public Supabase Storage URL */}
                    <img
                      src={imageSrc}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                    />
                    <div aria-hidden className="absolute inset-0 bg-white/92" />
                  </>
                ) : null}
                <div aria-hidden className={dashboardGlowOrbClass} />
                <div className="relative flex min-h-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {c.pathway ? (
                        <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-accent-strong uppercase">
                          {pathwayLabels[c.pathway]}
                        </p>
                      ) : null}
                      <p className="mt-1 font-bold text-foreground">{c.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {[gradeRange(c), entryFormatLabel(c)].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <Badge tone={c.status === "open" ? "success" : "warning"}>{statusLabels[c.status]}</Badge>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <span className="text-sm font-semibold text-foreground">{feeLabel(c)}</span>
                    {isRegistered ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        Registered ✓
                      </span>
                    ) : inHamper ? (
                      <button
                        type="button"
                        onClick={() => hamper.removeEntry(c.slug)}
                        className="cursor-pointer rounded-full border border-accent bg-white px-4 py-1.5 text-xs font-semibold text-accent-strong shadow-sm transition-colors duration-300 hover:bg-accent hover:text-white"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveSlug(c.slug)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white"
                      >
                        Add
                        <span aria-hidden="true">→</span>
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {active
        ? createPortal(
            <AnimatedModal onClose={closeModal} labelledBy={titleId} panelClassName="max-h-[min(92vh,900px)] max-w-3xl">
              <MenuScroll className="max-h-[min(92vh,900px)] p-5 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h2 id={titleId} className="text-xl font-extrabold tracking-tight text-foreground">
                    Register for {active.title}
                  </h2>
                  <ModalCloseButton />
                </div>
                <RegistrationWizard
                  key={active.slug}
                  competition={active}
                  mode="student"
                  studentName={student.fullName}
                  studentId={student.studentId ?? undefined}
                  paymentAccount={paymentAccount}
                  onAddedToList={() => {
                    closeModal();
                    hamper.openDrawer();
                  }}
                />
              </MenuScroll>
            </AnimatedModal>,
            document.body,
          )
        : null}
    </div>
  );
}
