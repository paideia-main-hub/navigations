import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listMyNominations, listSchoolNominations } from "@/domain/award-nominations/service";
import { MyNominationsTable } from "@/ui/components/dashboard/MyNominationsTable";
import { DashboardHero, dashboardHeroCtaClass } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function MyNominationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();

  const nominations =
    user.role === "school_coordinator"
      ? await (async () => {
          const school = await getCoordinatorSchool(supabase, user.id);
          return school ? listSchoolNominations(supabase, school.id) : [];
        })()
      : await listMyNominations(supabase, user.id);

  return (
    <>
      <DashboardHero
        eyebrow="Awards"
        title="My Nominations"
        subtitle="Every nomination you have submitted, plus any clarification requests."
      >
        <Link href="/dashboard/nominate" prefetch className={dashboardHeroCtaClass}>
          Start a nomination
        </Link>
      </DashboardHero>
      <DashboardPage>
        <div>
          <MyNominationsTable nominations={nominations} />
        </div>
      </DashboardPage>
    </>
  );
}
