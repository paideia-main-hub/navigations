import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = { title: "FAQs | Future Competence Series" };

const faqs = [
  {
    question: "Who can register — students or schools?",
    answer:
      "Both. Students can create their own account and register individually, and schools can register on behalf of many students or teams through a School Coordinator account.",
  },
  {
    question: "Is there a registration fee?",
    answer: "It varies by competition — check the Eligibility & Registration Rules tab on each competition's page.",
  },
  {
    question: "When are results published?",
    answer:
      "Results remain private until an authorized administrator approves them, then appear on the Results & Winners page and the relevant competition page.",
  },
  {
    question: "Will my child's photo be published?",
    answer:
      "Only where the required photo and result publication consent has been captured during registration.",
  },
];

export default function FAQsPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <PageBanner eyebrow="Support Center" title="FAQs" />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.question} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <summary className="cursor-pointer font-medium text-slate-900 dark:text-slate-100">{f.question}</summary>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
