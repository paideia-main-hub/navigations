import Link from "next/link";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listOpenAndUpcoming } from "@/domain/competitions/service";
import { getPaymentAccount } from "@/domain/payments/service";
import { categoryLabels, statusLabels } from "@/domain/competitions/types";
import { listMyRegistrations } from "@/domain/registrations/service";
import { getOwnStudentProfile } from "@/domain/students/service";
import { Badge } from "@/ui/components/Badge";
import { CompetitionBasket } from "@/ui/components/dashboard/CompetitionBasket";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function DashboardRegisterPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();

  if (user.role === "student") {
    const [competitions, registrations, student, paymentAccount] = await Promise.all([
      listOpenAndUpcoming(supabase),
      listMyRegistrations(supabase, user.id),
      getOwnStudentProfile(supabase, user.id),
      getPaymentAccount(supabase),
    ]);
    const registeredSlugs = registrations.filter((r) => r.status !== "rejected").map((r) => r.competitionSlug);

    return (
      <>
        <DashboardHero
          eyebrow="Competitions"
          title="Register for competitions"
          subtitle="Add as many competitions as you like, then check out once: confirm your details, give consent, and pay one total with a single receipt."
        />
        <DashboardPage>
          <div className="mt-6">
            {student ? (
              <CompetitionBasket
                competitions={competitions}
                registeredSlugs={registeredSlugs}
                student={{
                  fullName: student.fullName,
                  frlId: student.frlId,
                  grade: student.grade,
                  schoolName: student.schoolName ?? null,
                }}
                paymentAccount={paymentAccount}
              />
            ) : (
              <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
                No student profile is linked to this account yet, so registration isn&apos;t available.
              </p>
            )}
          </div>
        </DashboardPage>
      </>
    );
  }

  const competitions = await listOpenAndUpcoming(supabase);

  return (
    <>
      <DashboardHero
        eyebrow="Competitions"
        title="Register"
        subtitle="Open and upcoming competitions you can enter now."
      />
      <DashboardPage>
      <div className="grid gap-4 sm:grid-cols-2">
        {competitions.map((c) => (
          <div key={c.slug} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <Badge>{c.domain}</Badge>
              <Badge tone={c.status === "open" ? "success" : "warning"}>{statusLabels[c.status]}</Badge>
            </div>
            <p className="font-semibold text-foreground">{c.title}</p>
            <div className="flex flex-wrap gap-1">
              {c.eligibility.map((e) => (
                <span key={e.id} className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted">
                  {categoryLabels[e.category]}
                </span>
              ))}
            </div>
            <Link
              href={`/dashboard/register/${c.slug}`}
              prefetch
              className="mt-2 inline-block cursor-pointer rounded-full bg-accent px-4 py-2 text-center text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Start registration
            </Link>
          </div>
        ))}
        {competitions.length === 0 && <p className="text-muted">No competitions are open for registration right now.</p>}
      </div>
      </DashboardPage>
    </>
  );
}
