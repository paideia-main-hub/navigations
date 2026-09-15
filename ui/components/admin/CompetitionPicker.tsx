"use client";

import { useRouter } from "next/navigation";

export function CompetitionPicker({
  competitions,
  selectedId,
}: {
  competitions: { id: string; title: string }[];
  selectedId: string | null;
}) {
  const router = useRouter();

  return (
    <select
      value={selectedId ?? ""}
      onChange={(e) => router.push(e.target.value ? `/admin/results?competition=${e.target.value}` : "/admin/results")}
      className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
    >
      <option value="">Select a competition…</option>
      {competitions.map((c) => (
        <option key={c.id} value={c.id}>
          {c.title}
        </option>
      ))}
    </select>
  );
}
