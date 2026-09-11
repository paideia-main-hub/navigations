import Link from "next/link";

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
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">For Students</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        What you need to know before signing up and competing in the Future Competence Series.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {points.map((p) => (
          <li key={p} className="rounded-lg border border-black/10 px-4 py-3 text-sm text-zinc-700 dark:border-white/10 dark:text-zinc-300">
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link href="/register/student" className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
          Create your student account
        </Link>
      </div>
    </div>
  );
}
