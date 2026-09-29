// The Future Competence Framework competencies, by code. Every name here is
// taken from a competition manual's own "Competency alignment" section (see
// scripts/data/competitions/*.mjs) — codes no manual has named yet are left
// out rather than guessed. An admin can still tag a competition with any
// competency outside this list by typing its name; see CompetencyPicker.

export interface Competency {
  code: string;
  name: string;
}

export const COMPETENCIES: Competency[] = [
  { code: "C01", name: "Critical Thinking" },
  { code: "C02", name: "Problem Solving" },
  { code: "C03", name: "Research & Inquiry" },
  { code: "C04", name: "Learning to Learn" },
  { code: "C05", name: "Academic Communication" },
  { code: "C06", name: "Verbal Communication" },
  { code: "C07", name: "Written Communication" },
  { code: "C08", name: "Presentation & Public Speaking" },
  { code: "C09", name: "Debate & Argumentation" },
  { code: "C10", name: "Interpersonal Communication" },
  { code: "C12", name: "Analytical Problem Solving" },
  { code: "C14", name: "Quantitative & Data Reasoning" },
  { code: "C16", name: "Digital Literacy" },
  { code: "C17", name: "Computational Thinking" },
  { code: "C18", name: "Programming & Technology" },
  { code: "C19", name: "Digital Media Creation" },
  { code: "C20", name: "Information & Media Literacy" },
  { code: "C21", name: "Creative Thinking" },
  { code: "C22", name: "Artistic Expression" },
  { code: "C23", name: "Design & Aesthetic Thinking" },
  { code: "C24", name: "Cultural Expression" },
  { code: "C25", name: "Creative Communication" },
  { code: "C26", name: "Leadership" },
  { code: "C27", name: "Planning & Organization" },
  { code: "C28", name: "Collaboration & Teamwork" },
  { code: "C29", name: "Entrepreneurship" },
  { code: "C36", name: "Social Responsibility" },
  { code: "C38", name: "Environmental Responsibility" },
  { code: "C40", name: "Service Project Management" },
  { code: "C41", name: "Self-Awareness" },
  { code: "C43", name: "Resilience & Adaptability" },
  { code: "C44", name: "Ethical & Responsible Decision Making" },
  { code: "C45", name: "Global & Intercultural Competence" },
];

const byCode = new Map(COMPETENCIES.map((c) => [c.code, c]));

/** Broad themes the individual competencies roll up into — what the Results
 * page's "Browse by category" filters by. A competition belongs to every
 * group any of its competencies falls in; custom (non-coded) competencies are
 * matched by name. */
export interface CompetencyGroup {
  key: string;
  label: string;
  members: string[];
}

export const COMPETENCY_GROUPS: CompetencyGroup[] = [
  { key: "problem-solving", label: "Problem-solving", members: ["C01", "C02", "C12", "C14", "Analytical Reasoning", "Calculation", "Interpretation"] },
  { key: "communication", label: "Communication", members: ["C05", "C06", "C07", "C08", "C09", "C10", "Explanation"] },
  { key: "creativity", label: "Creativity", members: ["C21", "C22", "C23", "C24", "C25", "Storytelling"] },
  { key: "technology", label: "Technology", members: ["C16", "C17", "C18", "C19", "C20"] },
  { key: "research", label: "Research & Inquiry", members: ["C03", "C04", "Scientific Inquiry", "Scientific Communication", "Observation"] },
  { key: "innovation", label: "Innovation", members: ["C29", "Innovation"] },
  { key: "leadership", label: "Leadership", members: ["C26", "C27", "C28"] },
  {
    key: "citizenship",
    label: "Character & Citizenship",
    members: ["C36", "C38", "C40", "C41", "C43", "C44", "C45", "Empathy", "Responsibility", "Advocacy"],
  },
];

const groupByMember = new Map(
  COMPETENCY_GROUPS.flatMap((g) => g.members.map((m) => [m.toLowerCase(), g] as const)),
);

/** The groups a competition's competencies fall into, in the order its
 * competencies are listed — so the first entry is its lead theme. */
export function competencyGroupsFor(competencies: string[]): CompetencyGroup[] {
  const out: CompetencyGroup[] = [];
  for (const c of competencies) {
    const group = groupByMember.get(c.toLowerCase());
    if (group && !out.includes(group)) out.push(group);
  }
  return out;
}

/** "C01 Critical Thinking" for a framework code; a custom entry is shown as
 * typed. */
export function competencyLabel(value: string): string {
  const known = byCode.get(value);
  return known ? `${known.code} ${known.name}` : value;
}

/** Trims, drops blanks and removes duplicates (case-insensitively), keeping
 * the first spelling — what gets saved from the admin form. */
export function normalizeCompetencies(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const value = raw.trim();
    if (!value || seen.has(value.toLowerCase())) continue;
    seen.add(value.toLowerCase());
    out.push(value);
  }
  return out;
}

/** Framework codes first in code order, then custom entries alphabetically —
 * the order used for filter options and chips. */
export function sortCompetencies(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const aKnown = byCode.has(a);
    const bKnown = byCode.has(b);
    if (aKnown !== bKnown) return aKnown ? -1 : 1;
    return a.localeCompare(b);
  });
}
