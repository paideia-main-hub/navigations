// Dummy award nominations for testing the admin scoring/winner-computation
// flow end to end. Reuses real accounts already in the project (school
// coordinators via school_coordinators, students via profiles) rather than
// inventing fake auth users, so "log in as that account and check My
// Nominations" also works. Safe to re-run — clears its own previously
// seeded rows first (marked by a "[DUMMY]" prefix on nomination_number) so
// re-running doesn't pile up duplicates.
//
// Usage: node scripts/seed-dummy-nominations.mjs

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

function nominationNumber(seq) {
  return `[DUMMY]FRL-${new Date().getFullYear()}-${String(seq).padStart(4, "0")}`;
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (check .env.local).");
    process.exit(1);
  }
  const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  // Clean up any previously seeded dummy rows first (cascades to their
  // evidence/event-record children automatically).
  const { data: old } = await supabase.from("award_nominations").select("id").like("nomination_number", "[DUMMY]%");
  if (old && old.length > 0) {
    await supabase.from("award_nominations").delete().in("id", old.map((r) => r.id));
    console.log(`Removed ${old.length} previously seeded dummy nomination(s).`);
  }

  const { data: categories } = await supabase.from("award_categories").select("id, slug");
  const catId = Object.fromEntries((categories ?? []).map((c) => [c.slug, c.id]));

  const { data: coordinators } = await supabase
    .from("school_coordinators")
    .select("profile_id, school_id, schools(official_name)")
    .limit(6);
  if (!coordinators || coordinators.length === 0) {
    console.error("No school_coordinators found — register at least one school account first.");
    process.exit(1);
  }

  const { data: students } = await supabase.from("profiles").select("id, full_name").eq("role", "student").limit(6);
  if (!students || students.length === 0) {
    console.error("No student profiles found — register at least one student account first.");
    process.exit(1);
  }

  let seq = 1;
  const nominations = [];

  function schoolNomination(categorySlug, nomineeName, relationship, formData) {
    const c = coordinators[nominations.length % coordinators.length];
    nominations.push({
      nomination_number: nominationNumber(seq++),
      category_id: catId[categorySlug],
      nominator_profile_id: c.profile_id,
      school_id: c.school_id,
      nominee_name: nomineeName,
      nominee_relationship: relationship,
      form_data: formData,
      verifier_name: "Verification Office",
      verifier_contact: "verify@example.com",
      consent_terms: true,
      consent_privacy: true,
      consent_result_publication: true,
      consent_photo_publication: true,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    });
    return nominations[nominations.length - 1];
  }

  function independentNomination(categorySlug, route, formData) {
    const s = students[nominations.length % students.length];
    nominations.push({
      nomination_number: nominationNumber(seq++),
      category_id: catId[categorySlug],
      nominator_profile_id: s.id,
      school_id: null,
      nominee_name: s.full_name,
      nominee_relationship: "Self",
      route: route ?? null,
      form_data: formData,
      verifier_name: "Community Verifier",
      verifier_contact: "verifier@example.com",
      consent_terms: true,
      consent_privacy: true,
      consent_result_publication: true,
      consent_photo_publication: true,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    });
    return nominations[nominations.length - 1];
  }

  // --- Idea of the Year (3) ---
  independentNomination("idea-of-the-year", "implemented", {
    title: "Solar-Powered Water Purifier for Rural Classrooms",
    summary: "A low-cost solar water purifier built and piloted at a village school.",
    problem: "Students at the pilot school had no reliable access to clean drinking water.",
    intended_users: "Rural primary school students and staff.",
    idea: "A solar-powered UV purification unit built from locally available parts.",
    personal_contribution: "Designed the circuit, built two prototypes, and ran the school pilot.",
    implementation_plan: "Piloted at one school for one term, then proposed to two more schools.",
    results_success_measures: "Zero reported waterborne illness during the 3-month pilot; 140 students served daily.",
    next_steps: "Seeking sponsorship to build 5 more units for neighboring schools.",
  });
  schoolNomination("idea-of-the-year", "Zainab Fatima", "Grade 9 Student", {
    title: "Peer Tutoring Network for Math Anxiety",
    summary: "A structured peer-tutoring rota pairing struggling students with trained peer tutors.",
    problem: "Many students disengaged from math after repeated low grades.",
    intended_users: "Grade 7-9 students struggling with math.",
    idea: "Weekly peer tutoring sessions run by trained senior students.",
    personal_contribution: "Recruited and trained 12 peer tutors and built the scheduling system.",
    implementation_plan: "Ran for one semester across 3 sections.",
    results_success_measures: "Average test scores among tutored students rose 18% over the semester.",
    next_steps: "Expand to all grade levels next year.",
  });
  schoolNomination("idea-of-the-year", "Hamza Tariq", "Grade 10 Student", {
    title: "Campus Waste Sorting App",
    summary: "A simple app + bin-labeling system to improve recycling rates on campus.",
    problem: "Less than 10% of recyclable waste was actually being sorted correctly.",
    intended_users: "All students and staff on campus.",
    idea: "Color-coded bins plus a lightweight app that gamifies correct sorting.",
    personal_contribution: "Built the app and ran the awareness campaign.",
    implementation_plan: "Trial in 2 buildings before campus-wide rollout.",
    results_success_measures: "Correct sorting rate rose from 10% to 47% during the trial.",
    next_steps: "Campus-wide rollout next term, pending facilities approval.",
  });

  // --- Story of the Year (2) ---
  schoolNomination("story-of-the-year", "Mahnoor Khan", "Grade 8 Student", {
    narrative:
      "Two years ago I could barely read aloud in class without my hands shaking. My family had moved twice in one year and I'd fallen behind. My English teacher started giving me five extra minutes after class, just to read together, no pressure. I started volunteering to read the morning announcements — badly, at first. By this year I was chosen to represent my class at the inter-school public speaking round. The biggest change wasn't the trophy — it was that I stopped being afraid of my own voice in a room.",
  });
  independentNomination("story-of-the-year", null, {
    narrative:
      "I run a small tuck shop stall my family depends on. Last year I taught myself basic bookkeeping from library books because we kept losing track of credit given to neighbors. Within four months our stall stopped running at a loss for the first time in years. It wasn't dramatic, but it meant my younger siblings' school fees were never late again.",
  });

  // --- Young Changemaker (2) ---
  schoolNomination("young-changemaker", "Ibrahim Sheikh", "Grade 11 Student", {
    need_description: "Elderly residents in the neighborhood had no way to get groceries during heavy rain season.",
    actions_taken: "Organized a rotating group of 15 students to deliver groceries twice a week.",
    response_from_others: "Local shopkeepers began offering a small discount for the program once it gained attention.",
    positive_change_result: "Over 30 households received reliable deliveries for the full rain season.",
    continuity_plan: "Handed the rota system to the school's community service club to continue next year.",
  });
  independentNomination("young-changemaker", null, {
    need_description: "Younger kids in my street had nowhere safe to do homework after school.",
    actions_taken: "Started a free after-school homework circle in our building's common area.",
    response_from_others: "Two parents volunteered to help supervise; a local shop donated stationery.",
    positive_change_result: "12 children now attend regularly; several improved their term grades.",
    continuity_plan: "A parent has agreed to keep running it during my exam term.",
  });

  // --- Supportive Teacher (2, no scoring) ---
  schoolNomination("supportive-teacher", "Ms. Sadia Anwar", "Grade 8 Homeroom Teacher", {
    contribution_statement:
      "Coordinated every League registration for her homeroom, ran after-school prep sessions unpaid, and personally accompanied students to two competition venues.",
  });
  schoolNomination("supportive-teacher", "Mr. Faisal Iqbal", "Science Coordinator", {
    contribution_statement: "Built and ran the school's entire practice-lab schedule for the Robotics and STEM competitions this season.",
  });

  // --- Supportive Parent (1, no scoring) ---
  schoolNomination("supportive-parent", "Mrs. Nadia Chaudhry", "Parent of a Grade 6 student", {
    contribution_statement: "Organized carpooling for 8 families to every competition round and helped run the school's prep-day snack table.",
  });

  // --- Excellence Athlete (2) ---
  schoolNomination("excellence-athlete", "Usman Ali", "Grade 10 Student", {
    development_summary: "Two-year competitive swimmer, moved from district-level to provincial qualifying times.",
    reflection: "Training six mornings a week taught me more about discipline than any classroom could.",
  });
  schoolNomination("excellence-athlete", "Sana Yousaf", "Grade 9 Student", {
    development_summary: "Badminton singles player, selected for the district team both years of the evidence period.",
    reflection: "I focused on footwork drills after a rough first season, and it turned my results around.",
  });

  // --- Blazer Athlete (1, needs 3 event records) ---
  const blazer = schoolNomination("blazer-athlete", "Ahmed Raza", "Grade 11 Student", {
    development_summary: "Competed at a selection or competitive level in athletics, swimming and badminton across both evidence years.",
    reflection: "Balancing three sports taught me to plan my week around recovery, not just training.",
  });
  blazer.eventRecords = [
    { sport: "Athletics", event: "400m", organizer: "District Athletics Board", level: "District", role: "Competitor", result: "2nd place", evidence_note: "Certificate on file" },
    { sport: "Swimming", event: "50m Freestyle", organizer: "School Swimming Gala", level: "Inter-school", role: "Competitor", result: "1st place", evidence_note: "Organizer confirmation letter" },
    { sport: "Badminton", event: "Singles", organizer: "City Badminton Association", level: "City", role: "Selected squad", result: "Quarter-finalist", evidence_note: "Selection letter" },
  ];

  // --- Best Principal (2) ---
  schoolNomination("best-principal", "Dr. Farrukh Naseem", "Principal", {
    support_account: "Personally chaired weekly League coordination meetings and secured transport for every away round this season.",
  });
  schoolNomination("best-principal", "Ms. Alia Hassan", "Principal", {
    support_account: "Restructured the timetable to protect practice sessions and attended every final round in person.",
  });

  // Insert nominations, then event records for any that have them.
  for (const n of nominations) {
    const { eventRecords, ...row } = n;
    const { data, error } = await supabase.from("award_nominations").insert(row).select("id").single();
    if (error) {
      console.error(`Failed to seed nomination for ${n.nominee_name}: ${error.message}`);
      continue;
    }
    console.log(`Seeded: ${n.nomination_number} — ${n.nominee_name}`);
    if (eventRecords) {
      await supabase.from("award_event_records").insert(
        eventRecords.map((e, i) => ({ nomination_id: data.id, order_index: i, ...e })),
      );
    }
  }

  console.log(`\nDone — ${nominations.length} dummy nominations seeded across every judged/nominated category.`);
  console.log("Review and score them from Admin Console > Nominations.");
}

main();
