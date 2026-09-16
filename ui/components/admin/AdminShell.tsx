"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogout } from "@/domain/admin-auth/actions";
import { ThemeToggle } from "@/ui/components/ThemeToggle";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/competitions", label: "Competitions", icon: "🏆" },
  { href: "/admin/announcements", label: "Announcements", icon: "📣" },
  { href: "/admin/judge-applications", label: "Judge Applications", icon: "📝" },
  { href: "/admin/schools", label: "Schools", icon: "🏫" },
  { href: "/admin/students", label: "Students", icon: "🎓" },
  { href: "/admin/teams", label: "Teams", icon: "👥" },
  { href: "/admin/registrations", label: "Registrations", icon: "📋" },
  { href: "/admin/results", label: "Results", icon: "🏅" },
  { href: "/admin/admins", label: "Admins", icon: "🛡️" },
  { href: "/admin/account", label: "Account", icon: "🔐" },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-muted hover:text-foreground"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ fullName, children }: { fullName: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarInner = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2 px-5 py-5 font-semibold tracking-tight text-foreground">
        <span className="rounded-md bg-accent px-2 py-1 text-sm text-accent-foreground">FCS</span>
        <span>Admin Console</span>
      </Link>
      <div className="flex-1 overflow-y-auto px-3">
        <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </div>
      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between rounded-lg px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
            <p className="text-xs text-muted">Administrator</p>
          </div>
          <ThemeToggle />
        </div>
        <form action={adminLogout}>
          <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground">
            <span className="text-base">🚪</span>
            Log out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-muted lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">{sidebarInner}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-surface shadow-xl">{sidebarInner}</aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground"
          >
            ☰
          </button>
          <span className="font-semibold tracking-tight text-foreground">Admin Console</span>
          <ThemeToggle />
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
