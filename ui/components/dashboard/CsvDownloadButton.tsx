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
  className = "rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-accent disabled:opacity-50",
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

  return (
    <button
      type="button"
      onClick={download}
      disabled={rows.length === 0}
      className={className}
    >
      {label}
    </button>
  );
}
