import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getPaymentAccount } from "@/domain/payments/service";
import { SchoolEntryPayment } from "@/ui/components/registration/SchoolEntryPayment";
import { StudentHamperPayment } from "@/ui/components/registration/StudentHamperPayment";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function RegisterPayPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "school_coordinator" && user.role !== "student")) {
    return (
      <DashboardPage>
        <p className="text-muted">Only students and school coordinators can check out a hamper here.</p>
      </DashboardPage>
    );
  }

  const paymentAccount = await getPaymentAccount(await createClient());

  return (
    <>
      <DashboardHero
        eyebrow="Register"
        title="Checkout"
        subtitle="One receipt covers every competition in your hamper."
      />
      <DashboardPage>
        {user.role === "student" ? (
          <StudentHamperPayment paymentAccount={paymentAccount} />
        ) : (
          <SchoolEntryPayment paymentAccount={paymentAccount} />
        )}
      </DashboardPage>
    </>
  );
}
