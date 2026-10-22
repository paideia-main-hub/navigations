"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/domain/auth/actions";
import type { UserRole } from "@/domain/auth/session";
import { NAV_BY_ROLE, ROLE_LABELS } from "@/ui/components/dashboard/navByRole";
import { MenuScroll } from "@/ui/components/MenuScroll";

const MENU_WIDTH = 288;
const VIEW_PAD = 12;
const MOBILE_MQ = "(max-width: 639px)";

function MenuBody({
  items,
  pathname,
  fullName,
  secondary,
  showIdentity,
  onSelect,
}: {
  items: { href: string; label: string; icon: string }[];
  pathname: string;
  fullName: string;
  secondary: string;
  showIdentity: boolean;
  onSelect: () => void;
}) {
  return (
    <>
      {showIdentity ? (
        <div className="border-b border-border px-4 py-3">
          <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
          <p className="truncate text-xs text-muted">{secondary}</p>
        </div>
      ) : null}
      <MenuScroll className="max-h-[min(24rem,60vh)] py-1">
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
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium ${
                active ? "bg-accent-soft text-accent-strong" : "text-foreground hover:bg-surface-muted"
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </MenuScroll>
      <div className="border-t border-border pt-1">
        <form action={logout}>
          <input type="hidden" name="from" value={pathname || "/"} />
          <button
            type="submit"
            role="menuitem"
            className="menu-item flex w-full cursor-pointer items-center justify-start gap-3 px-4 py-2.5 text-left text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground"
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
  onNavigate,
}: {
  fullName: string;
  role: UserRole;
  photoUrl?: string | null;
  subtitle?: string | null;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
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

  useLayoutEffect(() => {
    if (!open || !isMobile || !buttonRef.current) {
      setPos(null);
      return;
    }

    function place() {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const width = Math.min(MENU_WIDTH, window.innerWidth - VIEW_PAD * 2);
      // Mobile only: under the avatar, shifted toward the right of the screen.
      const maxLeft = window.innerWidth - VIEW_PAD - width;
      const left = Math.max(VIEW_PAD, Math.min(rect.left, maxLeft));
      setPos({ top: rect.bottom + 8, left, width });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, isMobile]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
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

  function select() {
    setOpen(false);
    onNavigate?.();
  }

  const body = (
    <MenuBody
      items={items}
      pathname={pathname}
      fullName={fullName}
      secondary={secondary}
      showIdentity={isMobile}
      onSelect={select}
    />
  );

  let menu: ReactNode = null;
  if (open) {
    if (isMobile && mounted && pos) {
      menu = createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className="fixed z-[90] overflow-hidden rounded-2xl border border-border bg-background py-2 shadow-lg shadow-black/10"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
        >
          {body}
        </div>,
        document.body,
      );
    } else if (!isMobile) {
      menu = (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-border bg-background py-2 shadow-lg shadow-black/10"
        >
          {body}
        </div>
      );
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
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
