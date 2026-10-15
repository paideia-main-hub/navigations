import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getPublicCompetitionBySlug, registrationDeadlineOf } from "@/domain/competitions/service";
import { isDefaultEventTitle } from "@/domain/competitions/dateLabels";
import { categoryLabels, statusLabels, awardLabels, eventTypeLabels, resourceTypeLabels } from "@/domain/competitions/types";
import { announcementsForCompetition } from "@/domain/announcements/service";
import { listPublishedComputedWinners } from "@/domain/results/service";
import { awardRank } from "@/domain/results/types";
import { ArenaTabs } from "@/ui/components/marketing/ArenaTabs";
import { ArenaBadge } from "@/ui/components/marketing/ArenaBadge";
import { CompetitionOverviewSections } from "@/ui/components/marketing/CompetitionOverviewSections";
import { CompetitionResourceBody } from "@/ui/components/marketing/CompetitionResourceBody";
import { CompetitionFaqAccordion } from "@/ui/components/marketing/CompetitionFaqAccordion";
import { CompetitionRegisterPanel } from "@/ui/components/marketing/CompetitionRegisterPanel";

export default async function CompetitionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // All three reads are independent, so they go out together rather than
  // paying three round trips of latency in series.
  const [competition, competitionAnnouncements, allComputedWinners, user] = await Promise.all([
    getPublicCompetitionBySlug(supabase, slug),
    announcementsForCompetition(supabase, slug),
    listPublishedComputedWinners(supabase),
    getCurrentUser(),
  ]);
  if (!competition) notFound();

  const computedWinners = allComputedWinners
    .filter((w) => w.competitionSlug === slug)
    .sort((a, b) => awardRank[a.award] - awardRank[b.award]);

  const completeManual = competition.manuals.find((m) => m.type === "complete_manual");
  const registrationDeadline = registrationDeadlineOf(competition);
  // Stored as "D2 – COMMUNICATION…"; public UI shows the name only.
  const domainLabel = (competition.domain || "").replace(/^D\d+\s*[–—-]\s*/, "").trim();

  const card = "rounded-xl border border-accent/30 bg-surface p-4";
  const muted = "text-muted";
  const link = "text-sm font-semibold text-accent-strong hover:underline";

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      group: "About",
      content: (
        <CompetitionOverviewSections overview={competition.overview} domainLabel={domainLabel} />
      ),
    },
    {
      id: "eligibility",
      label: "Eligibility & Registration Rules",
      group: "About",
      content: (
        <div className="max-w-2xl space-y-4">
          <ul className="space-y-3">
            {competition.eligibility.map((rule) => {
              const gradeLabel =
                rule.minGrade === rule.maxGrade
                  ? `grade ${rule.minGrade}`
                  : `grades ${rule.minGrade}–${rule.maxGrade}`;
              const teamSizeLabel =
                rule.teamMinSize == null
                  ? null
                  : rule.teamMaxSize && rule.teamMaxSize !== rule.teamMinSize
                    ? `${rule.teamMinSize}–${rule.teamMaxSize} members`
                    : `${rule.teamMinSize} members`;
              const noteItems = rule.notes
                ? rule.notes
                    .split(/(?<=\.)\s+/)
                    .map((item) => item.trim())
                    .filter(Boolean)
                : [];
              return (
                <li key={rule.id} className={card}>
                  <p className="font-semibold text-foreground">
                    {categoryLabels[rule.category]} — {gradeLabel}
                  </p>
                  {teamSizeLabel ? (
                    <p className="mt-3 inline-flex rounded-lg bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent-strong">
                      Team size: {teamSizeLabel}
                    </p>
                  ) : null}
                  {noteItems.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {noteItems.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
            {competition.eligibility.length === 0 && <p className={`text-sm ${muted}`}>Eligibility rules coming soon.</p>}
          </ul>
          {completeManual ? (
            <p className={`text-sm ${muted}`}>
              Full eligibility and registration rules are in the competition manual.{" "}
              <a href="#manual" className={link}>
                See Manual
              </a>
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "stages",
      label: "Competition Stages",
      group: "About",
      content: (
        <div className="max-w-2xl space-y-4">
          {competition.stages.map((stage) => {
            const progressionItems = stage.progressionRule
              .split(/(?<=\.)\s+/)
              .map((item) => item.trim())
              .filter(Boolean);
            return (
              <div key={stage.id} className={card}>
                <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">
                  Stage {stage.stageNumber}
                </p>
                <h3 className="mt-1 font-semibold text-foreground">{stage.title}</h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex gap-3 text-sm leading-relaxed text-foreground">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{stage.format}</span>
                  </li>
                  <li className="flex gap-3 text-sm leading-relaxed text-foreground">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{stage.duration}</span>
                  </li>
                </ul>
                <div className="mt-4 rounded-xl bg-accent-soft px-4 py-3">
                  <p className="text-xs font-bold tracking-[0.14em] text-accent-strong uppercase">Progression</p>
                  <ul className="mt-2 space-y-2">
                    {progressionItems.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground">
                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
          {competition.stages.length === 0 && <p className={`text-sm ${muted}`}>Stages coming soon.</p>}
        </div>
      ),
    },
    {
      id: "challenges",
      label: "Stage-wise Challenges",
      group: "About",
      content: (
        <div className="max-w-2xl space-y-4">
          {competition.stages.map((stage) => {
            const paragraphs = stage.taskDescription
              .trim()
              .split(/\n\s*\n/)
              .map((part) => part.trim())
              .filter(Boolean);
            return (
              <div key={stage.id} className={card}>
                <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">
                  Stage {stage.stageNumber}
                </p>
                <h3 className="mt-1 font-semibold text-foreground">{stage.title}</h3>
                <div className="mt-4 space-y-4">
                  {paragraphs.map((paragraph) => {
                    const labeledList = paragraph.match(
                      /^((?:Suggested shape|Debate segments per candidate)[^—–:]*)\s*[—–:]\s*([\s\S]+)$/i,
                    );
                    if (labeledList) {
                      const [, rawLabel, rawBody] = labeledList;
                      const listPart = rawBody.includes(";")
                        ? rawBody.split(/(?<=\.)\s+/)[0] ?? rawBody
                        : rawBody;
                      const afterList = rawBody.includes(";")
                        ? rawBody
                            .slice(listPart.length)
                            .replace(/^\s+/, "")
                            .split(/(?<=\.)\s+/)
                            .map((item) => item.trim())
                            .filter(Boolean)
                        : [];
                      const items = listPart
                        .replace(/\.\s*$/, "")
                        .split(";")
                        .map((item) => item.trim())
                        .filter(Boolean);
                      return (
                        <div key={paragraph} className="space-y-3">
                          <div className="rounded-xl bg-accent-soft px-4 py-3">
                            <p className="text-xs font-bold tracking-[0.14em] text-accent-strong uppercase">
                              {rawLabel.trim()}
                            </p>
                            <ul className="mt-2 space-y-2">
                              {items.map((item) => (
                                <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground">
                                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {afterList.length > 0 ? (
                            <ul className="space-y-2">
                              {afterList.map((item) => (
                                <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground">
                                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      );
                    }

                    const sentences = paragraph
                      .split(/(?<=\.)\s+/)
                      .map((item) => item.trim())
                      .filter(Boolean);
                    return (
                      <ul key={paragraph} className="space-y-2">
                        {sentences.map((item) => (
                          <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground">
                            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {competition.stages.length === 0 && <p className={`text-sm ${muted}`}>Challenges coming soon.</p>}
        </div>
      ),
    },
    {
      id: "guiding-principles",
      label: "Guiding Principles",
      group: "About",
      content: (
        <div className="max-w-2xl space-y-4">
          <div className={card}>
            <p className="text-sm leading-relaxed text-foreground">
              This section covers the guiding rules for this competition:
            </p>
            <ul className="mt-3 space-y-2">
              {[
                "Preparation expectations",
                "Conduct",
                "Submission rules",
                "Allowed materials",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {completeManual ? (
            <p className={`text-sm ${muted}`}>
              Full guiding principles and conduct rules are in the competition manual.{" "}
              <a href="#manual" className={link}>
                See Manual
              </a>
            </p>
          ) : (
            <p className={`text-sm ${muted}`}>Not yet published.</p>
          )}
        </div>
      ),
    },
    {
      id: "judging",
      label: "Judging & Rubrics",
      group: "Prepare",
      content: (
        <div className="max-w-2xl space-y-4">
          {competition.rubrics
            .filter((r) => r.isPublic)
            .map((r) => {
              const stage = competition.stages.find((s) => s.id === r.stageId);
              const totalWeight = r.criteria.reduce((sum, c) => sum + c.weight, 0);
              const numberedTieBreak = r.tieBreakRule?.match(/\d+\)\s*[\s\S]+?(?=\s*\d+\)|$)/g);
              const tieBreakItems = r.tieBreakRule
                ? numberedTieBreak && numberedTieBreak.length >= 2
                  ? numberedTieBreak.map((item) => item.trim())
                  : r.tieBreakRule
                      .split(/(?<=\.)\s+/)
                      .map((item) => item.trim())
                      .filter(Boolean)
                : [];
              return (
                <div key={r.id} className={card}>
                  {stage ? (
                    <>
                      <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">
                        Stage {stage.stageNumber}
                      </p>
                      <h3 className="mt-1 font-semibold text-foreground">{stage.title}</h3>
                    </>
                  ) : (
                    <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">
                      Competition-wide
                    </p>
                  )}
                  <div className="mt-4 space-y-2">
                    {r.criteria.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-4 rounded-lg border border-accent/30 bg-background px-4 py-2.5"
                      >
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                        <span className="shrink-0 rounded-md bg-accent-soft px-2.5 py-1 text-sm font-bold text-accent-strong">
                          {c.weight}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-right text-xs font-semibold text-muted">
                    Total {totalWeight}%
                  </p>
                  {tieBreakItems.length > 0 ? (
                    <div className="mt-4 rounded-xl bg-accent-soft px-4 py-3">
                      <p className="text-xs font-bold tracking-[0.14em] text-accent-strong uppercase">
                        Tie-break
                      </p>
                      <ul className="mt-2 space-y-2">
                        {tieBreakItems.map((item) => (
                          <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground">
                            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
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
      group: "Prepare",
      content: completeManual ? (
        <div className="max-w-2xl space-y-4">
          <div className={card}>
            <p className="text-sm leading-relaxed text-foreground">
              The official competition manual includes eligibility and registration rules, guiding principles and
              conduct, and the full operations guide for this competition.
            </p>
          </div>
          <div className="rounded-xl border border-accent/30 bg-accent-soft px-5 py-4">
            <p className="text-xs font-bold tracking-[0.14em] text-accent-strong uppercase">Download</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{completeManual.title}</p>
            <a
              href={completeManual.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Download the complete competition manual
            </a>
          </div>
        </div>
      ) : (
        <p className={`text-sm ${muted}`}>Manual not yet published.</p>
      ),
    },
    {
      id: "practice",
      label: "Practice & Resource Pack",
      group: "Prepare",
      content: (
        <div className="max-w-2xl space-y-4">
          {competition.resources.map((r) => {
            const titled = r.title.match(/^(Resource\s+[A-Z])\s*[—–-]\s*(.+)$/i);
            return (
              <div key={r.id} className={card}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-bold tracking-[0.12em] text-accent-strong uppercase">
                    {resourceTypeLabels[r.type]}
                  </span>
                  {titled ? (
                    <span className="rounded-md border border-border px-2 py-0.5 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
                      {titled[1]}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 font-semibold text-foreground">{titled ? titled[2] : r.title}</h3>
                {r.content ? <CompetitionResourceBody content={r.content} /> : null}
                {r.videoUrl ? (
                  <a href={r.videoUrl} target="_blank" rel="noreferrer" className={`mt-3 inline-block ${link}`}>
                    {r.downloadAllowed ? "Download" : "View"} →
                  </a>
                ) : null}
              </div>
            );
          })}
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
      group: "Prepare",
      content: (
        <div className="max-w-2xl space-y-4">
          {competition.venue ? (
            <div className="rounded-xl border border-accent/30 bg-accent-soft px-5 py-4">
              <p className="text-xs font-bold tracking-[0.14em] text-accent-strong uppercase">Venue</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{competition.venue}</p>
            </div>
          ) : null}
          {[...competition.events]
            .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
            .map((e) => {
              const typeLabel = eventTypeLabels[e.type] ?? e.type;
              const customTitle = e.title && !isDefaultEventTitle(e) ? e.title : null;
              const dateLabel = new Date(e.eventDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              return (
                <div key={e.id} className={card}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      {customTitle ? (
                        <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">
                          {typeLabel}
                        </p>
                      ) : null}
                      <h3 className={`font-semibold text-foreground ${customTitle ? "mt-1" : ""}`}>
                        {customTitle ?? typeLabel}
                      </h3>
                      {e.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-muted">{e.description}</p>
                      ) : null}
                    </div>
                    <time
                      dateTime={e.eventDate}
                      className="inline-flex shrink-0 self-start rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-accent-strong"
                    >
                      {dateLabel}
                    </time>
                  </div>
                </div>
              );
            })}
          {competition.events.length === 0 && (
            <p className={`text-sm ${muted}`}>Dates not yet scheduled.</p>
          )}
        </div>
      ),
    },
    {
      id: "announcements",
      label: "Announcements",
      group: "Follow",
      content:
        competitionAnnouncements.length > 0 ? (
          <div className="max-w-2xl space-y-4">
            {competitionAnnouncements.map((a) => (
              <article
                key={a.id}
                className={`rounded-xl border px-5 py-4 ${
                  a.isImportant ? "border-accent/35 bg-accent-soft" : "border-accent/30 bg-surface"
                }`}
              >
                {a.isImportant ? (
                  <p className="text-xs font-bold tracking-[0.14em] text-accent-strong uppercase">Pinned</p>
                ) : null}
                <h3 className={`font-semibold text-foreground ${a.isImportant ? "mt-1" : ""}`}>{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted whitespace-pre-line">{a.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl rounded-xl border border-accent/30 bg-accent-soft px-5 py-4">
            <p className="text-sm leading-relaxed text-foreground">
              No announcements published for this competition yet.
            </p>
          </div>
        ),
    },
    {
      id: "results",
      label: "Results",
      group: "Follow",
      content:
        computedWinners.length > 0 ? (
          <div className="max-w-2xl space-y-3">
            {computedWinners.map((w, i) => (
              <div key={i} className={`${card} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{w.entrantName}</p>
                  {w.entryType === "team" && w.teamMembers && w.teamMembers.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {w.teamMembers.map((member) => (
                        <li key={member} className="flex gap-3 text-sm text-muted">
                          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{member}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-2 text-sm text-muted">{w.schoolName ?? "—"}</p>
                </div>
                <ArenaBadge tone="blue">
                  {w.award === "custom" && w.customAwardLabel ? w.customAwardLabel : awardLabels[w.award]}
                </ArenaBadge>
              </div>
            ))}
          </div>
        ) : (
          <div className={`max-w-2xl ${card}`}>
            <p className="text-sm leading-relaxed text-muted">
              Results are published after admin approval, once judge scoring is complete. Check back after the final
              event date.
            </p>
          </div>
        ),
    },
    {
      id: "winners",
      label: "Winners Gallery",
      group: "Follow",
      content:
        computedWinners.length > 0 || competition.winners.length > 0 ? (
          <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
            {computedWinners.map((w, i) => (
              <article key={`computed-${i}`} className="overflow-hidden rounded-xl border border-accent/30 bg-surface">
                {w.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage URL, not a Next Image host we need to configure
                  <img src={w.photoUrl} alt={w.entrantName} className="h-44 w-full object-cover object-top" />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center bg-surface-muted text-sm text-muted">
                    No photo
                  </div>
                )}
                <div className="space-y-2 p-4">
                  <ArenaBadge tone="warning">
                    {w.award === "custom" && w.customAwardLabel ? w.customAwardLabel : awardLabels[w.award]}
                  </ArenaBadge>
                  <h3 className="font-semibold text-foreground">{w.entrantName}</h3>
                  <p className="text-sm text-muted">{w.schoolName ?? "—"}</p>
                  {w.entryType === "team" && w.teamMembers && w.teamMembers.length > 0 ? (
                    <ul className="space-y-1 pt-1">
                      {w.teamMembers.map((member) => (
                        <li key={member} className="flex gap-3 text-sm text-muted">
                          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{member}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            ))}
            {competition.winners.map((w) => (
              <article key={w.id} className="overflow-hidden rounded-xl border border-accent/30 bg-surface">
                {w.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-controlled Supabase Storage URL, not a Next Image host we need to configure
                  <img src={w.photoUrl} alt={w.studentName} className="h-44 w-full object-cover object-top" />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center bg-surface-muted text-sm text-muted">
                    No photo
                  </div>
                )}
                <div className="space-y-2 p-4">
                  <ArenaBadge tone="warning">
                    {w.award === "custom" && w.customAwardLabel ? w.customAwardLabel : awardLabels[w.award]}
                  </ArenaBadge>
                  <h3 className="font-semibold text-foreground">{w.studentName}</h3>
                  <p className="text-sm text-muted">{w.schoolName}</p>
                  {w.positionLabel ? <p className="text-xs font-semibold text-accent-strong">{w.positionLabel}</p> : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={`max-w-2xl ${card}`}>
            <p className="text-sm leading-relaxed text-muted">
              Winners will be published here once results are approved.
            </p>
          </div>
        ),
    },
    {
      id: "faq",
      label: "FAQ",
      group: "Follow",
      content:
        competition.faqs.length > 0 ? (
          <CompetitionFaqAccordion items={competition.faqs} />
        ) : (
          <div className={`max-w-2xl ${card}`}>
            <p className="text-sm leading-relaxed text-muted">
              No competition-specific FAQs yet — see the site-wide FAQ page.
            </p>
            <Link href="/faqs" className={`mt-3 inline-block ${link}`}>
              Open site FAQ
            </Link>
          </div>
        ),
    },
    {
      id: "register",
      label: "Register",
      group: "Next step",
      emphasize: true,
      content: (
        <CompetitionRegisterPanel
          slug={competition.slug}
          title={competition.title}
          isLoggedIn={Boolean(user)}
        />
      ),
    },
  ].map((tab) => ({
    ...tab,
    // Keys required: tab contents are a list of elements passed into a Client Component.
    content: (
      <div key={tab.id} className="contents">
        {tab.content}
      </div>
    ),
  }));

  const deadlineLabel = registrationDeadline
    ? new Date(registrationDeadline).toLocaleDateString("en-GB")
    : null;

  return (
    <div className="bg-background">
      {/* Pull up under the floating header clearance on <main> (pt-24/28), same
          pattern as /competitions, /awards, /calendar, etc. */}
      <div className="-mt-24 bg-brand-deep px-6 pt-28 pb-14 sm:-mt-28 sm:pt-32">
        <div className="mx-auto max-w-7xl">
          <Link href="/competitions" className="text-sm font-medium text-accent transition-colors hover:text-brand-deep-foreground">
            ← All competitions
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ArenaBadge tone="dark">{domainLabel || "Uncategorized"}</ArenaBadge>
            <ArenaBadge tone={competition.status === "open" ? "success" : "dark"}>{statusLabels[competition.status]}</ArenaBadge>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{competition.title}</h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-brand-deep-muted">{competition.shortDescription}</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {deadlineLabel ? (
              <p className="inline-flex items-center rounded-full bg-accent-soft px-3.5 py-1.5 text-sm font-semibold text-accent-strong">
                Registration closes{" "}
                <span className="ml-1 font-bold text-accent">{deadlineLabel}</span>
              </p>
            ) : (
              <span />
            )}
            <a
              href="#register"
              className="inline-flex shrink-0 items-center justify-center self-end rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 sm:self-auto"
            >
              Register for {competition.title}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <ArenaTabs tabs={tabs} />
      </div>
    </div>
  );
}
