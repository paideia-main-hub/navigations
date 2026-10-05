import { createAdminClient } from "@/data/supabase/admin";
import { adminListCompetitions } from "@/domain/competitions/service";
import { Tabs } from "@/ui/components/Tabs";
import { BulkDatesForm } from "@/ui/components/admin/BulkDatesForm";
import { RandomDatesForm } from "@/ui/components/admin/RandomDatesForm";

export default async function AdminBulkDatesPage() {
  const admin = createAdminClient();
  const competitions = await adminListCompetitions(admin);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Set bulk dates for competitions</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Apply the same date to many competitions, or set different dates per competition from one place.
      </p>

      <div className="mt-6">
        <Tabs
          tabs={[
            {
              id: "bulk",
              label: "Set bulk dates",
              content: <BulkDatesForm competitions={competitions} />,
            },
            {
              id: "random",
              label: "Set random dates",
              content: <RandomDatesForm competitions={competitions} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
