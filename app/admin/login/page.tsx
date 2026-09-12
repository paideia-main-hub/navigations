import { AdminLoginForm } from "@/ui/components/admin/AdminLoginForm";

export const metadata = { title: "Admin Login | Future Competence Series" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
        <h1 className="text-xl font-bold text-foreground">Admin Login</h1>
        <p className="mt-1 text-sm text-muted">Future Competence Series — administrator portal.</p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
