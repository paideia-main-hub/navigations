// Extracted from MANUALS/MANUALS/Story_Spark_Manual.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "storyspark",
  title: "Story Spark",
  shortDescription:
    "Young storytelling challenge for Grades 3–5: see an idea, imagine possibilities, tell a story that connects.",
  domain: "Creative Communication & Storytelling",
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "live_response",
  image: null,
  manualFile: "Story_Spark_Manual.docx",

  overview: `Story Spark is a live Future Ready League storytelling competition for Grades 3–5. Each candidate receives an unseen age-appropriate story stimulus — an image, object, opening line, character, setting or combination — and a short preparation period, then creates and orally delivers an original story to judges.

The competition is designed to assess authentic creativity, narrative organisation, verbal communication and audience connection. It is not a memorised recitation, a prepared speech or a costume-based performance. Core question: can the student transform a simple unseen idea into an original, structured and engaging story and communicate it confidently?

Design principles — Prompt before performance: all candidates create from an unseen stimulus. Story before acting: narrative quality matters more than theatrical exaggeration. Originality before polish: authentic student ideas matter more than adult-coached language. Structure with freedom: stories should be coherent without forcing one "correct" plot. Age-appropriate confidence: normal pauses are acceptable, and students are never penalised for accent or personality style.

Competencies made observable: Creative Communication, Verbal Communication, Creativity & Imagination, Narrative Organisation, Perspective & Emotional Awareness, Confidence & Self-Management, and Audience Awareness.

Why it is fair: live unseen prompts reduce the value of memorised coaching, and no costly props or costumes are required.`,

  eligibility: [
    {
      category: "primary",
      minGrade: "3",
      maxGrade: "5",
      notes:
        "Open to Grades 3–5, individual participation. The League may run separate Grade 3, 4 and 5 categories or a combined category with age-sensitive judging expectations. Recommended preparation and delivery times by grade — Grade 3: 15 minutes prep, 2.5–4 minute story; Grade 4: 12 minutes prep, 3–4 minutes; Grade 5: 10 minutes prep, 3–5 minutes. No story is uploaded before the event.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Story Spark, Preparation & Live Storytelling",
      format: "Unseen stimulus, controlled preparation on the official planning sheet, then live oral storytelling to judges",
      duration: "10–15 minutes preparation by grade, then a 2.5–5 minute story",
      taskDescription: `The competition runs as one continuous live sequence. 1) Story Spark release — the candidate receives one unseen stimulus. 2) Preparation — the candidate plans independently on the official sheet only. 3) Live storytelling — the candidate tells the original story to judges. 4) Optional ownership question — a judge may ask one short question about a character, choice or ending. 5) Scoring — judges score independently using the published rubric. 6) Moderation — boundary and unusual scores are reviewed before results lock.

Prompt types include a single image, three related or contrasting images, an opening line, a simple organizer-provided object, a character card, a setting card, a situation card, or a mixed spark such as an image plus a surprise word. Every prompt must support multiple valid stories, stay age appropriate and culturally accessible, require no political or religious opinion, and remain confidential until all relevant candidates finish.

The official planning sheet supports thinking but must not become a full written script — brief words, phrases, arrows and simple notes only. It prompts the student to decide: Who? Where? Beginning. Change or problem. Development. Decision. Resolution. Ending. Audience takeaway.

Storytelling rules: the story must use the official prompt meaningfully; no full script reading is permitted even where the planning sheet may be carried in; stories must stay age appropriate and respectful; a clear beginning, development and ending are expected but no single plot structure is required; a moral is not compulsory; judges must not penalise accent; and excessive acting, costumes or imitation cannot substitute for storytelling quality.`,
      progressionRule:
        "Single-round live competition scored out of 100. Planning sheets may be retained for authenticity and moderation review.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Creativity & Originality", weight: 20 },
        { name: "Story Structure & Coherence", weight: 20 },
        { name: "Use of Story Spark", weight: 10 },
        { name: "Character, Setting & Development", weight: 15 },
        { name: "Language & Verbal Communication", weight: 15 },
        { name: "Expression & Audience Engagement", weight: 10 },
        { name: "Independent Delivery & Confidence", weight: 10 },
      ],
      tieBreakRule:
        "In order: 1) Creativity & Originality, 2) Story Structure & Coherence, 3) Language & Verbal Communication, 4) Use of Story Spark, 5) Independent Delivery & Confidence.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "The preparation method — CHARACTER → SETTING → CHANGE → DEVELOPMENT → DECISION → RESOLUTION → ENDING",
      content: `Practise story-building habits rather than memorising finished stories. Practise with random images or objects. Tell the same prompt in two different ways to build flexibility. Use a simple beginning–middle–ending structure before adding detail. Practise speaking for the category time without reading a script. Use natural expression rather than exaggerated performance. After each practice, reflect: was my story easy to follow, and did the prompt actually matter to the plot?`,
    },
    {
      type: "sample_task",
      title: "The official planning sheet prompts",
      content: `Who? — main character or central subject. Where? — setting. Beginning — how does the story start? Change / Problem — what happens that changes the situation? Development — what happens next? Decision — what important choice is made? Resolution — how is the challenge resolved? Ending — how does the story finish? Audience Takeaway — what should listeners remember?

Fill this in with brief words, phrases or arrows. It is a thinking aid, never a script to read aloud.`,
    },
    {
      type: "article",
      title: "What judges reward",
      content: `Creativity & Originality (20) — a distinctive, imaginative interpretation with original events, details and choices, rather than material that feels memorised. Story Structure & Coherence (20) — a strong beginning, development and ending with clear connections and purposeful progression. Use of Story Spark (10) — the prompt is central to the plot and used imaginatively, not merely mentioned. Character, Setting & Development (15) — clear characters and setting with motives, events or change developed in meaningful detail. Language & Verbal Communication (15) — clear, fluent, expressive language with effective age-appropriate vocabulary. Expression & Audience Engagement (10) — pace, emphasis, voice and natural expression that sustain attention. Independent Delivery & Confidence (10) — ownership, composure and the ability to recover from small pauses and continue independently.`,
    },
    {
      type: "article",
      title: "Student Quick Guide — SEE, IMAGINE, PLAN, BUILD, TELL, ENGAGE, FINISH",
      content: `SEE — understand your Story Spark. IMAGINE — think of more than one possibility. PLAN — choose your character, setting, problem and ending. BUILD — make events connect logically. TELL — speak clearly in your own words. ENGAGE — use natural voice, pace and expression. FINISH — give the audience a clear ending.

League principle: Story Spark rewards imagination, structure, communication and authentic student voice — not memorisation, costumes or expensive coaching.`,
    },
  ],

  faqs: [
    {
      question: "Do I prepare a story in advance?",
      answer:
        "No. You receive an unseen Story Spark on the day and build an original story from it during a short preparation period. Memorised stories score poorly — the rubric rewards original ideas generated from the prompt.",
    },
    {
      question: "Can I bring props or wear a costume?",
      answer:
        "No. Candidate-prepared props and costumes are not permitted in the standard format. The organizer may provide a simple object as the unseen Story Spark itself, but nothing is brought from home.",
    },
    {
      question: "Can I read from my planning sheet?",
      answer:
        "You may take the official planning sheet into the storytelling area if organizer policy allows, but reading a full script is not permitted. The sheet is for brief words, phrases and arrows — not a written-out story.",
    },
    {
      question: "How long should my story be?",
      answer:
        "It depends on your grade: Grade 3 tells a 2.5–4 minute story after 15 minutes of preparation, Grade 4 a 3–4 minute story after 12 minutes, and Grade 5 a 3–5 minute story after 10 minutes. Standard warning and stop signals are applied by the timekeeper.",
    },
    {
      question: "Will I be marked down for my accent, or for pausing?",
      answer:
        "No. Judges are instructed not to penalise accent, and normal age-appropriate pauses are acceptable. The Independent Delivery criterion specifically rewards recovering from a small pause and continuing on your own.",
    },
    {
      question: "Does my story need to have a moral?",
      answer:
        "No. A clear beginning, development and ending are expected, but there is no single required plot structure and no requirement to include a moral in every story.",
    },
    {
      question: "Can I use AI, a phone or a book while preparing?",
      answer:
        "No. AI tools, internet search, phones, smartwatches, books and prepared scripts are all prohibited during preparation, and no teacher, parent or peer assistance is permitted after the prompt is released. Planning sheets may be retained to support authenticity review.",
    },
  ],

  events: leagueDates("2026-12-06", "Competition day — live storytelling", {
    activityNote: "Finale weekend, day two.",
  }),
};
