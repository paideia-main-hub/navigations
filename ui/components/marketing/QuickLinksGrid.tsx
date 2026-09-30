import Link from "next/link";
import type { ReactNode } from "react";
import { BandDivider } from "./BandDivider";
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
  },
  {
    href: "/resources",
    label: "Practice / Resource Centre",
    detail: "Sample prompts and prep material to practice with before you enter.",
    icon: "bulb",
    wide: true,
  },
  {
    href: "/results",
    label: "Results & Winners",
    detail: "Published standings and the winners gallery, competition by competition.",
    icon: "trophy",
    wide: false,
  },
  {
    href: "/schools",
    label: "For Schools",
    detail: "Coordinator tools for registering students and managing your roster.",
    icon: "building",
    wide: false,
  },
  {
    href: "/students",
    label: "For Students",
    detail: "Everything you need to find a competition and get entered.",
    icon: "graduate",
    wide: false,
  },
] as const;

export function QuickLinksGrid() {
  return (
    <section className="relative mx-4 overflow-hidden rounded-[2rem] bg-surface-alt px-6 pt-16 pb-20 sm:mx-6 sm:rounded-[2.5rem] sm:pt-20 sm:pb-24 lg:mx-10 lg:pt-28 lg:pb-32">
      {/* Same dome on both edges, matching Announcements rather than the
          wave on Ways to Participate. */}
      <BandDivider shape="curve" side="top" color="text-background" />
      <BandDivider shape="curve" side="bottom" color="text-background" flip />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading eyebrow="Explore the Platform" title="Quick Links" />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {PORTALS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={`group relative flex flex-col overflow-hidden rounded-[1.6rem] border border-border bg-surface p-6 shadow-[0_18px_40px_-28px_rgba(31,32,65,0.4)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-[0_28px_55px_-26px_rgba(255,105,31,0.32)] sm:p-7 ${
                p.wide ? "lg:col-span-3" : "lg:col-span-2"
              }`}
            >
              <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
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

              <p className="relative mt-5 font-extrabold text-foreground">{p.label}</p>
              <p className="relative mt-1.5 text-sm leading-relaxed text-muted">{p.detail}</p>

              <span
                aria-hidden="true"
                className="relative mt-4 flex items-center gap-1 text-sm font-bold text-accent-strong opacity-0 transition-all duration-300 group-hover:opacity-100"
              >
                Open
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
