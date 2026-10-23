"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import type { CompetitionStatus } from "@/domain/competitions/types";

export type ManualCompetition = {
  slug: string;
  title: string;
  domain: string;
  status: CompetitionStatus;
  completeManual: { title: string; fileUrl: string } | null;
};

/** Drop leading “D2 –” / “D1 -” style codes from domain labels for display. */
function formatDomainLabel(domain: string): string {
  return domain.replace(/^\s*D\d+\s*[–—-]\s*/i, "").trim() || domain;
}

function ManualPanel({ item }: { item: ManualCompetition }) {
  const domain = item.domain ? formatDomainLabel(item.domain) : null;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black tracking-[0.18em] text-accent uppercase">Manual</p>
        <h3 className="font-heading mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {item.title}
        </h3>
        {domain ? <p className="mt-1.5 text-sm text-muted">{domain}</p> : null}
      </div>

      {item.completeManual ? (
        <>
          <div className="rounded-xl border border-accent/30 bg-surface p-4 sm:p-5">
            <p className="text-sm leading-relaxed text-foreground">
              The official competition manual includes eligibility and registration rules, guiding principles and
              conduct, and the full operations guide for this competition.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-accent/30 bg-accent-soft px-5 py-5 sm:gap-5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold tracking-[0.14em] text-accent-strong uppercase">Download</p>
              <p className="mt-2 text-sm leading-relaxed font-medium text-foreground">{item.completeManual.title}</p>
            </div>
            <a
              href={item.completeManual.fileUrl}
              target="_blank"
              rel="noreferrer"
              download
              aria-label={`Download manual: ${item.completeManual.title}`}
              title="Download competition manual"
              className="group relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground shadow-[0_10px_22px_-8px_rgba(255,105,31,0.55)] ring-4 ring-accent/20 transition-[transform,box-shadow,ring-color] duration-300 ease-out hover:scale-105 hover:bg-accent-strong hover:text-white hover:shadow-[0_14px_28px_-8px_rgba(255,105,31,0.65)] hover:ring-accent/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none motion-reduce:hover:scale-100 sm:h-12 sm:w-12"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5"
              >
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            </a>
          </div>
          <p className="text-sm text-muted">
            <Link
              href={`/competitions/${item.slug}`}
              className="font-semibold text-accent-strong hover:underline"
            >
              See competition details
            </Link>
          </p>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface-muted/50 px-5 py-8">
          <p className="text-sm leading-relaxed text-muted">
            The official competition manual will be available soon. Check back here, or open the competition page for
            other details in the meantime.
          </p>
          <Link
            href={`/competitions/${item.slug}`}
            className="mt-3 inline-flex text-sm font-semibold text-accent-strong hover:underline"
          >
            See competition details →
          </Link>
        </div>
      )}
    </div>
  );
}

export function ManualsLibrary({ competitions }: { competitions: ManualCompetition[] }) {
  const sorted = useMemo(
    () => [...competitions].sort((a, b) => a.title.localeCompare(b.title)),
    [competitions],
  );
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState<string | null>(sorted[0]?.slug ?? null);
  const groupId = useId();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q) ||
        formatDomainLabel(item.domain).toLowerCase().includes(q),
    );
  }, [sorted, query]);

  useEffect(() => {
    if (visible.length === 0) {
      setActiveSlug(null);
      return;
    }
    if (activeSlug && !visible.some((item) => item.slug === activeSlug)) {
      setActiveSlug(visible[0]!.slug);
    }
  }, [visible, activeSlug]);

  const active = visible.find((item) => item.slug === activeSlug) ?? null;

  const searchInput = (
    <label className="relative block w-full">
      <span className="sr-only">Search competitions</span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search competitions…"
        autoComplete="off"
        className="w-full rounded-full border border-border bg-surface py-3 pr-4 pl-10 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent"
      />
    </label>
  );

  const emptyState = (
    <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
      No competitions match your search.
    </p>
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-wider text-accent-strong uppercase">Library</p>
          <h2 className="font-heading mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Find a competition
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            {competitions.length} competitions — select a tab to view and download its official manual.
          </p>
        </div>
        <div className="hidden w-full max-w-sm lg:block">{searchInput}</div>
      </div>

      {/* Mobile: accordion */}
      <div className="space-y-4 lg:hidden">
        {searchInput}
        {visible.length === 0 ? (
          emptyState
        ) : (
          <ul className="space-y-2.5">
            {visible.map((item) => {
              const open = item.slug === activeSlug;
              const panelId = `${groupId}-mobile-${item.slug}`;
              return (
                <li
                  key={item.slug}
                  className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                    open
                      ? "border-accent bg-surface shadow-[0_10px_28px_-18px_rgba(196,64,10,0.45)]"
                      : "border-border bg-surface"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSlug((current) => (current === item.slug ? null : item.slug))}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <span
                      className={`min-w-0 flex-1 text-sm font-semibold leading-snug ${
                        open ? "text-accent-strong" : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      aria-hidden
                      className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                        open ? "border-accent text-accent" : "border-border text-muted"
                      }`}
                    >
                      <span
                        className={`absolute h-2.5 w-px bg-current transition-transform duration-300 ${
                          open ? "rotate-90" : ""
                        }`}
                      />
                      <span className="absolute h-px w-2.5 bg-current" />
                    </span>
                  </button>
                  <div
                    id={panelId}
                    className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t border-border px-4 pt-4 pb-5">
                        {open ? <ManualPanel item={item} /> : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Desktop: tab buttons + sticky panel */}
      <div className="hidden gap-8 lg:grid lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] xl:gap-10">
        <aside>
          {visible.length === 0 ? (
            emptyState
          ) : (
            <ul className="space-y-2.5" role="tablist" aria-label="Competitions">
              {visible.map((item) => {
                const selected = item.slug === activeSlug;
                return (
                  <li key={item.slug}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      id={`${groupId}-tab-${item.slug}`}
                      aria-controls={`${groupId}-panel`}
                      onClick={() => setActiveSlug(item.slug)}
                      className={`flex w-full cursor-pointer items-center rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold leading-snug transition-all duration-300 ${
                        selected
                          ? "border-accent bg-accent-soft text-accent-strong shadow-[0_10px_28px_-18px_rgba(196,64,10,0.55)]"
                          : "border-border bg-surface text-foreground hover:border-accent/40"
                      }`}
                    >
                      {item.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="lg:sticky lg:top-28">
          <div
            id={`${groupId}-panel`}
            role="tabpanel"
            aria-labelledby={active ? `${groupId}-tab-${active.slug}` : undefined}
            className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_22px_50px_-36px_rgba(31,32,65,0.45)]"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-accent via-accent/70 to-accent/20" />
            <div className="px-6 py-6 sm:px-8 sm:py-8">
              {active ? (
                <div key={active.slug} className="animate-faq-answer-in motion-reduce:animate-none">
                  <ManualPanel item={active} />
                </div>
              ) : (
                emptyState
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
