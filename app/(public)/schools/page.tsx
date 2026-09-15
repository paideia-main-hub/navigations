import Link from "next/link";
import { PageBanner } from "@/ui/components/marketing/PageBanner";

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
    <div className="bg-slate-50 dark:bg-slate-950">
      <PageBanner
        eyebrow="Institutional Access"
        title="For Schools"
        subtitle="Everything a school coordinator needs to register their school and manage student and team entries across the Future Competence Series."
      />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <ul className="grid gap-3 sm:grid-cols-2">
          {points.map((p) => (
            <li key={p} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register/school" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
            Register your school
          </Link>
          <a href="#" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
            Download school participation guide
          </a>
        </div>
      </div>
    </div>
  );
}
