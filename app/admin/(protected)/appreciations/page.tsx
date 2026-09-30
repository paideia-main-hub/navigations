import { createAdminClient } from "@/data/supabase/admin";
import { listAppreciations } from "@/domain/appreciations/service";
import { AdminAppreciationsList } from "@/ui/components/admin/AdminAppreciationsList";

export default async function AdminAppreciationsPage() {
  const appreciations = await listAppreciations(createAdminClient());

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Appreciations</h1>
      <p className="mt-2 max-w-xl text-muted">
        Add a heading, description, the school names, and who it is by. Each one appears on the
        home page under Announcements.
      </p>
      <div className="mt-6">
        <AdminAppreciationsList appreciations={appreciations} />
      </div>
    </div>
  );
}
