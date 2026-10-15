"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { resolveCompetitionCardImage } from "@/domain/competitions/cardImage";
import { pathwayLabels, type CompetitionPathway } from "@/domain/competitions/types";
import {
  submissionStatusLabels,
  type SubmissionCompetition,
  type SubmissionStatus,
  type WorkSubmission,
} from "@/domain/submissions/config";
import { AnimatedModal, ModalCloseButton } from "@/ui/components/AnimatedModal";
import { MenuScroll } from "@/ui/components/MenuScroll";
import { dashboardHeroCtaClass } from "@/ui/components/dashboard/DashboardHero";
import { dashboardGlowCardClass, dashboardGlowOrbClass } from "@/ui/components/dashboard/dashboardGlowCard";
import { SubmissionForm } from "@/ui/components/dashboard/SubmissionForm";

export type WorkSubmissionCard = {
  registrationId: string;
  competitionSlug: string;
  competitionTitle: string;
  registrationNumber: string;
  entryType: "individual" | "team";
  entrantName: string;
  schoolName: string | null;
  grade: string | null;
  categoryLabel: string | null;
  teamMembers: string[];
  pathway: CompetitionPathway | null | undefined;
  imageUrl: string | null | undefined;
  status: SubmissionStatus | null;
  totalScore: number | null;
  maxScore: number | null;
  hasForm: boolean;
  config: SubmissionCompetition | null;
  initial: WorkSubmission | null;
};

export function WorkSubmissionsPanel({
  items,
  emptyMessage = "You aren't registered in a competition that is open for online submission yet.",
  mode = "student",
  initialOpenId = null,
}: {
  items: WorkSubmissionCard[];
  emptyMessage?: string;
  mode?: "student" | "school";
  initialOpenId?: string | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [clearedDeepLink, setClearedDeepLink] = useState(false);
  const titleId = useId();
  const needle = query.trim().toLowerCase();

  useEffect(() => {
    if (!initialOpenId) return;
    if (!items.some((item) => item.registrationId === initialOpenId)) return;
    setActiveId(initialOpenId);
  }, [items, initialOpenId]);

  const shown = useMemo(() => {
    if (!needle) return items;
    return items.filter((item) => {
      const haystack = [
        item.competitionTitle,
        item.competitionSlug,
        item.registrationNumber,
        item.entrantName,
        pathwayLabel(item.pathway),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [items, needle]);

  const active = items.find((item) => item.registrationId === activeId) ?? null;

  function closeModal() {
    setActiveId(null);
    if (initialOpenId && !clearedDeepLink) {
      setClearedDeepLink(true);
      router.replace("/dashboard/submissions");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard/register" prefetch className={`${dashboardHeroCtaClass} w-full sm:w-auto`}>
          Register for competitions
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

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-muted">{emptyMessage}</p>
          <Link
            href="/dashboard/register"
            prefetch
            className="mt-3 inline-block text-sm font-semibold text-accent"
          >
            Register for competitions →
          </Link>
        </div>
      ) : shown.length === 0 ? (
        <p className="rounded-xl border border-accent/30 bg-surface p-6 text-center text-sm text-muted">
          No competitions match “{query.trim()}”.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((item) => {
            const imageSrc = resolveCompetitionCardImage(item.imageUrl);
            const actionLabel =
              mode === "school"
                ? item.status === "scored"
                  ? "View score"
                  : item.status
                    ? "View status"
                    : "View entry"
                : item.hasForm && item.status === "scored"
                  ? "View score & feedback"
                  : item.hasForm && item.status === "submitted"
                    ? "View / update submission"
                    : "Open & submit work";

            return (
              <li key={item.registrationId} className={`${dashboardGlowCardClass} flex flex-col p-4`}>
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
                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-accent-strong uppercase">
                      {pathwayLabel(item.pathway)}
                    </p>
                    <p className="mt-1 font-bold text-foreground">{item.competitionTitle}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.registrationNumber}
                      {item.entryType === "team" ? ` · Team ${item.entrantName}` : ""}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.status === "scored"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : item.status === "submitted"
                            ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                      }`}
                    >
                      {item.status ? submissionStatusLabels[item.status] : "Not started"}
                      {item.status === "scored" && item.totalScore != null
                        ? ` · ${item.totalScore}/${item.maxScore}`
                        : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveId(item.registrationId)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white"
                    >
                      {actionLabel}
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {active
        ? createPortal(
            <AnimatedModal
              onClose={closeModal}
              labelledBy={titleId}
              panelClassName="h-[min(92vh,900px)] max-w-3xl"
            >
              <div className="flex h-full min-h-0 flex-col">
                <header className="shrink-0 border-b border-accent/25 bg-accent-soft px-5 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-accent-strong uppercase">
                        {pathwayLabel(active.pathway)}
                      </p>
                      <h2 id={titleId} className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
                        {active.config?.title ?? active.competitionTitle}
                      </h2>
                      <p className="mt-1 text-sm text-muted">
                        {active.registrationNumber}
                        {active.entrantName ? ` · ${active.entrantName}` : ""}
                      </p>
                    </div>
                    <ModalCloseButton />
                  </div>
                </header>

                <MenuScroll
                  frameClassName="relative min-h-0 flex-1 overflow-hidden"
                  className="absolute inset-0 overscroll-contain p-5 sm:p-6"
                >
                  {active.config ? (
                    <div className="space-y-4">
                      <p className="rounded-2xl border border-accent/25 bg-accent-soft/50 px-4 py-3 text-sm leading-relaxed text-foreground">
                        {active.config.brief}
                      </p>
                      {mode === "school" ? (
                        <div className="space-y-2 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                          <p className="text-sm font-semibold text-foreground">
                            Status:{" "}
                            <span className="font-bold text-accent-strong">
                              {active.status ? submissionStatusLabels[active.status] : "Not started"}
                              {active.status === "scored" && active.totalScore != null
                                ? ` · ${active.totalScore}/${active.maxScore}`
                                : ""}
                            </span>
                          </p>
                          <p className="text-sm leading-relaxed text-muted">
                            Students submit their own work from their dashboard. You can track progress here.
                          </p>
                        </div>
                      ) : (
                        <SubmissionForm
                          key={active.registrationId}
                          registrationId={active.registrationId}
                          registrationNumber={active.registrationNumber}
                          config={active.config}
                          initial={active.initial}
                          onComplete={closeModal}
                        />
                      )}
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
                      Online submission is open for this competition. The questions to collect will be added later.
                    </p>
                  )}
                </MenuScroll>
              </div>
            </AnimatedModal>,
            document.body,
          )
        : null}
    </div>
  );
}

function pathwayLabel(pathway: CompetitionPathway | null | undefined): string {
  if (pathway && pathway in pathwayLabels) return pathwayLabels[pathway];
  return "Online submission";
}
