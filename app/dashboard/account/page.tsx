import { getCurrentUser } from "@/domain/auth/session";
import { ChangePasswordForm } from "@/ui/components/ChangePasswordForm";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Account</h1>
      <p className="mt-2 text-muted">{user.email}</p>

      <div className="mt-6 max-w-md">
        <h2 className="mb-3 font-semibold text-foreground">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
