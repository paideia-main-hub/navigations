import { Header } from "@/ui/components/Header";
import { Footer } from "@/ui/components/Footer";
import { LoginModalProvider } from "@/ui/components/LoginModalContext";
import { getCurrentUser } from "@/domain/auth/session";
import { createClient } from "@/data/supabase/server";
import { getOwnStudentProfile } from "@/domain/students/service";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const student = user?.role === "student" ? await getOwnStudentProfile(await createClient(), user.id) : null;
  const headerUser = user
    ? { fullName: user.fullName, role: user.role, photoUrl: student?.photoUrl ?? null }
    : null;

  return (
    <LoginModalProvider>
      <Header user={headerUser} />
      <main className="flex-1 pt-24 sm:pt-28">{children}</main>
      <Footer />
    </LoginModalProvider>
  );
}
