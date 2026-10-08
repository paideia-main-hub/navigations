"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseIso(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDisplay(iso: string): string {
  const date = parseIso(iso);
  if (!date) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function clampMonth(date: Date, min: Date | null, max: Date | null): Date {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  if (min && first < new Date(min.getFullYear(), min.getMonth(), 1)) {
    return new Date(min.getFullYear(), min.getMonth(), 1);
  }
  if (max && first > new Date(max.getFullYear(), max.getMonth(), 1)) {
    return new Date(max.getFullYear(), max.getMonth(), 1);
  }
  return first;
}

export function DateField({
  name,
  required = false,
  defaultValue = "",
  value: controlledValue,
  onChange,
  min,
  max,
  className = "",
  label = "Date",
}: {
  name: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const value = controlledValue ?? internal;
  const selected = parseIso(value);
  const minDate = min ? parseIso(min) : null;
  const maxDate = max ? parseIso(max) : null;
  const today = startOfDay(new Date());
  const [visibleMonth, setVisibleMonth] = useState(() =>
    clampMonth(selected ?? today, minDate, maxDate),
  );

  const thisYear = today.getFullYear();
  const maxYear = maxDate?.getFullYear() ?? thisYear + 5;
  const minYear = minDate?.getFullYear() ?? (maxDate && maxDate <= today ? thisYear - 100 : thisYear - 1);
  const years = Array.from({ length: Math.max(1, maxYear - minYear + 1) }, (_, i) => minYear + i);

  function commit(next: string) {
    if (controlledValue === undefined) setInternal(next);
    onChange?.(next);
    setOpen(false);
  }

  function place() {
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 292;
    const estimatedHeight = 372;
    const gap = 6;
    let left = rect.left;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    if (left < 8) left = 8;
    const below = rect.bottom + gap;
    const top =
      below + estimatedHeight > window.innerHeight - 8 && rect.top - gap - estimatedHeight > 8
        ? rect.top - gap - estimatedHeight
        : below;
    setCoords({ top, left });
  }

  useEffect(() => {
    if (!open) return;
    place();
    const onLayout = () => place();
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (inputRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", onLayout, true);
    window.addEventListener("resize", onLayout);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onLayout, true);
      window.removeEventListener("resize", onLayout);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: Date; outside: boolean }[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ date: new Date(year, month, i - firstWeekday + 1), outside: true });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), outside: false });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), outside: true });
  }

  function inRange(date: Date): boolean {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  }

  function shiftMonth(delta: number) {
    setVisibleMonth((current) => clampMonth(new Date(current.getFullYear(), current.getMonth() + delta, 1), minDate, maxDate));
  }

  const todayAllowed = inRange(today);

  return (
    <div className={className}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          required={required}
          readOnly
          value={value}
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => {
            setVisibleMonth(clampMonth(selected ?? today, minDate, maxDate));
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setVisibleMonth(clampMonth(selected ?? today, minDate, maxDate));
              setOpen(true);
            }
          }}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
        />
        <input
          type="text"
          readOnly
          tabIndex={-1}
          aria-hidden
          value={value ? formatDisplay(value) : ""}
          placeholder="Select a date"
          className="pointer-events-none h-[38px] w-full rounded-lg border border-border bg-background pr-10 pl-3 text-sm text-foreground outline-none placeholder:text-muted peer-focus:border-accent"
        />
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-accent-strong">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
            <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" strokeLinecap="round" />
          </svg>
        </span>
      </div>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            id={listId}
            role="dialog"
            aria-label="Choose a date"
            style={{ top: coords.top, left: coords.left }}
            className="fixed z-[100] w-[292px] rounded-2xl border border-border bg-surface p-3 text-foreground shadow-[0_18px_40px_-20px_rgba(31,32,65,0.55)]"
          >
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
                className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-foreground hover:bg-accent-soft hover:text-accent-strong"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                  <path d="M10 3.5 5.5 8 10 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <select
                aria-label="Month"
                value={month}
                onChange={(event) =>
                  setVisibleMonth(clampMonth(new Date(year, Number(event.target.value), 1), minDate, maxDate))
                }
                className="h-8 min-w-0 flex-1 rounded-lg border border-border bg-background px-2 text-sm font-semibold text-foreground outline-none focus:border-accent"
              >
                {MONTHS.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                aria-label="Year"
                value={year}
                onChange={(event) =>
                  setVisibleMonth(clampMonth(new Date(Number(event.target.value), month, 1), minDate, maxDate))
                }
                className="h-8 w-[4.75rem] shrink-0 rounded-lg border border-border bg-background px-2 text-sm font-semibold text-foreground outline-none focus:border-accent"
              >
                {years.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
                className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-foreground hover:bg-accent-soft hover:text-accent-strong"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                  <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-semibold tracking-wide text-muted uppercase">
              {WEEKDAYS.map((day) => (
                <span key={day} className="py-1">
                  {day}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map(({ date, outside }) => {
                const disabled = !inRange(date);
                const isSelected = selected ? sameDay(date, selected) : false;
                const isToday = sameDay(date, today);
                return (
                  <button
                    key={toIso(date)}
                    type="button"
                    disabled={disabled}
                    onClick={() => commit(toIso(date))}
                    className={`mx-auto grid h-9 w-9 cursor-pointer place-items-center rounded-full text-sm ${
                      isSelected
                        ? "bg-accent font-semibold text-accent-foreground"
                        : isToday
                          ? "font-semibold text-accent-strong ring-1 ring-accent"
                          : outside
                            ? "text-muted/70 hover:bg-accent-soft"
                            : "text-foreground hover:bg-accent-soft"
                    } disabled:cursor-not-allowed disabled:text-muted/35 disabled:hover:bg-transparent`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              {!required ? (
                <button
                  type="button"
                  onClick={() => commit("")}
                  className="cursor-pointer rounded-full px-2 py-1 text-xs font-semibold text-muted hover:text-foreground"
                >
                  Clear
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                disabled={!todayAllowed}
                onClick={() => {
                  setVisibleMonth(clampMonth(today, minDate, maxDate));
                  commit(toIso(today));
                }}
                className="cursor-pointer rounded-full px-2 py-1 text-xs font-semibold text-accent-strong hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40"
              >
                Today
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
