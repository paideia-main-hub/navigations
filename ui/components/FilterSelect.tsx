"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export type FilterOption = { value: string; label: string };

const filterFieldClass =
  "rounded-lg border border-border bg-background py-2 text-sm text-foreground outline-none focus:border-accent";
export const filterInputClass = `${filterFieldClass} px-2.5`;
const selectTriggerClass = `${filterFieldClass} relative w-full cursor-pointer pl-2.5 pr-8 text-left`;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={`pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Custom select so the menu can open below by default, or above when the
 * viewport has no room underneath (native <select> cannot do this).
 * Pass searchable for a live type-to-filter combobox. */
export function FilterSelect({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  className,
  searchable = false,
  searchPlaceholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  "aria-label"?: string;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const selected = options.find((option) => option.value === value) ?? options[0];

  const visibleOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;

    const place = () => {
      const trigger = rootRef.current?.getBoundingClientRect();
      if (!trigger) return;
      const menuHeight = menuRef.current?.offsetHeight ?? 240;
      const gap = 6;
      const spaceBelow = window.innerHeight - trigger.bottom - gap;
      const spaceAbove = trigger.top - gap;
      const needs = Math.min(menuHeight, 240);
      setPlacement(spaceBelow >= needs || spaceBelow >= spaceAbove ? "bottom" : "top");
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, visibleOptions.length]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  const menu = open ? (
    <ul
      ref={menuRef}
      role="listbox"
      aria-label={ariaLabel}
      className={`filter-dropdown-scroll absolute left-0 z-50 max-h-60 w-max min-w-full overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-surface py-1 shadow-[0_16px_40px_-20px_rgba(31,32,65,0.45)] ${
        placement === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5"
      }`}
    >
      {visibleOptions.length > 0 ? (
        visibleOptions.map((option) => {
          const active = option.value === value;
          return (
            <li key={option.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={active}
                className={`flex w-full items-center whitespace-nowrap px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? "bg-accent/10 font-semibold text-accent-strong"
                    : "text-foreground hover:bg-surface-muted"
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option.value)}
              >
                {option.label}
              </button>
            </li>
          );
        })
      ) : (
        <li className="px-3 py-2 text-sm text-muted">No matches</li>
      )}
    </ul>
  ) : null;

  return (
    <div ref={rootRef} className={`relative inline-flex min-w-0 ${className ?? ""}`}>
      {searchable ? (
        <div className="relative w-full">
          <input
            type="text"
            role="combobox"
            aria-label={ariaLabel}
            aria-expanded={open}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            autoComplete="off"
            placeholder={searchPlaceholder ?? selected?.label ?? "Search…"}
            value={open ? query : (selected?.label ?? "")}
            onChange={(event) => {
              setQuery(event.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => {
              setOpen(true);
              setQuery("");
            }}
            className={`${selectTriggerClass} cursor-text`}
          />
          <Chevron open={open} />
        </div>
      ) : (
        <button
          type="button"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((current) => !current)}
          className={selectTriggerClass}
          style={{ cursor: "pointer" }}
        >
          <span className="block truncate">{selected?.label}</span>
          <Chevron open={open} />
        </button>
      )}
      {menu}
    </div>
  );
}
