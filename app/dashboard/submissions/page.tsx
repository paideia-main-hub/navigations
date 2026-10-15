import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { categoryLabels, type AgeCategory } from "@/domain/competitions/types";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { getOwnStudentProfile } from "@/domain/students/service";
import {
  listOnlineSubmissionCompetitions,
  listOwnRegistrationsIn,
  listSchoolRegistrationsIn,
  listSubmissionsForRegistrations,
} from "@/data/repositories/submissions.repository";
import { submissionConfigFor } from "@/domain/submissions/config";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";
import { WorkSubmissionsPanel } from "@/ui/components/dashboard/WorkSubmissionsPanel";

export default async function WorkSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "student" && user.role !== "school_coordinator") redirect("/dashboard");
  const { open: initialOpenId = null } = await searchParams;

  const supabase = await createClient();
  const online = await listOnlineSubmissionCompetitions(supabase);
  const onlineBySlug = new Map(online.map((competition) => [competition.slug, competition]));
  const slugs = online.map((competition) => competition.slug);

  const registrations =
    user.role === "school_coordinator"
      ? await (async () => {
          const school = await getCoordinatorSchool(supabase, user.id);
          if (!school) return [];
          return listSchoolRegistrationsIn(supabase, school.id, slugs);
        })()
      : await (async () => {
          const student = await getOwnStudentProfile(supabase, user.id);
          return listOwnRegistrationsIn(supabase, user.id, student?.id ?? null, slugs);
        })();

  const submissions = await listSubmissionsForRegistrations(
    supabase,
    registrations.map((r) => r.registrationId),
  );
  const byRegistration = new Map(submissions.map((s) => [s.registrationId, s]));

  return (
    <>
      <DashboardHero
        eyebrow="Competitions"
        title="Work Submissions"
        subtitle={
          user.role === "school_coordinator"
            ? "Track online work submissions for your school’s competition entries."
            : "Hand in your work for competitions that accept online submission."
        }
      />
      <DashboardPage>
        <WorkSubmissionsPanel
          mode={user.role === "school_coordinator" ? "school" : "student"}
          initialOpenId={initialOpenId}
          emptyMessage={
            user.role === "school_coordinator"
              ? "No school entries are in a competition that accepts online submission yet."
              : "You aren't registered in a competition that is open for online submission yet."
          }
          items={registrations.map((r) => {
            const s = byRegistration.get(r.registrationId) ?? null;
            const competition = onlineBySlug.get(r.competitionSlug);
            const config = submissionConfigFor(r.competitionSlug);
            return {
              registrationId: r.registrationId,
              competitionSlug: r.competitionSlug,
              competitionTitle: r.competitionTitle,
              registrationNumber: r.registrationNumber,
              entryType: r.entryType,
              entrantName: r.entrantName,
              schoolName: r.schoolName,
              grade: r.grade,
              categoryLabel: r.category ? (categoryLabels[r.category as AgeCategory] ?? r.category) : null,
              teamMembers: r.teamMembers,
              pathway: competition?.pathway,
              imageUrl: competition?.imageUrl,
              status: s?.status ?? null,
              totalScore: s?.totalScore ?? null,
              maxScore: s?.maxScore ?? null,
              hasForm: Boolean(config),
              config,
              initial: s,
            };
          })}
        />
      </DashboardPage>
    </>
  );
}
