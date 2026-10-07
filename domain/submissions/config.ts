// What each Independent Submission competition asks students to hand in, and
// the rubric an admin scores it against — both taken from the competitions'
// official manuals (MANUALS/MANUALS/InquiryQuest_Complete_Operations_Manual_v1_0,
// CulturalScript_Future_Ready_League_Official_Manual,
// Humanity_Message_Future_Ready_League_Official_Manual). The student form and
// the admin review screen are both generated from this file, and the server
// validates submissions and scores against it.

export type FieldDef =
  | { kind: "text"; id: string; label: string; help?: string; required?: boolean; showIf?: Condition }
  | {
      kind: "textarea";
      id: string;
      label: string;
      help?: string;
      required?: boolean;
      /** inclusive word-count range, enforced on submit */
      words?: [number, number];
      showIf?: Condition;
    }
  | { kind: "select"; id: string; label: string; help?: string; required?: boolean; options: string[]; showIf?: Condition }
  | {
      kind: "file";
      id: string;
      label: string;
      help?: string;
      required?: boolean;
      /** <input accept>, e.g. ".pdf,.docx" */
      accept: string;
      /** extensions allowed, lower-case, without the dot */
      extensions: string[];
      showIf?: Condition;
      /** when set, a link field can stand in for this file (large videos) */
      linkAlternative?: string;
    }
  | { kind: "url"; id: string; label: string; help?: string; showIf?: Condition }
  | { kind: "declaration"; id: string; label: string };

export interface Condition {
  field: string;
  equals: string;
}

export interface RubricCriterion {
  key: string;
  label: string;
  max: number;
}

export interface RubricGroup {
  /** e.g. "Stage 1 — Problem Interpretation"; omitted for flat rubrics */
  title?: string;
  criteria: RubricCriterion[];
}

export interface SubmissionCompetition {
  slug: string;
  title: string;
  /** one-paragraph brief shown above the form */
  brief: string;
  fields: FieldDef[];
  rubric: RubricGroup[];
}

/** Largest single upload the storage bucket accepts (migration 0025). */
export const MAX_UPLOAD_MB = 50;

const AI_USE_OPTIONS = [
  "No AI tools were used",
  "AI was used only for permitted support (ideas, spelling/grammar, learning techniques) — described below",
];

export const SUBMISSION_COMPETITIONS: SubmissionCompetition[] = [
  {
    slug: "inquiryquest",
    title: "InquiryQuest",
    brief:
      "Submit your structured scientific inquiry report on the organiser-issued problem, with your source log, evidence/data record and reflection/revision log. Recommended length 1,500–2,000 words (6–8 A4 pages), excluding title page, references and appendices.",
    fields: [
      {
        kind: "select",
        id: "track",
        label: "Science track of the issued problem",
        required: true,
        options: ["Chemistry", "Physics", "Biology", "General Science"],
      },
      { kind: "text", id: "title", label: "Report title", required: true },
      {
        kind: "textarea",
        id: "research_question",
        label: "Research question",
        help: "One focused question you investigated — answerable with evidence from the research window.",
        required: true,
        words: [5, 80],
      },
      {
        kind: "textarea",
        id: "hypothesis",
        label: "Hypothesis or prediction (if used)",
        help: "If [factor changes], then [outcome is expected to change] because [scientific reasoning].",
        words: [0, 120],
      },
      {
        kind: "file",
        id: "report",
        label: "Inquiry report",
        help: "PDF or Word. Title · Problem Context · Research Question/Hypothesis · Background · Method · Evidence/Data · Analysis · Conclusion · Limitations · Reflection · References.",
        required: true,
        accept: ".pdf,.doc,.docx",
        extensions: ["pdf", "doc", "docx"],
      },
      {
        kind: "file",
        id: "source_log",
        label: "Source log",
        help: "Author/organisation, title, date, key evidence used and a credibility note for each source.",
        required: true,
        accept: ".pdf,.doc,.docx,.xls,.xlsx,.csv",
        extensions: ["pdf", "doc", "docx", "xls", "xlsx", "csv"],
      },
      {
        kind: "file",
        id: "evidence_record",
        label: "Evidence / data record",
        help: "Raw or summarised data, observation sheets or secondary evidence notes — traceable to your conclusion.",
        required: true,
        accept: ".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png",
        extensions: ["pdf", "doc", "docx", "xls", "xlsx", "csv", "jpg", "jpeg", "png"],
      },
      {
        kind: "file",
        id: "reflection_log",
        label: "Reflection & revision log",
        help: "Optional if your reflection is already inside the report.",
        accept: ".pdf,.doc,.docx",
        extensions: ["pdf", "doc", "docx"],
      },
      { kind: "select", id: "ai_use", label: "AI use", required: true, options: AI_USE_OPTIONS },
      {
        kind: "textarea",
        id: "ai_details",
        label: "Describe the AI support used",
        required: true,
        words: [3, 150],
        showIf: { field: "ai_use", equals: AI_USE_OPTIONS[1] },
      },
      {
        kind: "declaration",
        id: "integrity",
        label:
          "I declare that the data, sources and writing are my own and authentic: no fabricated data, invented sources, altered results or copied text, and every external idea, data point, image or quotation is acknowledged.",
      },
    ],
    rubric: [
      {
        title: "Stage 1 — Problem Interpretation, Research Question & Hypothesis",
        criteria: [
          { key: "s1_problem", label: "Problem understanding", max: 4 },
          { key: "s1_question", label: "Research question", max: 5 },
          { key: "s1_hypothesis", label: "Hypothesis or prediction", max: 3 },
          { key: "s1_scope", label: "Scope and variables", max: 3 },
        ],
      },
      {
        title: "Stage 2 — Research Plan & Source Evaluation",
        criteria: [
          { key: "s2_plan", label: "Inquiry plan", max: 5 },
          { key: "s2_strategy", label: "Source strategy", max: 5 },
          { key: "s2_evaluation", label: "Source evaluation", max: 5 },
          { key: "s2_safety", label: "Feasibility and safety", max: 5 },
        ],
      },
      {
        title: "Stage 3 — Evidence / Data Collection",
        criteria: [
          { key: "s3_method", label: "Method alignment", max: 5 },
          { key: "s3_quality", label: "Evidence quality", max: 5 },
          { key: "s3_traceability", label: "Traceability and records", max: 5 },
          { key: "s3_reliability", label: "Reliability and repeatability", max: 5 },
        ],
      },
      {
        title: "Stage 4 — Analysis, Synthesis & Scientific Conclusion",
        criteria: [
          { key: "s4_organisation", label: "Data and evidence organisation", max: 4 },
          { key: "s4_patterns", label: "Pattern interpretation", max: 5 },
          { key: "s4_synthesis", label: "Evidence synthesis", max: 4 },
          { key: "s4_conclusion", label: "Conclusion", max: 4 },
          { key: "s4_limitations", label: "Limitations", max: 3 },
        ],
      },
      {
        title: "Stage 5 — Final Inquiry Report & Citation",
        criteria: [
          { key: "s5_structure", label: "Report structure", max: 4 },
          { key: "s5_writing", label: "Scientific writing", max: 4 },
          { key: "s5_figures", label: "Tables and figures", max: 3 },
          { key: "s5_citation", label: "Citation and references", max: 4 },
        ],
      },
      {
        title: "Stage 6 — Reflection, Revision & Research Integrity",
        criteria: [
          { key: "s6_revision", label: "Revision quality", max: 4 },
          { key: "s6_reflection", label: "Research reflection", max: 3 },
          { key: "s6_integrity", label: "Integrity and ownership", max: 3 },
        ],
      },
    ],
  },
  {
    slug: "culturescript",
    title: "CultureScript",
    brief:
      "Theme: Cultural Diversity in Pakistan — Many Cultures, One Nation. Submit one original 3–5 minute video (MP4, landscape 16:9 recommended) with a 50–100 word Creator Statement, your sources/credits and the required declarations. Recommended file name: CulturalScript-CandidateName-SchoolName-CampusName.mp4.",
    fields: [
      { kind: "text", id: "title", label: "Final video title", required: true },
      {
        kind: "select",
        id: "approach",
        label: "Video approach",
        required: true,
        options: [
          "Short documentary",
          "Cultural story",
          "Visual essay",
          "Interview-led story",
          "Narrated cultural journey",
          "Heritage story",
          "Community portrait",
          "Contrast-and-connection narrative",
          "Cultural tradition explained through storytelling",
          "Original creative concept",
        ],
      },
      {
        kind: "select",
        id: "focus",
        label: "Cultural focus",
        required: true,
        options: [
          "Regional traditions",
          "Languages",
          "Heritage",
          "Music",
          "Crafts",
          "Architecture",
          "Clothing",
          "Food traditions",
          "Festivals",
          "Literature",
          "Folklore",
          "Traditional practices",
          "Local history",
          "Community values",
          "Cultural similarities",
          "Interregional connections",
          "Shared national values",
        ],
      },
      { kind: "select", id: "language", label: "Language of the video", required: true, options: ["English", "Urdu", "Pakistani regional language"] },
      { kind: "text", id: "regional_language", label: "Which regional language?", required: true, showIf: { field: "language", equals: "Pakistani regional language" } },
      {
        kind: "select",
        id: "subtitles",
        label: "Subtitles",
        help: "Required when needed for judges to understand the video fairly.",
        required: true,
        options: ["Subtitles included", "Not needed"],
      },
      {
        kind: "file",
        id: "video",
        label: "Video (MP4, 3–5 minutes)",
        help: `Upload here if under ${MAX_UPLOAD_MB} MB — otherwise paste a share link below (YouTube unlisted, Google Drive, etc. — make sure anyone with the link can view).`,
        accept: "video/mp4,.mp4",
        extensions: ["mp4"],
        required: true,
        linkAlternative: "video_link",
      },
      { kind: "url", id: "video_link", label: "…or video link" },
      {
        kind: "textarea",
        id: "creator_statement",
        label: "Creator Statement",
        help: "The cultural idea, your intended message, and how the video connects diversity with unity.",
        required: true,
        words: [50, 100],
      },
      {
        kind: "textarea",
        id: "sources",
        label: "Sources & credits",
        help: "Research sources, interviewees, music, external clips or images used — with permission/licence where needed.",
        words: [0, 300],
      },
      { kind: "select", id: "ai_use", label: "AI use", required: true, options: AI_USE_OPTIONS },
      {
        kind: "textarea",
        id: "ai_details",
        label: "Describe the AI support used",
        required: true,
        words: [3, 150],
        showIf: { field: "ai_use", equals: AI_USE_OPTIONS[1] },
      },
      {
        kind: "declaration",
        id: "originality",
        label:
          "This video is my own original work: I led the research, script, recording and editing, and it is not substantially produced by an adult or made mainly from other creators' material.",
      },
      {
        kind: "declaration",
        id: "external_material",
        label:
          "Any external music, footage or images are credited and used with permission, and identifiable people or restricted locations were filmed with the required permission.",
      },
    ],
    rubric: [
      {
        criteria: [
          { key: "cultural_understanding", label: "Cultural Understanding & Authentic Representation", max: 20 },
          { key: "storytelling", label: "Storytelling & Creative Communication", max: 20 },
          { key: "diversity", label: "Diversity, Inclusion & Intercultural Understanding", max: 15 },
          { key: "unity", label: "Unity / One Nation Message", max: 15 },
          { key: "media", label: "Digital Media Creation & Technical Execution", max: 10 },
          { key: "originality", label: "Originality & Student Voice", max: 10 },
          { key: "research", label: "Research Accuracy & Responsible Media Use", max: 5 },
          { key: "impact", label: "Overall Impact & Audience Engagement", max: 5 },
        ],
      },
    ],
  },
  {
    slug: "message-for-humanity",
    title: "Message for Humanity",
    brief:
      "Choose one theme and one format and communicate one focused message of empathy: a written message (50–150 words), one original A4 drawing/visual message, or a video of up to 30 seconds (MP4). Entries are judged on the message, not on production polish.",
    fields: [
      { kind: "select", id: "theme", label: "Theme", required: true, options: ["Empathy in Teaching", "Empathy Among Peers"] },
      {
        kind: "select",
        id: "format",
        label: "Submission format",
        required: true,
        options: ["Written message", "Drawing / visual message", "30-second video"],
      },
      { kind: "text", id: "title", label: "Title of your message", required: true },
      {
        kind: "textarea",
        id: "message_text",
        label: "Your written message",
        help: "A short message, reflection, micro-story, open letter or appeal. Few words. Clear meaning. Strong impact.",
        required: true,
        words: [50, 150],
        showIf: { field: "format", equals: "Written message" },
      },
      {
        kind: "file",
        id: "artwork",
        label: "Artwork (JPG, PNG or PDF — one page)",
        required: true,
        accept: ".jpg,.jpeg,.png,.pdf",
        extensions: ["jpg", "jpeg", "png", "pdf"],
        showIf: { field: "format", equals: "Drawing / visual message" },
      },
      { kind: "text", id: "caption", label: "Caption (optional)", showIf: { field: "format", equals: "Drawing / visual message" } },
      {
        kind: "file",
        id: "video",
        label: "Video (MP4, maximum 30 seconds)",
        help: `Upload here if under ${MAX_UPLOAD_MB} MB — otherwise paste a share link below.`,
        required: true,
        accept: "video/mp4,.mp4",
        extensions: ["mp4"],
        showIf: { field: "format", equals: "30-second video" },
        linkAlternative: "video_link",
      },
      { kind: "url", id: "video_link", label: "…or video link", showIf: { field: "format", equals: "30-second video" } },
      { kind: "select", id: "ai_use", label: "AI use", required: true, options: AI_USE_OPTIONS },
      {
        kind: "textarea",
        id: "ai_details",
        label: "Describe the AI support used",
        required: true,
        words: [3, 150],
        showIf: { field: "ai_use", equals: AI_USE_OPTIONS[1] },
      },
      {
        kind: "declaration",
        id: "originality",
        label:
          "This message is my own idea and work — a teacher or parent did not create the message, artwork or video, and AI did not generate it.",
      },
      {
        kind: "declaration",
        id: "safeguarding",
        label:
          "My entry does not identify, embarrass or share private information about any real person, and I have permission from anyone identifiable in it.",
      },
    ],
    rubric: [
      {
        criteria: [
          { key: "empathy", label: "Understanding of Empathy", max: 20 },
          { key: "clarity", label: "Clarity & Relevance of Message", max: 15 },
          { key: "impact", label: "Emotional & Human Impact", max: 20 },
          { key: "creativity", label: "Creativity & Originality", max: 15 },
          { key: "narrative", label: "Narrative / Communication Effectiveness", max: 15 },
          { key: "action", label: "Positive Action / Takeaway", max: 10 },
          { key: "technical", label: "Technical / Presentation Quality", max: 5 },
        ],
      },
    ],
  },
];

const bySlug = new Map(SUBMISSION_COMPETITIONS.map((c) => [c.slug, c]));

export function submissionConfigFor(slug: string): SubmissionCompetition | undefined {
  return bySlug.get(slug);
}

export const SUBMISSION_SLUGS = SUBMISSION_COMPETITIONS.map((c) => c.slug);

/** True when the competition should offer online work upload.
 * Form fields still come from SUBMISSION_COMPETITIONS by slug; the
 * hasOnlineSubmission / Independent pathway flags mark intent in admin. */
export function competitionTakesWorkUpload(competition: {
  slug: string;
  pathway?: string | null;
  hasOnlineSubmission?: boolean;
}): boolean {
  if (submissionConfigFor(competition.slug)) return true;
  if (competition.pathway === "independent_submission") return true;
  return Boolean(competition.hasOnlineSubmission);
}

export function rubricCriteria(config: SubmissionCompetition): RubricCriterion[] {
  return config.rubric.flatMap((g) => g.criteria);
}

export function rubricMax(config: SubmissionCompetition): number {
  return rubricCriteria(config).reduce((sum, c) => sum + c.max, 0);
}

export function isFieldVisible(field: FieldDef, answers: Record<string, string>): boolean {
  if (!("showIf" in field) || !field.showIf) return true;
  return answers[field.showIf.field] === field.showIf.equals;
}

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export type SubmissionStatus = "draft" | "submitted" | "scored";

export const submissionStatusLabels: Record<SubmissionStatus, string> = {
  draft: "Draft — not submitted",
  submitted: "Submitted — awaiting review",
  scored: "Reviewed & scored",
};

export interface SubmissionFile {
  path: string;
  name: string;
  size: number;
}

export interface WorkSubmission {
  id: string;
  registrationId: string;
  competitionSlug: string;
  answers: Record<string, string>;
  files: Record<string, SubmissionFile>;
  status: SubmissionStatus;
  submittedAt: string | null;
  scores: Record<string, number>;
  totalScore: number | null;
  maxScore: number | null;
  feedback: string | null;
  reviewedAt: string | null;
}

/** Problems that block a final submission (an empty list means it can be
 * submitted). Drafts may be saved with any of these outstanding. */
export function validateForSubmit(
  config: SubmissionCompetition,
  answers: Record<string, string>,
  files: Record<string, SubmissionFile>,
): string[] {
  const problems: string[] = [];
  for (const field of config.fields) {
    if (!isFieldVisible(field, answers)) continue;
    const value = (answers[field.id] ?? "").trim();
    switch (field.kind) {
      case "declaration":
        if (value !== "yes") problems.push(`Tick the declaration: “${field.label.slice(0, 60)}…”`);
        break;
      case "file": {
        const link = field.linkAlternative ? (answers[field.linkAlternative] ?? "").trim() : "";
        if (field.required && !files[field.id] && !link) {
          problems.push(field.linkAlternative ? `Upload “${field.label}” or paste a link to it.` : `Upload “${field.label}”.`);
        }
        break;
      }
      case "url":
        if (value && !/^https?:\/\/\S+\.\S+/i.test(value)) problems.push(`“${field.label}” must be a full link starting with https://`);
        break;
      default:
        if (field.required && !value) problems.push(`Fill in “${field.label}”.`);
        if (field.kind === "textarea" && field.words && value) {
          const n = wordCount(value);
          const [min, max] = field.words;
          if (n < min || n > max) problems.push(`“${field.label}” should be ${min}–${max} words (now ${n}).`);
        }
    }
  }
  return problems;
}
