// Same purpose as app/dashboard/loading.tsx, for every /admin/* route.
export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-48 rounded-lg bg-surface-muted" />
      <div className="h-10 w-full max-w-md rounded-lg bg-surface-muted" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}
