import { createAdminClient } from "@/data/supabase/admin";
import { getPaymentAccount } from "@/domain/payments/service";
import { PaymentAccountForm } from "@/ui/components/admin/PaymentAccountForm";

export default async function AdminPaymentAccountPage() {
  const account = await getPaymentAccount(createAdminClient());

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Bank account</h1>
      <p className="mt-1 max-w-xl text-sm text-muted">
        The account students and school coordinators transfer competition fees into.
      </p>
      <div className="mt-6">
        <PaymentAccountForm account={account} />
      </div>
    </div>
  );
}
