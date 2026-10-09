"use client";

import { useLayoutEffect, useRef, useState, type ReactNode, type Ref, type UIEvent } from "react";

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(node);
  else ref.current = node;
}

/** Scrollable dropdown body. The native bar is hidden; a thin thumb sits on
 * the right edge, with no arrow buttons. */
export function MenuScroll({
  className = "",
  children,
  scrollRef,
  id,
  role,
  "aria-label": ariaLabel,
}: {
  className?: string;
  children: ReactNode;
  scrollRef?: Ref<HTMLDivElement>;
  id?: string;
  role?: string;
  "aria-label"?: string;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ height: 0, top: 0, visible: false });

  function sync() {
    const el = innerRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 1) {
      setThumb((prev) => (prev.visible ? { height: 0, top: 0, visible: false } : prev));
      return;
    }
    const inset = 8;
    const track = el.clientHeight - inset * 2;
    const height = Math.max(20, (el.clientHeight / el.scrollHeight) * track);
    const top = inset + (el.scrollTop / maxScroll) * (track - height);
    const next = { height, top, visible: true };
    setThumb((prev) =>
      prev.visible === next.visible && prev.height === next.height && prev.top === next.top ? prev : next,
    );
  }

  useLayoutEffect(() => {
    sync();
  });

  return (
    <div className="relative">
      <div
        ref={(node) => {
          innerRef.current = node;
          assignRef(scrollRef, node);
        }}
        id={id}
        role={role}
        aria-label={ariaLabel}
        onScroll={(event: UIEvent<HTMLDivElement>) => {
          if (event.currentTarget === innerRef.current) sync();
        }}
        className={`filter-dropdown-scroll overflow-y-auto ${className}`}
      >
        {children}
      </div>
      {thumb.visible ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 z-10 w-1 rounded-full bg-foreground/35"
          style={{ height: thumb.height, top: thumb.top }}
        />
      ) : null}
    </div>
  );
}
