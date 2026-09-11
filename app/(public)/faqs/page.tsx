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
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">FAQs</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((f) => (
          <details key={f.question} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
            <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-50">{f.question}</summary>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{f.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
