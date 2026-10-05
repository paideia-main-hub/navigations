import { Header } from "@/ui/components/Header";
import { Footer } from "@/ui/components/Footer";
import { LoginModalProvider } from "@/ui/components/LoginModalContext";
import { getCurrentUser } from "@/domain/auth/session";

/** Auth routes share the public chrome so users never lose site navigation. */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const headerUser = user
    ? { fullName: user.fullName, role: user.role }
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
