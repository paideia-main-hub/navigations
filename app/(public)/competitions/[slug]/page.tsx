import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { getCompetitionBySlug, registrationDeadlineOf } from "@/domain/competitions/service";
import { categoryLabels, statusLabels, manualTypeLabels, awardLabels, eventTypeLabels } from "@/domain/competitions/types";
import { announcementsForCompetition } from "@/domain/announcements/service";
import { announcementCategoryLabels } from "@/domain/announcements/types";
import { Tabs } from "@/ui/components/Tabs";
import { Badge } from "@/ui/components/Badge";

export default async function CompetitionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const competition = await getCompetitionBySlug(supabase, slug);
  if (!competition) notFound();

  const competitionAnnouncements = await announcementsForCompetition(supabase, slug);

  const registrationRulesManual = competition.manuals.find((m) => m.type === "registration_rules");
  const guidingPrinciplesManual = competition.manuals.find((m) => m.type === "guiding_principles");
  const completeManual = competition.manuals.find((m) => m.type === "complete_manual");
  const registrationDeadline = registrationDeadlineOf(competition);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="max-w-2xl space-y-4">
          <p className="text-foreground">{competition.overview || "Overview coming soon."}</p>
          <p className="text-sm text-muted">
            Domain: <span className="font-medium text-foreground">{competition.domain || "—"}</span>
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
              <li key={rule.id} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-semibold text-foreground">
                  {categoryLabels[rule.category]} — grades {rule.minGrade}–{rule.maxGrade}
                </p>
                {rule.teamMinSize && (
                  <p className="text-sm text-muted">
                    Team size: {rule.teamMinSize}–{rule.teamMaxSize} members
                  </p>
                )}
                {rule.notes && <p className="text-sm text-muted">{rule.notes}</p>}
              </li>
            ))}
            {competition.eligibility.length === 0 && <p className="text-sm text-muted">Eligibility rules coming soon.</p>}
          </ul>
          <p className="text-sm text-muted">
            {registrationDeadline
              ? `Registration closes ${new Date(registrationDeadline).toLocaleDateString()}.`
              : "Registration dates not yet scheduled."}
          </p>
          {registrationRulesManual && (
            <a href={registrationRulesManual.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-accent">
              Download eligibility & registration rules ({registrationRulesManual.title})
            </a>
          )}
        </div>
      ),
    },
    {
      id: "stages",
      label: "Competition Stages",
      content: (
        <div className="max-w-2xl space-y-4">
          {competition.stages.map((stage) => (
            <div key={stage.id} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold tracking-wide text-accent uppercase">Stage {stage.stageNumber}</p>
              <h3 className="font-semibold text-foreground">{stage.title}</h3>
              <p className="text-sm text-muted">
                {stage.format} · {stage.duration}
              </p>
              <p className="mt-1 text-sm text-muted">Progression: {stage.progressionRule}</p>
            </div>
          ))}
          {competition.stages.length === 0 && <p className="text-sm text-muted">Stages coming soon.</p>}
        </div>
      ),
    },
    {
      id: "challenges",
      label: "Stage-wise Challenges",
      content: (
        <div className="max-w-2xl space-y-4">
          {competition.stages.map((stage) => (
            <div key={stage.id} className="rounded-xl border border-border bg-surface p-4">
              <h3 className="font-semibold text-foreground">
                Stage {stage.stageNumber}: {stage.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{stage.taskDescription}</p>
            </div>
          ))}
          {competition.stages.length === 0 && <p className="text-sm text-muted">Challenges coming soon.</p>}
        </div>
      ),
    },
    {
      id: "guiding-principles",
      label: "Guiding Principles",
      content: (
        <div className="max-w-2xl space-y-3 text-sm text-muted">
          <p>Preparation expectations, conduct, submission rules and allowed materials for this competition.</p>
          {guidingPrinciplesManual ? (
            <a href={guidingPrinciplesManual.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-accent">
              Download guiding principles ({guidingPrinciplesManual.title})
            </a>
          ) : (
            <p>Not yet published.</p>
          )}
        </div>
      ),
    },
    {
      id: "judging",
      label: "Judging & Rubrics",
      content: (
        <div className="max-w-2xl space-y-4">
          {competition.rubrics
            .filter((r) => r.isPublic)
            .map((r) => {
              const stage = competition.stages.find((s) => s.id === r.stageId);
              return (
                <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-xs font-semibold tracking-wide text-accent uppercase">
                    {stage ? `Stage ${stage.stageNumber}: ${stage.title}` : "Competition-wide"}
                  </p>
                  <div className="mt-2 space-y-2">
                    {r.criteria.map((c, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-2">
                        <span className="text-sm text-foreground">{c.name}</span>
                        <span className="text-sm font-semibold text-foreground">{c.weight}%</span>
                      </div>
                    ))}
                  </div>
                  {r.tieBreakRule && <p className="mt-2 text-xs text-muted">Tie-break: {r.tieBreakRule}</p>}
                </div>
              );
            })}
          {competition.rubrics.filter((r) => r.isPublic).length === 0 && (
            <p className="text-sm text-muted">Judging rubric not yet published.</p>
          )}
        </div>
      ),
    },
    {
      id: "manual",
      label: "Manual",
      content: completeManual ? (
        <a href={completeManual.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-accent">
          Download the complete competition manual ({completeManual.title})
        </a>
      ) : (
        <p className="text-sm text-muted">Manual not yet published.</p>
      ),
    },
    {
      id: "practice",
      label: "Practice & Resource Pack",
      content: (
        <div className="max-w-2xl space-y-3">
          {competition.resources.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-semibold text-foreground">{r.title}</p>
              {r.content && <p className="mt-1 text-sm text-muted">{r.content}</p>}
              {r.videoUrl && (
                <a href={r.videoUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-accent">
                  {r.downloadAllowed ? "Download" : "View"} →
                </a>
              )}
            </div>
          ))}
          {competition.resources.length === 0 && (
            <p className="text-sm text-muted">
              Practice questions, sample tasks and videos for this competition will appear here, viewable inside the
              website.
            </p>
          )}
        </div>
      ),
    },
    {
      id: "dates",
      label: "Important Dates",
      content: (
        <ul className="max-w-2xl space-y-2 text-sm">
          {competition.events.map((e) => (
            <li key={e.id} className="flex justify-between border-b border-border py-2">
              <span className="text-muted">
                {eventTypeLabels[e.type]}
                {e.title && e.title !== eventTypeLabels[e.type] ? ` — ${e.title}` : ""}
              </span>
              <span className="font-medium text-foreground">{new Date(e.eventDate).toLocaleDateString()}</span>
            </li>
          ))}
          {competition.events.length === 0 && <li className="py-2 text-muted">Dates not yet scheduled.</li>}
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
            {competition.winners.map((w) => (
              <div key={w.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                {w.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage URL, not a Next Image host we need to configure
                  <img src={w.photoUrl} alt={w.studentName} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-surface-muted text-sm text-muted">
                    No photo
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    {w.award === "custom" && w.customAwardLabel ? w.customAwardLabel : awardLabels[w.award]}
                  </span>
                  <p className="mt-1 font-semibold text-foreground">{w.studentName}</p>
                  <p className="text-sm text-muted">{w.schoolName}</p>
                  {w.positionLabel && <p className="text-xs text-muted">{w.positionLabel}</p>}
                </div>
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
            {competition.faqs.map((f) => (
              <details key={f.id} className="rounded-xl border border-border bg-surface p-4">
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
        <Badge>{competition.domain || "Uncategorized"}</Badge>
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
