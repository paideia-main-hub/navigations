"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { HeaderAccountMenu } from "@/ui/components/HeaderAccountMenu";
import { AnnouncementBell } from "@/ui/components/AnnouncementBell";
import { EntryListHeaderButton } from "@/ui/components/registration/SchoolHamperList";
import { StudentHamperHeaderButton } from "@/ui/components/registration/StudentHamperList";
import { useLoginModal } from "@/ui/components/LoginModalContext";
import type { UserRole } from "@/domain/auth/session";
import type { HeaderNotice } from "@/domain/announcements/types";

const navLinks = [
  { href: "/about-us", label: "About Us" },
  { href: "/competitions", label: "Competitions" },
  { href: "/calendar", label: "Calendar" },
  { href: "/results", label: "Results" },
  { href: "/awards", label: "Awards" },
  { href: "/schools", label: "For Schools" },
  { href: "/students", label: "For Students" },
];

export type HeaderUser = {
  id?: string;
  fullName: string;
  role: UserRole;
  photoUrl?: string | null;
  /** Replaces the role label under the name. Coordinators show their school. */
  subtitle?: string | null;
  notices?: HeaderNotice[];
};

function canShowAnnouncements(role: UserRole) {
  return role === "school_coordinator" || role === "student";
}

function linkIsActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ user = null }: { user?: HeaderUser | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const headerShellRef = useRef<HTMLDivElement>(null);
  const { openLogin } = useLoginModal();
  const pathname = usePathname();
  const menuId = useId();
  const showBell = Boolean(user?.id && user.notices && canShowAnnouncements(user.role));

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  function toggleMobileMenu() {
    setMobileOpen((open) => {
      if (!open) setAccountOpen(false);
      return !open;
    });
  }

  function setAccountMenuOpen(open: boolean) {
    setAccountOpen(open);
    if (open) setMobileOpen(false);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:top-6 sm:px-6">
      <div ref={headerShellRef} className="relative z-50 mx-auto max-w-7xl">
        <div className="relative z-20 flex min-h-12 items-center justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3 shadow-lg shadow-black/5 sm:min-h-14 sm:px-6">
          <Link
            href="/"
            className="flex h-6 w-[5.5rem] shrink-0 items-center sm:h-7 sm:w-[6.5rem]"
            onClick={() => {
              setMobileOpen(false);
              setAccountOpen(false);
            }}
          >
            <Logo className="h-full w-auto max-w-full" />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-4 text-sm font-medium text-muted lg:flex xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap transition-colors hover:text-accent ${
                  linkIsActive(pathname, link.href) ? "text-accent-strong" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            {showBell && user?.id && user.notices ? (
              <AnnouncementBell userId={user.id} notices={user.notices} />
            ) : null}
            {user?.role === "school_coordinator" ? <EntryListHeaderButton /> : null}
            {user?.role === "student" ? <StudentHamperHeaderButton /> : null}
            {user ? (
              <HeaderAccountMenu
                fullName={user.fullName}
                role={user.role}
                photoUrl={user.photoUrl}
                subtitle={user.subtitle}
                open={accountOpen}
                onOpenChange={setAccountMenuOpen}
                dropdownHostRef={headerShellRef}
                onNavigate={() => {
                  setMobileOpen(false);
                  setAccountOpen(false);
                }}
              />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openLogin();
                  }}
                  className="hidden cursor-pointer rounded-full px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted sm:inline-block"
                >
                  Login
                </button>
                <Link
                  href="/register"
                  className="rounded-full bg-accent px-3 py-2 text-xs font-semibold whitespace-nowrap text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white sm:px-4 sm:text-sm"
                >
                  Register Now
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls={menuId}
              className="relative z-30 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong lg:hidden"
            >
              <span className="relative block h-3.5 w-3.5">
                <span
                  className={`absolute left-0 block h-0.5 w-3.5 origin-center rounded-full bg-current transition-transform duration-300 ease-out ${
                    mobileOpen ? "top-[6px] rotate-45" : "top-0.5 rotate-0"
                  }`}
                />
                <span
                  className={`absolute top-[6px] left-0 block h-0.5 w-3.5 rounded-full bg-current transition-opacity duration-200 ${
                    mobileOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-0.5 w-3.5 origin-center rounded-full bg-current transition-transform duration-300 ease-out ${
                    mobileOpen ? "top-[6px] -rotate-45" : "top-[11px] rotate-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <nav
          id={menuId}
          aria-hidden={!mobileOpen}
          className={`absolute inset-x-0 top-full z-10 mt-2.5 origin-top rounded-2xl border border-border bg-background shadow-[0_20px_40px_-24px_rgba(31,32,65,0.45)] transition-[translate,opacity,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
            mobileOpen
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-4 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-0.5 p-2.5">
            {navLinks.map((link) => {
              const active = linkIsActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  tabIndex={mobileOpen ? 0 : -1}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-3.5 py-3 text-sm font-semibold tracking-tight transition-colors duration-200 ${
                    active
                      ? "bg-accent-soft text-accent-strong"
                      : "text-foreground hover:bg-surface-muted hover:text-accent-strong"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {!user ? (
              <>
                <div className="my-1.5 border-t border-border" />
                <button
                  type="button"
                  tabIndex={mobileOpen ? 0 : -1}
                  onClick={() => {
                    setMobileOpen(false);
                    openLogin();
                  }}
                  className="cursor-pointer rounded-xl bg-accent px-3.5 py-3 text-center text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white"
                >
                  Login
                </button>
              </>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
