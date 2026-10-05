"use client";

import { useEffect, useRef, useState } from "react";

const HIDE_MS = 850;
const TRACK_INSET = 8;

/**
 * Native scrollbar is hidden (no layout gutter). This fixed thumb only
 * appears while the page is scrolling, then fades out.
 */
export function OverlayScrollbar() {
  const [visible, setVisible] = useState(false);
  const [thumb, setThumb] = useState({ height: 0, top: 0, show: false });
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragging = useRef(false);
  const dragOffset = useRef(0);

  useEffect(() => {
    const clearHide = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = null;
    };

    const scheduleHide = () => {
      clearHide();
      if (dragging.current) return;
      hideTimer.current = setTimeout(() => setVisible(false), HIDE_MS);
    };

    const updateThumb = () => {
      const viewH = window.innerHeight;
      const scrollH = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const maxScroll = scrollH - viewH;
      if (maxScroll <= 1) {
        setThumb({ height: 0, top: 0, show: false });
        return;
      }

      const trackH = viewH - TRACK_INSET * 2;
      const height = Math.max(36, (viewH / scrollH) * trackH);
      const top = TRACK_INSET + (scrollTop / maxScroll) * (trackH - height);
      setThumb({ height, top, show: true });
    };

    const onScroll = () => {
      updateThumb();
      setVisible(true);
      scheduleHide();
    };

    updateThumb();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateThumb);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateThumb);
      clearHide();
    };
  }, []);

  useEffect(() => {
    const onMove = (clientY: number) => {
      if (!dragging.current) return;
      const viewH = window.innerHeight;
      const scrollH = document.documentElement.scrollHeight;
      const maxScroll = scrollH - viewH;
      if (maxScroll <= 0) return;

      const trackH = viewH - TRACK_INSET * 2;
      const thumbH = Math.max(36, (viewH / scrollH) * trackH);
      const maxTop = trackH - thumbH;
      const nextTop = Math.min(maxTop, Math.max(0, clientY - TRACK_INSET - dragOffset.current));
      window.scrollTo({ top: (nextTop / maxTop) * maxScroll });
    };

    const onPointerMove = (e: PointerEvent) => onMove(e.clientY);
    const onPointerUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.userSelect = "";
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), HIDE_MS);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  if (!thumb.show) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 right-0 z-[90] w-3"
    >
      <div
        className={`pointer-events-auto absolute right-1 w-1.5 rounded-full bg-foreground/40 shadow-sm transition-opacity duration-300 ease-out hover:bg-foreground/55 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{ height: thumb.height, top: thumb.top }}
        onPointerDown={(e) => {
          e.preventDefault();
          dragging.current = true;
          dragOffset.current = e.clientY - thumb.top;
          document.body.style.userSelect = "none";
          setVisible(true);
          if (hideTimer.current) clearTimeout(hideTimer.current);
        }}
      />
    </div>
  );
}
