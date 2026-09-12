import Link from "next/link";
import type { School } from "@/domain/schools/types";
import type { StudentProfile } from "@/domain/students/types";
import type { Team } from "@/domain/teams/types";
import type { Registration } from "@/domain/registrations/types";
import { registrationStatusLabels } from "@/domain/registrations/types";
import { getCompetitionBySlug } from "@/domain/competitions/service";
import { announcementsForCompetition } from "@/domain/announcements/service";
import { Badge } from "@/ui/components/Badge";
import { StatCard } from "./StatCard";
import { SchoolProfileCard } from "./SchoolProfileCard";
import { AddStudentForm } from "./AddStudentForm";
import { CreateTeamForm } from "./CreateTeamForm";
import { CsvDownloadButton } from "./CsvDownloadButton";

const statusTone: Record<string, "success" | "warning" | "neutral"> = {
  approved: "success",
  qualified: "success",
  finalist: "success",
  completed: "success",
  pending: "warning",
  rejected: "neutral",
};

export function SchoolDashboard({
  school,
  roster,
  teams,
  registrations,
}: {
  school: School;
  roster: StudentProfile[];
  teams: Team[];
  registrations: Registration[];
}) {
  const qualifiedOrFinalists = registrations.filter((r) => r.status === "qualified" || r.status === "finalist");

  const registeredCompetitions = Array.from(new Set(registrations.map((r) => r.competitionSlug)))
    .map((slug) => getCompetitionBySlug(slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">School Dashboard</h1>
        <Link
          href="/dashboard/register"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Register a student or team
        </Link>
      </div>

      <div className="mt-6">
        <SchoolProfileCard school={school} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Students" value={roster.length} />
        <StatCard label="Teams" value={teams.length} />
        <StatCard label="Registrations" value={registrations.length} />
        <StatCard label="Pending" value={registrations.filter((r) => r.status === "pending").length} />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-foreground">Registrations</h2>
          <CsvDownloadButton
            label="Export registrations (CSV)"
            filename={`${school.officialName}-registrations.csv`}
            rows={registrations.map((r) => ({
              Competition: r.competitionTitle,
              "Entry type": r.entryType,
              Entrant: r.entrantName,
              "Registration #": r.registrationNumber,
              Status: registrationStatusLabels[r.status],
              "Submitted at": new Date(r.submittedAt).toLocaleDateString(),
            }))}
          />
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">Competition</th>
                <th className="px-4 py-3 font-medium">Entry</th>
                <th className="px-4 py-3 font-medium">Registration #</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/competitions/${r.competitionSlug}`} className="font-medium text-foreground hover:text-accent">
                      {r.competitionTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.entrantName} <span className="capitalize">({r.entryType})</span>
                  </td>
                  <td className="px-4 py-3 text-muted">{r.registrationNumber}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[r.status] ?? "neutral"}>{registrationStatusLabels[r.status]}</Badge>
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No registrations yet. This log covers every season — nothing to archive until your school
                    registers for its first competition.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {qualifiedOrFinalists.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Qualified & Finalists</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {qualifiedOrFinalists.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
                <Badge tone="success">{registrationStatusLabels[r.status]}</Badge>
                <p className="mt-1 font-semibold text-foreground">{r.entrantName}</p>
                <p className="text-sm text-muted">{r.competitionTitle}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-8 text-sm text-muted">
        Winner photos and certificates appear here once results are published and approved by an
        administrator.
      </p>

      {registeredCompetitions.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Deadlines & announcements</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {registeredCompetitions.map((c) => (
              <div key={c.slug} className="rounded-xl border border-border bg-surface p-4">
                <Link href={`/competitions/${c.slug}`} className="font-semibold text-foreground hover:text-accent">
                  {c.title}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  Registration closes {new Date(c.registrationDeadline).toLocaleDateString()} · Event{" "}
                  {new Date(c.eventDate).toLocaleDateString()}
                </p>
                {announcementsForCompetition(c.slug)
                  .slice(0, 2)
                  .map((a) => (
                    <p key={a.id} className="mt-2 text-xs text-muted">
                      <span className="font-medium text-foreground">{a.title}:</span> {a.body}
                    </p>
                  ))}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-foreground">Student roster</h2>
            <CsvDownloadButton
              label="Download participant list (CSV)"
              filename={`${school.officialName}-students.csv`}
              rows={roster.map((s) => ({
                Name: s.fullName,
                Grade: s.grade ?? "",
                Guardian: s.guardianName ?? "",
                "Guardian contact": s.guardianMobile ?? s.guardianEmail ?? "",
              }))}
            />
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Guardian</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{s.fullName}</td>
                    <td className="px-4 py-3 text-muted">{s.grade ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{s.guardianName ?? "—"}</td>
                  </tr>
                ))}
                {roster.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted">
                      No students added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <AddStudentForm />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Teams</h2>
          <div className="space-y-3">
            {teams.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted">{t.members.map((m) => m.studentName).join(", ")}</p>
              </div>
            ))}
            {teams.length === 0 && <p className="text-sm text-muted">No teams created yet.</p>}
          </div>
          <div className="mt-3">
            <CreateTeamForm roster={roster} />
          </div>
        </section>
      </div>
    </div>
  );
}
