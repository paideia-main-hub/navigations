import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listSchoolRegistrations, listMyRegistrations } from "@/domain/registrations/service";
import { listSchoolRoster, getOwnStudentProfile } from "@/domain/students/service";
import { listSchoolTeams } from "@/domain/teams/service";
import { listAssignments } from "@/domain/judging/service";
import { listMyApplications } from "@/domain/judge-applications/service";
import { getPublishedResultsFor } from "@/domain/results/service";
import { listCompetitions, listOpenAndUpcoming } from "@/domain/competitions/service";
import { listAllAnnouncements } from "@/domain/announcements/service";
import type { Competition } from "@/domain/competitions/types";
import type { Announcement } from "@/domain/announcements/types";
import { StudentDashboard } from "@/ui/components/dashboard/StudentDashboard";
import { SchoolDashboard } from "@/ui/components/dashboard/SchoolDashboard";
import { JudgeDashboard } from "@/ui/components/dashboard/JudgeDashboard";

function groupAnnouncementsByCompetition(announcements: Announcement[]): Map<string, Announcement[]> {
  const map = new Map<string, Announcement[]>();
  for (const a of announcements) {
    if (!a.competitionSlug) continue;
    const list = map.get(a.competitionSlug) ?? [];
    list.push(a);
    map.set(a.competitionSlug, list);
  }
  return map;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const role = user?.role ?? "student";
  const supabase = await createClient();

  if (role === "school_coordinator" && user) {
    const school = await getCoordinatorSchool(supabase, user.id);
    if (!school) {
      return <p className="text-muted">No school found for this coordinator account.</p>;
    }

    const [roster, teams, registrations, allCompetitions, allAnnouncements] = await Promise.all([
      listSchoolRoster(supabase, school.id),
      listSchoolTeams(supabase, school.id),
      listSchoolRegistrations(supabase, school.id),
      listCompetitions(supabase),
      listAllAnnouncements(supabase),
    ]);

    const registeredSlugs = new Set(registrations.map((r) => r.competitionSlug));
    const registeredCompetitions = allCompetitions.filter((c) => registeredSlugs.has(c.slug));
    const announcementsByCompetition = groupAnnouncementsByCompetition(allAnnouncements);

    return (
      <SchoolDashboard
        school={school}
        roster={roster}
        teams={teams}
        registrations={registrations}
        registeredCompetitions={registeredCompetitions}
        announcementsByCompetition={announcementsByCompetition}
      />
    );
  }

  if (role === "judge" && user) {
    const [assignments, applications, openCompetitions] = await Promise.all([
      listAssignments(supabase, user.id),
      listMyApplications(supabase, user.id),
      listOpenAndUpcoming(supabase),
    ]);

    return <JudgeDashboard assignments={assignments} applications={applications} openCompetitions={openCompetitions} />;
  }

  if (role === "admin") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Console</h1>
        <p className="mt-2 max-w-xl text-muted">
          The admin CMS lives at{" "}
          <Link href="/admin" className="font-semibold text-accent">
            /admin
          </Link>{" "}
          (separate login).
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <StudentDashboard
        fullName=""
        profile={null}
        registrations={[]}
        results={new Map()}
        competitionsBySlug={new Map<string, Competition>()}
        announcementsByCompetition={new Map<string, Announcement[]>()}
      />
    );
  }

  const [profile, registrations, allCompetitions, allAnnouncements] = await Promise.all([
    getOwnStudentProfile(supabase, user.id),
    listMyRegistrations(supabase, user.id),
    listCompetitions(supabase),
    listAllAnnouncements(supabase),
  ]);
  const results = await getPublishedResultsFor(supabase, registrations.map((r) => r.id));
  const competitionsBySlug = new Map(allCompetitions.map((c) => [c.slug, c]));
  const announcementsByCompetition = groupAnnouncementsByCompetition(allAnnouncements);

  return (
    <StudentDashboard
      fullName={user.fullName}
      profile={profile}
      registrations={registrations}
      results={results}
      competitionsBySlug={competitionsBySlug}
      announcementsByCompetition={announcementsByCompetition}
    />
  );
}
