"use client";

import { useState, type ReactNode } from "react";

export function CompetitionTabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div className="scrollbar-none -mx-6 flex gap-1 overflow-x-auto border-b border-black/10 px-6 dark:border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap ${
              tab.id === activeTab?.id
                ? "border-teal-600 text-teal-700 dark:text-teal-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-8">{activeTab?.content}</div>
    </div>
  );
}
