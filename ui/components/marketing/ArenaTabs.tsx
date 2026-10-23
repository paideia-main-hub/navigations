"use client";

// Deliberately a separate component from ui/components/Tabs.tsx, which the
// admin competition editor also uses — this redesign must not touch that.
//
// Mobile: accordion of every section. Desktop (lg+): sticky vertical nav + panel.
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
  const [active, setActive] = useState<string | null>(tabs[0]?.id ?? null);
  const activeTab = tabs.find((t) => t.id === active) ?? null;
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

  function toggleMobile(id: string) {
    const next = active === id ? null : id;
    setActive(next);
    if (next) history.replaceState(null, "", `#${next}`);
    else history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  return (
    <>
      {/* Mobile: accordion */}
      <div className="space-y-3 lg:hidden">
        {groups.map((group, groupIndex) => (
          <div key={`mobile-group-${groupIndex}-${group.label ?? "ungrouped"}`} className="space-y-2.5">
            {group.label ? (
              <p className="px-1 text-[11px] font-bold tracking-[0.16em] text-muted uppercase">{group.label}</p>
            ) : null}
            <ul className="space-y-2.5">
              {group.tabs.map((tab) => {
                const open = tab.id === active;
                const panelId = `${tablistId}-mobile-${tab.id}`;
                return (
                  <li
                    key={tab.id}
                    className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                      open
                        ? tab.emphasize
                          ? "border-accent bg-accent-soft shadow-[0_10px_28px_-18px_rgba(196,64,10,0.45)]"
                          : "border-accent bg-surface shadow-[0_10px_28px_-18px_rgba(196,64,10,0.45)]"
                        : "border-border bg-surface"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleMobile(tab.id)}
                      aria-expanded={open}
                      aria-controls={panelId}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left"
                    >
                      <span
                        className={`min-w-0 flex-1 text-sm font-semibold leading-snug ${
                          open ? "text-accent-strong" : "text-foreground"
                        }`}
                      >
                        {tab.label}
                      </span>
                      <span
                        aria-hidden
                        className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                          open ? "border-accent text-accent" : "border-border text-muted"
                        }`}
                      >
                        <span
                          className={`absolute h-2.5 w-px bg-current transition-transform duration-300 ${
                            open ? "rotate-90" : ""
                          }`}
                        />
                        <span className="absolute h-px w-2.5 bg-current" />
                      </span>
                    </button>
                    <div
                      id={panelId}
                      className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="border-t border-border px-4 pt-4 pb-5">
                          {open ? (
                            <div className="animate-faq-answer-in motion-reduce:animate-none">
                              {tab.content}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Desktop: sticky vertical nav + panel */}
      <div className="hidden lg:flex lg:items-start lg:gap-10">
        <nav
          aria-label="Competition sections"
          role="tablist"
          className="lg:sticky lg:top-24 lg:w-72 lg:shrink-0 lg:flex-col lg:gap-3 lg:pr-6"
        >
          <div className="flex flex-col gap-3">
            {groups.map((group, groupIndex) => {
              const isActionGroup = group.tabs.some((tab) => tab.emphasize);
              return (
                <div
                  key={`group-${groupIndex}-${group.label ?? "ungrouped"}`}
                  className={`flex flex-col gap-0.5 ${
                    isActionGroup
                      ? "rounded-xl border border-accent/35 bg-accent-soft p-2"
                      : "rounded-xl border border-accent/30 bg-surface p-2"
                  }`}
                  aria-labelledby={group.label ? `${tablistId}-${groupIndex}` : undefined}
                >
                  {group.label ? (
                    <div
                      id={`${tablistId}-${groupIndex}`}
                      className="mb-1.5 flex items-center gap-2 px-2.5 pt-1"
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
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                          isActive
                            ? tab.emphasize
                              ? "bg-accent text-accent-foreground"
                              : "bg-accent-soft text-accent-strong"
                            : tab.emphasize
                              ? "text-accent-strong hover:bg-surface"
                              : "text-muted hover:bg-surface-muted hover:text-foreground"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="min-w-0 flex-1 lg:sticky lg:top-24">
          <div
            key={activeTab?.id}
            className="mx-auto w-full max-w-2xl animate-modal-swap-in"
            role="tabpanel"
            id={`${tablistId}-panel-${activeTab?.id ?? "empty"}`}
            aria-labelledby={activeTab ? `${tablistId}-tab-${activeTab.id}` : undefined}
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
    </>
  );
}
