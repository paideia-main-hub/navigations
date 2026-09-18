"use client";

import { useMemo, useState } from "react";

export interface DataTableFilter<T> {
  label: string;
  options: { label: string; value: string }[];
  predicate: (row: T, value: string) => boolean;
}

/** Shared search + filter-by + pagination shell for every admin/dashboard
 * table. Owns query/filter/page state and hands back only the current
 * page's slice — the caller still renders its own <table> (columns and row
 * markup differ too much per table to generalize), via the children
 * render-prop. Filtering runs against the full `rows` array on every
 * keystroke, which is fine at this app's scale (dozens–low hundreds of rows
 * per table, not paginated at the database level). */
export function DataTable<T>({
  rows,
  searchPlaceholder = "Search…",
  searchFields,
  filters = [],
  pageSize = 10,
  emptyMessage = "Nothing here yet.",
  children,
}: {
  rows: T[];
  searchPlaceholder?: string;
  /** Returns the row's searchable text fields; omit to disable the search box. */
  searchFields?: (row: T) => (string | null | undefined)[];
  filters?: DataTableFilter<T>[];
  pageSize?: number;
  emptyMessage?: string;
  children: (pageRows: T[]) => React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<number, string>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = rows;

    const q = query.trim().toLowerCase();
    if (q && searchFields) {
      result = result.filter((row) => searchFields(row).some((field) => field?.toLowerCase().includes(q)));
    }

    filters.forEach((filter, i) => {
      const value = filterValues[i];
      if (value && value !== "all") {
        result = result.filter((row) => filter.predicate(row, value));
      }
    });

    return result;
  }, [rows, query, filterValues, filters, searchFields]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function updateFilter(i: number, value: string) {
    setFilterValues((prev) => ({ ...prev, [i]: value }));
    setPage(1);
  }

  const hasControls = Boolean(searchFields) || filters.length > 0;

  return (
    <div>
      {hasControls && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {searchFields && (
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="min-w-[200px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          )}
          {filters.map((filter, i) => (
            <select
              key={filter.label}
              value={filterValues[i] ?? "all"}
              onChange={(e) => updateFilter(i, e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">{filter.label}: All</option>
              {filter.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
          <p className="text-sm text-muted sm:ml-auto">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
          {rows.length === 0 ? emptyMessage : "No results match your search or filters."}
        </div>
      ) : (
        children(pageRows)
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <p className="text-muted">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="rounded-full border border-border px-3 py-1.5 font-semibold text-foreground hover:border-accent disabled:opacity-40 disabled:hover:border-border"
            >
              Prev
            </button>
            {totalPages <= 7 &&
              Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-full text-xs font-semibold ${
                    n === currentPage ? "bg-accent text-accent-foreground" : "text-muted hover:bg-surface-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="rounded-full border border-border px-3 py-1.5 font-semibold text-foreground hover:border-accent disabled:opacity-40 disabled:hover:border-border"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
