import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCategoryBySlug } from "@/domain/awards/service";
import { canRoleNominate } from "@/domain/award-nominations/service";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { layerLabels } from "@/domain/awards/types";
import { NominationWizard } from "@/ui/components/awards/NominationWizard";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function DashboardNominatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const category = await getCategoryBySlug(supabase, slug);
  if (!category || category.status !== "open") notFound();

  if (!canRoleNominate(category, user.role)) {
    return (
      <DashboardPage>
        <div className="mx-auto max-w-xl py-16 text-center">
          <p className="text-muted">
            {category.title} requires a participating school account.{" "}
            <Link href="/dashboard/nominate" prefetch className="font-semibold text-accent">
              Back to categories
            </Link>
            .
          </p>
        </div>
      </DashboardPage>
    );
  }

  if (user.role === "school_coordinator") {
    const school = await getCoordinatorSchool(supabase, user.id);
    if (!school) {
      return (
        <DashboardPage>
          <p className="text-muted">No school found for this coordinator account.</p>
        </DashboardPage>
      );
    }

    return (
      <>
        <DashboardHero
          eyebrow={layerLabels[category.layer]}
          title={category.title}
          subtitle={`Submitting on behalf of ${school.officialName}.`}
        />
        <DashboardPage>
          <div>
            <NominationWizard category={category} schoolId={school.id} />
          </div>
        </DashboardPage>
      </>
    );
  }

  return (
    <>
      <DashboardHero
        eyebrow={layerLabels[category.layer]}
        title={category.title}
        subtitle="Submitting as yourself."
      />
      <DashboardPage>
        <div>
          <NominationWizard category={category} defaultNomineeName={user.fullName} />
        </div>
      </DashboardPage>
    </>
  );
}
