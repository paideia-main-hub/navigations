import { createAdminClient } from "@/data/supabase/admin";
import { adminListCategories } from "@/domain/awards/service";
import { listResults } from "@/domain/school-awards/service";
import { listAllSchools } from "@/domain/schools/service";
import { SchoolAwardsPanel } from "@/ui/components/admin/SchoolAwardsPanel";

export default async function AdminSchoolAwardsPage() {
  const admin = createAdminClient();
  const [allCategories, schools] = await Promise.all([adminListCategories(admin), listAllSchools(admin)]);
  const categories = allCategories.filter((c) => c.layer === "school_award");

  const resultsByCategory: Record<string, Awaited<ReturnType<typeof listResults>>> = {};
  for (const c of categories) {
    resultsByCategory[c.id] = await listResults(admin, c.id);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">School Awards</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Champion School, School Excellence, Whole School Participation and Diversified School are computed
        automatically — schools never nominate themselves. Collaboration &amp; Integrity is entered directly per
        school.
      </p>

      <div className="mt-6">
        <SchoolAwardsPanel
          categories={categories.map((c) => ({ id: c.id, slug: c.slug, title: c.title }))}
          resultsByCategory={resultsByCategory}
          schools={schools.map((s) => ({ id: s.id, officialName: s.officialName }))}
        />
      </div>
    </div>
  );
}
