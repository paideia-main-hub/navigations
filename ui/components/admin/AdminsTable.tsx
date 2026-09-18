"use client";

import type { AdminAccount } from "@/domain/admins/types";
import { DataTable } from "@/ui/components/DataTable";

export function AdminsTable({ admins }: { admins: AdminAccount[] }) {
  return (
    <DataTable
      rows={admins}
      searchPlaceholder="Search by name or email…"
      searchFields={(a) => [a.fullName, a.email]}
      emptyMessage="No admins found."
    >
      {(pageRows) => (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{a.fullName}</td>
                  <td className="px-4 py-3 text-muted">{a.email}</td>
                  <td className="px-4 py-3 text-muted">{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DataTable>
  );
}
