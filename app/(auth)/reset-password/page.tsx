import { redirect } from "next/navigation";
import { getCurrentUser } from "@/domain/auth/session";
import { ChangePasswordForm } from "@/ui/components/ChangePasswordForm";

export const metadata = { title: "Reset Password | Future Competence Series" };

export default async function ResetPasswordPage() {
  // Reached only after app/auth/confirm/route.ts verifies the emailed
  // recovery link, which establishes a real session — no session here means
  // the link was missing, expired, or already used.
  const user = await getCurrentUser();
  if (!user) redirect("/forgot-password");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Set a new password</h1>
      <p className="mt-1 text-sm text-muted">Choose a new password for {user.email}.</p>

      <div className="mt-6">
        <ChangePasswordForm submitLabel="Set new password" />
      </div>
    </div>
  );
}
