"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MenuScroll } from "@/ui/components/MenuScroll";

export type SelectOption = { value: string; label: string };

export function SelectField({
  name,
  label,
  options,
  required = false,
  defaultValue = "",
  value: valueProp,
  onValueChange,
  placeholder = "Select",
  className = "",
}: {
  name: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
  defaultValue?: string;
  /** When set, the field shows this value instead of its own state. */
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = valueProp ?? uncontrolled;
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const selected = options.find((option) => option.value === value);

  function place() {
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) return;
    const gap = 6;
    const estimatedHeight = Math.min(options.length * 40 + 16, 240);
    const below = rect.bottom + gap;
    const top =
      below + estimatedHeight > window.innerHeight - 8 && rect.top - gap - estimatedHeight > 8
        ? rect.top - gap - estimatedHeight
        : below;
    setCoords({ top, left: rect.left, width: rect.width });
  }

  useEffect(() => {
    if (!open) return;
    place();
    const onLayout = () => place();
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (inputRef.current?.parentElement?.contains(target) || menuRef.current?.contains(target)) return;
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

  function choose(next: string) {
    if (valueProp === undefined) setUncontrolled(next);
    onValueChange?.(next);
    setOpen(false);
  }

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
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
            }
          }}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
        />
        <div className="pointer-events-none flex h-[38px] w-full items-center rounded-lg border border-border bg-background pr-12 pl-3 text-sm peer-focus:border-accent">
          <span className={`truncate ${selected ? "text-foreground" : "text-muted"}`}>
            {selected?.label ?? placeholder}
          </span>
        </div>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className={`pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
        >
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {open &&
        createPortal(
          <div className="fixed z-[100]" style={{ top: coords.top, left: coords.left, width: coords.width }}>
          <MenuScroll
            scrollRef={menuRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className="max-h-60 rounded-xl border border-border bg-surface p-1 text-foreground shadow-[0_18px_40px_-20px_rgba(31,32,65,0.55)]"
          >
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(option.value)}
                  className={`flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm ${
                    active
                      ? "bg-accent font-semibold text-accent-foreground"
                      : "text-foreground hover:bg-accent-soft hover:text-accent-strong"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </MenuScroll>
          </div>,
          document.body,
        )}
    </div>
  );
}
