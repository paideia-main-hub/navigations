import Link from "next/link";
import type { ReactNode } from "react";
import { SectionHeading } from "./SectionHeading";

const icons: Record<string, ReactNode> = {
  book: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" />,
  bulb: <path d="M9 18h6m-5 3h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" />,
  trophy: <path d="M8 21h8m-4-4v4m-6-17h12v5a6 6 0 0 1-12 0V4Zm0 2H4a2 2 0 0 0 0 4h2m12-4h2a2 2 0 0 1 0 4h-2" />,
  building: <path d="M4 22V6l8-4 8 4v16M4 22h16M9 22v-6h6v6M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />,
  graduate: <path d="M22 10 12 5 2 10l10 5 10-5Zm-4 2.2V17c0 1.66-2.69 3-6 3s-6-1.34-6-3v-4.8M22 10v6" />,
};

const PORTALS = [
  {
    href: "/manuals",
    label: "Manuals & Guidelines",
    detail: "Rules, rubrics and the full manual for every competition category.",
    icon: "book",
    wide: true,
    bg: "bg-blue-50 dark:bg-blue-500/10",
    iconTile: "bg-blue-200/80 text-blue-800 dark:bg-blue-400/30 dark:text-blue-100",
  },
  {
    href: "/resources",
    label: "Practice / Resource Centre",
    detail: "Sample prompts and prep material to practice with before you enter.",
    icon: "bulb",
    wide: true,
    bg: "bg-amber-50 dark:bg-amber-500/10",
    iconTile: "bg-amber-200/80 text-amber-900 dark:bg-amber-400/30 dark:text-amber-100",
  },
  {
    href: "/results",
    label: "Results & Winners",
    detail: "Published standings and the winners gallery, competition by competition.",
    icon: "trophy",
    wide: false,
    bg: "bg-violet-50 dark:bg-violet-500/10",
    iconTile: "bg-violet-200/80 text-violet-900 dark:bg-violet-400/30 dark:text-violet-100",
  },
  {
    href: "/schools",
    label: "For Schools",
    detail: "Coordinator tools for registering students and managing your roster.",
    icon: "building",
    wide: false,
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconTile: "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-400/30 dark:text-emerald-100",
  },
  {
    href: "/students",
    label: "For Students",
    detail: "Everything you need to find a competition and get entered.",
    icon: "graduate",
    wide: false,
    bg: "bg-rose-50 dark:bg-rose-500/10",
    iconTile: "bg-rose-200/80 text-rose-900 dark:bg-rose-400/30 dark:text-rose-100",
  },
] as const;

export function QuickLinksGrid() {
  return (
    <section className="relative px-6 py-16 sm:py-20 lg:py-24">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading eyebrow="Explore the Platform" title="Quick Links" />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {PORTALS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={`group relative flex flex-col overflow-hidden rounded-[1.6rem] border border-border/60 p-6 shadow-[0_18px_40px_-28px_rgba(31,32,65,0.4)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,0.8,0.24,1)] hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-[0_28px_55px_-26px_rgba(255,105,31,0.32)] sm:p-7 ${p.bg} ${
                p.wide ? "lg:col-span-3" : "lg:col-span-2"
              }`}
            >
              {/* Large watermark of the same icon — echoes the card’s purpose. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-5 -bottom-6 text-foreground/10 transition-[transform,color,opacity] duration-500 ease-[cubic-bezier(0.22,0.8,0.24,1)] group-hover:-translate-x-1.5 group-hover:-translate-y-2 group-hover:scale-110 group-hover:text-foreground/16 dark:text-foreground/15 dark:group-hover:text-foreground/25 [&_svg]:h-36 [&_svg]:w-36 sm:[&_svg]:h-40 sm:[&_svg]:w-40"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {icons[p.icon]}
                </svg>
              </div>

              <span
                className={`relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-[background-color,color,transform] duration-500 ease-[cubic-bezier(0.22,0.8,0.24,1)] group-hover:scale-105 group-hover:bg-accent group-hover:text-accent-foreground ${p.iconTile}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-6 w-6"
                >
                  {icons[p.icon]}
                </svg>
              </span>
              <h3 className="relative z-10 mt-5 text-lg font-bold tracking-tight text-foreground transition-colors duration-500">
                {p.label}
              </h3>
              <p className="relative z-10 mt-2 flex-1 text-sm leading-relaxed text-muted transition-colors duration-500">
                {p.detail}
              </p>
              <span className="relative z-10 mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong transition-colors duration-500 ease-[cubic-bezier(0.22,0.8,0.24,1)] group-hover:text-accent">
                Open
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.22,0.8,0.24,1)] group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
