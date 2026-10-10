// Only the main column swaps during navigations — hero chrome + sidebar stay
// mounted in DashboardShell, so no background flicker.
export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse space-y-6">
      <p className="text-sm font-semibold text-muted">Loading…</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-border bg-surface" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}
