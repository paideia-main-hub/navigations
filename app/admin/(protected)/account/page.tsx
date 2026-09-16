import { requireAdminSession } from "@/domain/admin-auth/guard";
import { ChangePasswordForm } from "@/ui/components/ChangePasswordForm";

export default async function AdminAccountPage() {
  const session = await requireAdminSession();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Account</h1>
      <p className="mt-2 text-muted">{session.email}</p>

      <div className="mt-6 max-w-md">
        <h2 className="mb-3 font-semibold text-foreground">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
