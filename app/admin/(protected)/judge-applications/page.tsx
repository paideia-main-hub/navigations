import { createAdminClient } from "@/data/supabase/admin";
import { adminListApplications } from "@/domain/judge-applications/service";
import { JudgeApplicationsList } from "@/ui/components/admin/JudgeApplicationsList";

export default async function AdminJudgeApplicationsPage() {
  const admin = createAdminClient();
  const applications = await adminListApplications(admin);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Judge Applications</h1>
      <p className="mt-2 max-w-xl text-muted">
        Review applications, schedule an interview slot, then approve to grant the judge access to
        score every entrant in that competition.
      </p>
      <div className="mt-6">
        <JudgeApplicationsList applications={applications} />
      </div>
    </div>
  );
}
