import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import * as competitionService from "@/domain/competitions/service";
import {
  categoryLabels,
  competitionGradeLabel,
  entryFormatLabel,
  formatFee,
  isPubliclyVisible,
  manualTypeLabels,
  pathwayLabels,
  statusLabels,
  type Competition,
  type CompetitionSummary,
} from "@/domain/competitions/types";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
} from "@/domain/site/contact";
import { SUPPORT_FAQS } from "@/domain/support/faqs";
import {
  COMPETENCY_VISION_KNOWLEDGE,
  DASHBOARD_ONLY_KNOWLEDGE,
  SCHOOLS_PAGE_KNOWLEDGE,
  SEASON_CALENDAR_KNOWLEDGE,
  STUDENTS_PAGE_KNOWLEDGE,
} from "@/domain/support/publicPages";

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

function formatSummary(competition: CompetitionSummary): string {
  const fee =
    competition.feeRequired && competition.feeAmount != null
      ? `${formatFee(competition.feeAmount)} per student per competition (team of 3 = ${formatFee(competition.feeAmount * 3)})`
      : competition.feeRequired
        ? "fee required (amount on page) — charged per student per competition"
        : "no fee";
  const pathway = competition.pathway ? pathwayLabels[competition.pathway] : "pathway not set";
  const grades = competitionGradeLabel(competition.eligibility);
  const categories = [
    ...new Set(competition.eligibility.map((rule) => categoryLabels[rule.category])),
  ].join(", ");
  const events =
    competition.events.length === 0
      ? "none listed"
      : competition.events
          .map((event) => `${event.title} (${event.eventDate}${event.description ? `: ${truncate(event.description, 80)}` : ""})`)
          .join("; ");

  return [
    `- ${competition.title} (slug: ${competition.slug})`,
    `  URL: /competitions/${competition.slug}`,
    `  Status: ${statusLabels[competition.status]} · Pathway: ${pathway}`,
    `  Domain: ${competition.domain || "—"} · Season: ${competition.season || "—"}`,
    `  Fee: ${fee} · Entry: ${entryFormatLabel(competition)}`,
    `  Categories: ${categories || "—"} · Grades: ${grades}`,
    `  Dates cards: ${competition.datesCardOne || "—"} | ${competition.datesCardTwo || "—"}`,
    `  Venue: ${competition.venue || "—"} · Online submission: ${competition.hasOnlineSubmission ? "yes" : "no"}`,
    `  Short: ${truncate(competition.shortDescription || "", 220)}`,
    `  Events: ${events}`,
  ].join("\n");
}

function formatFull(competition: Competition): string {
  const lines = [formatSummary(competition)];

  if (competition.overview) {
    lines.push(`  Overview: ${truncate(competition.overview, 500)}`);
  }

  if (competition.stages.length > 0) {
    lines.push(
      `  Stages: ${competition.stages
        .map(
          (stage) =>
            `#${stage.stageNumber} ${stage.title} (${stage.format}, ${stage.duration}) — ${truncate(stage.taskDescription, 120)}`,
        )
        .join(" | ")}`,
    );
  }

  if (competition.manuals.length > 0) {
    lines.push(
      `  Manuals: ${competition.manuals
        .map((manual) => `${manualTypeLabels[manual.type]}: ${manual.title} (${manual.fileUrl})`)
        .join(" | ")}`,
    );
  }

  const publicRubrics = competition.rubrics.filter((rubric) => rubric.isPublic);
  if (publicRubrics.length > 0) {
    lines.push(
      `  Public rubrics: ${publicRubrics
        .map(
          (rubric) =>
            rubric.criteria.map((criterion) => `${criterion.name} ${criterion.weight}%`).join(", ") +
            (rubric.tieBreakRule ? ` (tie-break: ${truncate(rubric.tieBreakRule, 80)})` : ""),
        )
        .join(" | ")}`,
    );
  }

  if (competition.resources.length > 0) {
    lines.push(
      `  Resources: ${competition.resources
        .map((resource) => `${resource.title}${resource.videoUrl ? ` [video]` : ""}`)
        .join("; ")}`,
    );
  }

  if (competition.faqs.length > 0) {
    lines.push(
      `  Competition FAQs: ${competition.faqs
        .map((faq) => `Q: ${faq.question} A: ${truncate(faq.answer, 180)}`)
        .join(" || ")}`,
    );
  }

  const winners = competition.winners.filter((winner) => winner.published);
  if (winners.length > 0) {
    lines.push(
      `  Published winners: ${winners
        .map(
          (winner) =>
            `${winner.studentName} (${winner.schoolName}) — ${winner.customAwardLabel || winner.award}`,
        )
        .join("; ")}`,
    );
  }

  return lines.join("\n");
}

function createPublicSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function buildSiteKnowledgeUncached(): Promise<string> {
  const supabase = createPublicSupabase();
  const [summaries, full] = await Promise.all([
    competitionService.listPublicCompetitions(supabase),
    competitionService.listCompetitionsFull(supabase),
  ]);

  const publicFull = full.filter((competition) => isPubliclyVisible(competition.status));
  const bySlug = new Map(publicFull.map((competition) => [competition.slug, competition]));

  const competitionBlocks = summaries.map((summary) => {
    const detailed = bySlug.get(summary.slug);
    return detailed ? formatFull(detailed) : formatSummary(summary);
  });

  const faqs = SUPPORT_FAQS.map((item, index) => `${index + 1}. Q: ${item.question}\nA: ${item.answer}`).join(
    "\n\n",
  );

  return `
Navigations / Future Ready League (FRL) — public site assistant knowledge base.
Use this for public facts. Never invent fees, dates, winners, or rules missing below.
Prefer linking visitors to /competitions/{slug} for the full page.
For season schedule questions, use the Official season calendar section below (source of truth for /calendar). Do not invent ceremony dates.

FEE RULE (always apply this):
- The listed feeAmount is charged PER STUDENT for EACH competition — not once for a whole team.
- Total for a registration = feeAmount × number of students in that entry.
- Example: fee PKR 1,200 and a team of 3 → total PKR 3,600.
- Never say the fee is “per competition only” or that one payment covers an entire team.

Site map (public)
- /competitions — directory
- /competitions/{slug} — overview, eligibility, stages, manuals, rubrics, resources, announcements, results
- /students, /schools, /faqs, /contact, /manuals, /competency-vision, /calendar, results, awards
- /register/student, school registration paths
- Login: site log-in modal (students, school coordinators, judges) → /dashboard after sign-in

Contact
- Phone / WhatsApp: ${CONTACT_PHONE_DISPLAY}
- Email: ${CONTACT_EMAIL}
- Address: ${CONTACT_ADDRESS}

${SEASON_CALENDAR_KNOWLEDGE}

${COMPETENCY_VISION_KNOWLEDGE}

${STUDENTS_PAGE_KNOWLEDGE}

${SCHOOLS_PAGE_KNOWLEDGE}

General FAQs (/faqs)
${faqs}

${DASHBOARD_ONLY_KNOWLEDGE}

Live competitions (${summaries.length} public)
${competitionBlocks.join("\n\n") || "No public competitions published yet."}
`.trim();
}

/** Cached ~5 minutes so chat requests do not reload every competition on each message. */
export const getSiteKnowledge = unstable_cache(buildSiteKnowledgeUncached, ["support-chat-site-knowledge-v3"], {
  revalidate: 300,
});
