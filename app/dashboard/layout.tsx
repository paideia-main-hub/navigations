import { redirect } from "next/navigation";
import { getCurrentUser } from "@/domain/auth/session";
import { DashboardShell } from "@/ui/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <DashboardShell role={user.role} fullName={user.fullName}>
      {children}
    </DashboardShell>
  );
}
