import { createAdminClient } from "@/data/supabase/admin";
import { adminListCategories } from "@/domain/awards/service";
import { BulkAwardDatesForm } from "@/ui/components/admin/BulkAwardDatesForm";

export default async function AdminBulkAwardDatesPage() {
  const admin = createAdminClient();
  const categories = await adminListCategories(admin);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Set bulk dates for awards</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Apply the same nomination closing date to multiple award categories without editing each one.
      </p>

      <div className="mt-6">
        <BulkAwardDatesForm categories={categories} />
      </div>
    </div>
  );
}
