"use client";

import Link from "next/link";
import { useState } from "react";
import { FaqIcon } from "@/ui/components/marketing/faqIcons";

export type RegisterPath = {
  href: string;
  code: string;
  label: string;
  body: string;
  cta: string;
  tone: "warm" | "indigo" | "slate" | "teal" | "mist";
  /** FaqIcon name that conveys the path meaning. */
  icon: "id-badge" | "users" | "scale" | "megaphone";
};

const toneStyles: Record<
  RegisterPath["tone"],
  { shell: string; wash: string; code: string; cta: string; iconTile: string; watermark: string }
> = {
  warm: {
    shell: "border-accent/20 bg-accent-soft",
    wash: "from-accent/25 via-accent/5 to-transparent",
    code: "text-accent-strong",
    cta: "text-accent-strong",
    iconTile: "bg-accent text-accent-foreground",
    watermark: "text-accent/20",
  },
  indigo: {
    shell: "border-brand-deep/15 bg-[#e8eaf8]",
    wash: "from-brand-deep/20 via-brand-deep/5 to-transparent",
    code: "text-brand-deep",
    cta: "text-brand-deep",
    iconTile: "bg-brand-deep text-brand-deep-foreground",
    watermark: "text-brand-deep/15",
  },
  slate: {
    shell: "border-border bg-surface-alt",
    wash: "from-foreground/10 via-foreground/[0.03] to-transparent",
    code: "text-muted",
    cta: "text-accent-strong",
    iconTile: "bg-foreground text-background",
    watermark: "text-foreground/10",
  },
  teal: {
    shell: "border-[#1f6b63]/20 bg-[#e6f4f2]",
    wash: "from-[#1f6b63]/18 via-[#1f6b63]/05 to-transparent",
    code: "text-[#1f6b63]",
    cta: "text-[#1f6b63]",
    iconTile: "bg-[#1f6b63] text-white",
    watermark: "text-[#1f6b63]/15",
  },
  mist: {
    shell: "border-border bg-surface-muted",
    wash: "from-accent/15 via-transparent to-transparent",
    code: "text-muted",
    cta: "text-accent-strong",
    iconTile: "bg-accent text-accent-foreground",
    watermark: "text-accent/15",
  },
};

const hoverShell: Record<RegisterPath["tone"], string> = {
  warm: "border-accent/55 bg-[#ffe4d1]",
  indigo: "border-brand-deep/40 bg-[#dddff3]",
  slate: "border-foreground/25 bg-[#e4e8f4]",
  teal: "border-[#1f6b63]/45 bg-[#d7eeea]",
  mist: "border-accent/35 bg-[#e6ebf7]",
};

export function RegisterPathCard({
  path,
  onOpen,
}: {
  path: RegisterPath;
  /** When set, opens in-page instead of navigating. */
  onOpen?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const tone = toneStyles[path.tone];

  const className = `group relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border p-6 text-left sm:p-7 ${
    hovered ? hoverShell[path.tone] : tone.shell
  }`;

  const style = {
    transform: hovered ? "translateY(-4px)" : "translateY(0)",
    boxShadow: hovered
      ? "0 24px 48px -28px rgba(31,32,65,0.45)"
      : "0 10px 28px -22px rgba(31,32,65,0.35)",
    transition:
      "transform 0.3s ease-out, box-shadow 0.3s ease-out, border-color 0.3s ease-out, background-color 0.3s ease-out",
  } as const;

  const content = (
    <>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${tone.wash}`}
        style={{
          opacity: hovered ? 1 : 0.8,
          transition: "opacity 0.3s ease-out",
        }}
      />

      {/* Large watermark shape that reads the role at a glance */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-3 -bottom-4 ${tone.watermark}`}
        style={{
          transform: hovered ? "translate(-6px, -8px) scale(1.05)" : "translate(0, 0) scale(1)",
          transition: "transform 0.35s ease-out, opacity 0.3s ease-out",
          opacity: hovered ? 1 : 0.85,
        }}
      >
        <FaqIcon name={path.icon} className="h-36 w-36 sm:h-40 sm:w-40" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl shadow-sm ${tone.iconTile}`}
            style={{
              transform: hovered ? "translateY(-2px)" : "translateY(0)",
              transition: "transform 0.3s ease-out",
            }}
          >
            <FaqIcon name={path.icon} className="h-6 w-6" />
          </span>
          <span
            className={`text-sm font-black tracking-[0.18em] sm:text-base ${tone.code}`}
            style={{ transition: "color 0.3s ease-out" }}
          >
            {path.code}
          </span>
        </div>

        <h2
          className={`mt-5 text-2xl font-black tracking-tight ${hovered ? "text-accent-strong" : "text-foreground"}`}
          style={{ transition: "color 0.3s ease-out" }}
        >
          {path.label}
        </h2>
        <p
          className={`mt-3 max-w-[90%] text-sm leading-relaxed ${hovered ? "text-foreground/75" : "text-muted"}`}
          style={{ transition: "color 0.3s ease-out" }}
        >
          {path.body}
        </p>
      </div>

      <span
        className={`relative mt-8 inline-flex items-center gap-2 text-sm font-bold ${tone.cta}`}
        style={{ transition: "color 0.3s ease-out" }}
      >
        {path.cta}
        <span
          aria-hidden
          style={{
            display: "inline-block",
            transform: hovered ? "translateX(4px)" : "translateX(0)",
            transition: "transform 0.3s ease-out",
          }}
        >
          →
        </span>
      </span>
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={className}
        style={style}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={path.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={style}
    >
      {content}
    </Link>
  );
}
