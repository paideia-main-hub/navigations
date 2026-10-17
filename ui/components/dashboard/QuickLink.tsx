import Link from "next/link";
import { dashboardGlowCardClass, dashboardGlowOrbClass } from "@/ui/components/dashboard/dashboardGlowCard";

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
      className={`${dashboardGlowCardClass} flex h-full cursor-pointer flex-col p-4 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        emphasize ? "ring-accent hover:ring-accent" : ""
      }`}
    >
      <div aria-hidden className={dashboardGlowOrbClass} />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-base ${
              emphasize ? "bg-accent text-accent-foreground" : "bg-accent-soft text-foreground"
            }`}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-accent-strong uppercase">Shortcut</p>
            <p className="mt-1 font-bold text-foreground">{title}</p>
            <p className="mt-1 text-xs text-muted">{body}</p>
          </div>
        </div>
        <span
          className={`mt-auto inline-flex items-center gap-1.5 self-end pt-4 text-sm font-semibold sm:self-start ${
            emphasize ? "text-accent-strong" : "text-foreground"
          }`}
        >
          Open
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
