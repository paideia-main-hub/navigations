// Mirrors the spec's own "How It Works" sequence (section 5, Home page
// requirements): Sign Up → Choose Competition → Register → Prepare →
// Participate → Results.
const steps = ["Sign Up", "Choose Competition", "Register", "Prepare", "Participate", "Results"];

export function RoadmapSteps() {
  return (
    <div className="relative">
      {/* Connecting "road", fading toward gold at the podium — desktop only,
          since the grid stacks to fewer columns on small screens. */}
      <div className="absolute top-6 right-[8%] left-[8%] hidden h-0.5 bg-gradient-to-r from-blue-300 via-blue-500 to-amber-400 sm:block dark:from-blue-800 dark:via-blue-500 dark:to-amber-400" />

      <ol className="relative grid gap-8 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <li key={step} className="flex flex-col items-center text-center">
              <div
                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-base font-bold shadow-md ring-4 ring-slate-50 dark:ring-slate-950 ${
                  isLast ? "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950" : "bg-blue-600 text-white"
                }`}
              >
                {isLast ? "🏆" : i + 1}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{step}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
