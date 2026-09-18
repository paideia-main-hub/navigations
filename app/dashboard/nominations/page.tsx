import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { listMyNominations, listSchoolNominations } from "@/domain/award-nominations/service";
import { MyNominationsTable } from "@/ui/components/dashboard/MyNominationsTable";

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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">My Nominations</h1>
        <Link href="/dashboard/nominate" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90">
          Start a nomination
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-muted">Track every award nomination you&apos;ve submitted, and respond to any clarification requests.</p>

      <div className="mt-6">
        <MyNominationsTable nominations={nominations} />
      </div>
    </div>
  );
}
