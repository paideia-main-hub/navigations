import Link from "next/link";
import { BandTexture } from "./BandTexture";

export function ClosingCta({
  primaryHref = "/register",
  primaryLabel = "Register Now",
  secondaryHref = "/competitions",
  secondaryLabel = "Browse Competitions",
  showSecondary = true,
}: {
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  showSecondary?: boolean;
} = {}) {
  return (
    <section className="relative overflow-hidden rounded-tl-[4rem] rounded-tr-[4rem] bg-[#2a2c54] px-6 pt-20 pb-20 text-center sm:rounded-tl-[6rem] sm:rounded-tr-[6rem] sm:pt-24 lg:pt-28 lg:pb-24">
      <BandTexture pattern="grid" className="text-brand-deep-foreground/[0.05]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.08] blur-[130px]" />
      </div>

      <div className="relative">
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">READY TO REGISTER?</h2>
        <p className="mx-auto mt-4 max-w-xl text-brand-deep-muted">
          Join students across the country already registered for this season&apos;s competitions.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-4">
          <Link
            href={primaryHref}
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-accent-foreground shadow-[0_0_0_0_rgba(255,105,31,0)] transition-all duration-300 hover:scale-105 hover:bg-accent/90 hover:shadow-[0_0_0_10px_rgba(255,105,31,0.16)]"
          >
            {primaryLabel}
            <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          {showSecondary ? (
            <Link
              href={secondaryHref}
              className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
