"use client";

import { useCallback, useRef, type TouchEvent as ReactTouchEvent } from "react";

/** Horizontal swipe helpers for carousels.
 * Swipe left → next (1), swipe right → previous (-1).
 * Ignores mostly-vertical gestures so page scroll still works. */
export function useSwipeNavigation(
  onSwipe: (direction: -1 | 1) => void,
  options?: { threshold?: number; enabled?: boolean },
) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const threshold = options?.threshold ?? 42;
  const enabled = options?.enabled ?? true;

  const onTouchStart = useCallback(
    (event: ReactTouchEvent) => {
      if (!enabled) return;
      const touch = event.changedTouches[0];
      if (!touch) return;
      startX.current = touch.clientX;
      startY.current = touch.clientY;
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (event: ReactTouchEvent) => {
      if (!enabled || startX.current == null || startY.current == null) return;
      const touch = event.changedTouches[0];
      if (!touch) {
        startX.current = null;
        startY.current = null;
        return;
      }
      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;
      startX.current = null;
      startY.current = null;
      if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return;
      onSwipe(dx < 0 ? 1 : -1);
    },
    [enabled, onSwipe, threshold],
  );

  return { onTouchStart, onTouchEnd };
}
