"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import type { HeaderNotice } from "@/domain/announcements/types";
import { MenuScroll } from "@/ui/components/MenuScroll";
import { useSeenAnnouncements } from "@/ui/components/useSeenAnnouncements";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function AnnouncementBell({ userId, notices }: { userId: string; notices: HeaderNotice[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const { unseenCount, markAllSeen } = useSeenAnnouncements(userId, notices);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    setOpen((current) => {
      const next = !current;
      if (next) markAllSeen();
      return next;
    });
  }

  const badge = unseenCount > 99 ? "99+" : String(unseenCount);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={unseenCount > 0 ? `Announcements, ${unseenCount} new` : "Announcements"}
        onClick={toggle}
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-foreground hover:border-accent/50"
      >
        <BellIcon />
        {unseenCount > 0 ? (
          <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
            {badge}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          id={menuId}
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-background shadow-lg shadow-black/10"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-extrabold tracking-tight text-foreground">Announcements</p>
          </div>
          {notices.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">No announcements yet.</p>
          ) : (
            <MenuScroll className="max-h-80">
              <ul>
                {notices.slice(0, 6).map((notice) => (
                  <li key={notice.id} className="border-b border-border last:border-0">
                    <Link
                      href="/dashboard/announcements"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 hover:bg-surface-muted"
                    >
                      <p className="text-sm font-semibold text-foreground">{notice.title}</p>
                      {notice.competitionTitle ? (
                        <p className="mt-0.5 text-xs text-accent-strong">{notice.competitionTitle}</p>
                      ) : null}
                      <p className="mt-1 line-clamp-2 text-xs text-muted">{notice.body}</p>
                      <p className="mt-1 text-[11px] text-muted">
                        {new Date(notice.publishDate).toLocaleDateString("en-GB")}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </MenuScroll>
          )}
          <div className="border-t border-border px-4 py-2.5">
            <Link
              href="/dashboard/announcements"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-accent-strong hover:underline"
            >
              View all
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
