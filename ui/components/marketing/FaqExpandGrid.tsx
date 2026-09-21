"use client";

import { useId, useState, type ReactNode } from "react";

/** A grid of question cards that pop out of formation and unfold their answer
 * in place, instead of the usual <details> accordion.
 *
 * Two things make the "animation type effect" work without a library:
 *  - Opening a card sets it to `col-span-full`, so it visibly leaves the grid
 *    row it shared with its neighbours and claims the width its answer needs.
 *  - The answer panel animates height via the CSS grid-rows trick
 *    (grid-template-rows: 0fr -> 1fr transitions, unlike plain height:auto).
 *    The inner wrapper carries `overflow-hidden` + `min-height: 0` so the
 *    collapsed state truly measures zero.
 *
 * Cards are independent — any number can be open at once — because these
 * are unrelated facts, not mutually exclusive options like a single-select
 * accordion implies. */

export interface FaqCardItem {
  id: string;
  icon: ReactNode;
  question: string;
  answer: ReactNode;
}

export function FaqExpandGrid({ items }: { items: FaqCardItem[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const groupId = useId();

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => {
        const isOpen = open.has(item.id);
        const panelId = `${groupId}-panel-${i}`;
        return (
          <li key={item.id} className={isOpen ? "sm:col-span-2 lg:col-span-3" : undefined}>
            <div
              className={`group overflow-hidden rounded-2xl border bg-surface transition-[border-color,box-shadow,transform] duration-300 ${
                isOpen
                  ? "border-accent/60 shadow-[0_24px_55px_-30px_rgba(31,32,65,0.55)]"
                  : "border-border hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_40px_-28px_rgba(31,32,65,0.45)]"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-start gap-4 p-6 text-left focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${
                    isOpen ? "bg-accent text-accent-foreground" : "bg-accent-soft text-accent-strong"
                  }`}
                >
                  {item.icon}
                </span>

                <span className="flex-1 pt-1.5 leading-snug font-semibold text-foreground">{item.question}</span>

                {/* Plus rotates into a cross — the one moving part on the
                    collapsed card, so the affordance reads before any click. */}
                <span
                  aria-hidden="true"
                  className={`relative mt-2.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                    isOpen ? "border-accent text-accent" : "border-border text-muted group-hover:border-accent group-hover:text-accent-strong"
                  }`}
                >
                  <span
                    className={`absolute h-2.5 w-px bg-current transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
                  />
                  <span className="absolute h-px w-2.5 bg-current" />
                </span>
              </button>

              {/* The grid-rows trick: 0fr collapses the row to nothing (not
                  just visually hidden — it takes no space and isn't
                  measured), 1fr opens to the content's natural height. */}
              <div
                id={panelId}
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="px-6 pb-6 pl-[4.25rem] text-sm leading-relaxed text-muted">{item.answer}</div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
