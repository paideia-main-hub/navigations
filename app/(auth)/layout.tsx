import { Header } from "@/ui/components/Header";
import { Footer } from "@/ui/components/Footer";
import { LoginModalProvider } from "@/ui/components/LoginModalContext";
import { getCurrentUser } from "@/domain/auth/session";
import { createClient } from "@/data/supabase/server";
import { getCoordinatorAvatarUrl } from "@/domain/profiles/avatar";
import { getCoordinatorSchoolName } from "@/domain/schools/service";
import { getOwnStudentProfile } from "@/domain/students/service";
import { listHeaderNotices } from "@/domain/announcements/service";

/** Auth routes share the public chrome so users never lose site navigation. */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const supabase = user ? await createClient() : null;
  const student = user?.role === "student" && supabase ? await getOwnStudentProfile(supabase, user.id) : null;
  const notices =
    (user?.role === "school_coordinator" || user?.role === "student") && supabase
      ? await listHeaderNotices(supabase)
      : undefined;
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
      <main className="flex flex-1 flex-col bg-surface-muted pt-24 sm:pt-28">
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:py-16">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-[0_18px_40px_-36px_rgba(31,32,65,0.45)]">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </LoginModalProvider>
  );
}
