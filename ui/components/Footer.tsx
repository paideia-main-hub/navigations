import Link from "next/link";
import { Logo } from "@/ui/components/Logo";

const columns = [
  {
    title: "Tournament Support",
    links: [
      { href: "/competitions", label: "Competitions" },
      { href: "/calendar", label: "Competition Calendar" },
      { href: "/results", label: "Results & Winners" },
      { href: "/manuals", label: "Manuals & Guidelines" },
    ],
  },
  {
    title: "Participant Access",
    links: [
      { href: "/students", label: "For Students" },
      { href: "/schools", label: "For Schools" },
      { href: "/register", label: "Register" },
      { href: "/login", label: "Login" },
    ],
  },
  {
    title: "More Navigations",
    links: [
      { href: "/about-us", label: "About Us" },
      { href: "/about", label: "Competency Vision" },
      { href: "/faqs", label: "FAQs" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mx-4 bg-brand-deep text-brand-deep-muted sm:mx-6 lg:mx-10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-16 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Logo className="h-7 w-auto" onDark />
          <p className="mt-3 max-w-xs text-sm text-brand-deep-muted">
            Navigations — competitions that build real-world skills for Primary,
            Middle and Secondary students.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-semibold tracking-wider text-brand-deep-foreground uppercase">{col.title}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-6 py-6 text-xs text-muted">
        <p>
          © {new Date().getFullYear()} Navigations. Privacy, terms and safeguarding
          notices apply to all student data and photo publication.
        </p>
      </div>
    </footer>
  );
}
