"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { resolveCompetitionCardImage } from "@/domain/competitions/cardImage";
import { isGradeEligible } from "@/domain/competitions/service";
import {
  categoryLabels,
  entryFormatLabel,
  formatFee,
  pathwayLabels,
  statusLabels,
  type AgeCategory,
  type CompetitionSummary,
} from "@/domain/competitions/types";
import type { PaymentAccount } from "@/domain/payments/types";
import type { SchoolEntryStudent } from "@/domain/registrations/schoolEntries";
import type { StudentProfile } from "@/domain/students/types";
import { teamVisibleForCompetition, type Team } from "@/domain/teams/types";
import { Badge } from "@/ui/components/Badge";
import { useSchoolEntryList } from "@/ui/components/registration/SchoolHamperList";
import { EditSchoolEntry } from "@/ui/components/registration/EditSchoolEntry";
import { RegistrationFormDialog } from "@/ui/components/registration/RegistrationFormDialog";
import { RegistrationWizard } from "@/ui/components/registration/RegistrationWizard";
import { dashboardHeroCtaClass } from "@/ui/components/dashboard/DashboardHero";
import { dashboardGlowCardClass, dashboardGlowOrbClass } from "@/ui/components/dashboard/dashboardGlowCard";

function feeLabel(competition: CompetitionSummary): string {
  return competition.feeAmount == null ? "Fee not set" : formatFee(competition.feeAmount);
}

function gradeRange(competition: CompetitionSummary): string {
  const grades = competition.eligibility
    .flatMap((rule) => [Number(rule.minGrade), Number(rule.maxGrade)])
    .filter((n) => Number.isFinite(n) && n > 0);
  if (grades.length === 0) {
    return [...new Set(competition.eligibility.map((rule) => categoryLabels[rule.category]))].join(", ");
  }
  const lo = Math.min(...grades);
  const hi = Math.max(...grades);
  return lo === hi ? `Grade ${lo}` : `Grades ${lo}–${hi}`;
}

function pathwayLabel(competition: CompetitionSummary): string | null {
  if (competition.pathway) return pathwayLabels[competition.pathway];
  const domain = competition.domain.replace(/^D\d+\s*[–—-]\s*/, "").trim();
  return domain || null;
}

export function CoordinatorCompetitionGrid({
  competitions,
  roster,
  teams,
  schoolId,
  schoolName,
  paymentAccount,
}: {
  competitions: CompetitionSummary[];
  roster: StudentProfile[];
  teams: Team[];
  schoolId: string;
  schoolName: string;
  paymentAccount: PaymentAccount;
}) {
  const { entries, removeEntry, editing, clearEditing, replaceEntry, updateListedTeam, openDrawer } = useSchoolEntryList();
  const [schoolTeams, setSchoolTeams] = useState(teams);
  const listed = useMemo(() => new Set(entries.map((entry) => entry.competitionSlug)), [entries]);
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  useEffect(() => setSchoolTeams(teams), [teams]);
  useEffect(() => {
    if (editing) setActiveSlug(editing.competitionSlug);
  }, [editing]);

  function openAdd(slug: string) {
    clearEditing();
    setActiveSlug(slug);
  }

  function closeModal() {
    setActiveSlug(null);
    clearEditing();
  }
  const titleId = useId();
  const active = competitions.find((competition) => competition.slug === activeSlug) ?? null;
  const needle = query.trim().toLowerCase();
  const shown = useMemo(
    () => (needle ? competitions.filter((competition) => competition.title.toLowerCase().includes(needle)) : competitions),
    [competitions, needle],
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard/competitions" prefetch className={`${dashboardHeroCtaClass} w-full sm:w-auto`}>
          My Competitions
        </Link>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search competitions"
          aria-label="Search competitions"
          className="h-[38px] w-full rounded-lg border border-accent/30 bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent sm:max-w-xs sm:flex-1"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((competition) => {
          const inHamper = listed.has(competition.slug);
          const imageSrc = resolveCompetitionCardImage(competition.imageUrl);
          const label = pathwayLabel(competition);
          const teamOnly = competition.supportsTeam && !competition.supportsIndividual;
          return (
            <div
              key={competition.slug}
              className={`${dashboardGlowCardClass} flex flex-col p-4 ${inHamper ? "ring-accent hover:ring-accent" : ""}`}
            >
              {imageSrc ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- public Supabase Storage URL */}
                  <img
                    src={imageSrc}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  />
                  <div aria-hidden className="absolute inset-0 bg-white/92" />
                </>
              ) : null}
              <div aria-hidden className={dashboardGlowOrbClass} />
              <div className="relative flex min-h-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {label ? (
                      <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-accent-strong uppercase">{label}</p>
                    ) : null}
                    <h3 className="mt-1 font-bold text-foreground">{competition.title}</h3>
                    <p className="mt-1 text-xs text-muted">
                      {[gradeRange(competition), entryFormatLabel(competition)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Badge tone={competition.status === "open" ? "success" : "warning"}>{statusLabels[competition.status]}</Badge>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="text-sm font-semibold text-foreground">{feeLabel(competition)}</span>
                  {teamOnly ? (
                    <button
                      type="button"
                      onClick={() => openAdd(competition.slug)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white"
                    >
                      {inHamper ? "Add another team" : "Add"}
                      <span aria-hidden="true">→</span>
                    </button>
                  ) : inHamper ? (
                    <button
                      type="button"
                      onClick={() => removeEntry(competition.slug)}
                      className="cursor-pointer rounded-full border border-accent bg-white px-4 py-1.5 text-xs font-semibold text-accent-strong shadow-sm transition-colors duration-300 hover:bg-accent hover:text-white"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAdd(competition.slug)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white"
                    >
                      Add
                      <span aria-hidden="true">→</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {shown.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          {competitions.length === 0 ? "No competitions are open for registration right now." : `No competitions match “${query.trim()}”.`}
        </p>
      ) : null}
      {active
        ? createPortal(
            <RegistrationFormDialog
              titleId={titleId}
              title={editing?.competitionSlug === active.slug ? `Edit ${active.title}` : `Register for ${active.title}`}
              onClose={closeModal}
            >
              {editing?.competitionSlug === active.slug ? (
                <EditSchoolEntry
                  key={editing.id ?? editing.competitionSlug}
                  competition={active}
                  draft={editing}
                  roster={roster}
                  teams={schoolTeams.filter((team) =>
                    teamVisibleForCompetition(
                      team,
                      active.id,
                      entries
                        .filter((entry) => entry.competitionSlug === active.slug)
                        .flatMap((entry) =>
                          [entry.teamId, entry.teamName?.trim().toLowerCase()].filter((value): value is string => Boolean(value)),
                        ),
                    ),
                  )}
                  reservedTeamIds={entries
                    .filter((entry) => entry.competitionSlug === active.slug)
                    .flatMap((entry) =>
                      [entry.teamId, entry.teamName?.trim().toLowerCase()].filter((value): value is string => Boolean(value)),
                    )}
                  reservedStudentIds={entries
                    .filter(
                      (entry) =>
                        entry.competitionSlug === active.slug &&
                        (entry.id ?? entry.competitionSlug) !== (editing.id ?? editing.competitionSlug),
                    )
                    .flatMap((entry) => entry.students.map((student) => student.id))}
                  onTeamUpdated={(team) =>
                    setSchoolTeams((current) => current.map((item) => (item.id === team.id ? team : item)))
                  }
                  onSaved={(entry) => {
                    replaceEntry(editing.id ?? editing.competitionSlug, entry);
                    closeModal();
                    openDrawer();
                  }}
                />
              ) : (
                <RegistrationWizard
                  key={active.slug}
                  competition={active}
                  mode="school"
                  schoolId={schoolId}
                  schoolName={schoolName}
                  roster={roster}
                  teams={schoolTeams}
                  paymentAccount={paymentAccount}
                  reservedStudentIds={entries
                    .filter((entry) => entry.competitionSlug === active.slug)
                    .flatMap((entry) => entry.students.map((student) => student.id))}
                  reservedTeamIds={entries
                    .filter((entry) => entry.competitionSlug === active.slug)
                    .flatMap((entry) =>
                      [entry.teamId, entry.teamName?.trim().toLowerCase()].filter((value): value is string => Boolean(value)),
                    )}
                  listedMembers={entries
                    .filter((entry) => entry.competitionSlug === active.slug)
                    .flatMap((entry) => entry.students.map((student) => ({ studentId: student.id, teamId: entry.teamId })))}
                  onTeamUpdated={(team) => {
                    setSchoolTeams((current) => current.map((item) => (item.id === team.id ? team : item)));
                    const students: SchoolEntryStudent[] = team.members.flatMap((member) => {
                      const grade = member.grade?.trim() ?? "";
                      const rule = active.eligibility.find((item) => grade && isGradeEligible(item.minGrade, item.maxGrade, grade));
                      if (!rule) return [];
                      return [
                        {
                          id: member.studentId,
                          fullName: member.studentName,
                          grade: member.grade,
                          category: rule.category as AgeCategory,
                        },
                      ];
                    });
                    updateListedTeam(team.id, team.name, students);
                  }}
                  onAddedToList={closeModal}
                />
              )}
            </RegistrationFormDialog>,
            document.body,
          )
        : null}
    </>
  );
}
