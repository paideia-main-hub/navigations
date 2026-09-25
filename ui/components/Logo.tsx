/** The real wordmark, replacing the old "FCS" placeholder badge everywhere.
 * Two colour variants exist because the mark is solid Space Indigo text —
 * illegible on any of this site's dark surfaces (the permanently-dark
 * brand-deep bands, and every themeable surface once dark mode is on, since
 * they're dark navy too). `onDark` picks the light variant outright for a
 * surface that's always dark (e.g. the footer); leaving it unset swaps
 * between both by CSS depending on the active theme, the same dark:
 * convention ThemeToggle's own icon already uses. */
export function Logo({ className = "h-7 w-auto", onDark = false }: { className?: string; onDark?: boolean }) {
  if (onDark) {
    // eslint-disable-next-line @next/next/no-img-element -- static asset in public/
    return <img src="/logo-on-dark.png" alt="Navigations" className={className} />;
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- static asset in public/ */}
      <img src="/logo.png" alt="Navigations" className={`${className} dark:hidden`} />
      {/* eslint-disable-next-line @next/next/no-img-element -- static asset in public/ */}
      <img src="/logo-on-dark.png" alt="Navigations" className={`${className} hidden dark:block`} />
    </>
  );
}
