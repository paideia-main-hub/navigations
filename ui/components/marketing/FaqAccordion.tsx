"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FaqCardItem } from "@/ui/components/marketing/FaqExpandGrid";

type FaqVariant = "schools" | "students";

/** Split FAQ: questions on the left, sticky answer on the right. */
export function FaqAccordion({
  items,
  variant = "schools",
  searchable = true,
  searchPlaceholder = "Search questions…",
  stuckHref = "/contact",
  stuckLabel = "Contact us",
  stuckDescription = "Ask us directly and we will give you a clear answer about registration and participation.",
}: {
  items: FaqCardItem[];
  variant?: FaqVariant;
  searchable?: boolean;
  searchPlaceholder?: string;
  stuckHref?: string;
  stuckLabel?: string;
  stuckDescription?: string;
}) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const isSchools = variant === "schools";

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.question.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (visible.length === 0) {
      setActiveId(null);
      return;
    }
    if (!activeId || !visible.some((item) => item.id === activeId)) {
      setActiveId(visible[0]!.id);
    }
  }, [visible, activeId]);

  const active = visible.find((item) => item.id === activeId) ?? null;
  const activeIndex = active ? visible.findIndex((item) => item.id === active.id) + 1 : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <aside className="space-y-4">
        {searchable ? (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search questions"
            className={
              isSchools
                ? "w-full rounded-full border border-border bg-surface px-5 py-3 text-sm text-foreground outline-none focus:border-brand-deep"
                : "w-full rounded-full border border-border bg-surface px-5 py-3 text-sm text-foreground outline-none focus:border-accent"
            }
          />
        ) : null}

        <div>
          {visible.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              No questions match your search.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {visible.map((item, i) => {
                const selected = item.id === activeId;
                const index = String(i + 1).padStart(2, "0");
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      aria-current={selected ? "true" : undefined}
                      className={
                        isSchools
                          ? `flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
                              selected
                                ? "border-brand-deep bg-brand-deep text-brand-deep-foreground shadow-[0_14px_32px_-20px_rgba(31,32,65,0.7)]"
                                : "border-border bg-surface text-foreground hover:border-brand-deep/35"
                            }`
                          : `flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
                              selected
                                ? "border-accent bg-accent-soft shadow-[0_10px_28px_-18px_rgba(196,64,10,0.55)]"
                                : "border-border bg-surface hover:border-accent/40"
                            }`
                      }
                    >
                      <span
                        className={
                          isSchools
                            ? `shrink-0 text-[0.7rem] font-black tracking-[0.14em] ${
                                selected ? "text-accent" : "text-muted"
                              }`
                            : `shrink-0 text-[0.7rem] font-black tracking-[0.14em] ${
                                selected ? "text-accent" : "text-muted"
                              }`
                        }
                      >
                        {index}
                      </span>
                      <span
                        className={
                          isSchools
                            ? `min-w-0 flex-1 text-sm font-semibold leading-snug ${
                                selected ? "text-brand-deep-foreground" : "text-foreground"
                              }`
                            : `min-w-0 flex-1 text-sm font-semibold leading-snug ${
                                selected ? "text-accent-strong" : "text-foreground"
                              }`
                        }
                      >
                        {item.question}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div
          className={
            isSchools
              ? "rounded-2xl border border-brand-deep/15 bg-surface-alt p-5"
              : "rounded-2xl border border-accent/25 bg-accent-soft/50 p-5"
          }
        >
          <p className="text-sm font-bold text-foreground">Still stuck?</p>
          <p className="mt-1 text-sm text-muted">{stuckDescription}</p>
          <Link
            href={stuckHref}
            className={
              isSchools
                ? "mt-4 inline-flex rounded-full bg-brand-deep px-4 py-2.5 text-sm font-semibold text-brand-deep-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                : "mt-4 inline-flex rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            }
          >
            {stuckLabel}
          </Link>
        </div>
      </aside>

      <section className="lg:sticky lg:top-28 lg:pl-4 xl:pl-8">
        {active ? (
          <div
            key={active.id}
            className="animate-faq-answer-in overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_22px_50px_-36px_rgba(31,32,65,0.45)]"
          >
            <div
              className={
                isSchools
                  ? "h-1.5 w-full bg-gradient-to-r from-brand-deep via-brand-deep/70 to-brand-deep/20"
                  : "h-1.5 w-full bg-gradient-to-r from-accent via-accent/70 to-accent/20"
              }
            />
            <div className="px-6 py-6 sm:px-8 sm:py-8">
              <p
                className={
                  isSchools
                    ? "text-xs font-black tracking-[0.18em] text-brand-deep uppercase"
                    : "text-xs font-black tracking-[0.18em] text-accent uppercase"
                }
              >
                Question {String(activeIndex).padStart(2, "0")}
              </p>
              <div className="mt-4 flex items-start gap-4">
                <span
                  className={
                    isSchools
                      ? "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-deep text-brand-deep-foreground"
                      : "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground"
                  }
                >
                  {active.icon}
                </span>
                <h3 className="pt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {active.question}
                </h3>
              </div>
              <div className="mt-6 text-sm leading-relaxed text-muted sm:text-base">{active.answer}</div>
            </div>
          </div>
        ) : (
          <p className="px-6 text-sm text-muted sm:px-8">Select a question to read the answer.</p>
        )}
      </section>
    </div>
  );
}
