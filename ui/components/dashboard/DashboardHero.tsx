"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { useDashboardHeroSetter } from "@/ui/components/dashboard/DashboardShell";

export const dashboardHeroCtaClass =
  "inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-4 py-2 text-center text-sm font-semibold text-accent-foreground hover:opacity-90";

export const dashboardHeroGhostCtaClass =
  "inline-flex shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-brand-deep-foreground hover:bg-white/10 disabled:opacity-50";

/**
 * Registers hero copy into the persistent dashboard shell.
 * The indigo band / wave live in the layout and never remount on nav —
 * only this text + CTAs swap, which removes the background flicker.
 */
export function DashboardHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  const setHero = useDashboardHeroSetter();

  useLayoutEffect(() => {
    setHero({
      eyebrow,
      title,
      subtitle: subtitle ?? null,
      actions: children ?? null,
    });
  }, [eyebrow, title, subtitle, children, setHero]);

  return null;
}
