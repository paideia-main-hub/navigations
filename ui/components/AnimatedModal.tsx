"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const EXIT_MS = 220;

const AnimatedModalCloseContext = createContext<() => void>(() => {});

export function useAnimatedModalClose() {
  return useContext(AnimatedModalCloseContext);
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Hover styles only from `sm` up — touch devices keep a stable resting look. */
const modalCloseClass =
  "grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-all duration-200 ease-out sm:hover:rotate-90 sm:hover:bg-accent-soft sm:hover:text-accent motion-reduce:sm:hover:rotate-0";

/** Top-right X for AnimatedModal panels. Uses the modal close context. */
export function ModalCloseButton({ className = "" }: { className?: string }) {
  const requestClose = useAnimatedModalClose();
  return (
    <button type="button" onClick={requestClose} aria-label="Close" className={`${modalCloseClass} ${className}`}>
      <CloseIcon />
    </button>
  );
}

/** Same X control when the panel is not an AnimatedModal (drawers, custom dialogs). */
export function DialogCloseButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label="Close" className={`${modalCloseClass} ${className}`}>
      <CloseIcon />
    </button>
  );
}

/** Hamper drawer close — solid bright circle always; rotated X locked on mobile (no hover flip). */
export function HamperCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-white transition-transform duration-200 ease-out rotate-90 sm:rotate-0 sm:hover:rotate-90 motion-reduce:rotate-0 motion-reduce:sm:hover:rotate-0"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.45)" }}
    >
      <CloseIcon />
    </button>
  );
}

/** Shared modal chrome with enter/exit motion for backdrop + panel. */
export function AnimatedModal({
  onClose,
  labelledBy,
  panelClassName = "",
  children,
}: {
  onClose: () => void;
  labelledBy: string;
  panelClassName?: string;
  children: ReactNode;
}) {
  const [phase, setPhase] = useState<"enter" | "open" | "leave">("enter");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPhase("open");
      return;
    }
    const id = requestAnimationFrame(() => setPhase("open"));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (phase !== "leave") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(onClose, reduce ? 0 : EXIT_MS);
    return () => clearTimeout(t);
  }, [phase, onClose]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPhase("leave");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const requestClose = () => setPhase("leave");
  const open = phase === "open";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-brand-deep/55 backdrop-blur-[2px] transition-opacity duration-200 ease-out"
        style={{ opacity: open ? 1 : 0 }}
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative z-[81] flex w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-[0_30px_80px_-28px_rgba(31,32,65,0.65)] transition-[opacity,transform] duration-200 ease-out sm:rounded-3xl ${panelClassName}`}
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(18px) scale(0.97)",
        }}
      >
        <AnimatedModalCloseContext.Provider value={requestClose}>{children}</AnimatedModalCloseContext.Provider>
      </div>
    </div>,
    document.body,
  );
}
