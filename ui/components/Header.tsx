import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/about-us", label: "About Us" },
  { href: "/competitions", label: "Competitions" },
  { href: "/calendar", label: "Calendar" },
  { href: "/results", label: "Results" },
  { href: "/awards", label: "Awards" },
  { href: "/schools", label: "For Schools" },
  { href: "/students", label: "For Students" },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:top-6 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl border border-border bg-background/80 px-6 py-3 shadow-lg shadow-black/5 backdrop-blur-lg">
        <Link href="/" className="flex shrink-0 items-center">
          <Logo className="h-7 w-auto" />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-4 text-sm font-medium text-muted lg:flex xl:gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted sm:inline-block"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
          >
            Register Now
          </Link>
        </div>
      </div>
    </header>
  );
}
