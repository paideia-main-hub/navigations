import Link from "next/link";
import {
  dashboardCardEyebrowClass,
  dashboardCardRuleClass,
  dashboardGlowCardClass,
  dashboardGlowOrbClass,
} from "@/ui/components/dashboard/dashboardGlowCard";

export function QuickLink({
  href,
  icon,
  title,
  body,
  emphasize = false,
}: {
  href: string;
  icon: string;
  title: string;
  body: string;
  /** Visually promote the primary next step (e.g. Register). */
  emphasize?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={`${dashboardGlowCardClass} flex h-full cursor-pointer flex-col p-5 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        emphasize ? "ring-accent hover:ring-accent" : ""
      }`}
    >
      <div aria-hidden className={dashboardGlowOrbClass} />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-base ${
              emphasize ? "bg-accent text-accent-foreground" : "bg-accent-soft text-foreground"
            }`}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <p className={dashboardCardEyebrowClass}>Shortcut</p>
            <span aria-hidden className={dashboardCardRuleClass} />
            <p className={`mt-2 text-base font-medium tracking-tight text-foreground sm:text-lg`}>{title}</p>
          </div>
        </div>
        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">{body}</p>
        <span
          className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold ${
            emphasize ? "text-accent-strong" : "text-foreground"
          }`}
        >
          Open
          <span aria-hidden className="transition-transform duration-200 ease-out group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
