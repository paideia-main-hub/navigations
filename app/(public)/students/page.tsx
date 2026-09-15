import Link from "next/link";
import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = { title: "For Students | Future Competence Series" };

const points = [
  "Who can participate and category eligibility",
  "Individual or team participation rules",
  "What the competition is designed to develop",
  "Competition stages and progression criteria",
  "What to prepare for each stage",
  "Allowed materials/tools and prohibited practices",
  "Judging rubric and how marks are awarded",
  "Practice material and sample tasks",
  "Important deadlines and result dates",
  "What happens after registration",
  "How qualification/finalist status will be communicated",
  "Awards, certificates and winner publication information",
  "Code of conduct and academic integrity rules",
];

export default function ForStudentsPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <PageBanner
        eyebrow="Competitor Tier"
        title="For Students"
        subtitle="What you need to know before signing up and competing in the Future Competence Series."
      />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <ul className="grid gap-3 sm:grid-cols-2">
          {points.map((p) => (
            <li key={p} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link href="/register/student" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
            Create your student account
          </Link>
        </div>
      </div>
    </div>
  );
}
