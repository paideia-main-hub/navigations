// Static placeholder figures, by design — see the redesign plan's confirmed
// scope. Not wired to real counts.
const stats = [
  { value: "14,200+", label: "Active Competitors" },
  { value: "480+", label: "Accredited Institutions" },
  { value: "$126K", label: "Rewards Distributed" },
];

export function StatBar() {
  return (
    <div className="grid grid-cols-1 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {stats.map((s) => (
        <div key={s.label} className="px-6 py-5 text-center sm:text-left">
          <p className="text-2xl font-bold text-white">{s.value}</p>
          <p className="mt-1 text-sm text-slate-400">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
