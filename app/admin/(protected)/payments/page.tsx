import { createAdminClient } from "@/data/supabase/admin";
import { listAllPayments } from "@/domain/payments/service";
import { PaymentsTable } from "@/ui/components/admin/PaymentsTable";

export default async function AdminPaymentsPage() {
  const admin = createAdminClient();
  const payments = await listAllPayments(admin);
  const pendingCount = payments.filter((p) => p.status === "pending_review").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Approvals</h1>
          <p className="mt-1 text-sm text-muted">
            Fee receipts uploaded during registration. Approving one doesn&apos;t change the registration&apos;s own
            status — it clears the payment side of &ldquo;under review&rdquo; so the entrant can see it&apos;s settled.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
            {pendingCount} awaiting review
          </span>
        )}
      </div>

      <div className="mt-6">
        <PaymentsTable payments={payments} />
      </div>

      {payments.length === 0 && (
        <p className="mt-4 text-xs text-muted">
          Nothing here yet — receipts appear as soon as a student, team or school coordinator uploads one during
          registration.
        </p>
      )}
    </div>
  );
}
