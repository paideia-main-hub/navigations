import { createAdminClient } from "@/data/supabase/admin";
import { listAdmins } from "@/domain/admins/service";
import { CreateAdminForm } from "@/ui/components/admin/CreateAdminForm";
import { AdminsTable } from "@/ui/components/admin/AdminsTable";

export default async function AdminAdminsPage() {
  const admin = createAdminClient();
  const admins = await listAdmins(admin);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Admins</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Everyone with full access to this console. There&apos;s no public admin sign-up — the only way in is being
        added here by an existing admin.
      </p>

      <div className="mt-6">
        <AdminsTable admins={admins} />
      </div>

      <div className="mt-6">
        <CreateAdminForm />
      </div>
    </div>
  );
}
