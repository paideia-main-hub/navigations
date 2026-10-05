"use client";

import { useId, useState } from "react";

export type FaqItem = {
  question: string;
  answer: string;
};

/** Single-column accordion for the FAQs page — numbered, smooth open/close. */
export function FaqsPageAccordion({ items }: { items: FaqItem[] }) {
  const baseId = useId();
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <ol className="space-y-3">
      {items.map((item, index) => {
        const open = openId === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        const n = String(index + 1).padStart(2, "0");

        return (
          <li
            key={item.question}
            className={`overflow-hidden rounded-2xl border transition-[border-color,box-shadow] duration-300 ${
              open
                ? "border-accent/40 bg-surface shadow-[0_18px_40px_-32px_rgba(31,32,65,0.45)]"
                : "border-border bg-surface hover:border-foreground/15"
            }`}
          >
            <button
              type="button"
              id={buttonId}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId(open ? null : index)}
              className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left sm:gap-5 sm:px-6 sm:py-5"
            >
              <span
                className={`shrink-0 text-xs font-black tracking-[0.16em] tabular-nums ${
                  open ? "text-accent" : "text-muted"
                }`}
              >
                {n}
              </span>
              <span className="min-w-0 flex-1 text-base font-bold tracking-tight text-foreground sm:text-lg">
                {item.question}
              </span>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                  open ? "bg-accent text-accent-foreground" : "bg-surface-muted text-muted"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-border/70 px-5 pb-5 sm:px-6 sm:pb-6">
                  <p className="pt-4 text-sm leading-relaxed text-muted sm:pl-9 sm:text-base">{item.answer}</p>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
