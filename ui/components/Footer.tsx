import Link from "next/link";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/competitions", label: "Competitions" },
      { href: "/calendar", label: "Competition Calendar" },
      { href: "/results", label: "Results & Winners" },
      { href: "/manuals", label: "Manuals & Guidelines" },
    ],
  },
  {
    title: "Participate",
    links: [
      { href: "/students", label: "For Students" },
      { href: "/schools", label: "For Schools" },
      { href: "/register", label: "Register" },
      { href: "/login", label: "Login" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "Competency Vision" },
      { href: "/faqs", label: "FAQs" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface-muted">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <span className="rounded-md bg-accent px-2 py-1 text-sm font-semibold text-accent-foreground">FCS</span>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Future Competence Series — competitions that build real-world skills for Primary,
            Middle and Secondary students.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
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
      <div className="border-t border-border px-6 py-6 text-xs text-muted">
        <p>
          © {new Date().getFullYear()} Future Competence Series. Privacy, terms and safeguarding
          notices apply to all student data and photo publication.
        </p>
      </div>
    </footer>
  );
}
