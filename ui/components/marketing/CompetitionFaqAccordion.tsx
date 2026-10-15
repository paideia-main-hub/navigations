"use client";

import { useId, useState } from "react";

export type CompetitionFaqItem = {
  id: string;
  question: string;
  answer: string;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-4 w-4 transition-transform duration-300 ease-out motion-reduce:transition-none ${
        open ? "rotate-180" : "rotate-0"
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** Competition-page FAQ accordion — numbered rows, chevron, animated open. */
export function CompetitionFaqAccordion({ items }: { items: CompetitionFaqItem[] }) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="max-w-2xl space-y-3">
      {items.map((item, index) => {
        const open = openId === item.id;
        const panelId = `${baseId}-panel-${item.id}`;
        const buttonId = `${baseId}-button-${item.id}`;

        return (
          <div
            key={item.id}
            className={`overflow-hidden rounded-xl border bg-surface transition-[border-color] duration-300 ${
              open ? "border-accent/40" : "border-accent/30"
            }`}
          >
            <button
              type="button"
              id={buttonId}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left"
            >
              <span className="mt-0.5 shrink-0 rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-strong">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 font-semibold text-foreground">{item.question}</span>
              <span
                className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                  open ? "bg-accent text-accent-foreground" : "bg-surface-muted text-muted"
                }`}
              >
                <ChevronIcon open={open} />
              </span>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="border-t border-border px-4 pt-3 pb-4 text-sm leading-relaxed text-muted sm:pl-[3.25rem]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
