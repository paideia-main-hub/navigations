// Instant navigation feedback for every /dashboard/* route — Next.js shows
// this immediately while the page's own Server Component data fetch is still
// in flight, instead of leaving the previous screen frozen with no
// indication anything is happening. Purely a loading state; the actual page
// renders exactly as it already did once its data resolves.
export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-48 rounded-lg bg-surface-muted" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-border bg-surface" />
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
