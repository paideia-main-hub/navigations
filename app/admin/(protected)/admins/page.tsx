import { createAdminClient } from "@/data/supabase/admin";
import { listAdmins } from "@/domain/admins/service";
import { CreateAdminForm } from "@/ui/components/admin/CreateAdminForm";

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

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Added</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{a.fullName}</td>
                <td className="px-4 py-3 text-muted">{a.email}</td>
                <td className="px-4 py-3 text-muted">{new Date(a.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <CreateAdminForm />
      </div>
    </div>
  );
}
