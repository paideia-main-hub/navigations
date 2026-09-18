import { createAdminClient } from "@/data/supabase/admin";
import { adminListCategories } from "@/domain/awards/service";
import { adminListNominations } from "@/domain/award-nominations/service";
import { NominationsTable } from "@/ui/components/admin/NominationsTable";

export default async function AdminNominationsPage() {
  const admin = createAdminClient();
  const [categories, nominations] = await Promise.all([adminListCategories(admin), adminListNominations(admin)]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Nominations</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Every submission across Spotlight, Teacher/Parent, Sports and Principal categories. Open one to review
        evidence, assign scores, request clarification, or approve &amp; publish.
      </p>

      <div className="mt-6">
        <NominationsTable nominations={nominations} categories={categories.map((c) => ({ slug: c.slug, title: c.title }))} />
      </div>
    </div>
  );
}
