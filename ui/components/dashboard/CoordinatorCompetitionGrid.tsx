"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { isGradeEligible } from "@/domain/competitions/service";
import { categoryLabels, entryFormatLabel, statusLabels, type AgeCategory, type CompetitionSummary } from "@/domain/competitions/types";
import type { PaymentAccount } from "@/domain/payments/types";
import type { SchoolEntryStudent } from "@/domain/registrations/schoolEntries";
import type { StudentProfile } from "@/domain/students/types";
import { teamVisibleForCompetition, type Team } from "@/domain/teams/types";
import { Badge } from "@/ui/components/Badge";
import { MenuScroll } from "@/ui/components/MenuScroll";
import { AnimatedModal, ModalCloseButton } from "@/ui/components/AnimatedModal";
import { useSchoolEntryList } from "@/ui/components/registration/SchoolHamperList";
import { EditSchoolEntry } from "@/ui/components/registration/EditSchoolEntry";
import { RegistrationWizard } from "@/ui/components/registration/RegistrationWizard";

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
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Register</h2>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search competitions"
          aria-label="Search competitions"
          className="h-[38px] w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent sm:w-64"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((competition) => (
          <div
            key={competition.slug}
            className="flex flex-col rounded-2xl border border-border bg-surface p-4 shadow-[0_18px_40px_-36px_rgba(31,32,65,0.55)] sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-extrabold tracking-tight text-foreground">{competition.title}</h3>
              <Badge tone={competition.status === "open" ? "success" : "warning"}>{statusLabels[competition.status]}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">{competition.domain.replace(/^D\d+\s*[–—-]\s*/, "")}</p>
            <ul className="mt-4 grid gap-2">
              <li className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-3 py-2.5">
                <span className="text-sm font-medium text-foreground">Entry</span>
                <span className="text-right text-xs text-muted">{entryFormatLabel(competition)}</span>
              </li>
              <li className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-3 py-2.5">
                <span className="text-sm font-medium text-foreground">Grades</span>
                <span className="text-right text-xs text-muted">
                  {[...new Set(competition.eligibility.map((rule) => categoryLabels[rule.category]))].join(", ")}
                </span>
              </li>
            </ul>
            <div className="mt-auto flex justify-end pt-4">
              {competition.supportsTeam && !competition.supportsIndividual ? (
                <button
                  type="button"
                  onClick={() => openAdd(competition.slug)}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                >
                  {listed.has(competition.slug) ? "Add another team" : "Add"}
                  <span aria-hidden="true">→</span>
                </button>
              ) : listed.has(competition.slug) ? (
                <button
                  type="button"
                  onClick={() => removeEntry(competition.slug)}
                  className="cursor-pointer text-sm font-semibold text-muted hover:text-foreground hover:underline"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAdd(competition.slug)}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                >
                  Add
                  <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          {competitions.length === 0 ? "No competitions are open for registration right now." : `No competitions match “${query.trim()}”.`}
        </p>
      ) : null}
      {active
        ? createPortal(
            <AnimatedModal onClose={closeModal} labelledBy={titleId} panelClassName="max-h-[min(92vh,900px)] max-w-3xl">
              <MenuScroll className="max-h-[min(92vh,900px)] p-5 sm:p-6">
                <RegistrationDialogHeader
                  titleId={titleId}
                  title={editing?.competitionSlug === active.slug ? `Edit ${active.title}` : `Register for ${active.title}`}
                />
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
              </MenuScroll>
            </AnimatedModal>,
            document.body,
          )
        : null}
    </>
  );
}

function RegistrationDialogHeader({ titleId, title }: { titleId: string; title: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <h2 id={titleId} className="pr-2 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <ModalCloseButton />
    </div>
  );
}
