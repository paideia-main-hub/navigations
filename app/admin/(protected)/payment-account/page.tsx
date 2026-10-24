import { createAdminClient } from "@/data/supabase/admin";
import { getPaymentAccount, listReceiptExemptions } from "@/domain/payments/service";
import { listAllSchools } from "@/domain/schools/service";
import { PaymentAccountForm } from "@/ui/components/admin/PaymentAccountForm";
import { ReceiptExemptionPanel } from "@/ui/components/admin/ReceiptExemptionPanel";

export default async function AdminPaymentAccountPage() {
  const admin = createAdminClient();
  const [account, exemptions, schools] = await Promise.all([
    getPaymentAccount(admin),
    listReceiptExemptions(admin),
    listAllSchools(admin),
  ]);

  const schoolOptions = schools.map((school) => ({
    id: school.id,
    name: school.officialName,
    coordinatorLabel: school.coordinators?.[0]?.name ?? null,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Bank account</h1>
      <p className="mt-1 max-w-xl text-sm text-muted">
        The account students and school coordinators transfer competition fees into.
      </p>
      <div className="mt-6">
        <PaymentAccountForm account={account} />
        <ReceiptExemptionPanel exemptions={exemptions} schools={schoolOptions} />
      </div>
    </div>
  );
}
