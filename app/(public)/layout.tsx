import { Header } from "@/ui/components/Header";
import { Footer } from "@/ui/components/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24 sm:pt-28">{children}</main>
      <Footer />
    </>
  );
}
