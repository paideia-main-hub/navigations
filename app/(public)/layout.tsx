import { Header } from "@/ui/components/Header";
import { Footer } from "@/ui/components/Footer";
import { LoginModalProvider } from "@/ui/components/LoginModalContext";
import { getCurrentUser } from "@/domain/auth/session";
import { createClient } from "@/data/supabase/server";
import { getCoordinatorAvatarUrl } from "@/domain/profiles/avatar";
import { getCoordinatorSchoolName } from "@/domain/schools/service";
import { getOwnStudentProfile } from "@/domain/students/service";
import { listHeaderNotices } from "@/domain/announcements/service";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const supabase = user ? await createClient() : null;
  const student = user?.role === "student" && supabase ? await getOwnStudentProfile(supabase, user.id) : null;
  const notices = user?.role === "school_coordinator" && supabase ? await listHeaderNotices(supabase) : undefined;
  const headerUser = user
    ? {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        photoUrl:
          user.role === "student"
            ? (student?.photoUrl ?? null)
            : user.role === "school_coordinator"
              ? await getCoordinatorAvatarUrl(user.id)
              : null,
        subtitle: user.role === "school_coordinator" ? await getCoordinatorSchoolName(user.id) : null,
        notices,
      }
    : null;

  return (
    <LoginModalProvider>
      <Header user={headerUser} />
      <main className="flex-1 pt-24 sm:pt-28">{children}</main>
      <Footer />
    </LoginModalProvider>
  );
}
