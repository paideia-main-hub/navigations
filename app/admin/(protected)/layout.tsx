import { redirect } from "next/navigation";
import { getAdminSession } from "@/domain/admin-auth/guard";
import { AdminShell } from "@/ui/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return <AdminShell fullName={session.fullName}>{children}</AdminShell>;
}
