import { redirect } from "next/navigation";
import { getCurrentUser } from "@/domain/auth/session";
import { DashboardShell } from "@/ui/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Admins use the separate /admin panel (its own login and session) — the
  // dashboard is only for students, schools, judges and nominators.
  if (user.role === "admin") redirect("/admin");

  return (
    <DashboardShell role={user.role} fullName={user.fullName}>
      {children}
    </DashboardShell>
  );
}
