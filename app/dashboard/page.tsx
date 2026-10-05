import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listSchoolRegistrations, listMyRegistrations } from "@/domain/registrations/service";
import { deriveDisplayStatus } from "@/domain/registrations/service";
import { listSchoolRoster, getOwnStudentProfile } from "@/domain/students/service";
import { listSchoolTeams } from "@/domain/teams/service";
import { listAssignments } from "@/domain/judging/service";
import { listMyApplications } from "@/domain/judge-applications/service";
import { listCompetitions } from "@/domain/competitions/service";
import { listAllAnnouncements } from "@/domain/announcements/service";
import { StatCard } from "@/ui/components/dashboard/StatCard";
import { StudentProfileCard } from "@/ui/components/dashboard/StudentProfileCard";
import { SchoolProfileCard } from "@/ui/components/dashboard/SchoolProfileCard";
import { QuickLink } from "@/ui/components/dashboard/QuickLink";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null; // the layout already redirects unauthenticated visitors

  const supabase = await createClient();

  if (user.role === "school_coordinator") {
    const school = await getCoordinatorSchool(supabase, user.id);
    if (!school) {
      return (
        <DashboardPage>
          <p className="text-muted">No school found for this coordinator account.</p>
        </DashboardPage>
      );
    }

    const [roster, teams, registrations, announcements] = await Promise.all([
      listSchoolRoster(supabase, school.id),
      listSchoolTeams(supabase, school.id),
      listSchoolRegistrations(supabase, school.id),
      listAllAnnouncements(supabase),
    ]);

    return (
      <>
        <DashboardHero
          eyebrow="Dashboard"
          title={`Welcome back, ${school.officialName}`}
          subtitle="Registrations, roster, teams, and results for your school."
        />
        <DashboardPage>
          <div>
            <SchoolProfileCard school={school} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Students" value={roster.length} />
            <StatCard label="Teams" value={teams.length} />
            <StatCard label="Registrations" value={registrations.length} />
            <StatCard label="Pending" value={registrations.filter((r) => r.status === "pending").length} />
          </div>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink href="/dashboard/registrations" icon="📋" title="Registrations" body="Track every active registration." />
            <QuickLink href="/dashboard/students" icon="🎓" title="Manage Students" body="View and add to your school roster." />
            <QuickLink href="/dashboard/teams" icon="👥" title="Manage Teams" body="Create and organize competition teams." />
            <QuickLink href="/dashboard/history" icon="📜" title="History & Results" body="Concluded competitions and winners." />
          </section>

          {announcements.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Latest Announcements</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {announcements.slice(0, 4).map((a) => (
                  <div key={a.id} className="rounded-xl border border-border bg-surface p-4">
                    <p className="font-medium text-foreground">{a.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{a.body}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </DashboardPage>
      </>
    );
  }

  if (user.role === "judge") {
    const [assignments, applications] = await Promise.all([listAssignments(supabase, user.id), listMyApplications(supabase, user.id)]);
    const pending = assignments.filter((a) => a.status === "pending").length;

    return (
      <>
        <DashboardHero
          eyebrow="Dashboard"
          title={`Welcome back, ${user.fullName}`}
          subtitle="Apply to judge, then score assigned entrants once you are approved."
        />
        <DashboardPage>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Assigned" value={assignments.length} />
            <StatCard label="Pending" value={pending} />
            <StatCard label="Scored" value={assignments.length - pending} />
          </div>

          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <QuickLink href="/dashboard/scoring" icon="✅" title="Score Entrants" body={`${pending} entrant(s) waiting on your score.`} />
            <QuickLink
              href="/dashboard/applications"
              icon="📝"
              title="Applications"
              body={applications.length === 0 ? "Apply to judge a competition." : `${applications.length} application(s) on file.`}
            />
          </section>
        </DashboardPage>
      </>
    );
  }

  // Student
  const [profile, registrations, allCompetitions, announcements] = await Promise.all([
    getOwnStudentProfile(supabase, user.id),
    listMyRegistrations(supabase, user.id),
    listCompetitions(supabase),
    listAllAnnouncements(supabase),
  ]);
  const competitionsBySlug = new Map(allCompetitions.map((c) => [c.slug, c]));

  const displayStatuses = registrations.map((r) => deriveDisplayStatus(r, competitionsBySlug.get(r.competitionSlug)));
  const counts = {
    registered: displayStatuses.filter((s) => s === "registered").length,
    upcoming: displayStatuses.filter((s) => s === "upcoming").length,
    in_progress: displayStatuses.filter((s) => s === "in_progress").length,
    qualified: displayStatuses.filter((s) => s === "qualified").length,
    completed: displayStatuses.filter((s) => s === "completed").length,
  };

  return (
    <>
      <DashboardHero
        eyebrow="Dashboard"
        title={`Welcome back, ${user.fullName}`}
        subtitle="Your competitions, submissions, nominations, and results."
      />
      <DashboardPage>
        {profile && (
          <div className="mt-6">
            <StudentProfileCard fullName={user.fullName} profile={profile} />
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard label="Registered" value={counts.registered} />
          <StatCard label="Upcoming" value={counts.upcoming} />
          <StatCard label="In Progress" value={counts.in_progress} />
          <StatCard label="Qualified" value={counts.qualified} />
          <StatCard label="Completed" value={counts.completed} />
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <QuickLink href="/dashboard/competitions" icon="🏆" title="My Competitions" body="Deadlines, manuals and practice resources." />
          <QuickLink href="/dashboard/history" icon="📜" title="History & Results" body="Concluded competitions and results." />
          <QuickLink href="/dashboard/register" icon="➕" title="Register" body="Sign up for a new competition." />
        </section>

        {announcements.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Latest Announcements</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {announcements.slice(0, 4).map((a) => (
                <div key={a.id} className="rounded-xl border border-border bg-surface p-4">
                  <p className="font-medium text-foreground">{a.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{a.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </DashboardPage>
    </>
  );
}
