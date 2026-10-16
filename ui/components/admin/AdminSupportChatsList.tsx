"use client";

import { useMemo, useState } from "react";
import type { SupportChatLogRow } from "@/domain/support/logs";

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AdminSupportChatsList({ rows }: { rows: SupportChatLogRow[] }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.userMessage.toLowerCase().includes(q) ||
        row.assistantReply.toLowerCase().includes(q) ||
        (row.pagePath ?? "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-surface px-4 py-8 text-sm text-muted">
        No support chats logged yet. They appear here after visitors use Ask Navigations.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="block min-w-[16rem] flex-1 text-sm">
          <span className="font-semibold text-foreground">Search questions</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Fee, registration, Argumentor…"
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-accent"
          />
        </label>
        <p className="text-sm text-muted">
          Showing {filtered.length} of {rows.length}
        </p>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {filtered.map((row) => {
          const open = openId === row.id;
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : row.id)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-background/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{row.userMessage}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{row.assistantReply}</p>
                  <p className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                    <span>{formatWhen(row.createdAt)}</span>
                    {row.pagePath ? <span>· {row.pagePath}</span> : null}
                    {row.hadScreenshot ? (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent-strong">
                        Screenshot
                      </span>
                    ) : null}
                    {row.hadVoice ? (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent-strong">
                        Voice
                      </span>
                    ) : null}
                    {row.needsHuman ? (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent-strong">
                        WhatsApp suggested
                      </span>
                    ) : null}
                    {row.needsLogin ? (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent-strong">
                        Login suggested
                      </span>
                    ) : null}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-accent-strong">{open ? "Hide" : "View"}</span>
              </button>
              {open ? (
                <div className="space-y-3 border-t border-border bg-background px-4 py-3 text-sm">
                  <div>
                    <p className="text-xs font-bold tracking-wide text-muted uppercase">Visitor</p>
                    <p className="mt-1 whitespace-pre-wrap text-foreground">{row.userMessage}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wide text-muted uppercase">Assistant</p>
                    <p className="mt-1 whitespace-pre-wrap text-foreground">{row.assistantReply}</p>
                  </div>
                  <p className="text-xs text-muted">Session {row.sessionId}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
