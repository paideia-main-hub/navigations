// End-to-end dummy-data pass for manually verifying the full pipeline:
// register students from different schools -> 3 judges score every entrant
// -> standings are generated -> results are published -> winners show on
// the homepage / results pages / school leaderboard.
//
// Covers 3 real competitions (Argumentor, CodeCircuit, CulturalScript) and
// 5 dummy schools, so the school leaderboard has something real to rank.
//
// Everything this script creates is tagged for easy identification and
// later removal:
//   - schools.website                   = "seed:test-e2e-flow"
//   - registrations.registration_number  starts with "TEST-"
//   - coordinator/judge emails           end in "@frltest.invalid"
//     (.invalid is an RFC 2606 reserved TLD - guaranteed fake, Supabase
//     never actually emails it)
//
// Safe to re-run: deletes its own previously-seeded rows first (matched by
// the markers above) so re-running doesn't create duplicates.
//
// Requires (run once, both are idempotent):
//   node scripts/seed-real-competitions.mjs argumentor codecircuit culturescript
//   node scripts/seed-award-categories.mjs
//
// Usage: node scripts/seed-test-e2e-flow.mjs

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const WEBSITE_MARKER = "seed:test-e2e-flow";
const EMAIL_DOMAIN = "frltest.invalid";
const PASSWORD = "TestPass#2026";
const TOTAL_COMPETITIONS = 23;

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

function svgAvatar(initials, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="${bg}"/><text x="128" y="150" font-size="96" font-family="Arial, sans-serif" fill="#ffffff" text-anchor="middle" font-weight="bold">${initials}</text></svg>`;
}

function initialsOf(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

const AVATAR_COLORS = ["#6366f1", "#ec4899", "#059669", "#d97706", "#0891b2", "#7c3aed", "#dc2626", "#4f46e5"];

const CRITERIA = {
  // Argumentor's judge dashboard always falls back to Stage 1's rubric
  // (both its rubrics are stage-scoped, so the "prefer the stage-less one"
  // lookup finds nothing and takes rubrics[0], which is Stage 1) - use
  // exactly those 6 criteria so seeded data matches what a judge would see.
  argumentor: [
    { name: "Position & relevance", weight: 15 },
    { name: "Argument quality & logic", weight: 25 },
    { name: "Evidence & examples", weight: 20 },
    { name: "Counterargument awareness", weight: 15 },
    { name: "Delivery & verbal clarity", weight: 15 },
    { name: "Structure, timing & conduct", weight: 10 },
  ],
  codecircuit: [
    { name: "Stage 1 — Problem Decomposition", weight: 15 },
    { name: "Stage 2 — Algorithm Builder", weight: 20 },
    { name: "Stage 3 — Live Coding", weight: 40 },
    { name: "Stage 4 — Test, Debug, Improve & Final Submit", weight: 25 },
  ],
  culturescript: [
    { name: "Cultural Understanding & Authentic Representation", weight: 20 },
    { name: "Storytelling & Creative Communication", weight: 20 },
    { name: "Diversity, Inclusion & Intercultural Understanding", weight: 15 },
    { name: "Unity / One Nation Message", weight: 15 },
    { name: "Digital Media Creation & Technical Execution", weight: 10 },
    { name: "Originality & Student Voice", weight: 10 },
    { name: "Research Accuracy & Responsible Media Use", weight: 5 },
    { name: "Overall Impact & Audience Engagement", weight: 5 },
  ],
};

const COMPETITIONS = ["argumentor", "codecircuit", "culturescript"];

const SCHOOLS = [
  { key: "alnoor", name: "Al-Noor Grammar School", coordinatorName: "Ms. Amina Sheikh", city: "Islamabad" },
  { key: "falcon", name: "Falcon Heights Academy", coordinatorName: "Mr. Tariq Javed", city: "Lahore" },
  { key: "riverside", name: "Riverside Model School", coordinatorName: "Ms. Rabia Malik", city: "Karachi" },
  { key: "horizon", name: "Horizon Science Academy", coordinatorName: "Mr. Salman Yousuf", city: "Rawalpindi" },
  { key: "crescent", name: "Crescent Valley School", coordinatorName: "Ms. Farah Naz", city: "Faisalabad" },
];

const JUDGES = [
  { name: "Dr. Imran Qureshi" },
  { name: "Ms. Nadia Baig" },
  { name: "Mr. Kamran Sheikh" },
];

// One entry per registration. `target` is the intended averaged total score
// (0-100) - chosen with wide gaps within each competition so averaging
// across 3 judges with small jitter can never accidentally flip the order:
// gold ~93, silver ~84, bronze ~75, finalists 66/60/54.
const REGISTRANTS = [
  { comp: "argumentor", school: "alnoor", name: "Ayesha Siddiqui", grade: "10", target: 93 },
  { comp: "argumentor", school: "falcon", name: "Hassan Raza", grade: "11", target: 84 },
  { comp: "argumentor", school: "riverside", name: "Khadija Yousuf", grade: "9", target: 75 },
  { comp: "argumentor", school: "horizon", name: "Usman Tariq", grade: "10", target: 66 },
  { comp: "argumentor", school: "crescent", name: "Zara Ansari", grade: "11", target: 60 },

  { comp: "codecircuit", school: "alnoor", name: "Bilal Ahmed", grade: "9", target: 93 },
  { comp: "codecircuit", school: "falcon", name: "Fatima Noor", grade: "10", target: 84 },
  { comp: "codecircuit", school: "riverside", name: "Ali Hamza", grade: "11", target: 75 },
  { comp: "codecircuit", school: "horizon", name: "Sana Khalid", grade: "9", target: 66 },
  { comp: "codecircuit", school: "horizon", name: "Ahmed Bilal", grade: "10", target: 60 },
  { comp: "codecircuit", school: "crescent", name: "Danish Iqbal", grade: "11", target: 54 },

  { comp: "culturescript", school: "alnoor", name: "Sara Malik", grade: "10", target: 93 },
  { comp: "culturescript", school: "falcon", name: "Omar Farooq", grade: "9", target: 84 },
  { comp: "culturescript", school: "riverside", name: "Mariam Aslam", grade: "11", target: 75 },
  { comp: "culturescript", school: "horizon", name: "Iqra Shahid", grade: "10", target: 66 },
  { comp: "culturescript", school: "crescent", name: "Noor Fatima", grade: "9", target: 60 },
];

function weightedTotal(criteria, criteriaScores) {
  let total = 0;
  for (const c of criteria) total += (criteriaScores[c.name] * c.weight) / 100;
  return Math.round(total);
}

function buildCriteriaScores(criteria, base) {
  const scores = {};
  for (const c of criteria) {
    const jitter = Math.round((Math.random() - 0.5) * 6); // +-3
    scores[c.name] = Math.max(0, Math.min(100, base + jitter));
  }
  return scores;
}

async function cleanupPrevious(sb) {
  const { data: oldRegs } = await sb.from("registrations").select("id").like("registration_number", "TEST-%");
  if (oldRegs?.length) {
    await sb.from("registrations").delete().in("id", oldRegs.map((r) => r.id));
    console.log(`Removed ${oldRegs.length} previous test registration(s) (cascades consents/scores/results/winner_media).`);
  }

  const { data: oldSchools } = await sb.from("schools").select("id").eq("website", WEBSITE_MARKER);
  const oldSchoolIds = (oldSchools ?? []).map((s) => s.id);
  if (oldSchoolIds.length) {
    const { data: oldStudents } = await sb.from("students").select("id").in("school_id", oldSchoolIds);
    if (oldStudents?.length) await sb.from("students").delete().in("id", oldStudents.map((s) => s.id));
    await sb.from("school_coordinators").delete().in("school_id", oldSchoolIds);
    await sb.from("school_award_results").delete().in("school_id", oldSchoolIds);
    await sb.from("schools").delete().in("id", oldSchoolIds);
    console.log(`Removed ${oldSchoolIds.length} previous test school(s) and their students.`);
  }

  const { data: authList } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const testUsers = (authList?.users ?? []).filter((u) => u.email?.endsWith(`@${EMAIL_DOMAIN}`));
  for (const u of testUsers) await sb.auth.admin.deleteUser(u.id);
  if (testUsers.length) {
    console.log(`Removed ${testUsers.length} previous test auth account(s) (cascades profiles/judges/assignments/scores).`);
  }
}

async function computeSchoolFormulaInputs(sb) {
  const inputs = new Map();
  function get(id) {
    if (!inputs.has(id)) {
      inputs.set(id, {
        outstandingPerformerCount: 0,
        distinguishedFinalistCount: 0,
        emergingTalentCount: 0,
        participationCount: 0,
        competitionSet: new Set(),
      });
    }
    return inputs.get(id);
  }

  const { data: medalRows, error: medalErr } = await sb
    .from("results")
    .select("award, registrations!inner(school_id)")
    .eq("is_published", true)
    .in("award", ["gold", "silver", "bronze"]);
  if (medalErr) console.error(`school-formula medal query: ${medalErr.message}`);
  for (const row of medalRows ?? []) {
    const schoolId = row.registrations?.school_id;
    if (!schoolId) continue;
    const inp = get(schoolId);
    if (row.award === "gold") inp.outstandingPerformerCount++;
    else if (row.award === "silver") inp.distinguishedFinalistCount++;
    else if (row.award === "bronze") inp.emergingTalentCount++;
  }

  const { data: regRows, error: regErr } = await sb
    .from("registrations")
    .select("school_id, status, entry_type, competition_slug, team_id")
    .neq("status", "rejected")
    .not("school_id", "is", null);
  if (regErr) console.error(`school-formula registrations query: ${regErr.message}`);

  const teamIds = (regRows ?? []).filter((r) => r.entry_type === "team" && r.team_id).map((r) => r.team_id);
  const teamSizeById = new Map();
  if (teamIds.length) {
    const { data: members } = await sb.from("team_members").select("team_id").in("team_id", teamIds);
    for (const m of members ?? []) teamSizeById.set(m.team_id, (teamSizeById.get(m.team_id) ?? 0) + 1);
  }

  for (const row of regRows ?? []) {
    const inp = get(row.school_id);
    inp.participationCount += row.entry_type === "team" ? teamSizeById.get(row.team_id) ?? 0 : 1;
    if (["qualified", "finalist", "completed"].includes(row.status) && row.competition_slug) {
      inp.competitionSet.add(row.competition_slug);
    }
  }

  for (const inp of inputs.values()) inp.distinctCompetitionsCompleted = inp.competitionSet.size;
  return inputs;
}

function championPoints(i) {
  return i.outstandingPerformerCount * 10 + i.distinguishedFinalistCount * 6 + i.emergingTalentCount * 3;
}
function diversifiedCoverage(i) {
  return (i.distinctCompetitionsCompleted / TOTAL_COMPETITIONS) * 100;
}

async function rankAndSave(sb, categoryId, valueBySchool) {
  const entries = [...valueBySchool.entries()].map(([schoolId, value]) => ({ schoolId, value }));
  entries.sort((a, b) => b.value - a.value);
  const topValue = entries[0]?.value ?? 0;
  let rank = 0;
  let lastValue = null;
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].value !== lastValue) {
      rank = i + 1;
      lastValue = entries[i].value;
    }
    entries[i].rank = rank;
    entries[i].isWinner = topValue > 0 && entries[i].value === topValue;
  }
  for (const e of entries) {
    const { error } = await sb.from("school_award_results").upsert(
      {
        school_id: e.schoolId,
        category_id: categoryId,
        computed_value: e.value,
        rank: e.rank,
        is_winner: e.isWinner,
        is_published: true,
        computed_at: new Date().toISOString(),
      },
      { onConflict: "school_id,category_id" },
    );
    if (error) console.error(`school_award_results upsert (${e.schoolId}): ${error.message}`);
  }
  return entries;
}

async function recomputeSchoolAwards(sb, schoolNameById) {
  const { data: cats } = await sb
    .from("award_categories")
    .select("id, slug")
    .in("slug", ["champion-school", "school-excellence", "whole-school-participation", "diversified-school"]);
  const catId = Object.fromEntries((cats ?? []).map((c) => [c.slug, c.id]));
  if (!catId["champion-school"]) {
    console.log("award_categories not seeded - run scripts/seed-award-categories.mjs, then re-run this script.");
    return;
  }

  const inputs = await computeSchoolFormulaInputs(sb);
  const championMap = new Map();
  const excellenceMap = new Map();
  const participationMap = new Map();
  const diversifiedMap = new Map();
  for (const [schoolId, inp] of inputs) {
    championMap.set(schoolId, championPoints(inp));
    excellenceMap.set(schoolId, inp.outstandingPerformerCount);
    participationMap.set(schoolId, inp.participationCount);
    diversifiedMap.set(schoolId, diversifiedCoverage(inp));
  }

  const championRanked = await rankAndSave(sb, catId["champion-school"], championMap);
  await rankAndSave(sb, catId["school-excellence"], excellenceMap);
  await rankAndSave(sb, catId["whole-school-participation"], participationMap);
  await rankAndSave(sb, catId["diversified-school"], diversifiedMap);

  const unknownIds = championRanked.map((e) => e.schoolId).filter((id) => !schoolNameById.has(id));
  if (unknownIds.length) {
    const { data: otherSchools } = await sb.from("schools").select("id, official_name").in("id", unknownIds);
    for (const s of otherSchools ?? []) schoolNameById.set(s.id, `${s.official_name} (pre-existing, not part of this test)`);
  }

  console.log("\nChampion School standings (points = gold*10 + silver*6 + bronze*3):");
  for (const e of championRanked) {
    const name = schoolNameById.get(e.schoolId) ?? e.schoolId;
    console.log(`  #${e.rank} ${name} — ${e.value} pts${e.isWinner ? "  <- WINNER" : ""}`);
  }
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

  console.log("Cleaning up any previous run of this script...");
  await cleanupPrevious(sb);

  const { data: comps } = await sb.from("competitions").select("id, slug, title").in("slug", COMPETITIONS);
  const compBySlug = Object.fromEntries((comps ?? []).map((c) => [c.slug, c]));
  for (const slug of COMPETITIONS) {
    if (!compBySlug[slug]) {
      console.error(`Missing competition "${slug}" - run: node scripts/seed-real-competitions.mjs argumentor codecircuit culturescript`);
      process.exit(1);
    }
  }

  console.log("\nCreating schools + coordinators...");
  const schoolByKey = {};
  for (const s of SCHOOLS) {
    const email = `coordinator.${s.key}@${EMAIL_DOMAIN}`;
    const { data: authRes, error: authErr } = await sb.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: s.coordinatorName, role: "school_coordinator" },
    });
    if (authErr) {
      console.error(`  ! coordinator ${s.key}: ${authErr.message}`);
      continue;
    }
    const profileId = authRes.user.id;

    const { data: school, error: schoolErr } = await sb
      .from("schools")
      .insert({
        official_name: s.name,
        city: s.city,
        province: s.city,
        country: "Pakistan",
        school_type: "Private",
        curriculums: ["National Curriculum"],
        website: WEBSITE_MARKER,
        created_by: profileId,
      })
      .select("id")
      .single();
    if (schoolErr) {
      console.error(`  ! school ${s.key}: ${schoolErr.message}`);
      continue;
    }

    await sb.from("school_coordinators").insert({
      school_id: school.id,
      profile_id: profileId,
      designation: "Competitions Coordinator",
      official_email: email,
      is_primary: true,
    });

    schoolByKey[s.key] = { id: school.id, coordinatorProfileId: profileId, name: s.name };
    console.log(`  School: ${s.name} — coordinator ${email}`);
  }

  console.log("\nCreating judges + competition assignments...");
  const judgeAssignmentIdByComp = {};
  for (const slug of COMPETITIONS) judgeAssignmentIdByComp[slug] = [];

  for (let i = 0; i < JUDGES.length; i++) {
    const j = JUDGES[i];
    const email = `judge${i + 1}@${EMAIL_DOMAIN}`;
    const { data: authRes, error: authErr } = await sb.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: j.name, role: "judge" },
    });
    if (authErr) {
      console.error(`  ! judge ${i + 1}: ${authErr.message}`);
      continue;
    }
    const profileId = authRes.user.id;

    const { data: judgeRow, error: judgeErr } = await sb
      .from("judges")
      .insert({ profile_id: profileId, bio: "Dummy test judge seeded for the results-flow verification pass." })
      .select("id")
      .single();
    if (judgeErr) {
      console.error(`  ! judges row ${i + 1}: ${judgeErr.message}`);
      continue;
    }

    for (const slug of COMPETITIONS) {
      const { data: ja, error: jaErr } = await sb
        .from("judge_assignments")
        .insert({ judge_id: judgeRow.id, competition_id: compBySlug[slug].id, stage_id: null })
        .select("id")
        .single();
      if (jaErr) {
        console.error(`  ! assignment ${slug}/judge${i + 1}: ${jaErr.message}`);
        continue;
      }
      judgeAssignmentIdByComp[slug].push(ja.id);
    }
    console.log(`  Judge: ${j.name} — ${email} — assigned to ${COMPETITIONS.join(", ")}`);
  }

  console.log("\nCreating students, registrations and consents...");
  let seq = 1;
  const regByComp = {};
  for (const slug of COMPETITIONS) regByComp[slug] = [];

  for (const r of REGISTRANTS) {
    const school = schoolByKey[r.school];
    if (!school) {
      console.error(`  ! skipping ${r.name}: school ${r.school} was not created`);
      continue;
    }

    const svg = svgAvatar(initialsOf(r.name), AVATAR_COLORS[seq % AVATAR_COLORS.length]);
    const photoPath = `test-e2e/${r.comp}-${seq}.svg`;
    const { error: uploadErr } = await sb.storage
      .from("student-photos")
      .upload(photoPath, Buffer.from(svg), { contentType: "image/svg+xml", upsert: true });
    if (uploadErr) console.error(`  ! photo upload ${r.name}: ${uploadErr.message}`);
    const photoUrl = sb.storage.from("student-photos").getPublicUrl(photoPath).data.publicUrl;

    const { data: student, error: studentErr } = await sb
      .from("students")
      .insert({
        school_id: school.id,
        full_name: r.name,
        grade: r.grade,
        curriculum: "National Curriculum",
        gender: seq % 2 === 0 ? "female" : "male",
        guardian_name: `Guardian of ${r.name}`,
        guardian_relationship: "Parent",
        guardian_email: `guardian${seq}@${EMAIL_DOMAIN}`,
        guardian_mobile: `+9230000${String(seq).padStart(4, "0")}`,
        photo_url: photoUrl,
      })
      .select("id")
      .single();
    if (studentErr) {
      console.error(`  ! student ${r.name}: ${studentErr.message}`);
      continue;
    }

    const comp = compBySlug[r.comp];
    const regNumber = `TEST-${r.comp.slice(0, 3).toUpperCase()}-${String(seq).padStart(4, "0")}`;
    const { data: reg, error: regErr } = await sb
      .from("registrations")
      .insert({
        registration_number: regNumber,
        competition_slug: comp.slug,
        competition_title: comp.title,
        category: "secondary",
        entry_type: "individual",
        student_id: student.id,
        school_id: school.id,
        registered_by: school.coordinatorProfileId,
        status: "completed",
      })
      .select("id")
      .single();
    if (regErr) {
      console.error(`  ! registration ${r.name}: ${regErr.message}`);
      continue;
    }

    await sb.from("consent_records").insert(
      ["terms", "privacy", "result_publication", "photo_publication"].map((type) => ({
        registration_id: reg.id,
        type,
        accepted: true,
        accepted_at: new Date().toISOString(),
        accepted_by: school.coordinatorProfileId,
      })),
    );

    regByComp[r.comp].push({ registrationId: reg.id, target: r.target });
    console.log(`  ${r.name} (${school.name}) -> ${comp.title} [${regNumber}], target score ${r.target}`);
    seq++;
  }

  console.log("\nSubmitting scores (3 judges x every registrant, per competition)...");
  for (const slug of COMPETITIONS) {
    const criteria = CRITERIA[slug];
    const jaIds = judgeAssignmentIdByComp[slug];
    for (const entry of regByComp[slug]) {
      for (const jaId of jaIds) {
        const judgeBase = entry.target + Math.round((Math.random() - 0.5) * 4); // +-2 per judge
        const criteriaScores = buildCriteriaScores(criteria, judgeBase);
        const total = weightedTotal(criteria, criteriaScores);
        const { error } = await sb.from("scores").insert({
          judge_assignment_id: jaId,
          registration_id: entry.registrationId,
          criteria_scores: criteriaScores,
          total_score: total,
          comments: "Seeded test score for results-flow verification.",
          submitted_at: new Date().toISOString(),
        });
        if (error) console.error(`  ! score insert: ${error.message}`);
      }
    }
    console.log(`  ${slug}: scored ${regByComp[slug].length} registrant(s) x ${jaIds.length} judge(s)`);
  }

  console.log("\nGenerating standings and publishing (mirrors the admin Results panel)...");
  const { data: adminProfile } = await sb.from("profiles").select("id").eq("role", "admin").limit(1).maybeSingle();
  const approvedBy = adminProfile?.id ?? null;

  for (const slug of COMPETITIONS) {
    const comp = compBySlug[slug];
    const entries = regByComp[slug];
    const regIds = entries.map((e) => e.registrationId);
    if (!regIds.length) continue;

    const { data: scoreRows } = await sb
      .from("scores")
      .select("registration_id, total_score")
      .in("registration_id", regIds)
      .not("total_score", "is", null);

    const byReg = new Map();
    for (const row of scoreRows ?? []) {
      if (!byReg.has(row.registration_id)) byReg.set(row.registration_id, []);
      byReg.get(row.registration_id).push(row.total_score);
    }

    const averaged = [...byReg.entries()].map(([registrationId, vals]) => ({
      registrationId,
      avg: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100,
    }));
    averaged.sort((a, b) => b.avg - a.avg);
    for (let i = 0; i < averaged.length; i++) {
      const higher = averaged.filter((x) => x.avg > averaged[i].avg).length;
      averaged[i].rank = 1 + higher;
      averaged[i].award = averaged[i].rank === 1 ? "gold" : averaged[i].rank === 2 ? "silver" : averaged[i].rank === 3 ? "bronze" : "finalist";
    }

    const publishedSummary = [];
    for (const a of averaged) {
      // Upsert-by-registration_id assumes a UNIQUE(registration_id) constraint
      // that (per a live run) isn't actually present on this database even
      // though a migration file claims to add it — select-then-insert/update
      // instead, so this doesn't depend on that constraint existing.
      const { data: existing } = await sb.from("results").select("id").eq("registration_id", a.registrationId).maybeSingle();
      let resultId;
      if (existing) {
        const { error: updErr } = await sb
          .from("results")
          .update({ competition_id: comp.id, season: "2026", award: a.award, score: a.avg })
          .eq("id", existing.id);
        if (updErr) {
          console.error(`  ! result update ${a.registrationId}: ${updErr.message}`);
          continue;
        }
        resultId = existing.id;
      } else {
        const { data: inserted, error: insErr } = await sb
          .from("results")
          .insert({ registration_id: a.registrationId, competition_id: comp.id, season: "2026", award: a.award, score: a.avg })
          .select("id")
          .single();
        if (insErr) {
          console.error(`  ! result insert ${a.registrationId}: ${insErr.message}`);
          continue;
        }
        resultId = inserted.id;
      }

      const { error: pubErr } = await sb
        .from("results")
        .update({ is_published: true, approved_by: approvedBy, approved_at: new Date().toISOString() })
        .eq("id", resultId);
      if (pubErr) {
        console.error(`  ! result publish ${a.registrationId}: ${pubErr.message}`);
        continue;
      }

      const { data: regRow } = await sb.from("registrations").select("student_id").eq("id", a.registrationId).single();
      let photoUrl = null;
      if (regRow?.student_id) {
        const { data: st } = await sb.from("students").select("photo_url").eq("id", regRow.student_id).single();
        photoUrl = st?.photo_url ?? null;
      }

      const { data: existingMedia } = await sb.from("winner_media").select("id").eq("result_id", resultId).maybeSingle();
      if (existingMedia) {
        await sb.from("winner_media").update({ photo_url: photoUrl, consent_confirmed: true }).eq("id", existingMedia.id);
      } else {
        await sb.from("winner_media").insert({ result_id: resultId, photo_url: photoUrl, consent_confirmed: true });
      }

      publishedSummary.push(`${a.award}(${a.avg})`);
    }

    console.log(`  ${slug}: published ${publishedSummary.length}/${averaged.length} result(s) — ${publishedSummary.join(", ")}`);
  }

  console.log("\nRecomputing school awards...");
  const schoolNameById = new Map(Object.values(schoolByKey).map((s) => [s.id, s.name]));
  await recomputeSchoolAwards(sb, schoolNameById);

  console.log("\nDone.");
  console.log(`All test coordinator/judge accounts share the password: ${PASSWORD}`);
}

main();
