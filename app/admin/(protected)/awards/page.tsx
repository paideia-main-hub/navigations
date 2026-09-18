import Link from "next/link";
import { createAdminClient } from "@/data/supabase/admin";
import { adminListCategories } from "@/domain/awards/service";
import { AwardCategoriesTable } from "@/ui/components/admin/AwardCategoriesTable";
import { CreateAwardCategoryForm } from "@/ui/components/admin/CreateAwardCategoryForm";

export default async function AdminAwardsPage() {
  const admin = createAdminClient();
  const categories = await adminListCategories(admin);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Awards</h1>
        <Link href="#create" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90">
          + New category
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-muted">
        The Future Ready League&apos;s five recognition layers. Competition Distinctions and School Awards need no
        submission form here — they&apos;re computed from existing competition data (see School Awards in the
        sidebar).
      </p>

      <div className="mt-6">
        <AwardCategoriesTable categories={categories} />
      </div>

      <div id="create" className="mt-8">
        <CreateAwardCategoryForm />
      </div>
    </div>
  );
}
