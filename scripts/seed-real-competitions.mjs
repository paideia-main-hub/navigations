// Replaces the demo competitions with the real Future Ready League
// competitions, built from the official manuals in MANUALS/MANUALS/.
//
// Each competition's content is extracted into its own file under
// scripts/data/competitions/ and written here into exactly the same tables
// the admin portal writes to (competitions, competition_eligibility_rules,
// competition_stages, rubrics, manuals, resources, competition_faqs,
// events) — so everything lands in the 14 competition tabs and stays fully
// editable from Admin Console > Competitions afterwards.
//
// The manual file itself is uploaded to the public `manuals` storage bucket
// and linked as the competition's complete manual, so the Manual tab has a
// working download.
//
// Safe to re-run: competitions are upserted by slug and their child rows are
// replaced, so re-running after editing a data file just updates that
// competition.
//
// Usage: node scripts/seed-real-competitions.mjs [slug ...]
//        (no args = every competition; pass slugs to seed a subset)

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { COMPETITIONS } from "./data/competitions/index.mjs";

const DEMO_SLUGS = ["young-innovators-challenge", "mindworks-decathlon", "quiz-masters-demo", "robotics-rumble-demo", "hello"];
const MANUALS_DIR = new URL("../MANUALS/MANUALS/", import.meta.url);

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

async function removeDemoCompetitions(sb) {
  const { data: existing } = await sb.from("competitions").select("id, slug, title").in("slug", DEMO_SLUGS);
  if (!existing || existing.length === 0) {
    console.log("No demo competitions left to remove.");
    return;
  }
  // registrations reference competitions by slug snapshot as well as by FK,
  // so clear those explicitly before the competition rows go (results,
  // scores and consent records cascade from registrations).
  const slugs = existing.map((c) => c.slug);
  const { data: regs } = await sb.from("registrations").select("id").in("competition_slug", slugs);
  if (regs && regs.length > 0) {
    await sb.from("registrations").delete().in("id", regs.map((r) => r.id));
    console.log(`Removed ${regs.length} demo registration(s).`);
  }
  await sb.from("competitions").delete().in("id", existing.map((c) => c.id));
  console.log(`Removed ${existing.length} demo competition(s): ${existing.map((c) => c.title).join(", ")}`);
}

async function uploadManual(sb, slug, fileName) {
  const bytes = readFileSync(new URL(encodeURIComponent(fileName), MANUALS_DIR));
  const ext = fileName.split(".").pop().toLowerCase();
  const contentType =
    ext === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const path = `${slug}/${fileName.replace(/\s+/g, "-")}`;

  const { error } = await sb.storage.from("manuals").upload(path, bytes, { contentType, upsert: true });
  if (error) {
    console.error(`  ! manual upload failed: ${error.message}`);
    return null;
  }
  return sb.storage.from("manuals").getPublicUrl(path).data.publicUrl;
}

// pathway and image_url arrive in migration 0018. Seeding shouldn't fail on a
// database that hasn't had it applied yet, so probe once and drop those two
// fields if they aren't there.
async function hasPathwayColumns(sb) {
  const { error } = await sb.from("competitions").select("pathway, image_url").limit(1);
  if (!error) return true;
  console.log("! competitions.pathway / image_url not found — seeding without them.");
  console.log("  Apply supabase/migrations/0018_competition_pathway_and_image.sql, then re-run.\n");
  return false;
}

async function seedCompetition(sb, c, withPathway) {
  const row = {
    slug: c.slug,
    title: c.title,
    short_description: c.shortDescription,
    overview: c.overview,
    domain_competency_area: c.domain,
    participation_type: c.supportsTeam && !c.supportsIndividual ? "team" : "individual",
    supports_individual: c.supportsIndividual,
    supports_team: c.supportsTeam,
    status: c.status ?? "open",
    fee_required: false,
    season: c.season ?? "2026",
    updated_at: new Date().toISOString(),
    ...(withPathway ? { pathway: c.pathway ?? null, image_url: c.image ?? null } : {}),
  };

  const { data: saved, error } = await sb.from("competitions").upsert(row, { onConflict: "slug" }).select("id").single();
  if (error) {
    console.error(`  ! ${c.slug}: ${error.message}`);
    return;
  }
  const id = saved.id;

  // Replace child rows so a re-run reflects edits rather than duplicating.
  await Promise.all([
    sb.from("competition_eligibility_rules").delete().eq("competition_id", id),
    sb.from("competition_stages").delete().eq("competition_id", id),
    sb.from("rubrics").delete().eq("competition_id", id),
    sb.from("resources").delete().eq("competition_id", id),
    sb.from("competition_faqs").delete().eq("competition_id", id),
    sb.from("events").delete().eq("competition_id", id),
    sb.from("manuals").delete().eq("competition_id", id),
  ]);

  if (c.eligibility?.length) {
    await sb.from("competition_eligibility_rules").insert(
      c.eligibility.map((e) => ({
        competition_id: id,
        category: e.category,
        min_grade: e.minGrade,
        max_grade: e.maxGrade,
        min_age: e.minAge ?? null,
        max_age: e.maxAge ?? null,
        team_min_size: e.teamMinSize ?? null,
        team_max_size: e.teamMaxSize ?? null,
        notes: e.notes ?? null,
      })),
    );
  }

  // Stages go in first so rubrics can be attached to the stage they score —
  // that's what makes the Judging & Rubrics tab label each rubric with its
  // stage instead of a row of identical "Competition-wide" headings.
  const stageIdByNumber = new Map();
  if (c.stages?.length) {
    const { data: savedStages } = await sb
      .from("competition_stages")
      .insert(
        c.stages.map((s, i) => ({
          competition_id: id,
          stage_number: s.stageNumber ?? i + 1,
          title: s.title,
          format: s.format ?? null,
          duration: s.duration ?? null,
          task_description: s.taskDescription ?? null,
          progression_rule: s.progressionRule ?? null,
          order_index: i,
        })),
      )
      .select("id, stage_number");
    for (const s of savedStages ?? []) stageIdByNumber.set(s.stage_number, s.id);
  }

  if (c.rubrics?.length) {
    await sb.from("rubrics").insert(
      c.rubrics.map((r) => ({
        competition_id: id,
        stage_id: r.stageNumber ? (stageIdByNumber.get(r.stageNumber) ?? null) : null,
        criteria: r.criteria,
        tie_break_rule: r.tieBreakRule ?? null,
        is_public: r.isPublic ?? true,
      })),
    );
  }

  if (c.resources?.length) {
    await sb.from("resources").insert(
      c.resources.map((r, i) => ({
        competition_id: id,
        stage_id: null,
        type: r.type ?? "practice_question",
        title: r.title,
        content: r.content ?? null,
        video_url: r.videoUrl ?? null,
        order_index: i,
        download_allowed: r.downloadAllowed ?? false,
      })),
    );
  }

  if (c.faqs?.length) {
    await sb.from("competition_faqs").insert(
      c.faqs.map((f, i) => ({ competition_id: id, question: f.question, answer: f.answer, order_index: i })),
    );
  }

  if (c.events?.length) {
    await sb.from("events").insert(
      c.events.map((e) => ({
        competition_id: id,
        type: e.type,
        title: e.title,
        event_date: e.eventDate,
        description: e.description ?? null,
      })),
    );
  }

  const manualEntries = [];
  if (c.manualFile) {
    const url = await uploadManual(sb, c.slug, c.manualFile);
    if (url) {
      manualEntries.push({
        competition_id: id,
        type: "complete_manual",
        title: `${c.title} — Official Competition Manual`,
        file_url: url,
        version_label: c.manualVersion ?? null,
        version_date: c.manualDate ?? null,
      });
      // The same official manual carries the registration rules and the
      // conduct/guiding principles, so the Eligibility and Guiding
      // Principles tabs link to it too rather than showing nothing.
      manualEntries.push({
        competition_id: id,
        type: "registration_rules",
        title: `${c.title} — Eligibility & Registration Rules`,
        file_url: url,
        version_label: c.manualVersion ?? null,
        version_date: c.manualDate ?? null,
      });
      manualEntries.push({
        competition_id: id,
        type: "guiding_principles",
        title: `${c.title} — Guiding Principles & Conduct`,
        file_url: url,
        version_label: c.manualVersion ?? null,
        version_date: c.manualDate ?? null,
      });
    }
  }
  if (manualEntries.length > 0) await sb.from("manuals").insert(manualEntries);

  console.log(
    `  ✓ ${c.title} — ${c.eligibility?.length ?? 0} eligibility, ${c.stages?.length ?? 0} stages, ${c.rubrics?.length ?? 0} rubric, ${c.resources?.length ?? 0} resources, ${c.faqs?.length ?? 0} FAQs, ${c.events?.length ?? 0} dates`,
  );
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (check .env.local).");
    process.exit(1);
  }
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const only = process.argv.slice(2);
  const targets = only.length > 0 ? COMPETITIONS.filter((c) => only.includes(c.slug)) : COMPETITIONS;

  if (only.length === 0) await removeDemoCompetitions(sb);

  const withPathway = await hasPathwayColumns(sb);

  console.log(`\nSeeding ${targets.length} competition(s) from the official manuals:`);
  for (const c of targets) await seedCompetition(sb, c, withPathway);

  console.log(`\nDone. Review and edit any of them from Admin Console > Competitions.`);
}

main();
