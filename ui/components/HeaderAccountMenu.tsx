"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { logout } from "@/domain/auth/actions";
import type { UserRole } from "@/domain/auth/session";
import { NAV_BY_ROLE, ROLE_LABELS } from "@/ui/components/dashboard/navByRole";

export function HeaderAccountMenu({
  fullName,
  role,
  onNavigate,
}: {
  fullName: string;
  role: UserRole;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const items = NAV_BY_ROLE[role];
  const initial = (fullName.trim().charAt(0) || "?").toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[12rem] cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-2 py-1.5 text-left transition-colors hover:border-accent/50 sm:max-w-[16rem] sm:px-2.5"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-deep text-xs font-bold text-brand-deep-foreground">
          {initial}
        </span>
        <span className="min-w-0 hidden sm:block">
          <span className="block truncate text-sm font-semibold text-foreground">{fullName}</span>
          <span className="block truncate text-[11px] text-muted">{ROLE_LABELS[role]}</span>
        </span>
        <svg
          viewBox="0 0 16 16"
          className={`hidden h-3.5 w-3.5 shrink-0 text-muted transition-transform sm:block ${open ? "rotate-180" : ""}`}
          fill="none"
          aria-hidden
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-background py-2 shadow-lg shadow-black/10"
        >
          <div className="border-b border-border px-4 py-3 sm:hidden">
            <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
            <p className="truncate text-xs text-muted">{ROLE_LABELS[role]}</p>
          </div>
          <div className="max-h-[min(24rem,60vh)] overflow-y-auto py-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-border pt-1">
            <form action={logout}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground"
              >
                <span aria-hidden="true">🚪</span>
                Log out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
