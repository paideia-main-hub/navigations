import { notFound } from "next/navigation";
import Link from "next/link";
import {
  competitions,
  getCompetitionBySlug,
  categoryLabels,
  statusLabels,
} from "@/lib/data/competitions";
import { CompetitionTabs } from "./CompetitionTabs";

export function generateStaticParams() {
  return competitions.map((c) => ({ slug: c.slug }));
}

export default async function CompetitionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const competition = getCompetitionBySlug(slug);
  if (!competition) notFound();

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="max-w-2xl space-y-4">
          <p className="text-zinc-700 dark:text-zinc-300">{competition.overview}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Domain: <span className="font-medium text-zinc-700 dark:text-zinc-300">{competition.domain}</span>
          </p>
        </div>
      ),
    },
    {
      id: "eligibility",
      label: "Eligibility & Registration Rules",
      content: (
        <div className="max-w-2xl space-y-4">
          <ul className="space-y-2">
            {competition.eligibility.map((rule) => (
              <li key={rule.category} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {categoryLabels[rule.category]} — grades {rule.minGrade}–{rule.maxGrade}
                </p>
                {rule.teamMinSize && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Team size: {rule.teamMinSize}–{rule.teamMaxSize} members
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Registration closes {new Date(competition.registrationDeadline).toLocaleDateString()}.
          </p>
          <a href="#" className="text-sm font-semibold text-teal-700 dark:text-teal-400">
            Download eligibility & registration rules (PDF)
          </a>
        </div>
      ),
    },
    {
      id: "stages",
      label: "Competition Stages",
      content: (
        <div className="max-w-2xl space-y-4">
          {competition.stages.map((stage) => (
            <div key={stage.stageNumber} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                Stage {stage.stageNumber}
              </p>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{stage.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {stage.format} · {stage.duration}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Progression: {stage.progressionRule}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "challenges",
      label: "Stage-wise Challenges",
      content: (
        <div className="max-w-2xl space-y-4">
          {competition.stages.map((stage) => (
            <div key={stage.stageNumber} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Stage {stage.stageNumber}: {stage.title}
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{stage.taskDescription}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "guiding-principles",
      label: "Guiding Principles",
      content: (
        <div className="max-w-2xl space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          <p>Preparation expectations, conduct, submission rules and allowed materials for this competition.</p>
          <a href="#" className="text-sm font-semibold text-teal-700 dark:text-teal-400">
            Download guiding principles (PDF)
          </a>
        </div>
      ),
    },
    {
      id: "judging",
      label: "Judging & Rubrics",
      content: (
        <div className="max-w-2xl space-y-2">
          {competition.rubric.map((c) => (
            <div key={c.name} className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-2 dark:border-white/10">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{c.name}</span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{c.weight}%</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "manual",
      label: "Manual",
      content: (
        <a href="#" className="text-sm font-semibold text-teal-700 dark:text-teal-400">
          Download the complete competition manual (PDF)
        </a>
      ),
    },
    {
      id: "practice",
      label: "Practice & Resource Pack",
      content: (
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Practice questions, sample tasks and videos for this competition will appear here,
          viewable inside the website.
        </p>
      ),
    },
    {
      id: "dates",
      label: "Important Dates",
      content: (
        <ul className="max-w-2xl space-y-2 text-sm">
          <li className="flex justify-between border-b border-black/5 py-2 dark:border-white/5">
            <span className="text-zinc-500 dark:text-zinc-400">Registration closes</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {new Date(competition.registrationDeadline).toLocaleDateString()}
            </span>
          </li>
          <li className="flex justify-between py-2">
            <span className="text-zinc-500 dark:text-zinc-400">Final event</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {new Date(competition.eventDate).toLocaleDateString()}
            </span>
          </li>
        </ul>
      ),
    },
    {
      id: "announcements",
      label: "Announcements",
      content: (
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          No announcements published for this competition yet.
        </p>
      ),
    },
    {
      id: "results",
      label: "Results",
      content: (
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Results are published after admin approval. Check back after the final event date.
        </p>
      ),
    },
    {
      id: "winners",
      label: "Winners Gallery",
      content:
        competition.winners.length > 0 ? (
          <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
            {competition.winners.map((w, i) => (
              <div key={i} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">{w.award}</span>
                <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">{w.studentName}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{w.schoolName}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Winners will be published here once results are approved.
          </p>
        ),
    },
    {
      id: "faq",
      label: "FAQ",
      content:
        competition.faqs.length > 0 ? (
          <div className="max-w-2xl space-y-3">
            {competition.faqs.map((f, i) => (
              <details key={i} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
                <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-50">
                  {f.question}
                </summary>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{f.answer}</p>
              </details>
            ))}
          </div>
        ) : (
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            No competition-specific FAQs yet — see the site-wide FAQ page.
          </p>
        ),
    },
    {
      id: "register",
      label: "Register",
      content: (
        <div className="max-w-2xl space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Choose how you want to register for {competition.title}.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/register/student?competition=${competition.slug}`}
              className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Register as Student
            </Link>
            <Link
              href={`/register/school?competition=${competition.slug}`}
              className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:border-black/20 dark:border-white/15 dark:text-zinc-200"
            >
              Register via School
            </Link>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {competition.domain}
        </span>
        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
          {statusLabels[competition.status]}
        </span>
      </div>
      <h1 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{competition.title}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{competition.shortDescription}</p>

      <div className="mt-8">
        <CompetitionTabs tabs={tabs} />
      </div>
    </div>
  );
}
