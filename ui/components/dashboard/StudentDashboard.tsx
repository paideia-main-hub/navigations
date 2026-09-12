import Link from "next/link";
import type { StudentProfile } from "@/domain/students/types";
import type { Registration, DisplayStatus } from "@/domain/registrations/types";
import { displayStatusLabels } from "@/domain/registrations/types";
import { deriveDisplayStatus } from "@/domain/registrations/service";
import { getCompetitionBySlug } from "@/domain/competitions/service";
import { announcementsForCompetition } from "@/domain/announcements/service";
import type { ResultInfo } from "@/domain/results/types";
import { Badge } from "@/ui/components/Badge";
import { StatCard } from "./StatCard";
import { StudentProfileCard } from "./StudentProfileCard";

const statusTone: Record<DisplayStatus, "success" | "warning" | "neutral" | "accent"> = {
  registered: "warning",
  upcoming: "neutral",
  in_progress: "accent",
  qualified: "success",
  completed: "success",
  rejected: "neutral",
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function StudentDashboard({
  fullName,
  profile,
  registrations,
  results,
}: {
  fullName: string;
  profile: StudentProfile | null;
  registrations: Registration[];
  results: Map<string, ResultInfo>;
}) {
  const withCompetition = registrations.map((r) => ({
    registration: r,
    competition: getCompetitionBySlug(r.competitionSlug),
  }));

  const displayStatuses = withCompetition.map(({ registration, competition }) =>
    deriveDisplayStatus(registration, competition),
  );

  const counts = {
    registered: displayStatuses.filter((s) => s === "registered").length,
    upcoming: displayStatuses.filter((s) => s === "upcoming").length,
    in_progress: displayStatuses.filter((s) => s === "in_progress").length,
    qualified: displayStatuses.filter((s) => s === "qualified").length,
    completed: displayStatuses.filter((s) => s === "completed").length,
  };

  const registeredCompetitions = Array.from(new Set(registrations.map((r) => r.competitionSlug)))
    .map((slug) => getCompetitionBySlug(slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">My Competitions</h1>
        <Link
          href="/dashboard/register"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Register for a competition
        </Link>
      </div>

      {profile && (
        <div className="mt-6">
          <StudentProfileCard fullName={fullName} profile={profile} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Registered" value={counts.registered} />
        <StatCard label="Upcoming" value={counts.upcoming} />
        <StatCard label="In Progress" value={counts.in_progress} />
        <StatCard label="Qualified" value={counts.qualified} />
        <StatCard label="Completed" value={counts.completed} />
      </div>

      <div className="mt-8 space-y-4">
        {withCompetition.map(({ registration: r, competition: c }, i) => {
          const status = displayStatuses[i];
          const result = results.get(r.id);

          return (
            <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/competitions/${r.competitionSlug}`} className="font-semibold text-foreground hover:text-accent">
                    {r.competitionTitle}
                  </Link>
                  <p className="text-sm text-muted">
                    {r.entrantName} <span className="capitalize">({r.entryType})</span> · {r.registrationNumber}
                  </p>
                </div>
                <Badge tone={statusTone[status]}>{displayStatusLabels[status]}</Badge>
              </div>

              {r.entryType === "team" && r.teamMembers && r.teamMembers.length > 0 && (
                <p className="mt-2 text-xs text-muted">Team: {r.teamMembers.join(", ")}</p>
              )}

              {c && (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span>
                    Registration closes {new Date(c.registrationDeadline).toLocaleDateString()}
                    {daysUntil(c.registrationDeadline) >= 0 && ` (${daysUntil(c.registrationDeadline)}d)`}
                  </span>
                  <span>
                    Event {new Date(c.eventDate).toLocaleDateString()}
                    {daysUntil(c.eventDate) >= 0 && ` (${daysUntil(c.eventDate)}d)`}
                  </span>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/competitions/${r.competitionSlug}#manual`}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-accent"
                >
                  Manual & stage rules
                </Link>
                <Link
                  href={`/competitions/${r.competitionSlug}#practice`}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-accent"
                >
                  Practice resources
                </Link>
              </div>

              <div className="mt-3 border-t border-border pt-3">
                {result ? (
                  <p className="text-sm text-foreground">
                    Result: <span className="font-semibold">{result.customAwardLabel ?? result.award ?? "Released"}</span>
                    {result.score != null && <span className="text-muted"> · Score {result.score}</span>}
                  </p>
                ) : (
                  <p className="text-xs text-muted">Results not yet released for this competition.</p>
                )}
              </div>
            </div>
          );
        })}

        {registrations.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
            You haven&apos;t registered for any competitions yet.
          </div>
        )}
      </div>

      {registeredCompetitions.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Announcements</h2>
          <div className="space-y-3">
            {registeredCompetitions.flatMap((c) =>
              announcementsForCompetition(c.slug)
                .slice(0, 2)
                .map((a) => (
                  <div key={a.id} className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs font-semibold tracking-wide text-accent uppercase">{c.title}</p>
                    <p className="mt-1 font-medium text-foreground">{a.title}</p>
                    <p className="text-sm text-muted">{a.body}</p>
                  </div>
                )),
            )}
          </div>
        </section>
      )}

      <p className="mt-8 text-sm text-muted">
        Certificates and badges will be downloadable here once the platform supports them.
      </p>
    </div>
  );
}
