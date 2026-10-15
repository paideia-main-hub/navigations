import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/data/supabase/admin";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorAvatarUrl } from "@/domain/profiles/avatar";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { getOwnStudentProfile } from "@/domain/students/service";
import { listHeaderNotices } from "@/domain/announcements/service";
import { Header } from "@/ui/components/Header";
import { Footer } from "@/ui/components/Footer";
import { LoginModalProvider } from "@/ui/components/LoginModalContext";
import { DashboardShell } from "@/ui/components/dashboard/DashboardShell";
import { SchoolEntryListProvider } from "@/ui/components/registration/SchoolHamperList";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    const headerStore = await headers();
    const next =
      headerStore.get("next-url") ??
      headerStore.get("x-url") ??
      headerStore.get("x-invoke-path") ??
      "/dashboard";
    const path = next.startsWith("http")
      ? (() => {
          try {
            return new URL(next).pathname;
          } catch {
            return "/dashboard";
          }
        })()
      : next.startsWith("/")
        ? next
        : "/dashboard";
    redirect(`/login?next=${encodeURIComponent(path)}`);
  }
  // Admins use the separate /admin panel (its own login and session) — the
  // dashboard is only for students, schools, judges and nominators.
  if (user.role === "admin") redirect("/admin");

  const student = user.role === "student" ? await getOwnStudentProfile(await createClient(), user.id) : null;
  const isCoordinator = user.role === "school_coordinator";
  const photoUrl =
    user.role === "student"
      ? (student?.photoUrl ?? null)
      : isCoordinator
        ? await getCoordinatorAvatarUrl(user.id)
        : null;
  const school = isCoordinator ? await getCoordinatorSchool(createAdminClient(), user.id) : null;
  const schoolName = school?.officialName.trim() || null;
  const notices = isCoordinator ? await listHeaderNotices(await createClient()) : undefined;
  const headerUser = { id: user.id, fullName: user.fullName, role: user.role, photoUrl, subtitle: schoolName, notices };
  const shell = (
    <DashboardShell
      role={user.role}
      fullName={user.fullName}
      photoUrl={photoUrl}
      frlId={student?.frlId ?? null}
      subtitle={schoolName}
    >
      {children}
    </DashboardShell>
  );

  const frame = (
    <>
      <Header user={headerUser} />
      <main className="flex-1 pt-24 sm:pt-28">{shell}</main>
      <Footer />
    </>
  );

  return (
    <LoginModalProvider>
      {isCoordinator ? <SchoolEntryListProvider storageKey={school?.id ?? user.id}>{frame}</SchoolEntryListProvider> : frame}
    </LoginModalProvider>
  );
}
