"use client";

// Deliberately a separate component from ui/components/Tabs.tsx, which the
// admin competition editor also uses — this redesign must not touch that.
//
// Below the `lg` breakpoint this is a horizontal scroll-strip; at `lg` and up
// it becomes a sticky vertical nav with optional group labels.
import { useEffect, useId, useState, type ReactNode } from "react";

export interface ArenaTab {
  id: string;
  label: string;
  icon?: string;
  /** Optional sidebar group label (desktop). Does not change tab content. */
  group?: string;
  /** Visually promote this item (e.g. Register) without removing other tabs. */
  emphasize?: boolean;
  content: ReactNode;
}

function groupTabs(tabs: ArenaTab[]) {
  const groups: { label: string | null; tabs: ArenaTab[] }[] = [];
  for (const tab of tabs) {
    const label = tab.group ?? null;
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.tabs.push(tab);
    } else {
      groups.push({ label, tabs: [tab] });
    }
  }
  return groups;
}

export function ArenaTabs({ tabs }: { tabs: ArenaTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];
  const tablistId = useId();
  const groups = groupTabs(tabs);

  useEffect(() => {
    function applyHash() {
      const hash = window.location.hash.slice(1);
      if (hash && tabs.some((t) => t.id === hash)) {
        setActive(hash);
      }
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tabs identity is stable for a given page render
  }, []);

  function selectTab(id: string) {
    setActive(id);
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <div className="lg:flex lg:items-start lg:gap-10">
      <nav
        aria-label="Competition sections"
        role="tablist"
        className="scrollbar-none -mx-6 mb-6 flex gap-1 overflow-x-auto border-b border-border px-6 pb-px lg:sticky lg:top-24 lg:mx-0 lg:mb-0 lg:w-72 lg:shrink-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:border-b-0 lg:px-0 lg:pr-6 lg:pb-0"
      >
        {groups.map((group, groupIndex) => {
          const isActionGroup = group.tabs.some((tab) => tab.emphasize);
          return (
            <div
              key={`group-${groupIndex}-${group.label ?? "ungrouped"}`}
              className={`flex gap-1 lg:flex-col lg:gap-0.5 ${
                isActionGroup
                  ? "lg:rounded-xl lg:border lg:border-accent/35 lg:bg-accent-soft lg:p-2"
                  : "lg:rounded-xl lg:border lg:border-accent/30 lg:bg-surface lg:p-2"
              }`}
              aria-labelledby={group.label ? `${tablistId}-${groupIndex}` : undefined}
            >
              {group.label ? (
                <div
                  id={`${tablistId}-${groupIndex}`}
                  className="mb-1.5 hidden items-center gap-2 px-2.5 pt-1 lg:flex"
                >
                  <p
                    className={`shrink-0 text-[11px] font-bold tracking-[0.16em] uppercase ${
                      isActionGroup ? "text-accent-strong" : "text-foreground"
                    }`}
                  >
                    {group.label}
                  </p>
                  <span
                    aria-hidden="true"
                    className={`h-px min-w-0 flex-1 ${
                      isActionGroup ? "bg-accent/40" : "bg-border"
                    }`}
                  />
                </div>
              ) : null}
              {group.tabs.map((tab) => {
                const isActive = tab.id === activeTab?.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`${tablistId}-tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`${tablistId}-panel-${tab.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => selectTab(tab.id)}
                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
                      lg:w-full lg:rounded-lg lg:border-b-0 lg:px-3 lg:py-2 ${
                      isActive
                        ? tab.emphasize
                          ? "border-accent bg-accent text-accent-foreground lg:bg-accent lg:text-accent-foreground"
                          : "border-accent text-accent-strong lg:bg-accent-soft lg:text-accent-strong"
                        : tab.emphasize
                          ? "border-transparent text-accent-strong lg:bg-transparent lg:hover:bg-surface"
                          : "border-transparent text-muted hover:text-foreground lg:hover:bg-surface-muted"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className="min-w-0 flex-1">
        <div
          key={activeTab?.id}
          className="mx-auto w-full max-w-2xl animate-modal-swap-in"
          role="tabpanel"
          id={`${tablistId}-panel-${activeTab?.id}`}
          aria-labelledby={`${tablistId}-tab-${activeTab?.id}`}
        >
          {activeTab ? (
            <h2 className="mb-5 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              {activeTab.label}
            </h2>
          ) : null}
          {activeTab?.content}
        </div>
      </div>
    </div>
  );
}
