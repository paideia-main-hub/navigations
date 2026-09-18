import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listOpenCategories } from "@/domain/awards/service";
import { canRoleNominate } from "@/domain/award-nominations/service";
import { layerLabels } from "@/domain/awards/types";
import { Badge } from "@/ui/components/Badge";

export default async function NominateCategoryPickerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "judge" || user.role === "admin") redirect("/dashboard");

  const supabase = await createClient();
  const allOpen = await listOpenCategories(supabase);
  const eligible = allOpen.filter((c) => c.status === "open" && canRoleNominate(c, user.role));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Start a Nomination</h1>
      <p className="mt-2 max-w-2xl text-muted">
        {user.role === "school_coordinator"
          ? "Every award category your school can currently submit to."
          : "You can submit these categories directly, without a school account. Teacher, Parent, Sports and Principal recognition must come through a participating school."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eligible.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/nominate/${c.slug}`}
            className="rounded-xl border border-border bg-surface p-5 hover:border-accent"
          >
            <Badge>{layerLabels[c.layer]}</Badge>
            <p className="mt-2 font-semibold text-foreground">{c.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
          </Link>
        ))}
        {eligible.length === 0 && (
          <p className="col-span-full rounded-xl border border-border bg-surface p-8 text-center text-muted">
            No award categories are open for you to submit right now.
          </p>
        )}
      </div>

      <p className="mt-8 text-sm text-muted">
        Want the full criteria and eligibility details first?{" "}
        <Link href="/awards" className="font-semibold text-accent">
          Read about every award
        </Link>
        .
      </p>
    </div>
  );
}
