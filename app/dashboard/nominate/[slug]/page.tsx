import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCategoryBySlug } from "@/domain/awards/service";
import { canRoleNominate } from "@/domain/award-nominations/service";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { NominationWizard } from "@/ui/components/awards/NominationWizard";

export default async function DashboardNominatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const category = await getCategoryBySlug(supabase, slug);
  if (!category || category.status !== "open") notFound();

  if (!canRoleNominate(category, user.role)) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="text-muted">
          {category.title} requires a participating school account.{" "}
          <Link href="/dashboard/nominate" className="font-semibold text-accent">
            Back to categories
          </Link>
          .
        </p>
      </div>
    );
  }

  if (user.role === "school_coordinator") {
    const school = await getCoordinatorSchool(supabase, user.id);
    if (!school) return <p className="text-muted">No school found for this coordinator account.</p>;

    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground">{category.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">Submitting on behalf of {school.officialName}.</p>
        <div className="mt-6">
          <NominationWizard category={category} schoolId={school.id} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{category.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">Submitting as yourself.</p>
      <div className="mt-6">
        <NominationWizard category={category} defaultNomineeName={user.fullName} />
      </div>
    </div>
  );
}
