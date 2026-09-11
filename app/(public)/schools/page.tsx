import Link from "next/link";

export const metadata = { title: "For Schools | Future Competence Series" };

const points = [
  "Why schools should participate",
  "Eligible grades and age categories",
  "Individual and team entry options",
  "Maximum/minimum team size for each competition",
  "School coordinator responsibilities",
  "Registration deadlines and competition calendar",
  "Competition fees / payment policy, where applicable",
  "Manuals, rules and judging rubrics",
  "Required student/parent consent",
  "Certificates, awards and school recognition",
  "Result publication policy",
  "Contact/support channel for coordinators",
];

export default function ForSchoolsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">For Schools</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Everything a school coordinator needs to register their school and manage student and
        team entries across the Future Competence Series.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {points.map((p) => (
          <li key={p} className="rounded-lg border border-black/10 px-4 py-3 text-sm text-zinc-700 dark:border-white/10 dark:text-zinc-300">
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/register/school" className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
          Register your school
        </Link>
        <a href="#" className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-zinc-700 dark:border-white/15 dark:text-zinc-200">
          Download school participation guide
        </a>
      </div>
    </div>
  );
}
