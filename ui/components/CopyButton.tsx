"use client";

import { useState } from "react";

async function writeClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Permission or insecure context: fall through to the selection copy.
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.readOnly = true;
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.width = "1px";
  area.style.height = "1px";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, text.length);
  const copied = document.execCommand("copy");
  document.body.removeChild(area);
  if (!copied) throw new Error("copy failed");
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="5.25" y="5.25" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.75 5.25V3.75A1.5 1.5 0 0 0 9.25 2.25h-5.5A1.5 1.5 0 0 0 2.25 3.75v5.5A1.5 1.5 0 0 0 3.75 10.75H5.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3.5 8.25 6.5 11.25 12.5 4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Small clipboard control. Uses the async clipboard API, then a selection
 * fallback so the same tap works on desktop and mobile. */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await writeClipboard(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-accent-strong hover:bg-background/70"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}
