"use client";

import { useMemo, useState } from "react";
import { FilterSelect, filterInputClass } from "@/ui/components/FilterSelect";

export interface DataTableFilter<T> {
  label: string;
  options: { label: string; value: string }[];
  predicate: (row: T, value: string) => boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

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
  pageSize: initialPageSize = 10,
  emptyMessage = "Nothing here yet.",
  actions,
  children,
}: {
  rows: T[];
  searchPlaceholder?: string;
  /** Returns the row's searchable text fields; omit to disable the search box. */
  searchFields?: (row: T) => (string | null | undefined)[];
  filters?: DataTableFilter<T>[];
  pageSize?: number;
  emptyMessage?: string;
  /** Sits on the top-right of the result count, above the filters. */
  actions?: React.ReactNode;
  children: (pageRows: T[]) => React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<number, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

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
  const pageStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, filtered.length);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function updateFilter(i: number, value: string) {
    setFilterValues((prev) => ({ ...prev, [i]: value }));
    setPage(1);
  }

  function updatePageSize(value: string) {
    const next = Number(value);
    if (!Number.isFinite(next) || next <= 0) return;
    setPageSize(next);
    setPage(1);
  }

  const hasControls = Boolean(searchFields) || filters.length > 0;
  const showPager = filtered.length > 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent-strong">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {actions}
          {showPager ? (
            <label className="flex items-center gap-2 text-sm text-muted">
              <span className="whitespace-nowrap">Rows per page</span>
              <select
                value={String(pageSize)}
                onChange={(e) => updatePageSize(e.target.value)}
                aria-label="Rows per page"
                className={`${filterInputClass} w-auto min-w-[4.5rem] bg-surface! py-1.5`}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
                {!PAGE_SIZE_OPTIONS.includes(pageSize as (typeof PAGE_SIZE_OPTIONS)[number]) ? (
                  <option value={pageSize}>{pageSize}</option>
                ) : null}
              </select>
            </label>
          ) : null}
        </div>
      </div>
      {hasControls && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {searchFields && (
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className={`min-w-[200px] flex-1 ${filterInputClass} bg-surface!`}
            />
          )}
          {filters.map((filter, i) => (
            <FilterSelect
              key={filter.label}
              value={filterValues[i] ?? "all"}
              onChange={(value) => updateFilter(i, value)}
              aria-label={filter.label}
              className="w-full sm:w-52"
              triggerClassName="bg-surface!"
              options={[
                { value: "all", label: `${filter.label}: All` },
                ...filter.options,
              ]}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
          {rows.length === 0 ? emptyMessage : "No results match your search or filters."}
        </div>
      ) : (
        children(pageRows)
      )}

      {showPager ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted">
            Showing {pageStart}–{pageEnd} of {filtered.length}
            {totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : null}
          </p>
          {totalPages > 1 ? (
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
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
