import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = { title: "FAQs | Navigations" };

const faqs = [
  {
    question: "Who can register — students or schools?",
    answer:
      "Both. Students can create their own account and register individually, and schools can register on behalf of many students or teams through a School Coordinator account.",
  },
  {
    question: "Is there a registration fee?",
    answer:
      "Yes. Every competition has an entry fee of PKR 1,000 per entry. You pay it during registration and upload the payment receipt; your registration is confirmed once an admin approves the payment.",
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
    <div className="bg-background">
      <PageBanner eyebrow="Support Center" title="FAQs" />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.question} className="rounded-xl border border-border bg-surface p-4">
              <summary className="cursor-pointer font-medium text-foreground">{f.question}</summary>
              <p className="mt-2 text-sm text-muted">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
