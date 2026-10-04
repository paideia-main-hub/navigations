import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { RegisterPathsSection } from "@/ui/components/marketing/RegisterPathsSection";

export const metadata = { title: "Register | Navigations" };

export default function RegisterChoicePage() {
  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Get started"
        title="Who's joining Navigations?"
        subtitle="Pick the path that fits you — each one leads to a different registration experience."
        className="-mt-24 pt-28 pb-28 sm:-mt-28 sm:pt-32 sm:pb-32 lg:pt-36 lg:pb-36"
        showNet
        netLattice="angular"
        curvedBottom
      />

      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <RegisterPathsSection />
      </div>
    </div>
  );
}
