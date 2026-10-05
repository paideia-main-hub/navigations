import { ClosingCta } from "@/ui/components/marketing/ClosingCta";
import { FaqsPageAccordion } from "@/ui/components/marketing/FaqsPageAccordion";
import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = { title: "FAQs | Navigations" };

const faqs = [
  {
    question: "How will students prepare?",
    answer:
      "Students should use the competition’s published manual, practice resources and assessment criteria. Preparation should build understanding and independent work.",
  },
  {
    question: "Why should my child or school join FRL?",
    answer:
      "FRL gives students opportunities to practise useful skills, demonstrate their strengths and identify areas where they need improvement.",
  },
  {
    question: "How is FRL different from other competitions?",
    answer:
      "FRL’s focus is on how students think, create, explain and improve. Activities use competency-based criteria to assess these skills alongside the final performance or submission.",
  },
  {
    question: "Is FRL another academic examination?",
    answer:
      "No. Activities include real-life situations, creative tasks, live challenges and projects. Students demonstrate what they can do with what they know.",
  },
  {
    question: "What does “competency-based” mean?",
    answer:
      "A competency is the ability to use knowledge and skills effectively. For example, students demonstrate reasoning when they explain why their solution makes sense.",
  },
  {
    question: "How does FRL connect with classroom learning?",
    answer:
      "Students apply classroom learning to unfamiliar tasks—for example, using mathematics to solve a practical problem or language skills to explain an idea.",
  },
  {
    question: "Is FRL only for high-achieving or confident students?",
    answer:
      "No. Different activities offer opportunities for different strengths. Students should choose a competition that matches their interests and eligible grade range.",
  },
  {
    question: "What benefits does a school receive?",
    answer:
      "Schools gain structured enrichment activities, opportunities to recognize student strengths and examples of applied learning. Participation and results can also contribute to school recognition under FRL’s award rules.",
  },
  {
    question: "Is FRL only about winning awards?",
    answer:
      "No. Awards recognize achievement, while the wider purpose is meaningful participation and skill practice. Students who complete their competition receive recognition according to the published participation policy.",
  },
];

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
        <FaqsPageAccordion items={faqs} />
      </div>

      <ClosingCta />
    </div>
  );
}
