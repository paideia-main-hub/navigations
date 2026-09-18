"use client";

import Link from "next/link";
import type { AwardCategory } from "@/domain/awards/types";
import { layerLabels } from "@/domain/awards/types";
import { AwardCategoryStatusControl } from "@/ui/components/admin/AwardCategoryStatusControl";
import { DataTable } from "@/ui/components/DataTable";

export function AwardCategoriesTable({ categories }: { categories: AwardCategory[] }) {
  return (
    <DataTable
      rows={categories}
      searchPlaceholder="Search by title or slug…"
      searchFields={(c) => [c.title, c.slug]}
      filters={[
        {
          label: "Layer",
          options: Object.entries(layerLabels).map(([value, label]) => ({ value, label })),
          predicate: (c, value) => c.layer === value,
        },
      ]}
      emptyMessage="No award categories yet. Create the first one to get started."
    >
      {(pageRows) => (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Layer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="text-xs text-muted">/{c.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{layerLabels[c.layer]}</td>
                  <td className="px-4 py-3">
                    <AwardCategoryStatusControl categoryId={c.id} status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/awards/${c.id}`} className="text-sm font-semibold text-accent">
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DataTable>
  );
}
