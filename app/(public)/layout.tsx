import { Header } from "@/ui/components/Header";
import { Footer } from "@/ui/components/Footer";
import { LoginModalProvider } from "@/ui/components/LoginModalContext";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LoginModalProvider>
      <Header />
      <main className="flex-1 pt-24 sm:pt-28">{children}</main>
      <Footer />
    </LoginModalProvider>
  );
}
