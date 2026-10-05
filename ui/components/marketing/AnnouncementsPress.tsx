"use client";

import { useState, type ReactNode } from "react";
import type { Announcement } from "@/domain/announcements/types";
import { BandDivider } from "./BandDivider";
import { SectionHeading } from "./SectionHeading";

/** Pinned notices stay first. Every other notice is oldest first. */
function byDateWithPinnedFirst(a: Announcement, b: Announcement): number {
  const pinned = Number(Boolean(b.isImportant)) - Number(Boolean(a.isImportant));
  if (pinned !== 0) return pinned;
  return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
}

/** Modern visual beside an accordion of notices — no date column. */
export function AnnouncementsPress({ announcements }: { announcements: Announcement[] }): ReactNode {
  const shown = [...announcements].sort(byDateWithPinnedFirst).slice(0, 4);
  const [openId, setOpenId] = useState<string | null>(shown[0]?.id ?? null);

  return (
    <section className="relative mx-4 overflow-hidden rounded-[2rem] bg-[#f0e0d2] px-6 pt-16 pb-20 sm:mx-6 sm:rounded-[2.5rem] sm:pt-20 sm:pb-24 lg:mx-10 lg:pt-28 lg:pb-32 dark:bg-[#181428]">
      {/* The same dome on both edges. Ways to Participate uses a wave, so
          this band keeps a single curve instead. */}
      <BandDivider shape="curve" side="top" color="text-background" />
      <BandDivider shape="curve" side="bottom" color="text-background" flip />

      {/* Same dotted square net as Important Dates; stroke stays in the
          warm/indigo family of this band so it reads as texture, not a second colour. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <svg className="absolute inset-0 h-full w-full dark:hidden">
          <defs>
            <pattern id="announce-net-light" width="45" height="45" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0.8" x2="45" y2="0.8" stroke="#d8c0ac" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 5" />
              <line x1="0.8" y1="0" x2="0.8" y2="45" stroke="#d8c0ac" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#announce-net-light)" />
        </svg>
        <svg className="absolute inset-0 hidden h-full w-full dark:block">
          <defs>
            <pattern id="announce-net-dark" width="45" height="45" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0.8" x2="45" y2="0.8" stroke="#2c2640" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 5" />
              <line x1="0.8" y1="0" x2="0.8" y2="45" stroke="#2c2640" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#announce-net-dark)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Important"
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
                src="/announcement-pulse.jpg"
                alt="Pakistani students gathered around a digital display in a bright modern atrium"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <ol className="relative flex flex-col gap-3">
              {shown.map((item) => {
                const open = openId === item.id;
                const panelId = `press-${item.id}`;
                const shell = open
                  ? "border-accent/40 bg-surface shadow-[0_16px_40px_rgba(31,32,65,0.08)]"
                  : "border-border bg-surface hover:border-foreground/15";
                return (
                  <li key={item.id} className="relative">
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenId(open ? null : item.id)}
                      className={`flex w-full cursor-pointer items-center gap-3 border px-4 py-3 text-left transition-colors ${shell} ${
                        open ? "rounded-t-2xl border-b-0" : "rounded-2xl"
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        {item.isImportant ? (
                          <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-accent-strong uppercase">
                            <span className="rounded-full bg-accent px-2 py-0.5 tracking-[0.12em] text-accent-foreground">
                              Pinned
                            </span>
                          </span>
                        ) : null}
                        <span
                          className={`block text-base font-bold tracking-tight text-foreground ${item.isImportant ? "mt-1" : ""}`}
                        >
                          {item.title}
                        </span>
                      </span>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          open ? "bg-accent text-accent-foreground" : "bg-surface-muted text-muted"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
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
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                      <div className={`overflow-hidden ${open ? `rounded-b-2xl border border-t-0 ${shell}` : ""}`}>
                        <div className="px-4 pb-4">
                          {item.competitionTitle && <p className="mb-1.5 text-xs text-muted">{item.competitionTitle}</p>}
                          {item.body && <p className="text-sm leading-6 text-foreground">{item.body}</p>}
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
