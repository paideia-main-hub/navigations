import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { listOpenCategories } from "@/domain/awards/service";
import { layerLabels } from "@/domain/awards/types";
import { Badge } from "@/ui/components/Badge";

export default async function NominateCategoryPickerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "judge" || user.role === "admin") redirect("/dashboard");

  const supabase = await createClient();
  const allOpen = await listOpenCategories(supabase);
  // Competition Distinctions and School Awards are computed, never
  // submitted, by anyone — everything else is listed here regardless of
  // role, same as the Competitions directory lists every competition
  // regardless of a visitor's grade. Eligibility (school vs. independent)
  // is checked on the submission page itself, not by hiding the category.
  const nominatable = allOpen.filter((c) => c.status === "open" && c.layer !== "competition_distinction" && c.layer !== "school_award");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Start a Nomination</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Every award category currently open for nominations. Categories marked{" "}
        <span className="font-semibold">School account required</span> must be submitted by a school coordinator —
        pick one to see exactly what&apos;s needed.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nominatable.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/nominate/${c.slug}`}
            className="rounded-xl border border-border bg-surface p-5 hover:border-accent"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{layerLabels[c.layer]}</Badge>
              {!c.allowsIndependent && <Badge tone="warning">School account required</Badge>}
            </div>
            <p className="mt-2 font-semibold text-foreground">{c.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
          </Link>
        ))}
        {nominatable.length === 0 && (
          <p className="col-span-full rounded-xl border border-border bg-surface p-8 text-center text-muted">
            No award categories are open for nominations right now.
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
