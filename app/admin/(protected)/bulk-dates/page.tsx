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
      <p className="mt-2 max-w-3xl text-sm text-muted">
        By category: set venue, online submission, and all matching date slots for many competitions at once — or give
        each competition its own date on the second tab.
      </p>

      <div className="mt-6">
        <Tabs
          tabs={[
            {
              id: "bulk",
              label: "Set by category",
              content: <BulkDatesForm competitions={competitions} />,
            },
            {
              id: "random",
              label: "Set per competition",
              content: <RandomDatesForm competitions={competitions} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
