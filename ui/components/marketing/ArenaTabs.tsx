"use client";

// Deliberately a separate component from ui/components/Tabs.tsx, which the
// admin competition editor also uses — this redesign must not touch that.
//
// Below the `lg` breakpoint this is the same horizontal scroll-strip it's
// always been; at `lg` and up it becomes a sticky vertical nav down the left
// side of the page, since 14 tabs no longer fit as a readable single row.
import { useEffect, useState, type ReactNode } from "react";

export interface ArenaTab {
  id: string;
  label: string;
  icon?: string;
  content: ReactNode;
}

export function ArenaTabs({ tabs }: { tabs: ArenaTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && tabs.some((t) => t.id === hash)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing to the URL hash, which isn't known during SSR
      setActive(hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectTab(id: string) {
    setActive(id);
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <div className="lg:flex lg:items-start lg:gap-10">
      <nav
        className="scrollbar-none -mx-6 mb-6 flex gap-1 overflow-x-auto border-b border-border px-6 pb-px lg:sticky lg:top-24 lg:mx-0 lg:mb-0 lg:w-72 lg:shrink-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:border-b-0 lg:border-r lg:px-0 lg:pr-6 lg:pb-0"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab?.id;
          return (
            <button
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-left text-sm font-semibold transition-colors
                lg:w-full lg:rounded-lg lg:border-b-0 lg:px-4 lg:py-2.5 ${
                isActive
                  ? "border-accent text-accent-strong lg:bg-accent-soft lg:text-accent-strong dark:lg:bg-accent-soft"
                  : "border-transparent text-muted hover:text-foreground lg:hover:bg-surface-muted"
              }`}
            >
              {tab.icon && <span className="text-base">{tab.icon}</span>}
              {tab.label}
            </button>
          );
        })}
      </nav>
      <div className="min-w-0 flex-1">{activeTab?.content}</div>
    </div>
  );
}
