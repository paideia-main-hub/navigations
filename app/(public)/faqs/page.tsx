import { SUPPORT_FAQS } from "@/domain/support/faqs";
import { ClosingCta } from "@/ui/components/marketing/ClosingCta";
import { FaqsPageAccordion } from "@/ui/components/marketing/FaqsPageAccordion";
import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = { title: "FAQs | Navigations" };

export default function FAQsPage() {
  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Support"
        title="FAQs"
        subtitle="Clear answers about Future Ready League — preparation, participation, competencies and how schools and families take part."
        className="-mt-24 pt-28 pb-28 sm:-mt-28 sm:pt-32 sm:pb-32 lg:pt-36 lg:pb-36"
        showNet
        netLattice="angular"
        curvedBottom
      />

      <div className="mx-auto max-w-3xl px-6 py-14 sm:py-16 lg:py-20">
        <FaqsPageAccordion items={[...SUPPORT_FAQS]} />
      </div>

      <ClosingCta />
    </div>
  );
}
