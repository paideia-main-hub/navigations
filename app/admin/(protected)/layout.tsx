import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/domain/admin-auth/guard";
import { AdminShell } from "@/ui/components/admin/AdminShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  title: "Admin",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return <AdminShell fullName={session.fullName}>{children}</AdminShell>;
}
