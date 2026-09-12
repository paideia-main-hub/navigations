import Link from "next/link";
import { listOpenAndUpcoming } from "@/domain/competitions/service";
import { categoryLabels, statusLabels } from "@/domain/competitions/types";
import { Badge } from "@/ui/components/Badge";

export default function DashboardRegisterPage() {
  const competitions = listOpenAndUpcoming();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Register for a competition</h1>
      <p className="mt-2 max-w-xl text-muted">
        Choose a competition that&apos;s open or upcoming for registration.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {competitions.map((c) => (
          <div key={c.slug} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <Badge>{c.domain}</Badge>
              <Badge tone={c.status === "open" ? "success" : "warning"}>{statusLabels[c.status]}</Badge>
            </div>
            <p className="font-semibold text-foreground">{c.title}</p>
            <div className="flex flex-wrap gap-1">
              {c.eligibility.map((e) => (
                <span key={e.category} className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted">
                  {categoryLabels[e.category]}
                </span>
              ))}
            </div>
            <Link
              href={`/dashboard/register/${c.slug}`}
              className="mt-2 inline-block rounded-full bg-accent px-4 py-2 text-center text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Start registration
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
