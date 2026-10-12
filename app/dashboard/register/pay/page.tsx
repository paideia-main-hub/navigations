import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getPaymentAccount } from "@/domain/payments/service";
import { SchoolEntryPayment } from "@/ui/components/registration/SchoolEntryPayment";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function SchoolEntryPayPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "school_coordinator") {
    return (
      <DashboardPage>
        <p className="text-muted">Only a school coordinator registers students this way.</p>
      </DashboardPage>
    );
  }

  const paymentAccount = await getPaymentAccount(await createClient());

  return (
    <DashboardPage>
      <SchoolEntryPayment paymentAccount={paymentAccount} />
    </DashboardPage>
  );
}
