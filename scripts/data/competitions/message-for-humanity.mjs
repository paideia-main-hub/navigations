// Extracted from MANUALS/MANUALS/Humanity_Message_Future_Ready_League_Official_Manual.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "message-for-humanity",
  title: "Humanity Message",
  shortDescription:
    "Empathy, kindness and human connection challenge — one focused message, delivered in writing, a drawing or a 30-second video.",
  domain: "Empathy, Inclusion & Social-Emotional Intelligence",
  competencies: ["Empathy", "Responsibility", "Advocacy"],
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "independent_submission",
  image: null,
  manualFile: "Humanity_Message_Future_Ready_League_Official_Manual.docx",

  overview: `Humanity Message is a social-emotional communication challenge that gives students a platform to communicate a powerful message about empathy, kindness, understanding and human connection in education.

Students select one announced theme and communicate one focused message through a written entry, an original drawing or visual message, or a short video of up to 30 seconds. The competition is not based on expensive production or technical sophistication — it rewards the strength, authenticity and human impact of the student's message. Core challenge: can one thoughtful message help another person understand what empathy looks like in everyday school life?

Two themes are offered. Empathy in Teaching explores the teacher–student learning relationship: listening before judging a learner, recognising different needs or circumstances, encouraging rather than humiliating, supporting students through difficulty or mistakes, how a caring teacher shapes confidence and learning, and respecting student voice in emotionally safe classrooms. Empathy Among Peers explores student-to-student relationships: understanding a friend's feelings, including someone who feels left out, supporting a struggling classmate, listening during disagreement, respecting differences, preventing bullying and insensitive behaviour, and helping without embarrassing another person.

Three formats are accepted because students communicate differently, and all entries are judged primarily on the quality and impact of the message. Format-neutral judging is a published principle: a drawing earns no extra marks for advanced artistry, a video none for professional editing, and a written message none for complex vocabulary. Technical production supports the message; it does not replace it.

Competency signature — Empathy & Inclusion and Social-Emotional Intelligence are primary; Creative Communication and Perspective Taking are strong supporting; Citizenship & Responsibility supports throughout; and Digital Media Creation, Visual Expression or Written Communication support depending on the chosen format.

Registration fee: PKR 1,000 per entry. Top award: Best Humanity Message — PKR 10,000 cash prize plus the official Winner Certificate. The winning message may be featured through League channels subject to permissions.`,

  eligibility: [
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      notes:
        "Individual competition. Each student may submit one official entry under one selected theme (Empathy in Teaching or Empathy Among Peers) and one selected submission format (written, drawing or 30-second video). Grade or age categories, where applicable, are displayed on the registration portal. Registration fee: PKR 1,000 per entry.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "10",
      notes:
        "Individual competition. Each student may submit one official entry under one selected theme (Empathy in Teaching or Empathy Among Peers) and one selected submission format (written, drawing or 30-second video). Grade or age categories, where applicable, are displayed on the registration portal. Registration fee: PKR 1,000 per entry.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Create & Submit One Message",
      format: "Written message, drawing / visual message, or a 30-second video — one format per candidate",
      duration: "Portal submission window; video entries are capped at 30 seconds",
      taskDescription: `Choose one theme and one format, then build a single focused message.

Format A — Written Message. Recommended length 50–150 words. May be a short message, reflection, micro-story, open letter, appeal, an original quotation with explanation, or another concise creative format. Few words, clear meaning, strong impact.

Format B — Drawing / Visual Message. One original A4 or equivalent single-page artwork: a drawing, illustration, symbolic artwork, visual story or poster-style composition. A short title or caption may be used where helpful. The artwork should communicate a message, not simply display artistic skill.

Format C — 30-Second Video Message. Maximum 30 seconds, MP4. Suitable approaches include direct-to-camera message, micro-story, a short dramatised situation, voice-over, visual narrative, spoken reflection or symbolic concept. A useful structure: 0–5 seconds for the situation, 5–20 seconds for the empathy or response, 20–30 seconds for a powerful takeaway. Professional voice-over is not required.

Every message must satisfy four core requirements: Empathy — understanding of another person's feelings, needs or perspective. Theme Relevance — a clear connection to the selected theme. Positive Human Response — it encourages listening, inclusion, understanding, support or responsible action. Memorable Impact — it leaves the audience with something meaningful to think, feel or do.

Submission through the portal: log in, open Humanity Message under registered competitions, select Submit Entry, confirm candidate / school / grade / theme / format, upload the final entry, enter the title of the message, complete the originality and AI-use declarations, submit before the deadline and verify the portal displays "Submission Confirmed."

File requirements — Written: PDF, 50–150 words recommended. Drawing: JPG, PNG or PDF, one page. Video: MP4, maximum 30 seconds. Naming convention: HumanityMessage-CandidateName-SchoolName-Campus (e.g. HumanityMessage-AliKhan-FutureSchool-Gulberg.mp4).

Content, privacy and safeguarding: keep entries appropriate for a school-age audience; never identify or humiliate teachers, classmates or other individuals; no bullying, hate speech or discriminatory language; never disclose another person's sensitive private information; never use empathy as a reason to publicly expose another person's difficulties; and obtain required permissions where identifiable people appear in submitted media.`,
      progressionRule:
        "Four evaluation stages: 1) Eligibility screening verifies registration, fee status, file type, video duration, theme, declarations and successful submission. 2) Judges score eligible entries independently against the published 100-mark rubric. 3) The Head Judge moderates major scoring differences, close rankings, originality concerns, inappropriate content or AI concerns. 4) The highest-quality moderated entry is selected as Best Humanity Message.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Understanding of Empathy", weight: 20 },
        { name: "Clarity & Relevance of Message", weight: 15 },
        { name: "Emotional & Human Impact", weight: 20 },
        { name: "Creativity & Originality", weight: 15 },
        { name: "Narrative / Communication Effectiveness", weight: 15 },
        { name: "Positive Action / Takeaway", weight: 10 },
        { name: "Technical / Presentation Quality", weight: 5 },
      ],
      tieBreakRule:
        "In order: 1) Understanding of Empathy, 2) Emotional & Human Impact, 3) Narrative / Communication Effectiveness, 4) Creativity & Originality, 5) Positive Action / Takeaway. If candidates remain tied, a final comparative moderation is conducted.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "The message thinking sequence — NOTICE → UNDERSTAND → CONNECT → RESPOND → MESSAGE",
      content: `NOTICE — what is another person experiencing? UNDERSTAND — how might they feel? CONNECT — why does their experience matter? RESPOND — what can someone do differently? MESSAGE — what should your audience remember?

Sympathy vs empathy, the distinction judges look for: sympathy says "I feel sorry for you." Empathy says "I am trying to understand what this experience feels like for you." The Understanding of Empathy criterion (20 marks) separates the two directly — kindness or sympathy with limited perspective-taking sits in the Developing band, while an entry confused with a general motivational message falls to Emerging.`,
    },
    {
      type: "article",
      title: "Format-specific guidance",
      content: `Written message — focus on one strong idea, write in your own voice, stay concise, use an example or micro-story if it strengthens the message, and avoid long essays, copied quotations and generic slogans.

Drawing / visual message — use visual storytelling or symbolism purposefully, show who is affected and what human response is being communicated, use a title or short caption only when helpful, and do not rely on artistic complexity alone. Meaning is more important.

30-second video — structure it as 0–5 seconds situation, 5–20 seconds empathy or response, 20–30 seconds a powerful takeaway. For narration, judges consider clarity, natural delivery, appropriate tone and the relationship between voice and message. Professional voice-over is not required.`,
    },
    {
      type: "article",
      title: "Originality and the AI use policy",
      content: `All submissions must substantially represent the student's own idea and work. Teachers and parents may explain the competition, discuss empathy, provide general guidance and help younger students with technical uploading — they must not create the student's message, artwork or final video. Entries may be referred for authenticity review where there is reasonable concern about authorship.

Limited acceptable AI support: understanding the concept of empathy, brainstorming broad themes or questions, checking spelling or grammar, and learning basic editing techniques.

Unacceptable AI use: generating the final written message, generating the complete artwork, generating the complete video, cloning another person's voice, creating fake people and presenting them as real, or replacing the student's original creative contribution. Significant AI support must be disclosed where the portal requires it; undisclosed authorship-replacing AI use may lead to integrity review, score reduction or disqualification.`,
    },
    {
      type: "article",
      title: "Student Quick Guide — CHOOSE, THINK, FOCUS, CREATE, CHECK, UPLOAD, IMPACT",
      content: `CHOOSE — select Empathy in Teaching or Empathy Among Peers. THINK — whose feelings or perspective do you want people to understand? FOCUS — choose one strong message. CREATE — write it, draw it, or communicate it through a 30-second video. CHECK — is it authentic, respectful and understandable? UPLOAD — submit through the portal. IMPACT — ask: will someone think or act differently after seeing my message?

Suggested reflection to write afterwards for your portfolio: whose perspective did you try to understand, and what did you want your audience to feel, understand or do differently?

NOTICE → UNDERSTAND → CONNECT → EXPRESS → INFLUENCE. Sometimes changing a community does not begin with a big campaign — it begins with one message that helps someone see another human being differently.`,
    },
    {
      type: "article",
      title: "Submission checklist",
      content: `Registered through the portal • PKR 1,000 registration fee processed • selected Empathy in Teaching or Empathy Among Peers • selected only one submission format • the work substantially reflects your own contribution • the message clearly demonstrates empathy • content is respectful and appropriate • written message is concise where applicable • drawing is clearly visible where applicable • video is no longer than 30 seconds and is MP4 where applicable • the file naming requirement has been followed • any significant AI assistance has been disclosed • the uploaded file opens correctly • the portal status shows "Submission Confirmed."`,
    },
  ],

  faqs: [
    {
      question: "Can I submit in more than one format, or under both themes?",
      answer:
        "No. Each student may submit one official entry under one selected theme and one selected submission format. Choose the medium that communicates your message best — all three are judged on message quality, not on production value.",
    },
    {
      question: "Does a professionally edited video score better than a simple drawing?",
      answer:
        "No. Format-neutral judging is an explicit rule: a drawing earns no extra marks for advanced artistry, a video none for professional editing, and a written message none for complex vocabulary. Technical and presentation quality is worth only 5 of the 100 marks.",
    },
    {
      question: "How long should my written entry be?",
      answer:
        "50–150 words is recommended. Long essays are discouraged — the criterion rewards a central idea that is immediately understandable, focused and strongly connected to the chosen theme.",
    },
    {
      question: "Can I write about a real teacher or classmate?",
      answer:
        "Not in a way that identifies or humiliates them. Entries must never identify or embarrass teachers, classmates or other individuals, must not disclose another person's sensitive private information, and must not use empathy as a reason to publicly expose someone's difficulties. Where identifiable people appear in submitted media, required permissions must be obtained.",
    },
    {
      question: "Am I allowed to use AI?",
      answer:
        "Only for limited support — understanding the concept of empathy, brainstorming broad themes, checking spelling or grammar, and learning basic editing. AI must not generate your final message, artwork or video, clone a voice, or create fake people presented as real. Significant AI support must be disclosed where the portal requires it.",
    },
    {
      question: "What is the fee and what can I win?",
      answer:
        "Registration is PKR 1,000 per entry. The top award, Best Humanity Message, carries a PKR 10,000 cash prize and the official Winner Certificate, and the winning message may be featured through League channels subject to permissions.",
    },
    {
      question: "How are ties resolved?",
      answer:
        "By criterion, in this order: Understanding of Empathy, then Emotional & Human Impact, then Narrative / Communication Effectiveness, then Creativity & Originality, then Positive Action / Takeaway. If candidates remain tied, a final comparative moderation is conducted.",
    },
  ],

  events: leagueDates(null, undefined, {
    workDeadline: true,
    activityNote: "Submission-based competition run through the League portal; a PKR 1,000 entry fee applies. Selected entries screen on 11 December, the first day of the finale.",
  }),
};
