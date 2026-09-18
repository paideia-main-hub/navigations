import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getCategoryBySlug } from "@/domain/awards/service";
import { getCoordinatorSchool } from "@/domain/schools/service";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { NominationWizard } from "@/ui/components/awards/NominationWizard";

export default async function NominatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const category = await getCategoryBySlug(supabase, slug);
  if (!category || category.status !== "open") notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?error=Sign+in+through+your+school+account%2C+or+register+as+an+independent+nominator%2C+to+submit+this+nomination.`);
  }

  if (user.role === "school_coordinator") {
    const school = await getCoordinatorSchool(supabase, user.id);
    if (!school) return <p className="p-6 text-muted">No school found for this coordinator account.</p>;

    return (
      <div className="bg-slate-50 dark:bg-slate-950">
        <PageBanner eyebrow={category.title} title="Submit a nomination" />
        <div className="mx-auto max-w-3xl px-6 py-12">
          <NominationWizard category={category} schoolId={school.id} />
        </div>
      </div>
    );
  }

  if (category.allowsIndependent) {
    return (
      <div className="bg-slate-50 dark:bg-slate-950">
        <PageBanner eyebrow={category.title} title="Submit a nomination" />
        <div className="mx-auto max-w-3xl px-6 py-12">
          <NominationWizard category={category} defaultNomineeName="Self" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <p className="text-muted">
        {category.title} requires a participating school account.{" "}
        <Link href="/register/school" className="font-semibold text-accent">
          Register your school
        </Link>{" "}
        first.
      </p>
    </div>
  );
}
