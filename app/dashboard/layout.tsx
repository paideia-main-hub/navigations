import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/data/supabase/admin";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorAvatarUrl } from "@/domain/profiles/avatar";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { getOwnStudentProfile } from "@/domain/students/service";
import { listHeaderNotices } from "@/domain/announcements/service";
import { getPaymentAccount, isSchoolReceiptWaived } from "@/domain/payments/service";
import { Header } from "@/ui/components/Header";
import { Footer } from "@/ui/components/Footer";
import { LoginModalProvider } from "@/ui/components/LoginModalContext";
import { DashboardShell } from "@/ui/components/dashboard/DashboardShell";
import { SchoolEntryListProvider } from "@/ui/components/registration/SchoolHamperList";
import { StudentHamperProvider } from "@/ui/components/registration/StudentHamperList";

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

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
  const notices =
    isCoordinator || user.role === "student" ? await listHeaderNotices(await createClient()) : undefined;
  const supabase = await createClient();
  const paymentAccount =
    isCoordinator || user.role === "student" ? await getPaymentAccount(supabase) : null;
  const receiptWaived =
    isCoordinator && school ? await isSchoolReceiptWaived(supabase, school.id) : false;
  const headerUser = { id: user.id, fullName: user.fullName, role: user.role, photoUrl, subtitle: schoolName, notices };
  const accountEmail =
    user.email && !user.email.endsWith("@students.navigations.com.pk") ? user.email : null;
  const shell = (
    <DashboardShell
      role={user.role}
      fullName={user.fullName}
      photoUrl={photoUrl}
      frlId={student?.frlId ?? school?.frlId ?? null}
      subtitle={schoolName}
      email={accountEmail}
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

  const withHamper =
    isCoordinator && paymentAccount ? (
      <SchoolEntryListProvider
        storageKey={school?.id ?? user.id}
        paymentAccount={paymentAccount}
        receiptWaived={receiptWaived}
      >
        {frame}
      </SchoolEntryListProvider>
    ) : user.role === "student" && paymentAccount ? (
      <StudentHamperProvider
        storageKey={student?.frlId ?? user.id}
        paymentAccount={paymentAccount}
        studentName={user.fullName}
      >
        {frame}
      </StudentHamperProvider>
    ) : (
      frame
    );

  return <LoginModalProvider>{withHamper}</LoginModalProvider>;
}
