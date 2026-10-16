"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { HeaderNotice } from "@/domain/announcements/types";

function storageKey(userId: string) {
  return `frl-seen-announcements:${userId}`;
}

function readSeen(userId: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(userId)) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/** Tracks which header announcements this user has already opened. */
export function useSeenAnnouncements(userId: string, notices: HeaderNotice[]) {
  const pathname = usePathname();
  const [seen, setSeen] = useState<string[] | null>(null);

  function remember(ids: string[]) {
    const next = [...new Set([...(seen ?? readSeen(userId)), ...ids])];
    localStorage.setItem(storageKey(userId), JSON.stringify(next));
    setSeen(next);
  }

  useEffect(() => {
    setSeen(readSeen(userId));
  }, [userId]);

  useEffect(() => {
    if (seen == null) return;
    if (pathname !== "/dashboard/announcements") return;
    const unseen = notices.some((notice) => !seen.includes(notice.id));
    if (unseen) remember(notices.map((notice) => notice.id));
    // remember closes over latest seen; only re-run when route/notices/seen change.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mark-all on announcements page visit
  }, [pathname, notices, seen, userId]);

  const unseenCount = seen == null ? 0 : notices.filter((notice) => !seen.includes(notice.id)).length;

  function markAllSeen() {
    remember(notices.map((notice) => notice.id));
  }

  return { unseenCount, markAllSeen };
}
