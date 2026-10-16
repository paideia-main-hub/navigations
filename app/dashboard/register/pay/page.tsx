import { redirect } from "next/navigation";
import { getCurrentUser } from "@/domain/auth/session";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

/** Checkout lives in the hamper sheet now — deep links land on Register with the sheet open. */
export default async function RegisterPayPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "school_coordinator" && user.role !== "student")) {
    return (
      <DashboardPage>
        <p className="text-muted">Only students and school coordinators can check out a hamper here.</p>
      </DashboardPage>
    );
  }

  redirect("/dashboard/register?checkout=1");
}
