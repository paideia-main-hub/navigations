const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** Stable date-only label — no locale APIs (avoids SSR hydration mismatches). */
export function formatEventDateOnly(iso?: string | null): string {
  if (!iso) return "—";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** `YYYY-MM-DD` for `<input type="date">` from a stored event timestamp. */
export function toDateInputValue(iso?: string | null): string {
  if (!iso) return "";
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? "";
}
