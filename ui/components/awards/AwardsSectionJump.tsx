"use client";

import { useEffect, useId, useState } from "react";

export type AwardsJumpSection = {
  id: string;
  label: string;
};

/** Left-edge handle; timeline slides in on click/tap on every screen size. */
export function AwardsSectionJump({ sections }: { sections: AwardsJumpSection[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (sections.length === 0) return;

    function update() {
      const y = window.innerHeight * 0.35;
      let current = 0;
      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i]!.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= y) current = i;
      }
      setActiveIndex(current);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function goTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  }

  if (sections.length === 0) return null;

  const progress = sections.length <= 1 ? 1 : activeIndex / (sections.length - 1);
  const panelWidth = "w-[min(17.5rem,calc(100vw-1.5rem))]";

  return (
    <nav aria-label="Awards sections" className="pointer-events-none fixed inset-y-0 left-0 z-50">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={`pointer-events-auto absolute top-1/2 left-0 z-30 flex h-36 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-r-2xl border border-l-0 border-border bg-surface/95 text-foreground shadow-[8px_0_24px_-12px_rgba(31,32,65,0.4)] backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-[min(17.5rem,calc(100vw-1.5rem))]" : "translate-x-0"
        }`}
      >
        <span className="rotate-180 text-[10px] font-bold tracking-[0.22em] text-muted uppercase [writing-mode:vertical-rl]">
          On this page
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-label="On this page"
        className={`pointer-events-auto absolute top-1/2 left-0 ${panelWidth} -translate-y-1/2 overflow-hidden rounded-r-2xl border border-l-0 border-border bg-surface/95 p-3 shadow-[12px_0_36px_-16px_rgba(31,32,65,0.45)] backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <p className="text-[10px] font-bold tracking-[0.18em] text-muted uppercase">On this page</p>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" className="h-3.5 w-3.5">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <TimelineList sections={sections} activeIndex={activeIndex} progress={progress} onSelect={goTo} />
      </div>
    </nav>
  );
}

function TimelineList({
  sections,
  activeIndex,
  progress,
  onSelect,
}: {
  sections: AwardsJumpSection[];
  activeIndex: number;
  progress: number;
  onSelect: (id: string) => void;
}) {
  return (
    <ol className="relative flex flex-col gap-0.5">
      <span aria-hidden="true" className="absolute top-3 bottom-3 left-[0.95rem] w-px bg-border" />
      <span
        aria-hidden="true"
        className="absolute top-3 left-[0.95rem] w-px origin-top bg-accent transition-[height] duration-500 ease-out"
        style={{ height: `calc((100% - 1.5rem) * ${progress})` }}
      />

      {sections.map((section, index) => {
        const active = index === activeIndex;
        const done = index < activeIndex;
        return (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => onSelect(section.id)}
              aria-current={active ? "true" : undefined}
              className={`group relative flex w-full cursor-pointer items-start gap-3 rounded-xl px-1.5 py-2 text-left transition-colors ${
                active ? "bg-accent/10" : "hover:bg-foreground/[0.04]"
              }`}
            >
              <span
                className={`relative z-10 mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold transition-colors ${
                  active
                    ? "bg-accent text-accent-foreground ring-4 ring-accent/20"
                    : done
                      ? "bg-accent/80 text-accent-foreground"
                      : "bg-surface text-muted ring-1 ring-border group-hover:ring-accent/40"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={`min-w-0 flex-1 pt-0.5 text-[13px] leading-snug font-semibold transition-colors ${
                  active ? "text-accent" : done ? "text-foreground" : "text-muted group-hover:text-foreground"
                }`}
              >
                {section.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
