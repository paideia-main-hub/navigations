"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/domain/auth/session";
import { NAV_BY_ROLE, ROLE_LABELS } from "@/ui/components/dashboard/navByRole";
import { WaveCurvedBottom } from "@/ui/components/marketing/WaveCurvedBottom";

const panelClass =
  "rounded-2xl border border-border bg-background/80 shadow-lg shadow-black/5 backdrop-blur-lg";

const sidebarClass =
  "rounded-2xl border border-accent/20 bg-accent-soft shadow-lg shadow-black/5";

/** Fixed hero chrome — shared by every dashboard route (never remounts on nav). */
export const DASHBOARD_HERO_SHELL =
  "relative -mt-24 flex h-[20rem] flex-col overflow-x-hidden overflow-y-visible bg-brand-deep px-6 pt-24 sm:-mt-28 sm:h-[22rem] sm:pt-28 lg:h-[24rem]";

export type DashboardHeroPayload = {
  eyebrow: string;
  title: string;
  subtitle: ReactNode | null;
  actions: ReactNode | null;
};

const HeroSetContext = createContext<((payload: DashboardHeroPayload) => void) | null>(null);

export function useDashboardHeroSetter() {
  const set = useContext(HeroSetContext);
  if (!set) throw new Error("DashboardHero must be used within DashboardShell");
  return set;
}

function NavLinkBody({ icon, label }: { icon: string; label: string }) {
  const { pending } = useLinkStatus();
  return (
    <>
      <span className="text-base">{icon}</span>
      <span className="min-w-0 flex-1">{label}</span>
      {pending ? <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent" aria-hidden /> : null}
    </>
  );
}

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: { href: string; label: string; icon: string }[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1">
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
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-background text-accent shadow-sm shadow-black/5"
                : "text-muted hover:bg-background/70 hover:text-foreground"
            }`}
          >
            <NavLinkBody icon={item.icon} label={item.label} />
          </Link>
        );
      })}
    </nav>
  );
}

function PersistentHero({ hero }: { hero: DashboardHeroPayload | null }) {
  return (
    <section className={DASHBOARD_HERO_SHELL}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: [
              "repeating-linear-gradient(32deg, transparent 0 20px, #2c2f4c 20px 21.5px)",
              "repeating-linear-gradient(122deg, transparent 0 20px, #2c2f4c 20px 21.5px)",
            ].join(", "),
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-end gap-6 pb-14 sm:gap-8 sm:pb-16 lg:pb-20">
        <div className="min-w-0 flex-1 self-center">
          <p className="text-xs font-semibold tracking-wider text-accent uppercase">
            {hero?.eyebrow ?? "\u00a0"}
          </p>
          <h1 className="font-heading mt-1 line-clamp-2 min-h-[2.5rem] text-3xl font-extrabold text-white sm:min-h-[2.75rem] sm:text-4xl">
            {hero?.title ?? "\u00a0"}
          </h1>
          <p className="mt-3 line-clamp-2 min-h-[2.75rem] max-w-2xl text-brand-deep-muted [&_a]:font-semibold [&_a]:text-accent [&_a]:hover:opacity-90">
            {hero?.subtitle ?? "\u00a0"}
          </p>
        </div>

        <div className="flex min-h-10 shrink-0 flex-col items-stretch justify-end gap-2 sm:items-end">
          {hero?.actions}
        </div>
      </div>

      <WaveCurvedBottom id="dashboard-hero" nextColor="text-background" fill="#1f2041" showShadow />
    </section>
  );
}

/**
 * One dashboard chrome for every route:
 * persistent hero band + left sidebar; only hero copy and main content swap.
 */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardShell({
  role,
  fullName,
  photoUrl = null,
  frlId = null,
  children,
}: {
  role: UserRole;
  fullName: string;
  photoUrl?: string | null;
  frlId?: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hero, setHeroState] = useState<DashboardHeroPayload | null>(null);
  const items = NAV_BY_ROLE[role];

  const setHero = useCallback((payload: DashboardHeroPayload) => {
    setHeroState((prev) => {
      if (
        prev &&
        prev.eyebrow === payload.eyebrow &&
        prev.title === payload.title &&
        prev.subtitle === payload.subtitle &&
        prev.actions === payload.actions
      ) {
        return prev;
      }
      return payload;
    });
  }, []);

  const sidebarInner = (
    <div>
      <div className="border-b border-border px-5 py-5">
        <div className="flex items-center gap-3">
          {role === "student" ? (
            <Link href="/dashboard/account" prefetch title="Profile photo — view or change" className="shrink-0">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- public Supabase Storage URL
                <img src={photoUrl} alt="Your profile photo" className="h-20 w-20 rounded-full object-cover ring-2 ring-surface" />
              ) : (
                <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-deep text-base font-bold text-brand-deep-foreground ring-2 ring-surface">
                  {initials(fullName)}
                </span>
              )}
            </Link>
          ) : null}
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">Dashboard</p>
            <p className="mt-1 truncate text-sm font-semibold text-foreground">{fullName}</p>
            <p className="truncate text-xs text-muted">{ROLE_LABELS[role]}</p>
          </div>
        </div>
        {frlId ? (
          <div className="mt-3">
            <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-accent-strong uppercase">Your League ID</p>
            <p className="mt-0.5 font-mono text-sm font-bold text-foreground">{frlId}</p>
            <p className="mt-1 text-xs text-muted">Used for every competition you enter.</p>
          </div>
        ) : null}
      </div>
      <div className="px-3 py-4">
        <NavLinks items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </div>
    </div>
  );

  return (
    <HeroSetContext.Provider value={setHero}>
      <div className="bg-background">
        <PersistentHero hero={hero} />

        {/* Sidebar + main share the same max-w-7xl column as the public site. */}
        <div className="w-full py-8 sm:py-10 lg:py-12">
          <div className="mx-auto flex w-full max-w-7xl items-start gap-4 px-6 sm:gap-6">
            <aside
              className={`sticky top-28 z-30 hidden w-64 shrink-0 self-start sm:top-32 lg:block ${sidebarClass}`}
            >
              {sidebarInner}
            </aside>

            {mobileOpen ? (
              <div className="fixed inset-0 z-40 lg:hidden">
                <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                <aside
                  className={`absolute top-4 left-4 max-h-[calc(100dvh-2rem)] w-[min(16rem,calc(100vw-2rem))] overflow-y-auto sm:top-6 sm:left-6 ${sidebarClass}`}
                >
                  {sidebarInner}
                </aside>
              </div>
            ) : null}

            <div className="min-w-0 flex-1">
              <div className={`mb-4 flex items-center gap-3 px-4 py-3 lg:hidden ${panelClass}`}>
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open dashboard menu"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground"
                >
                  ☰
                </button>
                <p className="text-sm font-semibold text-foreground">Dashboard menu</p>
              </div>
              <main className="min-h-[min(24rem,calc(100dvh-16rem))]">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </HeroSetContext.Provider>
  );
}

/** Page body in the column beside the sidebar. Each block fills that column
 * up to its own max-width, then sits in the horizontal center. */
export function DashboardPage({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full flex-col items-center [&>*]:w-full">{children}</div>;
}
