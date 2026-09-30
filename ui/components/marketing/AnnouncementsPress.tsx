"use client";

import { useState, type ReactNode } from "react";
import type { Announcement } from "@/domain/announcements/types";
import { announcementCategoryLabels } from "@/domain/announcements/types";
import { BandDivider } from "./BandDivider";
import { SectionHeading } from "./SectionHeading";

function formatParts(iso: string): { day: string; month: string; year: string } {
  const date = new Date(iso);
  return {
    day: date.toLocaleDateString("en-GB", { day: "numeric" }),
    month: date.toLocaleDateString("en-GB", { month: "short" }),
    year: date.toLocaleDateString("en-GB", { year: "numeric" }),
  };
}

/** Pinned notices stay first. Every other notice is oldest first. */
function byDateWithPinnedFirst(a: Announcement, b: Announcement): number {
  const pinned = Number(Boolean(b.isImportant)) - Number(Boolean(a.isImportant));
  if (pinned !== 0) return pinned;
  return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
}

/** A megaphone announcement beside an accordion. Each row keeps its date on
 * a shared timeline, and opening a row reveals that notice. */
export function AnnouncementsPress({ announcements }: { announcements: Announcement[] }): ReactNode {
  const shown = [...announcements].sort(byDateWithPinnedFirst).slice(0, 4);
  const [openId, setOpenId] = useState<string | null>(shown[0]?.id ?? null);

  return (
    <section className="relative mx-4 overflow-hidden rounded-[2rem] bg-surface-warm px-6 pt-16 pb-20 sm:mx-6 sm:rounded-[2.5rem] sm:pt-20 sm:pb-24 lg:mx-10 lg:pt-28 lg:pb-32">
      {/* The same dome on both edges. Ways to Participate uses a wave, so
          this band keeps a single curve instead. */}
      <BandDivider shape="curve" side="top" color="text-background" />
      <BandDivider shape="curve" side="bottom" color="text-background" flip />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Press file"
          title="Announcements"
          action={{ href: "/announcements", label: "View all" }}
        />

        {shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface/60 py-10 text-center text-sm text-muted">
            No announcements published yet.
          </p>
        ) : (
          <div className="grid items-stretch gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
            <div className="relative min-h-[22rem] overflow-hidden rounded-3xl lg:min-h-full">
              <img
                src="/announcement-megaphone.png"
                alt="A person seen from behind, raising a megaphone to address a hall"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <ol className="relative flex flex-col gap-3">
              <span aria-hidden="true" className="absolute top-6 bottom-6 left-[3.5rem] w-px bg-border" />
              {shown.map((item) => {
                const open = openId === item.id;
                const panelId = `press-${item.id}`;
                const date = formatParts(item.publishDate);
                const shell = open
                  ? "border-accent/40 bg-surface shadow-[0_16px_40px_rgba(31,32,65,0.08)]"
                  : "border-border bg-surface hover:border-foreground/15";
                return (
                  <li key={item.id} className="relative grid grid-cols-[7rem_minmax(0,1fr)] items-stretch gap-x-3">
                    <time
                      dateTime={item.publishDate}
                      className={`relative z-10 row-start-1 flex h-full flex-col items-center justify-center rounded-2xl border px-2 text-center ${
                        open
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-surface text-foreground"
                      }`}
                    >
                      <span className="text-2xl leading-none font-bold">{date.day}</span>
                      <span className="mt-1 text-xs font-semibold tracking-wide uppercase">{date.month}</span>
                      <span className={`mt-0.5 text-xs ${open ? "text-accent-foreground/80" : "text-muted"}`}>{date.year}</span>
                    </time>

                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenId(open ? null : item.id)}
                      className={`col-start-2 row-start-1 flex w-full cursor-pointer items-center gap-4 border px-5 py-4 text-left transition-colors ${shell} ${
                        open ? "rounded-t-2xl border-b-0" : "rounded-2xl"
                      }`}
                    >
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.16em] text-accent-strong uppercase">
                            {announcementCategoryLabels[item.category]}
                            {item.isImportant && (
                              <span className="rounded-full bg-accent px-2 py-0.5 tracking-[0.12em] text-accent-foreground">
                                Pinned
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block text-xl font-bold tracking-tight text-foreground">{item.title}</span>
                        </span>
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            open ? "bg-accent text-accent-foreground" : "bg-surface-muted text-muted"
                          }`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </span>
                      </button>
                      <div
                        id={panelId}
                        role="region"
                        className={`col-start-2 grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                      >
                        <div className={`overflow-hidden ${open ? `rounded-b-2xl border border-t-0 ${shell}` : ""}`}>
                          <div className="px-5 pb-5">
                            {item.competitionTitle && <p className="mb-2 text-sm text-muted">{item.competitionTitle}</p>}
                            {item.body && <p className="text-lg leading-8 text-foreground">{item.body}</p>}
                          </div>
                        </div>
                      </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
