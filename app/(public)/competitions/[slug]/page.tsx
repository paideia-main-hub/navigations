import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { getCompetitionBySlug, registrationDeadlineOf } from "@/domain/competitions/service";
import { categoryLabels, statusLabels, awardLabels, eventTypeLabels } from "@/domain/competitions/types";
import { announcementsForCompetition } from "@/domain/announcements/service";
import { announcementCategoryLabels } from "@/domain/announcements/types";
import { listPublishedComputedWinners } from "@/domain/results/service";
import { awardRank } from "@/domain/results/types";
import { ArenaTabs } from "@/ui/components/marketing/ArenaTabs";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";

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
  const allComputedWinners = await listPublishedComputedWinners(supabase);
  const computedWinners = allComputedWinners
    .filter((w) => w.competitionSlug === slug)
    .sort((a, b) => awardRank[a.award] - awardRank[b.award]);

  const registrationRulesManual = competition.manuals.find((m) => m.type === "registration_rules");
  const guidingPrinciplesManual = competition.manuals.find((m) => m.type === "guiding_principles");
  const completeManual = competition.manuals.find((m) => m.type === "complete_manual");
  const registrationDeadline = registrationDeadlineOf(competition);

  const card = "rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900";
  const muted = "text-slate-500 dark:text-slate-400";
  const link = "text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400";

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: "📋",
      content: (
        <div className="max-w-2xl space-y-4">
          <p className="whitespace-pre-line text-slate-900 dark:text-slate-100">{competition.overview || "Overview coming soon."}</p>
          <p className={`text-sm ${muted}`}>
            Domain: <span className="font-medium text-slate-900 dark:text-slate-100">{competition.domain || "—"}</span>
          </p>
        </div>
      ),
    },
    {
      id: "eligibility",
      label: "Eligibility & Registration Rules",
      icon: "✅",
      content: (
        <div className="max-w-2xl space-y-4">
          <ul className="space-y-2">
            {competition.eligibility.map((rule) => (
              <li key={rule.id} className={card}>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {categoryLabels[rule.category]} — grades {rule.minGrade}–{rule.maxGrade}
                </p>
                {rule.teamMinSize && (
                  <p className={`text-sm ${muted}`}>
                    Team size: {rule.teamMinSize}–{rule.teamMaxSize} members
                  </p>
                )}
                {rule.notes && <p className={`text-sm ${muted}`}>{rule.notes}</p>}
              </li>
            ))}
            {competition.eligibility.length === 0 && <p className={`text-sm ${muted}`}>Eligibility rules coming soon.</p>}
          </ul>
          <p className={`text-sm ${muted}`}>
            {registrationDeadline
              ? `Registration closes ${new Date(registrationDeadline).toLocaleDateString()}.`
              : "Registration dates not yet scheduled."}
          </p>
          {registrationRulesManual && (
            <a href={registrationRulesManual.fileUrl} target="_blank" rel="noreferrer" className={link}>
              Download eligibility & registration rules ({registrationRulesManual.title})
            </a>
          )}
        </div>
      ),
    },
    {
      id: "stages",
      label: "Competition Stages",
      icon: "🏁",
      content: (
        <div className="max-w-2xl space-y-4">
          {competition.stages.map((stage) => (
            <div key={stage.id} className={card}>
              <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">Stage {stage.stageNumber}</p>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{stage.title}</h3>
              <p className={`text-sm ${muted}`}>
                {stage.format} · {stage.duration}
              </p>
              <p className={`mt-1 text-sm ${muted}`}>Progression: {stage.progressionRule}</p>
            </div>
          ))}
          {competition.stages.length === 0 && <p className={`text-sm ${muted}`}>Stages coming soon.</p>}
        </div>
      ),
    },
    {
      id: "challenges",
      label: "Stage-wise Challenges",
      icon: "🧩",
      content: (
        <div className="max-w-2xl space-y-4">
          {competition.stages.map((stage) => (
            <div key={stage.id} className={card}>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Stage {stage.stageNumber}: {stage.title}
              </h3>
              <p className={`mt-1 whitespace-pre-line text-sm ${muted}`}>{stage.taskDescription}</p>
            </div>
          ))}
          {competition.stages.length === 0 && <p className={`text-sm ${muted}`}>Challenges coming soon.</p>}
        </div>
      ),
    },
    {
      id: "guiding-principles",
      label: "Guiding Principles",
      icon: "📖",
      content: (
        <div className={`max-w-2xl space-y-3 text-sm ${muted}`}>
          <p>Preparation expectations, conduct, submission rules and allowed materials for this competition.</p>
          {guidingPrinciplesManual ? (
            <a href={guidingPrinciplesManual.fileUrl} target="_blank" rel="noreferrer" className={link}>
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
      icon: "⚖️",
      content: (
        <div className="max-w-2xl space-y-4">
          {competition.rubrics
            .filter((r) => r.isPublic)
            .map((r) => {
              const stage = competition.stages.find((s) => s.id === r.stageId);
              return (
                <div key={r.id} className={card}>
                  <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">
                    {stage ? `Stage ${stage.stageNumber}: ${stage.title}` : "Competition-wide"}
                  </p>
                  <div className="mt-2 space-y-2">
                    {r.criteria.map((c, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
                        <span className="text-sm text-slate-900 dark:text-slate-100">{c.name}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{c.weight}%</span>
                      </div>
                    ))}
                  </div>
                  {r.tieBreakRule && <p className={`mt-2 text-xs ${muted}`}>Tie-break: {r.tieBreakRule}</p>}
                </div>
              );
            })}
          {competition.rubrics.filter((r) => r.isPublic).length === 0 && (
            <p className={`text-sm ${muted}`}>Judging rubric not yet published.</p>
          )}
        </div>
      ),
    },
    {
      id: "manual",
      label: "Manual",
      icon: "📘",
      content: completeManual ? (
        <a href={completeManual.fileUrl} target="_blank" rel="noreferrer" className={link}>
          Download the complete competition manual ({completeManual.title})
        </a>
      ) : (
        <p className={`text-sm ${muted}`}>Manual not yet published.</p>
      ),
    },
    {
      id: "practice",
      label: "Practice & Resource Pack",
      icon: "🎯",
      content: (
        <div className="max-w-2xl space-y-3">
          {competition.resources.map((r) => (
            <div key={r.id} className={card}>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{r.title}</p>
              {r.content && <p className={`mt-1 whitespace-pre-line text-sm ${muted}`}>{r.content}</p>}
              {r.videoUrl && (
                <a href={r.videoUrl} target="_blank" rel="noreferrer" className={`mt-2 inline-block ${link}`}>
                  {r.downloadAllowed ? "Download" : "View"} →
                </a>
              )}
            </div>
          ))}
          {competition.resources.length === 0 && (
            <p className={`text-sm ${muted}`}>
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
      icon: "📅",
      content: (
        <ul className="max-w-2xl space-y-2 text-sm">
          {competition.events.map((e) => (
            <li key={e.id} className="flex justify-between border-b border-slate-200 py-2 dark:border-slate-800">
              <span className={muted}>
                {eventTypeLabels[e.type]}
                {e.title && e.title !== eventTypeLabels[e.type] ? ` — ${e.title}` : ""}
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{new Date(e.eventDate).toLocaleDateString()}</span>
            </li>
          ))}
          {competition.events.length === 0 && <li className={`py-2 ${muted}`}>Dates not yet scheduled.</li>}
        </ul>
      ),
    },
    {
      id: "announcements",
      label: "Announcements",
      icon: "📣",
      content:
        competitionAnnouncements.length > 0 ? (
          <div className="max-w-2xl space-y-3">
            {competitionAnnouncements.map((a) => (
              <div key={a.id} className={card}>
                <ArenaBadge tone="blue">{announcementCategoryLabels[a.category]}</ArenaBadge>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{a.title}</p>
                <p className={`mt-1 text-sm ${muted}`}>{a.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={`max-w-2xl text-sm ${muted}`}>No announcements published for this competition yet.</p>
        ),
    },
    {
      id: "results",
      label: "Results",
      icon: "🏅",
      content:
        computedWinners.length > 0 ? (
          <ul className="max-w-2xl space-y-2 text-sm">
            {computedWinners.map((w, i) => (
              <li key={i} className="flex items-center justify-between border-b border-slate-200 py-2 dark:border-slate-800">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {w.entrantName}
                    {w.entryType === "team" && w.teamMembers && w.teamMembers.length > 0 && (
                      <span className={`ml-1 font-normal ${muted}`}>({w.teamMembers.join(", ")})</span>
                    )}
                  </p>
                  <p className={muted}>{w.schoolName ?? "—"}</p>
                </div>
                <ArenaBadge tone="blue">{w.award === "custom" && w.customAwardLabel ? w.customAwardLabel : awardLabels[w.award]}</ArenaBadge>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`max-w-2xl text-sm ${muted}`}>
            Results are published after admin approval, once judge scoring is complete. Check back after the final
            event date.
          </p>
        ),
    },
    {
      id: "winners",
      label: "Winners Gallery",
      icon: "🏆",
      content:
        computedWinners.length > 0 || competition.winners.length > 0 ? (
          <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
            {computedWinners.map((w, i) => (
              <div key={`computed-${i}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                {w.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage URL, not a Next Image host we need to configure
                  <img src={w.photoUrl} alt={w.entrantName} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    No photo
                  </div>
                )}
                <div className="p-4">
                  <ArenaBadge tone="warning">{w.award === "custom" && w.customAwardLabel ? w.customAwardLabel : awardLabels[w.award]}</ArenaBadge>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{w.entrantName}</p>
                  <p className={`text-sm ${muted}`}>{w.schoolName ?? "—"}</p>
                </div>
              </div>
            ))}
            {competition.winners.map((w) => (
              <div key={w.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                {w.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage URL, not a Next Image host we need to configure
                  <img src={w.photoUrl} alt={w.studentName} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    No photo
                  </div>
                )}
                <div className="p-4">
                  <ArenaBadge tone="warning">{w.award === "custom" && w.customAwardLabel ? w.customAwardLabel : awardLabels[w.award]}</ArenaBadge>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{w.studentName}</p>
                  <p className={`text-sm ${muted}`}>{w.schoolName}</p>
                  {w.positionLabel && <p className={`text-xs ${muted}`}>{w.positionLabel}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`max-w-2xl text-sm ${muted}`}>Winners will be published here once results are approved.</p>
        ),
    },
    {
      id: "faq",
      label: "FAQ",
      icon: "❓",
      content:
        competition.faqs.length > 0 ? (
          <div className="max-w-2xl space-y-3">
            {competition.faqs.map((f) => (
              <details key={f.id} className={card}>
                <summary className="cursor-pointer font-medium text-slate-900 dark:text-slate-100">{f.question}</summary>
                <p className={`mt-2 text-sm ${muted}`}>{f.answer}</p>
              </details>
            ))}
          </div>
        ) : (
          <p className={`max-w-2xl text-sm ${muted}`}>
            No competition-specific FAQs yet — see the site-wide FAQ page.
          </p>
        ),
    },
    {
      id: "register",
      label: "Register",
      icon: "➕",
      content: (
        <div className="max-w-2xl space-y-4">
          <p className={`text-sm ${muted}`}>Already have an account? Register straight from your dashboard.</p>
          <Link
            href={`/dashboard/register/${competition.slug}`}
            className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Register for {competition.title}
          </Link>
          <p className={`pt-2 text-sm ${muted}`}>New here? Create an account first.</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/register/student?competition=${competition.slug}`}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:border-blue-500 dark:border-slate-700 dark:text-slate-100"
            >
              Create Student Account
            </Link>
            <Link
              href={`/register/school?competition=${competition.slug}`}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:border-blue-500 dark:border-slate-700 dark:text-slate-100"
            >
              Create School Account
            </Link>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <div className="bg-slate-950 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <Link href="/competitions" className="text-sm font-medium text-slate-400 hover:text-white">
            ← All competitions
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ArenaBadge tone="dark">{competition.domain || "Uncategorized"}</ArenaBadge>
            <ArenaBadge tone={competition.status === "open" ? "success" : "dark"}>{statusLabels[competition.status]}</ArenaBadge>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{competition.title}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">{competition.shortDescription}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <ArenaTabs tabs={tabs} />
      </div>
    </div>
  );
}
