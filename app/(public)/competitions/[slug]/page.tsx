import { notFound } from "next/navigation";
import Link from "next/link";
import { listCompetitions, getCompetitionBySlug } from "@/domain/competitions/service";
import { categoryLabels, statusLabels } from "@/domain/competitions/types";
import { announcementsForCompetition } from "@/domain/announcements/service";
import { announcementCategoryLabels } from "@/domain/announcements/types";
import { Tabs } from "@/ui/components/Tabs";
import { Badge } from "@/ui/components/Badge";

export function generateStaticParams() {
  return listCompetitions().map((c) => ({ slug: c.slug }));
}

export default async function CompetitionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const competition = getCompetitionBySlug(slug);
  if (!competition) notFound();

  const competitionAnnouncements = announcementsForCompetition(competition.slug);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="max-w-2xl space-y-4">
          <p className="text-foreground">{competition.overview}</p>
          <p className="text-sm text-muted">
            Domain: <span className="font-medium text-foreground">{competition.domain}</span>
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
              <li key={rule.category} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-semibold text-foreground">
                  {categoryLabels[rule.category]} — grades {rule.minGrade}–{rule.maxGrade}
                </p>
                {rule.teamMinSize && (
                  <p className="text-sm text-muted">
                    Team size: {rule.teamMinSize}–{rule.teamMaxSize} members
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">
            Registration closes {new Date(competition.registrationDeadline).toLocaleDateString()}.
          </p>
          <a href="#" className="text-sm font-semibold text-accent">
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
            <div key={stage.stageNumber} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold tracking-wide text-accent uppercase">
                Stage {stage.stageNumber}
              </p>
              <h3 className="font-semibold text-foreground">{stage.title}</h3>
              <p className="text-sm text-muted">
                {stage.format} · {stage.duration}
              </p>
              <p className="mt-1 text-sm text-muted">Progression: {stage.progressionRule}</p>
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
            <div key={stage.stageNumber} className="rounded-xl border border-border bg-surface p-4">
              <h3 className="font-semibold text-foreground">
                Stage {stage.stageNumber}: {stage.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{stage.taskDescription}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "guiding-principles",
      label: "Guiding Principles",
      content: (
        <div className="max-w-2xl space-y-3 text-sm text-muted">
          <p>Preparation expectations, conduct, submission rules and allowed materials for this competition.</p>
          <a href="#" className="text-sm font-semibold text-accent">
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
            <div key={c.name} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2">
              <span className="text-sm text-foreground">{c.name}</span>
              <span className="text-sm font-semibold text-foreground">{c.weight}%</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "manual",
      label: "Manual",
      content: (
        <a href="#" className="text-sm font-semibold text-accent">
          Download the complete competition manual (PDF)
        </a>
      ),
    },
    {
      id: "practice",
      label: "Practice & Resource Pack",
      content: (
        <p className="max-w-2xl text-sm text-muted">
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
          <li className="flex justify-between border-b border-border py-2">
            <span className="text-muted">Registration closes</span>
            <span className="font-medium text-foreground">
              {new Date(competition.registrationDeadline).toLocaleDateString()}
            </span>
          </li>
          <li className="flex justify-between py-2">
            <span className="text-muted">Final event</span>
            <span className="font-medium text-foreground">
              {new Date(competition.eventDate).toLocaleDateString()}
            </span>
          </li>
        </ul>
      ),
    },
    {
      id: "announcements",
      label: "Announcements",
      content:
        competitionAnnouncements.length > 0 ? (
          <div className="max-w-2xl space-y-3">
            {competitionAnnouncements.map((a) => (
              <div key={a.id} className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs font-semibold tracking-wide text-accent uppercase">
                  {announcementCategoryLabels[a.category]}
                </p>
                <p className="mt-1 font-semibold text-foreground">{a.title}</p>
                <p className="mt-1 text-sm text-muted">{a.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="max-w-2xl text-sm text-muted">No announcements published for this competition yet.</p>
        ),
    },
    {
      id: "results",
      label: "Results",
      content: (
        <p className="max-w-2xl text-sm text-muted">
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
              <div key={i} className="rounded-xl border border-border bg-surface p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  {w.award}
                </span>
                <p className="mt-1 font-semibold text-foreground">{w.studentName}</p>
                <p className="text-sm text-muted">{w.schoolName}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="max-w-2xl text-sm text-muted">Winners will be published here once results are approved.</p>
        ),
    },
    {
      id: "faq",
      label: "FAQ",
      content:
        competition.faqs.length > 0 ? (
          <div className="max-w-2xl space-y-3">
            {competition.faqs.map((f, i) => (
              <details key={i} className="rounded-xl border border-border bg-surface p-4">
                <summary className="cursor-pointer font-medium text-foreground">{f.question}</summary>
                <p className="mt-2 text-sm text-muted">{f.answer}</p>
              </details>
            ))}
          </div>
        ) : (
          <p className="max-w-2xl text-sm text-muted">
            No competition-specific FAQs yet — see the site-wide FAQ page.
          </p>
        ),
    },
    {
      id: "register",
      label: "Register",
      content: (
        <div className="max-w-2xl space-y-4">
          <p className="text-sm text-muted">
            Already have an account? Register straight from your dashboard.
          </p>
          <Link
            href={`/dashboard/register/${competition.slug}`}
            className="inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            Register for {competition.title}
          </Link>
          <p className="pt-2 text-sm text-muted">New here? Create an account first.</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/register/student?competition=${competition.slug}`}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent"
            >
              Create Student Account
            </Link>
            <Link
              href={`/register/school?competition=${competition.slug}`}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent"
            >
              Create School Account
            </Link>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-wrap items-center gap-3">
        <Badge>{competition.domain}</Badge>
        <Badge tone={competition.status === "open" ? "success" : "neutral"}>
          {statusLabels[competition.status]}
        </Badge>
      </div>
      <h1 className="mt-3 text-3xl font-bold text-foreground">{competition.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{competition.shortDescription}</p>

      <div className="mt-8">
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
}
