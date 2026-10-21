"use client";

import type { School } from "@/domain/schools/types";
import { DataTable } from "@/ui/components/DataTable";

function whatsappHref(mobile: string): string | null {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length < 7) return null;
  return `https://wa.me/${digits}`;
}

export function SchoolsTable({ schools }: { schools: School[] }) {
  const countryOptions = Array.from(new Set(schools.map((s) => s.country).filter((c): c is string => Boolean(c)))).sort();

  return (
    <DataTable
      rows={schools}
      searchPlaceholder="Search by name, city or coordinator…"
      searchFields={(s) => [
        s.officialName,
        s.city,
        s.country,
        ...(s.coordinators ?? []).flatMap((c) => [c.name, c.mobile]),
      ]}
      filters={[
        {
          label: "Country",
          options: countryOptions.map((c) => ({ value: c, label: c })),
          predicate: (s, value) => s.country === value,
        },
      ]}
      dateField={(s) => s.createdAt}
      emptyMessage="No schools registered yet."
    >
      {(pageRows) => (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Coordinator</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Country</th>
                <th className="px-4 py-3 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{s.officialName}</td>
                  <td className="px-4 py-3 text-muted">
                    {(s.coordinators ?? []).length > 0 ? (
                      <ol className="list-decimal space-y-2 pl-4">
                        {(s.coordinators ?? []).map((coordinator) => {
                          const href = coordinator.mobile
                            ? whatsappHref(coordinator.mobile)
                            : null;
                          return (
                            <li key={coordinator.name}>
                              <div className="font-medium text-foreground">{coordinator.name}</div>
                              {coordinator.mobile ? (
                                href ? (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-accent underline-offset-2 hover:underline"
                                  >
                                    {coordinator.mobile}
                                  </a>
                                ) : (
                                  <span className="text-sm">{coordinator.mobile}</span>
                                )
                              ) : (
                                <span className="text-sm">—</span>
                              )}
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{s.city ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{s.country ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{s.schoolType ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DataTable>
  );
}
