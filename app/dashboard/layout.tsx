import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getOwnStudentProfile } from "@/domain/students/service";
import { Header } from "@/ui/components/Header";
import { Footer } from "@/ui/components/Footer";
import { LoginModalProvider } from "@/ui/components/LoginModalContext";
import { DashboardShell } from "@/ui/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Admins use the separate /admin panel (its own login and session) — the
  // dashboard is only for students, schools, judges and nominators.
  if (user.role === "admin") redirect("/admin");

  const student = user.role === "student" ? await getOwnStudentProfile(await createClient(), user.id) : null;
  const headerUser = { fullName: user.fullName, role: user.role, photoUrl: student?.photoUrl ?? null };

  return (
    <LoginModalProvider>
      <Header user={headerUser} />
      <main className="flex-1 pt-24 sm:pt-28">
        <DashboardShell
          role={user.role}
          fullName={user.fullName}
          photoUrl={student?.photoUrl ?? null}
          frlId={student?.frlId ?? null}
        >
          {children}
        </DashboardShell>
      </main>
      <Footer />
    </LoginModalProvider>
  );
}
