import { AdminLoginForm } from "@/ui/components/admin/AdminLoginForm";
import { Logo } from "@/ui/components/Logo";

export const metadata = { title: "Admin Login | Future Competence Series" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-deep px-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface p-8 shadow-xl">
        <Logo className="h-7 w-auto" />
        <h1 className="mt-4 text-xl font-bold text-foreground">Admin Console</h1>
        <p className="mt-1 text-sm text-muted">Restricted access — administrators only.</p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
