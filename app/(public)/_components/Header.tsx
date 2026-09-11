import Link from "next/link";

const navLinks = [
  { href: "/competitions", label: "Competitions" },
  { href: "/calendar", label: "Calendar" },
  { href: "/announcements", label: "Announcements" },
  { href: "/manuals", label: "Manuals" },
  { href: "/resources", label: "Resources" },
  { href: "/results", label: "Results & Winners" },
  { href: "/schools", label: "For Schools" },
  { href: "/students", label: "For Students" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-black/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="rounded bg-teal-600 px-2 py-1 text-sm text-white">FCS</span>
          <span className="hidden sm:inline">Future Competence Series</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium text-zinc-600 lg:flex dark:text-zinc-300">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-teal-700 dark:hover:text-teal-400">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/competitions"
            className="hidden rounded-full border border-black/10 px-3 py-2 text-sm text-zinc-600 hover:border-black/20 sm:inline-block dark:border-white/15 dark:text-zinc-300"
          >
            Search
          </Link>
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Register Now
          </Link>
        </div>
      </div>
    </header>
  );
}
