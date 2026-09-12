import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/domain/admin-auth/guard";
import { adminLogout } from "@/domain/admin-auth/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/competitions", label: "Competitions" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/judge-applications", label: "Judge Applications" },
  { href: "/admin/schools", label: "Schools" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/registrations", label: "Registrations" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="font-semibold tracking-tight text-foreground">
            Future Competence Series — Admin
          </Link>
          <form action={adminLogout}>
            <button className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:border-accent">
              Log out
            </button>
          </form>
        </div>
        <nav className="scrollbar-none mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted hover:border-accent hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
