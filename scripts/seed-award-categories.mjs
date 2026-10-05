// One-time seed for award_categories, straight from
// documentation/FRL_Awards_Website_Publication_Copy.docx — without these
// rows, /awards, the dashboard nomination picker, and School Awards
// computation all have nothing to show, since nothing creates them
// automatically (the admin panel is the intended way to create them one at
// a time; this script does the same inserts in bulk from the spec).
//
// Safe to re-run: upserts by slug, so editing this file and re-running only
// touches the fields you changed. Nomination closing date now comes from
// documentation/FRL_Website_Calendar_REVISED_Nov_Dec_2026.docx (Route 2
// shares Route 1's registration window and its 22 November 2026 evidence
// deadline). Evidence period start/end are still left null — the awards doc
// gives each category its own evidence-window language (e.g. "the preceding
// two years") rather than one shared calendar window — so set those from
// the admin panel per category if a fixed window is ever wanted.
//
// Usage: node scripts/seed-award-categories.mjs

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

function crit(key, label, weight) {
  return { key, label, weight };
}

// Route 2 registration and evidence submission share Route 1's window:
// register 8 October - 10 November 2026, submit the complete nomination by
// 22 November 2026 (Pakistan Standard Time), per
// documentation/FRL_Website_Calendar_REVISED_Nov_Dec_2026.docx. Review runs
// 23 November - 4 December, with recognition at the 5-6 December finale.
const NOMINATION_CLOSING_AT = "2026-11-22T23:59:00+05:00";

/** Public card copy: description = line under title, details = body under divider.
 * Kept in sync with ui/components/awards/awardDetails.ts. */
const PUBLICATION = {
  "outstanding-performer": {
    description: "Setting the standard through exceptional skill and performance.",
    details:
      "Each of the 23 Route 1 competitions recognises three leading entries. Outstanding Performer is awarded to the first-ranked entry. Rankings follow the competition's published assessment rules. A pair or team receives one entry distinction, with certificates for its verified members. An entry can receive only one distinction in the same competition award pool.",
  },
  "distinguished-finalist": {
    description: "Standing out through strong skills and thoughtful execution.",
    details:
      "Each of the 23 Route 1 competitions recognises three leading entries. Distinguished Finalist is awarded to the second-ranked entry. Rankings follow the competition's published assessment rules. A pair or team receives one entry distinction, with certificates for its verified members. An entry can receive only one distinction in the same competition award pool.",
  },
  "emerging-talent": {
    description: "Showing promise today, inspiring possibilities for tomorrow.",
    details:
      "Each of the 23 Route 1 competitions recognises three leading entries. Emerging Talent is awarded to the third-ranked entry. Rankings follow the competition's published assessment rules. A pair or team receives one entry distinction, with certificates for its verified members. An entry can receive only one distinction in the same competition award pool.",
  },
  "future-ready-participant": {
    description: "Taking on challenges, building skills, preparing for tomorrow.",
    details:
      "Future Ready Participant recognises meaningful participation. Students who complete their competition receive recognition according to the published participation policy. This distinction celebrates skill practice and finishing the challenge — not only podium results.",
  },
  "champion-school": {
    description: "The school with the highest competition points total",
    details:
      "Champion points = (Outstanding Performer awards × 10) + (Distinguished Finalist awards × 6) + (Emerging Talent awards × 3). Only approved League competition results count. Each winning pair or team earns one set of points. Other recognition awards do not add points.",
  },
  "school-excellence": {
    description: "The school with the highest number of Outstanding Performer awards",
    details: "This award counts first positions only.",
  },
  "whole-school-participation": {
    description: "The school with the highest number of confirmed student–competition registrations",
    details:
      "A student registered for four competitions counts as four registrations. A team of three counts as three student registrations in that competition. Duplicate, draft, cancelled, withdrawn and rejected registrations do not count. Completion is not required for this registration-based award.",
  },
  "diversified-school": {
    description: "The school participating successfully across the widest range of competitions",
    details:
      "Each different competition counts once when the school completes at least one eligible entry. Multiple entries in the same competition do not increase the count. Coverage is the number of competitions completed divided by 23, multiplied by 100.",
  },
  "collaboration-and-integrity": {
    description: "The school that demonstrates the strongest coordination and cooperation during the League",
    details:
      "The organizer uses documented records; the highest verified score of at least 70% receives the award. Schools do not need to nominate themselves for any of the five School Awards — exact ties receive joint recognition, and a school may win more than one category.",
  },
  "idea-of-the-year": {
    description: "School-nominated or independent individuals — you don't have to win a League competition to submit",
    details:
      "Have you implemented an idea that made a difference, or developed a credible proposal for the future? Share the need you identified, your solution and the value it can create. Choose Implemented idea if you can show implementation and results within the published two-year evidence period, or Future proposal if your idea is planned for the upcoming edition or a stated future year (future proposals need credible research or testing, an implementation plan and measures of success). One award is planned; the highest verified score of at least 70% receives recognition.",
  },
  "story-of-the-year": {
    description: "School-nominated or independent individuals",
    details:
      "Share a true story of progress from home, school, work, personal life or the wider community — the starting point, the challenge, the actions taken, what changed and what you learned. Meaningful progress matters, even when it begins with a small step. Submit 600–1,000 words or an audio/video account of up to five minutes, with at least two supporting evidence items and one verifier. English and Urdu entries are welcome.",
  },
  "young-changemaker": {
    description: "A young person aged 5–25 who has influenced others to make a positive change",
    details:
      "Show what you initiated, how you involved people and what improved as a result. Contributions within a team are welcome when your own role is clear. Submit two dated evidence items, a before-and-after measure or observable outcome, and one beneficiary or independent adult verifier. Likes, views and followers do not by themselves prove positive change.",
  },
  "supportive-teacher": {
    description: "School-nominated teachers",
    details:
      "Thanks teachers for their guidance, coordination, encouragement and cooperation throughout the Future Ready League. This is a nomination-based acknowledgement with no competitive scoring, ranking or merit shortlist — every complete, valid school nomination receives the award. A person nominated more than once in the same category receives one award for that category.",
  },
  "supportive-parent": {
    description: "School-nominated parents and guardians",
    details:
      "Recognises the contribution of parents and guardians who make participation possible through encouragement, practical support and cooperation. Like Supportive Teacher, every complete, valid school nomination receives the award — no competitive scoring.",
  },
  "excellence-athlete": {
    description: "A student with sustained, verified performance in one primary sport over the previous two years",
    details:
      "Schools submit the nomination with a dated record of achievement, development and sportsmanship — a verified competitive achievement or selection in each of the two consecutive 12-month periods ending on the nomination deadline, plus evidence of regular development. Sports recognition celebrates documented achievement and does not add school leaderboard points.",
  },
  "blazer-athlete": {
    description: "A student with strong verified achievement across three distinct sports",
    details:
      "Schools must identify three sports and provide a competitive result or selection record for each within the two-year evidence period; different events in the same sport count as one sport. Each sport must score at least 10 out of 20, and the overall score must reach 70%. A student may receive both Excellence Athlete and Blazer Athlete if independently eligible for each.",
  },
  "best-principal": {
    description: "Up to 50 principals from participating schools",
    details: "This recognition does not change school leaderboard points.",
  },
};

const CATEGORIES = [
  {
    slug: "outstanding-performer",
    title: "Outstanding Performer",
    layer: "competition_distinction",
    description:
      "Each of the 23 Route 1 competitions recognises three leading entries. Outstanding Performer is awarded to the first-ranked entry. Rankings follow the competition's published assessment rules. A pair or team receives one entry distinction, with certificates for its verified members. An entry can receive only one distinction in the same competition award pool.",
    requiresSchool: false,
    allowsIndependent: false,
    rubricCriteria: [],
    passThreshold: 70,
    tieBreakOrder: [],
    maxWinners: null,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "distinguished-finalist",
    title: "Distinguished Finalist",
    layer: "competition_distinction",
    description:
      "Each of the 23 Route 1 competitions recognises three leading entries. Distinguished Finalist is awarded to the second-ranked entry. Rankings follow the competition's published assessment rules. A pair or team receives one entry distinction, with certificates for its verified members. An entry can receive only one distinction in the same competition award pool.",
    requiresSchool: false,
    allowsIndependent: false,
    rubricCriteria: [],
    passThreshold: 70,
    tieBreakOrder: [],
    maxWinners: null,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "emerging-talent",
    title: "Emerging Talent",
    layer: "competition_distinction",
    description:
      "Each of the 23 Route 1 competitions recognises three leading entries. Emerging Talent is awarded to the third-ranked entry. Rankings follow the competition's published assessment rules. A pair or team receives one entry distinction, with certificates for its verified members. An entry can receive only one distinction in the same competition award pool.",
    requiresSchool: false,
    allowsIndependent: false,
    rubricCriteria: [],
    passThreshold: 70,
    tieBreakOrder: [],
    maxWinners: null,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "future-ready-participant",
    title: "Future Ready Participant",
    layer: "competition_distinction",
    description:
      "Future Ready Participant recognises students who complete their Route 1 competition according to the published participation policy.",
    requiresSchool: false,
    allowsIndependent: false,
    rubricCriteria: [],
    passThreshold: 70,
    tieBreakOrder: [],
    maxWinners: null,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "champion-school",
    title: "Champion School Award",
    layer: "school_award",
    description:
      "Awarded to the school with the highest competition points total. Champion points = (Outstanding Performer awards × 10) + (Distinguished Finalist awards × 6) + (Emerging Talent awards × 3).",
    requiresSchool: false,
    allowsIndependent: false,
    rubricCriteria: [],
    passThreshold: 70,
    tieBreakOrder: [],
    maxWinners: null,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "school-excellence",
    title: "School Excellence Award",
    layer: "school_award",
    description: "Awarded to the school with the highest number of Outstanding Performer awards. Counts first positions only.",
    requiresSchool: false,
    allowsIndependent: false,
    rubricCriteria: [],
    passThreshold: 70,
    tieBreakOrder: [],
    maxWinners: null,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "whole-school-participation",
    title: "Whole School Participation Award",
    layer: "school_award",
    description:
      "Awarded to the school with the highest number of confirmed student–competition registrations across the League. Completion is not required for this registration-based award.",
    requiresSchool: false,
    allowsIndependent: false,
    rubricCriteria: [],
    passThreshold: 70,
    tieBreakOrder: [],
    maxWinners: null,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "diversified-school",
    title: "Diversified School Award",
    layer: "school_award",
    description:
      "Awarded to the school participating successfully across the widest range of competitions. Coverage is the number of competitions completed divided by 23, multiplied by 100.",
    requiresSchool: false,
    allowsIndependent: false,
    rubricCriteria: [],
    passThreshold: 70,
    tieBreakOrder: [],
    maxWinners: null,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "collaboration-and-integrity",
    title: "Collaboration and Integrity Award",
    layer: "school_award",
    description:
      "Recognises the school that demonstrates the strongest coordination and cooperation during the League. The organizer enters this score directly per school — no nomination.",
    requiresSchool: false,
    allowsIndependent: false,
    rubricCriteria: [
      crit("timely_coordination", "Timely and accurate coordination", 30),
      crit("communication", "Communication", 25),
      crit("cooperation_resolution", "Cooperation and problem resolution", 20),
      crit("integrity", "Integrity", 15),
      crit("professional_conduct", "Professional, inclusive conduct", 10),
    ],
    passThreshold: 70,
    tieBreakOrder: [],
    maxWinners: null,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "idea-of-the-year",
    title: "Idea of the Year",
    layer: "spotlight",
    description:
      "Have you implemented an idea that made a difference, or developed a credible proposal for the future? Share the need you identified, your solution and the value it can create. School-nominated or independent — you don't have to win a League competition to submit.",
    requiresSchool: false,
    allowsIndependent: true,
    rubricCriteria: [
      crit("problem_relevance", "Problem and relevance", 15),
      crit("originality_contribution", "Originality and your contribution", 20),
      crit("practicality_resources", "Practicality and resources", 20),
      crit("evidence_learning", "Evidence and learning", 25),
      crit("value_sustainability", "Value and sustainability", 20),
    ],
    passThreshold: 70,
    tieBreakOrder: ["evidence_learning", "originality_contribution"],
    maxWinners: 1,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "story-of-the-year",
    title: "Story of the Year",
    layer: "spotlight",
    description:
      "Share a true story of progress from home, school, work, personal life or the wider community. Meaningful progress matters, even when it begins with a small step. School-nominated or independent.",
    requiresSchool: false,
    allowsIndependent: true,
    rubricCriteria: [
      crit("authenticity_evidence", "Authenticity and evidence", 25),
      crit("significance_progress", "Significance of progress", 25),
      crit("agency_effort", "Agency and effort", 20),
      crit("reflection_learning", "Reflection and learning", 20),
      crit("clarity", "Clarity", 10),
    ],
    passThreshold: 70,
    tieBreakOrder: ["authenticity_evidence", "significance_progress"],
    maxWinners: 1,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "young-changemaker",
    title: "Young Changemaker Award",
    layer: "spotlight",
    description:
      "Recognises a young person aged 5–25 who has influenced others to make a positive change. Show what you initiated, how you involved people and what improved as a result. School-nominated or independent.",
    requiresSchool: false,
    allowsIndependent: true,
    rubricCriteria: [
      crit("positive_change", "Positive change", 30),
      crit("influence_involvement", "Influence and involvement of others", 25),
      crit("personal_initiative", "Personal initiative", 20),
      crit("continuity_action", "Continuity and responsible action", 15),
      crit("verification_reflection", "Verification and reflection", 10),
    ],
    passThreshold: 70,
    tieBreakOrder: ["positive_change", "influence_involvement"],
    maxWinners: 1,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "supportive-teacher",
    title: "Supportive Teacher Award",
    layer: "teacher_parent",
    description:
      "Thanks school-nominated teachers for their guidance, coordination, encouragement and cooperation throughout the Future Ready League. Nomination-based — no competitive scoring; every complete, valid nomination receives the award.",
    requiresSchool: true,
    allowsIndependent: false,
    rubricCriteria: [],
    passThreshold: 0,
    tieBreakOrder: [],
    maxWinners: null,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "supportive-parent",
    title: "Supportive Parent Award",
    layer: "teacher_parent",
    description:
      "Recognises the contribution of school-nominated parents and guardians to the League experience. Nomination-based — no competitive scoring; every complete, valid nomination receives the award.",
    requiresSchool: true,
    allowsIndependent: false,
    rubricCriteria: [],
    passThreshold: 0,
    tieBreakOrder: [],
    maxWinners: null,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "excellence-athlete",
    title: "Excellence Athlete Award",
    layer: "sports",
    description:
      "Recognises a student with sustained, verified performance and development in one primary sport over the previous two years. Schools submit the nomination with a dated record of achievement, development and sportsmanship.",
    requiresSchool: true,
    allowsIndependent: false,
    rubricCriteria: [
      crit("consistency_two_years", "Consistency across two years", 30),
      crit("performance_progression", "Verified performance and progression", 30),
      crit("commitment_development", "Commitment and development", 20),
      crit("sportsmanship_teamwork", "Sportsmanship and teamwork", 10),
      crit("evidence", "Evidence", 10),
    ],
    passThreshold: 70,
    tieBreakOrder: ["consistency_two_years", "performance_progression"],
    maxWinners: 1,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "blazer-athlete",
    title: "Blazer Athlete Award",
    layer: "sports",
    description:
      "Recognises a student with strong verified achievement across three distinct sports. Each sport must score at least 10/20, and the overall score must reach 70%.",
    requiresSchool: true,
    allowsIndependent: false,
    rubricCriteria: [
      crit("sport_1", "Performance — sport 1", 20),
      crit("sport_2", "Performance — sport 2", 20),
      crit("sport_3", "Performance — sport 3", 20),
      crit("consistency_two_years", "Consistency across two years", 15),
      crit("all_round_development", "All-round development", 10),
      crit("sportsmanship", "Sportsmanship", 10),
      crit("verification", "Verification", 5),
    ],
    passThreshold: 70,
    tieBreakOrder: ["sport_1", "consistency_two_years"],
    maxWinners: 1,
    closingAt: NOMINATION_CLOSING_AT,
  },
  {
    slug: "best-principal",
    title: "Best Principal Award",
    layer: "principal",
    description: "Up to 50 principals from participating schools",
    requiresSchool: true,
    allowsIndependent: false,
    rubricCriteria: [
      crit("timely_coordination", "Timely coordination", 30),
      crit("communication", "Communication", 25),
      crit("cooperation", "Cooperation", 20),
      crit("integrity", "Integrity", 15),
      crit("inclusive_conduct", "Inclusive professional conduct", 10),
    ],
    passThreshold: 0,
    tieBreakOrder: ["integrity", "timely_coordination", "communication"],
    maxWinners: 50,
    closingAt: NOMINATION_CLOSING_AT,
  },
];

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (check .env.local).");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  for (const c of CATEGORIES) {
    const publication = PUBLICATION[c.slug] ?? {};
    const { error } = await supabase.from("award_categories").upsert(
      {
        slug: c.slug,
        title: c.slug === "best-principal" ? "Best Principal Award" : c.title,
        layer: c.layer,
        description: publication.description ?? c.description,
        details: publication.details ?? c.description,
        requires_school: c.requiresSchool,
        allows_independent: c.allowsIndependent,
        rubric_criteria: c.rubricCriteria,
        pass_threshold: c.passThreshold,
        tie_break_order: c.tieBreakOrder,
        max_winners: c.maxWinners,
        closing_at: c.closingAt,
        // Best Principal is announced separately — keep it out of “Open for
        // nominations” unless an admin deliberately opens it later.
        status: c.slug === "best-principal" ? "closed" : "open",
      },
      { onConflict: "slug" },
    );
    if (error) {
      console.error(`Failed to seed ${c.slug}: ${error.message}`);
    } else {
      console.log(`Seeded: ${c.slug}`);
    }
  }

  console.log(`\nDone — ${CATEGORIES.length} award categories seeded/updated, all set to "open".`);
  console.log("Adjust descriptions, thresholds, tie-break order, evidence period and closing dates any time from Admin Console > Awards.");
}

main();
