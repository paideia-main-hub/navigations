import Link from "next/link";
import { ForgotPasswordForm } from "@/ui/components/ForgotPasswordForm";

export const metadata = { title: "Forgot Password | Navigations" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Forgot your password?</h1>
      <p className="mt-1 text-sm text-muted">
        Enter the email on your account and we&apos;ll send you a link to set a new password.
      </p>

      <div className="mt-6">
        <ForgotPasswordForm />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-accent">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
