import Link from "next/link";
import { competitions, categoryLabels, statusLabels } from "@/lib/data/competitions";

const steps = [
  "Sign Up",
  "Choose Competition",
  "Register",
  "Prepare",
  "Participate",
  "Results",
];

const whyParticipate = [
  {
    title: "Real competencies",
    body: "Every competition is designed around a skill students actually use — not just a trophy.",
  },
  {
    title: "Recognition",
    body: "Certificates, awards and public winner listings for students and their schools.",
  },
  {
    title: "Portfolio building",
    body: "A record of participation and achievement across Primary, Middle and Secondary years.",
  },
];

export default function HomePage() {
  const featured = competitions.filter((c) => c.status === "open" || c.status === "upcoming");
  const winners = competitions.flatMap((c) =>
    c.winners.map((w) => ({ ...w, competition: c.title })),
  );

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Hero */}
      <section className="flex flex-col items-start gap-6 py-16 sm:py-24">
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          Registration is open for the 2026 season
        </span>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Competitions that build real-world competence, not just certificates.
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          The Future Competence Series brings together {competitions.length}+ competitions across
          Primary, Middle and Secondary levels — with online practice resources, transparent
          judging, and published results.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Register Now
          </Link>
          <Link
            href="/competitions"
            className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-zinc-700 hover:border-black/20 dark:border-white/15 dark:text-zinc-200"
          >
            Explore Competitions
          </Link>
        </div>

        {/* Competition search */}
        <form action="/competitions" className="mt-4 flex w-full max-w-xl gap-2">
          <input
            type="search"
            name="q"
            placeholder="Search by competition name, category or keyword…"
            className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm outline-none focus:border-teal-500 dark:border-white/15 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Search
          </button>
        </form>
      </section>

      {/* Featured competitions */}
      <section className="py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Open &amp; upcoming competitions
          </h2>
          <Link href="/competitions" className="text-sm font-semibold text-teal-700 dark:text-teal-400">
            View all →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <Link
              key={c.slug}
              href={`/competitions/${c.slug}`}
              className="flex flex-col gap-3 rounded-2xl border border-black/10 p-6 hover:border-teal-500 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {c.domain}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    c.status === "open"
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  }`}
                >
                  {statusLabels[c.status]}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{c.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{c.shortDescription}</p>
              <div className="mt-auto flex flex-wrap gap-1 text-xs text-zinc-500 dark:text-zinc-500">
                {c.eligibility.map((e) => (
                  <span key={e.category} className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                    {categoryLabels[e.category]}
                  </span>
                ))}
              </div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">
                Registration closes {new Date(c.registrationDeadline).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {steps.map((step, i) => (
            <li
              key={step}
              className="rounded-xl border border-black/10 p-4 text-center dark:border-white/10"
            >
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                {i + 1}
              </div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Winners showcase */}
      {winners.length > 0 && (
        <section className="py-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Recent winners</h2>
            <Link href="/results" className="text-sm font-semibold text-teal-700 dark:text-teal-400">
              View all results →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {winners.slice(0, 4).map((w, i) => (
              <div
                key={i}
                className="rounded-xl border border-black/10 p-4 dark:border-white/10"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  {w.award}
                </span>
                <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">{w.studentName}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{w.schoolName}</p>
                <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{w.competition}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why participate */}
      <section className="py-12">
        <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Why participate</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {whyParticipate.map((item) => (
            <div key={item.title}>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="py-12">
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/manuals", label: "Manuals" },
            { href: "/resources", label: "Practice Resources" },
            { href: "/results", label: "Results" },
            { href: "/schools", label: "School Registration" },
            { href: "/students", label: "Student Registration" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-teal-500 hover:text-teal-700 dark:border-white/15 dark:text-zinc-300"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
