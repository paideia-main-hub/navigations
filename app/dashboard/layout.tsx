import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/domain/auth/session";
import { logout } from "@/domain/auth/actions";
import { ThemeToggle } from "@/ui/components/ThemeToggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-[calc(100vh-1px)] bg-surface-muted">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight text-foreground">
          Future Competence Series
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted">
          <span>
            {user.fullName} · <span className="capitalize">{user.role}</span>
          </span>
          <ThemeToggle />
          <form action={logout}>
            <button className="rounded-full border border-border px-3 py-1.5 text-foreground hover:border-accent">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
