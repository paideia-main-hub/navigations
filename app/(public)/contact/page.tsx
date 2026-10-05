import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = { title: "Contact | Navigations" };

const EMAIL = "admin@navigations.com.pk";
const PHONE_DISPLAY = "0320 7000760";
const PHONE_HREF = "tel:+923207000760";
const ADDRESS = "Plot 20, Block J 2, Wapda Town, Phase 1, Lahore, 54770, Pakistan";
const FACEBOOK = "https://www.facebook.com/NAVIGATIONS.EDU";
const INSTAGRAM = "https://www.instagram.com/navigations10/";

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M12 22s7-5.33 7-12a7 7 0 1 0-14 0c0 6.67 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M14 8.2h2.2V5H14c-2.4 0-4 1.5-4 4.1V11H7.5v3.2H10V21h3.3v-6.8h2.4l.5-3.2h-2.9V9.5c0-.8.3-1.3 1.2-1.3Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col bg-background sm:min-h-[calc(100dvh-7rem)]">
      <PageBanner
        eyebrow="Get in Touch"
        title="Contact"
        subtitle="Questions about registration, eligibility, or a specific competition? Reach the Navigations team."
        className="-mt-24 pt-28 pb-28 sm:-mt-28 sm:pt-32 sm:pb-32 lg:pt-36 lg:pb-36"
        showNet
        netLattice="angular"
        curvedBottom
      />

      <section className="relative flex flex-1 flex-col justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,241,232,0.7),transparent_55%)]"
        />

        <div className="relative mx-auto w-full max-w-5xl px-6 py-14 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-accent-strong uppercase">Reach us</p>
              <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                We&apos;re here to help schools and families.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
                Write, call, or visit — or follow Navigations for updates on competitions, awards, and the season ahead.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={FACEBOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground/20 hover:bg-surface-muted"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-deep/8 text-brand-deep transition-transform duration-300 group-hover:scale-105">
                    <FacebookIcon className="h-4 w-4" />
                  </span>
                  Facebook
                </a>
                <a
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground/20 hover:bg-surface-muted"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-accent-strong transition-transform duration-300 group-hover:scale-105">
                    <InstagramIcon className="h-4 w-4" />
                  </span>
                  Instagram
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-[0_24px_60px_-40px_rgba(31,32,65,0.45)]">
              <a
                href={PHONE_HREF}
                className="group flex items-start gap-4 border-b border-border px-5 py-5 transition-colors hover:bg-accent-soft/40 sm:gap-5 sm:px-6 sm:py-6"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground transition-transform duration-300 group-hover:scale-105">
                  <PhoneIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold tracking-[0.14em] text-muted uppercase">Phone</span>
                  <span className="mt-1 block text-lg font-bold tracking-tight text-foreground sm:text-xl">{PHONE_DISPLAY}</span>
                </span>
              </a>

              <a
                href={`mailto:${EMAIL}`}
                className="group flex items-start gap-4 border-b border-border px-5 py-5 transition-colors hover:bg-accent-soft/40 sm:gap-5 sm:px-6 sm:py-6"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-deep text-brand-deep-foreground transition-transform duration-300 group-hover:scale-105">
                  <MailIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold tracking-[0.14em] text-muted uppercase">Email</span>
                  <span className="mt-1 block break-all text-lg font-bold tracking-tight text-foreground sm:text-xl">{EMAIL}</span>
                </span>
              </a>

              <div className="flex items-start gap-4 px-5 py-5 sm:gap-5 sm:px-6 sm:py-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface-muted text-foreground">
                  <PinIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-[0.14em] text-muted uppercase">Address</p>
                  <p className="mt-1 text-base leading-relaxed font-semibold text-foreground sm:text-lg">{ADDRESS}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
