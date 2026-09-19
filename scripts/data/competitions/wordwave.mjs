// Extracted from MANUALS/MANUALS/WordWave_Live_Narrative_Writing_Competition_Manual_v2_1 (1).docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "wordwave",
  title: "WordWave",
  shortDescription:
    "Live narrative writing competition: choose, imagine, plan, draft, develop, revise, edit, submit — one unseen prompt, 90 minutes.",
  domain: "Communication & Public Expression",
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "live_response",
  image: "/competitions/wordwave.jpg",
  manualVersion: "v2.1",
  manualFile: "WordWave_Live_Narrative_Writing_Competition_Manual_v2_1 (1).docx",

  overview: `WordWave is a one-day live narrative writing competition. Two unseen prompts are issued for each category immediately before the official start signal; the candidate chooses ONE and writes a complete original narrative within a single 90-minute session that covers prompt choice, planning, drafting, revising, editing and submission.

It assesses whether a student can respond independently to an unseen prompt, shape an original story, control structure and language, sustain reader interest, and revise the writing within a fixed live session. It is not a memorised-story competition.

Core integrity rule: the official prompts are unseen until the live session begins. Candidates may practise narrative techniques and sample prompts beforehand, but they must not bring a prepared story to reproduce. Judges assess the live script written in response to the selected prompt — a memorised-looking response that barely uses the prompt loses marks under Prompt Response & Originality.

Competency alignment — C07 Written Communication is the core competency, evidenced through C07-S01 Structure, C07-S02 Vocabulary, C07-S03 Grammar and C07-S05 Editing. C07-S04 Argument Construction is not a primary target of this narrative-only competition. First, second and third positions are competition achievements and do not automatically mean a student has reached a particular competency proficiency level.

Word guidance: approximately 450–650 words for Junior and 650–900 for Senior. These are planning guidelines, not a reason to reward word count mechanically — a longer response is not automatically better, and writing must remain controlled and purposeful.

The recommended default edition is English narrative writing completed by hand under supervised conditions; if a secure typed edition is offered, all candidates in the same result category use the same medium, announced before registration.`,

  eligibility: [
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      notes:
        "Junior category, individual, one live round of 90 minutes with two unseen prompts (choose one). Ranked separately from Senior. Recommended length approximately 450–650 words — quality, control and completeness matter more than reaching the top of the range. Registration through an approved school coordinator or the organizer-approved individual route.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "10",
      notes:
        "Senior category — Grades 9–10 / O Level / Matric equivalent — individual, one live round of 90 minutes with two unseen prompts (choose one). Ranked separately from Junior. Recommended length approximately 650–900 words. Senior prompts may contain greater ambiguity, tension or conceptual depth.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "The 90-Minute Live Writing Session",
      format: "Two unseen prompts per category, one chosen; supervised writing in a coded answer booklet",
      duration: "90 minutes total, including prompt choice, planning, drafting, revision, editing and submission",
      taskDescription: `At the official signal candidates receive the two category prompts and the 90 minutes begins. Choose one prompt, record the prompt code clearly, and plan, draft, revise and edit independently. Time warnings are given at 30 minutes remaining and 10 minutes remaining, and all writing stops immediately at 90 minutes.

Recommended time management — 0–10 min: interpret both prompts, choose one, sketch the story arc and the ending. 10–65 min: draft the complete narrative, prioritising coherent progression over decoration. 65–80 min: revise for plot logic, pacing, paragraph order, continuity and ending. 80–90 min: edit language errors, improve weak wording, and check that candidate details and the prompt code are complete. This is guidance, not a separate timed-stage system — the candidate controls the full 90 minutes.

Prompt types you may face: an opening line ("By the time the lights came back on, everything had changed"), a required closing line, a title ("The Second Door"), a situation, a choice or dilemma, or an image-inspired prompt with a short instruction. Both prompts within a category have comparable difficulty and are open enough for multiple original interpretations.

The prompt-response rule: the prompt is a creative springboard, not a sentence to mention once and ignore. A high-scoring response uses the prompt meaningfully in the plot, situation, atmosphere, character decision or ending.

Candidate rules: write only in your registered category; once the session begins no teacher, parent, peer or coach may assist; no pre-written narrative, memorised story, model answer, notes or personal reference material may be used; dictionaries, phones, smartwatches, AI tools and internet-connected devices are not permitted unless the organizer publishes a different controlled rule; the response must remain recognisably connected to the chosen prompt; and you must stop when time is called. Scripts use your Candidate ID rather than your name for blind marking wherever possible.`,
      progressionRule:
        "Single-round competition. Blind coded marking is used where practical, with a two-marker model recommended for finalists, high scores and the moderation sample. Markers calibrate on anchor scripts first; substantial mark differences go to the Chief Marker or a third review; all scripts near award thresholds are checked in moderation; and no result is published until missing marks, ties and integrity flags are resolved.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Prompt Response & Originality", weight: 15 },
        { name: "Narrative Structure & Plot Control", weight: 25 },
        { name: "Character, Setting & Narrative Detail", weight: 15 },
        { name: "Vocabulary, Style & Voice", weight: 20 },
        { name: "Grammar, Punctuation & Sentence Control", weight: 15 },
        { name: "Revision, Cohesion & Overall Effect", weight: 10 },
      ],
      tieBreakRule:
        "In order: 1) Narrative Structure & Plot Control, 2) Vocabulary, Style & Voice, 3) Prompt Response & Originality, 4) Grammar, Punctuation & Sentence Control, 5) Chief Judge blind comparative review of the tied scripts.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "The 6-part narrative planner and the prompt-to-plot method",
      content: `The planner: 1. Character — who is at the centre, and what do they want or fear? 2. Setting — where and when, and which details matter to the action? 3. Trigger — what event starts the real story? 4. Development — what becomes more difficult, surprising or important? 5. Turning Point — what decision, discovery or event changes the direction? 6. Resolution — what changes by the end, and what should the reader understand or feel?

Prompt-to-plot method: read both prompts twice • write one possible story idea for each in a single sentence • choose the prompt that gives you the clearest conflict and ending • decide the ending before drafting the first paragraph • plan 4–6 major story beats, not every sentence • begin close to the main action rather than writing a long background section • build toward one meaningful turning point • leave time to revise and edit.`,
    },
    {
      type: "article",
      title: "Craft notes — character, dialogue and description without overwriting",
      content: `Character and dialogue: give the main character a clear goal, concern or decision; reveal character through action, reaction, choice and selective dialogue; avoid introducing too many characters in a short timed narrative; dialogue should move the story, reveal character or create tension; punctuate dialogue consistently and avoid long conversations that replace narration.

Description without overwriting — instead of describing everything in the setting, select 2–3 details that influence mood or action. Instead of many adjectives in every sentence, choose one precise noun or verb. Instead of stopping the story for a paragraph of description, blend description into movement, observation and decision. Instead of dramatic words used without purpose, match language to the character, scene and tension.`,
    },
    {
      type: "article",
      title: "The Revision Ladder and the final 10-minute editing checklist",
      content: `Revision Ladder — 1. PROMPT: is the story clearly connected to the chosen prompt? 2. PLOT: can the reader follow what changes from beginning to end? 3. CONTINUITY: are time, character details and actions consistent? 4. PACE: is too much time spent before the main event, or is the ending rushed? 5. PARAGRAPHS: does each paragraph have a clear function or shift? 6. LANGUAGE: replace vague or repetitive words with more precise choices. 7. SENTENCES: fix fragments, run-ons, tense shifts and unclear pronouns. 8. PUNCTUATION/SPELLING: correct errors that distract the reader. 9. ENDING: does the final paragraph complete the story rather than simply stop?

Final 10-minute checklist: my story clearly responds to the chosen prompt • the beginning reaches the main story quickly enough • events follow logically and character details are consistent • I have a clear turning point or meaningful change • the ending completes the story and is not rushed • paragraph breaks help the reader follow shifts in time, action or speaker • I have replaced obvious repeated or vague words • tenses and pronouns are consistent • dialogue punctuation is understandable • I have corrected the spelling and punctuation errors I can identify • my Candidate ID and prompt code are complete.`,
    },
    {
      type: "practice_question",
      title: "Junior practice prompts (Grades 6–8)",
      content: `Write a story that begins: "The envelope had my name on it, but I had never seen the handwriting before."

Write a story titled "The Last Seat."

Write a story in which a normal school day changes because of one unexpected announcement.

Write a story that ends: "For the first time, I was glad I had taken the longer way home."

Write a story about a character who discovers that a small mistake has an unexpectedly useful result.

Write a story inspired by the idea: a locked room, a missing key, and a message that does not make sense at first.

Write a story titled "Seven Minutes."

Write a story in which two people remember the same event very differently.`,
    },
    {
      type: "practice_question",
      title: "Senior practice prompts (Grades 9 – O Level / Matric)",
      content: `Write a story that begins: "Everyone agreed on what had happened, except the one person who had seen it clearly."

Write a story titled "The Version We Never Heard."

Write a story about a decision that seems insignificant at first but changes the direction of several people's day.

Write a story that ends: "I closed the file without sending it."

Write a story in which a character must choose between being believed and telling the whole truth.

Write a story inspired by the idea of a place that looks unchanged but feels completely different.

Write a story titled "Before the Bell."

Write a story in which an ordinary object becomes important because of what it reveals.`,
    },
    {
      type: "sample_task",
      title: "Worked planning example — \"The Last Seat\"",
      content: `Character: a student arriving late for an inter-school event, anxious about being alone. Setting: a school auditorium just before a public event begins. Trigger: only one seat remains, beside someone the student has been avoiding. Development: the two are forced into a short conversation while an unexpected delay stops the event. Turning point: the student discovers that a previous misunderstanding was based on incomplete information. Resolution: the "last seat" becomes the reason a conflict is resolved, and the ending returns to the meaning of the title.

This is a planning example only, not a model story. Practise generating your own plots rather than memorising completed narratives.`,
    },
    {
      type: "article",
      title: "Six-week preparation plan",
      content: `Week 1 — Prompt interpretation: take 5 different prompts and generate 2 possible stories for each without writing full stories. Week 2 — Plot and endings: practise the 6-part planner; write strong turning points and endings. Week 3 — Character, setting and dialogue: write short scenes that reveal character through action and selective dialogue. Week 4 — Language control: practise vocabulary precision, sentence variety and paragraph transitions. Week 5 — Timed writing: complete 60–75 minute narratives, leaving dedicated revision time. Week 6 — Full simulation: choose 1 of 2 unseen prompts and complete a full 90-minute script, then mark it with the official rubric.

Recommended materials: a personal vocabulary notebook organised by meaning and context rather than random difficult words • short stories from age-appropriate collections, read to study openings, pacing and endings • a timer • the WordWave rubric applied after each practice script • a simple error log of recurring grammar, punctuation and spelling problems • peer or teacher feedback focused on one or two criteria at a time rather than rewriting your story.`,
    },
  ],

  faqs: [
    {
      question: "Do I get to see the prompts in advance?",
      answer:
        "No. Two prompts per category are issued immediately before the official start signal and may not be read until instructed. You may practise narrative techniques and sample prompts beforehand, but bringing a prepared story to reproduce is a breach of the core integrity rule.",
    },
    {
      question: "Does the 90 minutes include planning and editing?",
      answer:
        "Yes — the clock covers prompt choice, planning, drafting, revising, editing and submission. A recommended split is 10 minutes to choose and plan, 55 to draft, 15 to revise and 10 to edit and submit, but you control the full session.",
    },
    {
      question: "How long should my story be?",
      answer:
        "Roughly 450–650 words for Junior and 650–900 for Senior. These are planning guidelines, not targets — a longer response is not automatically better, and word count is not rewarded mechanically. Quality, control and completeness matter more.",
    },
    {
      question: "Can I bring a dictionary or use my phone?",
      answer:
        "No. Dictionaries, phones, smartwatches, AI tools and internet-connected devices are not permitted unless the organizer explicitly publishes a different controlled rule, and no notes or personal reference material may be used.",
    },
    {
      question: "What if my interpretation of the prompt is unusual?",
      answer:
        "That is fine. Judges are instructed not to penalise an unconventional interpretation if it is coherent and meaningfully connected to the prompt. What loses marks is a story that mentions the prompt once and then ignores it.",
    },
    {
      question: "Does neat handwriting earn marks?",
      answer:
        "No — handwriting appearance is not rewarded beyond basic legibility, and markers do not correct the script line by line as a classroom exercise. They assess the six published criteria across the whole narrative.",
    },
    {
      question: "Is a creative idea enough to win?",
      answer:
        "Not by itself. A creative idea with weak execution should not automatically outscore a less unusual but much better controlled narrative — and equally, a technically accurate script with no meaningful narrative development should not receive top marks.",
    },
    {
      question: "What happens if I arrive late?",
      answer:
        "You may enter only within the organizer's published late-entry window, and no extra time is normally added for ordinary late arrival. A candidate who leaves early submits the script and may not return to continue.",
    },
  ],

  events: leagueDates("2026-10-28", "Competition day — 90-minute live writing session", {
    activityNote: "Week one of the League activity period. Arena / one-day live format.",
  }),
};
