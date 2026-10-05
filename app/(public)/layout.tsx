import { Header } from "@/ui/components/Header";
import { Footer } from "@/ui/components/Footer";
import { LoginModalProvider } from "@/ui/components/LoginModalContext";
import { getCurrentUser } from "@/domain/auth/session";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const headerUser = user
    ? { fullName: user.fullName, role: user.role }
    : null;

  return (
    <LoginModalProvider>
      <Header user={headerUser} />
      <main className="flex-1 pt-24 sm:pt-28">{children}</main>
      <Footer />
    </LoginModalProvider>
  );
}
