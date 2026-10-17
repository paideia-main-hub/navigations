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

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-6">
          {PORTALS.map((p, index) => {
            const isLast = index === PORTALS.length - 1;
            return (
            <Link
              key={p.href}
              href={p.href}
              className={`group relative flex flex-col overflow-hidden rounded-[1.6rem] border border-accent/50 p-4 shadow-[0_18px_40px_-28px_rgba(31,32,65,0.4)] sm:border-border/60 sm:p-7 sm:transition-[transform,translate,box-shadow,border-color,background-color] sm:duration-500 sm:ease-[cubic-bezier(0.22,0.8,0.24,1)] sm:hover:-translate-y-1.5 sm:hover:border-accent/50 sm:hover:shadow-[0_28px_55px_-26px_rgba(255,105,31,0.32)] motion-reduce:sm:transition-none ${p.bg} ${
                p.wide
                  ? "col-span-2 lg:col-span-3"
                  : isLast
                    ? "col-span-2 lg:col-span-2"
                    : "col-span-1 lg:col-span-2"
              }`}
            >
              {/* Large watermark of the same icon — echoes the card’s purpose. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-5 -bottom-6 text-foreground/10 dark:text-foreground/15 sm:transition-[transform,translate,scale,color,opacity] sm:duration-500 sm:ease-[cubic-bezier(0.22,0.8,0.24,1)] motion-reduce:sm:transition-none sm:group-hover:-translate-x-1.5 sm:group-hover:-translate-y-2 sm:group-hover:scale-110 sm:group-hover:text-foreground/16 dark:sm:group-hover:text-foreground/25 [&_svg]:h-28 [&_svg]:w-28 sm:[&_svg]:h-40 sm:[&_svg]:w-40"
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
                className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-12 sm:w-12 sm:transition-[background-color,color,transform,scale] sm:duration-500 sm:ease-[cubic-bezier(0.22,0.8,0.24,1)] motion-reduce:sm:transition-none sm:group-hover:scale-105 sm:group-hover:bg-accent sm:group-hover:text-accent-foreground ${p.iconTile}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                >
                  {icons[p.icon]}
                </svg>
              </span>
              <h3 className="relative z-10 mt-3 text-base font-bold tracking-tight text-foreground sm:mt-5 sm:text-lg">
                {p.label}
              </h3>
              <p className="relative z-10 mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted sm:mt-2 sm:line-clamp-none sm:text-sm">
                {p.detail}
              </p>
              <span className="relative z-10 mt-3 inline-flex items-center gap-1.5 self-end text-sm font-semibold text-accent-strong sm:mt-5 sm:self-start sm:transition-colors sm:duration-500 sm:ease-[cubic-bezier(0.22,0.8,0.24,1)] motion-reduce:sm:transition-none sm:group-hover:text-accent">
                Open
                <span
                  aria-hidden="true"
                  className="inline-block sm:transition-transform sm:duration-500 sm:ease-[cubic-bezier(0.22,0.8,0.24,1)] motion-reduce:sm:transition-none sm:group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
