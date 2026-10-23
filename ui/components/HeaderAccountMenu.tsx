"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/domain/auth/actions";
import type { UserRole } from "@/domain/auth/session";
import { NAV_BY_ROLE, ROLE_LABELS } from "@/ui/components/dashboard/navByRole";

/** Same under-header shell + motion as the main mobile nav. */
const mobilePanelClass =
  "absolute inset-x-0 top-full z-10 mt-2.5 origin-top rounded-2xl border border-border bg-background shadow-[0_20px_40px_-24px_rgba(31,32,65,0.45)] transition-[translate,opacity,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden";

const desktopPanelClass =
  "absolute top-full right-0 z-50 mt-2 w-72 origin-top rounded-2xl border border-border bg-background py-2 shadow-[0_20px_40px_-24px_rgba(31,32,65,0.45)] transition-[translate,opacity,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

const openMotion = "visible translate-y-0 opacity-100";
const closedMotion = "pointer-events-none invisible -translate-y-4 opacity-0";

const MOBILE_MQ = "(max-width: 1023px)";

function MenuBody({
  items,
  pathname,
  fullName,
  secondary,
  showIdentity,
  onSelect,
  linkClassName,
}: {
  items: { href: string; label: string; icon: string }[];
  pathname: string;
  fullName: string;
  secondary: string;
  showIdentity: boolean;
  onSelect: () => void;
  linkClassName: (active: boolean) => string;
}) {
  return (
    <>
      {showIdentity ? (
        <div className="border-b border-border px-3.5 py-3">
          <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
          <p className="truncate text-xs text-muted">{secondary}</p>
        </div>
      ) : null}
      <div className={showIdentity ? "flex flex-col gap-0.5 p-2.5" : "py-1"}>
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              role="menuitem"
              aria-current={active ? "page" : undefined}
              onClick={onSelect}
              className={linkClassName(active)}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className={showIdentity ? "border-t border-border px-2.5 pb-2.5" : "border-t border-border pt-1"}>
        <form action={logout}>
          <input type="hidden" name="from" value={pathname || "/"} />
          <button
            type="submit"
            role="menuitem"
            className={
              showIdentity
                ? "menu-item flex w-full cursor-pointer items-center justify-start gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold text-muted hover:bg-surface-muted hover:text-foreground"
                : "menu-item flex w-full cursor-pointer items-center justify-start gap-3 px-4 py-2.5 text-left text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground"
            }
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
              <path d="M6.5 2.5H3.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M7 8h6.5M11 5.5 13.5 8 11 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Log out
          </button>
        </form>
      </div>
    </>
  );
}

export function HeaderAccountMenu({
  fullName,
  role,
  photoUrl = null,
  subtitle = null,
  open,
  onOpenChange,
  onNavigate,
  dropdownHostRef,
}: {
  fullName: string;
  role: UserRole;
  photoUrl?: string | null;
  subtitle?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: () => void;
  /** Relative header shell — mobile panel portals here to match main menu placement. */
  dropdownHostRef: RefObject<HTMLElement | null>;
}) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const items = NAV_BY_ROLE[role];
  const initial = (fullName.trim().charAt(0) || "?").toUpperCase();
  const secondary = subtitle?.trim() || ROLE_LABELS[role];

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  function select() {
    onOpenChange(false);
    onNavigate?.();
  }

  const mobileBody = (
    <MenuBody
      items={items}
      pathname={pathname}
      fullName={fullName}
      secondary={secondary}
      showIdentity
      onSelect={select}
      linkClassName={(active) =>
        `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold tracking-tight ${
          active
            ? "bg-accent-soft text-accent-strong"
            : "text-foreground hover:bg-surface-muted hover:text-accent-strong"
        }`
      }
    />
  );

  const desktopBody = (
    <MenuBody
      items={items}
      pathname={pathname}
      fullName={fullName}
      secondary={secondary}
      showIdentity={false}
      onSelect={select}
      linkClassName={(active) =>
        `flex items-center gap-3 px-4 py-2.5 text-sm font-medium ${
          active ? "bg-accent-soft text-accent-strong" : "text-foreground hover:bg-surface-muted"
        }`
      }
    />
  );

  let menu: ReactNode = null;
  if (mounted && isMobile === true && dropdownHostRef.current) {
    menu = createPortal(
      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-hidden={!open}
        className={`${mobilePanelClass} ${open ? openMotion : closedMotion}`}
      >
        {mobileBody}
      </div>,
      dropdownHostRef.current,
    );
  } else if (isMobile === false) {
    menu = (
      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-hidden={!open}
        className={`${desktopPanelClass} ${open ? openMotion : closedMotion}`}
      >
        {desktopBody}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
        className="flex h-9 max-w-[12rem] cursor-pointer items-center gap-1 rounded-full border border-border bg-surface p-0 pr-1.5 text-left transition-colors hover:border-accent hover:bg-accent-soft sm:h-auto sm:max-w-[16rem] sm:gap-2 sm:px-2.5 sm:py-1.5 sm:pr-2.5"
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- public Supabase Storage URL
          <img
            src={photoUrl}
            alt=""
            className="h-full w-auto shrink-0 aspect-square rounded-full object-cover sm:h-8 sm:w-8"
          />
        ) : (
          <span className="grid h-full w-auto shrink-0 aspect-square place-items-center rounded-full bg-brand-deep text-xs font-bold text-brand-deep-foreground sm:h-8 sm:w-8">
            {initial}
          </span>
        )}
        <span className="min-w-0 hidden sm:block">
          <span className="block truncate text-sm font-semibold text-foreground">{fullName}</span>
          <span className="block truncate text-[11px] text-muted">{secondary}</span>
        </span>
        <svg
          viewBox="0 0 16 16"
          className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          aria-hidden
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {menu}
    </div>
  );
}
