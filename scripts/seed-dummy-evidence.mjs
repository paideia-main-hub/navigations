// Attaches placeholder evidence (one PDF + one image) to every dummy
// nomination from seed-dummy-nominations.mjs, so the admin review page has
// real attachments to open instead of "No evidence uploaded" — matching
// what a genuine submission looks like. Uses the same private
// "award-evidence" bucket and award_evidence_files table the real
// submission wizard writes to.
//
// Safe to re-run: removes evidence files it previously attached to dummy
// nominations (by storage path prefix) before re-adding them.
//
// Usage: node scripts/seed-dummy-evidence.mjs

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  let text;
  try {
    text = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
  } catch {
    return;
  }
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

/** Builds a small, genuinely valid single-page PDF (correct xref byte
 * offsets, not just PDF-shaped text) so it actually opens in a viewer. */
function buildMinimalPdf(lines) {
  const objects = [];
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
  objects.push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 300] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`,
  );
  const streamOps = lines.map((line, i) => `BT /F1 12 Tf 20 ${260 - i * 18} Td (${line.replace(/[()\\]/g, "")}) Tj ET`).join("\n");
  objects.push(`4 0 obj\n<< /Length ${streamOps.length} >>\nstream\n${streamOps}\nendstream\nendobj\n`);
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

// 1x1 placeholder PNG — stands in for a supporting photo/screenshot.
const PLACEHOLDER_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (check .env.local).");
    process.exit(1);
  }
  const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: nominations, error } = await supabase
    .from("award_nominations")
    .select("id, nomination_number, nominee_name, category_id, award_categories(title)")
    .like("nomination_number", "[DUMMY]%");
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (!nominations || nominations.length === 0) {
    console.error("No dummy nominations found — run scripts/seed-dummy-nominations.mjs first.");
    process.exit(1);
  }

  // Clear out evidence this script previously attached (both the storage
  // objects and their DB rows) so re-running doesn't duplicate.
  const { data: oldFiles } = await supabase
    .from("award_evidence_files")
    .select("id, file_url, nomination_id")
    .in("nomination_id", nominations.map((n) => n.id));
  if (oldFiles && oldFiles.length > 0) {
    await supabase.storage.from("award-evidence").remove(oldFiles.map((f) => f.file_url));
    await supabase.from("award_evidence_files").delete().in("id", oldFiles.map((f) => f.id));
    console.log(`Removed ${oldFiles.length} previously seeded dummy evidence file(s).`);
  }

  for (const n of nominations) {
    const categoryTitle = n.award_categories?.title ?? "Award";
    const pdf = buildMinimalPdf([
      `${categoryTitle}`,
      `Nominee: ${n.nominee_name}`,
      `Nomination: ${n.nomination_number.replace("[DUMMY]", "")}`,
      "",
      "This is a placeholder supporting document",
      "for testing the admin review flow.",
    ]);

    const pdfPath = `${n.id}/evidence-document.pdf`;
    const imgPath = `${n.id}/supporting-photo.png`;

    const [pdfUpload, imgUpload] = await Promise.all([
      supabase.storage.from("award-evidence").upload(pdfPath, pdf, { contentType: "application/pdf", upsert: true }),
      supabase.storage.from("award-evidence").upload(imgPath, PLACEHOLDER_PNG, { contentType: "image/png", upsert: true }),
    ]);

    if (pdfUpload.error || imgUpload.error) {
      console.error(`Failed to upload evidence for ${n.nominee_name}: ${pdfUpload.error?.message ?? imgUpload.error?.message}`);
      continue;
    }

    const { error: insertError } = await supabase.from("award_evidence_files").insert([
      { nomination_id: n.id, file_type: "pdf", file_url: pdfPath, size_bytes: pdf.length, page_count: 1 },
      { nomination_id: n.id, file_type: "image", file_url: imgPath, size_bytes: PLACEHOLDER_PNG.length, page_count: null },
    ]);
    if (insertError) {
      console.error(`Failed to record evidence rows for ${n.nominee_name}: ${insertError.message}`);
      continue;
    }

    console.log(`Attached evidence: ${n.nomination_number} — ${n.nominee_name}`);
  }

  console.log(`\nDone — evidence attached to ${nominations.length} dummy nomination(s).`);
  console.log("Open any [DUMMY] nomination in Admin Console > Nominations — the Evidence (private) section now has a PDF and an image to view.");
}

main();
