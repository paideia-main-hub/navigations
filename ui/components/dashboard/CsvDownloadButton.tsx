"use client";

function toCsv(rows: Record<string, string>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h] ?? "")).join(","))];
  return lines.join("\n");
}

export function CsvDownloadButton({
  label,
  filename,
  rows,
  className = "form-action cursor-pointer rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
}: {
  label: string;
  filename: string;
  rows: Record<string, string>[];
  className?: string;
}) {
  function download() {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  const unavailable = rows.length === 0;

  return (
    <span className={unavailable ? "inline-flex cursor-not-allowed" : "inline-flex"}>
      <button
        type="button"
        onClick={download}
        disabled={unavailable}
        aria-disabled={unavailable}
        className={className}
      >
        {label}
      </button>
    </span>
  );
}
