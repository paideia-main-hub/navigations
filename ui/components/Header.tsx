"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useLoginModal } from "@/ui/components/LoginModalContext";

const navLinks = [
  { href: "/about-us", label: "About Us" },
  { href: "/competitions", label: "Competitions" },
  { href: "/calendar", label: "Calendar" },
  { href: "/results", label: "Results" },
  { href: "/awards", label: "Awards" },
  { href: "/schools", label: "For Schools" },
  { href: "/students", label: "For Students" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openLogin } = useLoginModal();

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:top-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/80 px-4 py-3 shadow-lg shadow-black/5 backdrop-blur-lg sm:px-6">
          <Link href="/" className="flex shrink-0 items-center" onClick={() => setMobileOpen(false)}>
            <Logo className="h-6 w-auto sm:h-7" />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-4 text-sm font-medium text-muted lg:flex xl:gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="whitespace-nowrap hover:text-accent">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
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
              className="rounded-full bg-accent px-3 py-2 text-xs font-semibold whitespace-nowrap text-accent-foreground hover:bg-accent/90 sm:px-4 sm:text-sm"
            >
              Register Now
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-foreground lg:hidden"
            >
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4.5">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4.5">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile/tablet nav — a dropdown off the floating pill rather than a
            full-screen drawer, so it stays consistent with the header's own
            compact, floating look instead of a heavier overlay. */}
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out lg:hidden"
          style={{ gridTemplateRows: mobileOpen ? "1fr" : "0fr" }}
        >
          <div className="min-h-0 overflow-hidden">
            <nav className="mt-2 flex flex-col gap-1 rounded-2xl border border-border bg-background/95 p-3 shadow-lg shadow-black/5 backdrop-blur-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-1 border-t border-border" />
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openLogin();
                }}
                className="cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                Login
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
