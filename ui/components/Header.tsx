import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/competitions", label: "Competitions" },
  { href: "/calendar", label: "Calendar" },
  { href: "/results", label: "Results" },
  { href: "/schools", label: "For Schools" },
  { href: "/students", label: "For Students" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-foreground">
          <span className="rounded-md bg-accent px-2 py-1 text-sm text-accent-foreground">FCS</span>
          <span className="hidden sm:inline">Future Competence Series</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium text-muted lg:flex">
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
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            Register Now
          </Link>
        </div>
      </div>
    </header>
  );
}
