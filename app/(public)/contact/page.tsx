import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = { title: "Contact | Future Competence Series" };

export default function ContactPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <PageBanner
        eyebrow="Get in Touch"
        title="Contact"
        subtitle="Questions about registration, eligibility, or a specific competition? Reach the Future Competence Series team."
      />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <dt className="text-xs font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">Support email</dt>
            <dd className="mt-1 text-slate-900 dark:text-slate-100">support@futurecompetence.example</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <dt className="text-xs font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">
              School coordinator support
            </dt>
            <dd className="mt-1 text-slate-900 dark:text-slate-100">schools@futurecompetence.example</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
