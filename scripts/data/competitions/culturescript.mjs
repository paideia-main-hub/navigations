// Extracted from MANUALS/MANUALS/CulturalScript_Future_Ready_League_Official_Manual.docx
import { leagueDates } from "./_shared.mjs";

export default {
  slug: "culturescript",
  title: "CulturalScript",
  shortDescription:
    "Cultural diversity and digital storytelling challenge — a 3–5 minute video on Many Cultures, One Nation.",
  domain: "Cultural Expression & Creative Communication",
  competencies: ["C24", "C25"],
  supportsIndividual: true,
  supportsTeam: false,
  status: "open",
  pathway: "independent_submission",
  image: "/competitions/culturescript.webp",
  manualFile: "CulturalScript_Future_Ready_League_Official_Manual.docx",

  overview: `CulturalScript is a digital storytelling competition that challenges students to explore the cultural diversity of Pakistan and transform their understanding into an original, meaningful and responsible short video.

Students create a 3–5 minute video presenting a cultural story, perspective, tradition, connection or experience that reflects Pakistan's diversity while communicating one clear message: Many Cultures. Shared Identity. One Nation.

This is not simply a filmmaking competition. It assesses how effectively students can understand culture, interpret diversity, communicate creatively, use digital media responsibly and promote unity through authentic storytelling. The competency question behind every criterion: can the student understand cultural difference, communicate it responsibly, and use storytelling to build connection rather than division?

How it differs from familiar activities — a Cultural Day moves beyond dress, food and display toward interpretation and meaning; unlike a video competition, story meaning carries more weight than expensive production; unlike a documentary competition, a clear student perspective and unity message are required; unlike a speech competition, verbal, visual and digital communication are combined; and unlike a social-media reel, cultural responsibility outranks entertainment or views.

Competency alignment — the primary focus is Cultural Expression plus Creative Communication plus Intercultural Understanding, supported by Empathy & Inclusion, Digital Media Creation, Citizenship & Responsibility, Information & Media Literacy and Verbal Communication. Digital production supports these competencies but should not dominate the competition.

The core message every submission must carry: Pakistan's cultural diversity is a source of identity, understanding and strength, and different cultural traditions can coexist within one shared national community — and that message should emerge naturally from the video rather than appearing only as a slogan at the end.`,

  eligibility: [
    {
      category: "middle",
      minGrade: "6",
      maxGrade: "8",
      notes:
        "Junior Category. Individual competition — one candidate submits one official video entry. Schools may register multiple candidates subject to League registration rules.",
    },
    {
      category: "secondary",
      minGrade: "9",
      maxGrade: "10",
      notes:
        "Senior Category — Grades 9 to O Level. Individual competition — one candidate submits one official video entry.",
    },
  ],

  stages: [
    {
      stageNumber: 1,
      title: "Research, Produce & Submit the Video",
      format: "One original 3–5 minute MP4 video, plus a 50–100 word Creator Statement and required declarations",
      duration: "3–5 minutes of final video; production window as published on the portal",
      taskDescription: `Submission components: one original 3–5 minute video; one 50–100 word Creator Statement explaining the cultural idea, intended message and the connection between diversity and unity; and the declarations covering originality, responsible use of external material and AI use.

Acceptable approaches are flexible — short documentary, cultural story, visual essay, interview-led story, narrated cultural journey, heritage story, community portrait, contrast-and-connection narrative, a cultural tradition explained through storytelling, or an original concept aligned with the theme — but the final video must demonstrate a coherent cultural idea and unity message.

Subject matter can be drawn from regional traditions, languages, heritage, music, crafts, architecture, clothing, food traditions, festivals, literature, folklore, traditional practices, local history, community values, cultural similarities, interregional connections or shared national values. You are not required to cover every culture or region — a focused, well-developed story is preferable to a superficial overview of Pakistan.

Four content requirements: A) Cultural Understanding — communicate meaningful understanding of the selected subject. B) Authentic Representation — represent cultural elements respectfully and accurately. C) Creative Storytelling — a clear structure, purpose and audience. D) Unity Message — connect cultural diversity with shared identity, belonging or national unity.

Technical requirements: 3–5 minutes, MP4, landscape 16:9 recommended, 1920×1080 recommended, clear and understandable audio, English / Urdu / a Pakistani regional language, with subtitles required where needed for fair understanding by judges. Technical quality should support communication but does not need to be professional-studio quality. Mandatory filename: CulturalScript-CandidateName-SchoolName-CampusName.mp4 — avoid informal filenames such as finalvideo2.mp4.

Portal submission: log in, open CulturalScript under registered competitions, select Submit Entry, confirm candidate / school / category, enter the final video title, upload the MP4, add the Creator Statement, provide source and credit information, complete the AI-use and originality declarations, and submit before the deadline. Required portal status: "Submission Confirmed." Uploading a file does not replace your responsibility to check that it opens and plays correctly.

Cultural respect and inclusion rules prohibit cultural mockery, ethnic stereotypes, discriminatory language, hate speech, humiliating portrayals, claims of cultural superiority, inflammatory political campaigning, content designed to create hostility between communities and knowingly false cultural information. Treat cultural communities as people with identity and context, not as costumes or visual props. When filming identifiable individuals — especially younger children, community members, on private property or at heritage locations where recording may be restricted — follow school and organiser permission requirements.`,
      progressionRule:
        "Stage 1 technical and eligibility screening verifies registration, category, format, duration, file accessibility, deadline, declarations and rule compliance — qualifying rather than scored. Stage 2 is independent judging against the published 100-mark rubric, with more than one judge where possible. Stage 3 moderation by the Head Judge reviews significant score differences, originality and cultural-sensitivity concerns, possible excessive AI or external production, and boundary decisions. Only moderated scores are used for the final result.",
    },
  ],

  rubrics: [
    {
      stageNumber: 1,
      isPublic: true,
      criteria: [
        { name: "Cultural Understanding & Authentic Representation", weight: 20 },
        { name: "Storytelling & Creative Communication", weight: 20 },
        { name: "Diversity, Inclusion & Intercultural Understanding", weight: 15 },
        { name: "Unity / One Nation Message", weight: 15 },
        { name: "Digital Media Creation & Technical Execution", weight: 10 },
        { name: "Originality & Student Voice", weight: 10 },
        { name: "Research Accuracy & Responsible Media Use", weight: 5 },
        { name: "Overall Impact & Audience Engagement", weight: 5 },
      ],
      tieBreakRule:
        "In order: 1) Cultural Understanding & Authentic Representation, 2) Storytelling & Creative Communication, 3) Diversity, Inclusion & Intercultural Understanding, 4) Unity / One Nation Message, 5) Originality & Student Voice. If candidates remain tied, the League may declare equal standing or apply the league-level tie-break rule.",
    },
  ],

  resources: [
    {
      type: "article",
      title: "The design process — EXPLORE → RESEARCH → CONNECT → DEFINE → SCRIPT → STORYBOARD → CREATE → EDIT → VERIFY → SHARE → REFLECT",
      content: `EXPLORE — choose a meaningful cultural idea. RESEARCH — understand its background, meaning and context. CONNECT — identify relationships with other communities or shared values. DEFINE — decide the message you want viewers to understand. SCRIPT — plan your narrative. STORYBOARD — plan visuals, scenes, interviews, narration and transitions. CREATE — record authentic material. EDIT — combine media purposefully. VERIFY — check facts, credits, permissions and your AI declaration. SHARE — submit through the portal. REFLECT — consider what the experience changed in your own understanding.

The competition statement in one line: Understand Difference → Respect Identity → Discover Connection → Tell a Story → Communicate Unity.`,
    },
    {
      type: "article",
      title: "Ownership, external footage and the AI use policy",
      content: `You should have meaningful ownership of the concept, cultural research, storyline, script, narration or presentation, creative direction, footage selection, editing decisions and final message. Parents, teachers and professionals may give normal age-appropriate guidance but must not create the submission — an entry that appears substantially adult-produced may be referred for authenticity review.

External media may be used in a limited way where it is legally usable, properly credited, supports rather than replaces student-generated content, and does not misrepresent authorship. A compilation made primarily from internet videos, stock clips or other creators' material does not demonstrate sufficient student ownership.

Acceptable AI support: brainstorming, developing research questions, checking language, organising ideas, subtitle assistance, learning editing techniques and limited technical editing support. Unacceptable: generating the complete video, replacing your creative contribution, submitting an AI-written script unchanged, fabricating cultural information, creating fake interviews, impersonating real individuals, presenting synthetic cultural scenes as authentic documentary evidence, or misrepresenting authorship.

Every candidate must declare whether AI was used and, if so, which tool or type of support and for what purpose. Permitted and declared assistance does not automatically reduce marks; undisclosed or authorship-replacing use may result in score reduction, integrity review or disqualification.`,
    },
    {
      type: "article",
      title: "The judging principle that decides close entries",
      content: `CulturalScript is not a competition for the most expensive camera, professional editor or advanced software. Judges prioritise Cultural Meaning + Student Voice + Responsible Representation + Storytelling + Unity.

A technically simple but authentic, thoughtful and powerful video may score higher than a professionally produced video with weak student ownership or superficial cultural content — Digital Media Creation & Technical Execution is worth only 10 of the 100 marks, while Cultural Understanding and Storytelling carry 20 each.

Note also that a competition result is not a competency level. A score of 85/100 is not converted into a proficiency rating; competency proficiency stays evidence-based and considers quality, independence, complexity, depth, consistency and repeated evidence over time.`,
    },
    {
      type: "article",
      title: "Submission checklist",
      content: `I am registered for CulturalScript • my video is between 3 and 5 minutes • my file is MP4 • my filename follows the required format • my video focuses on cultural diversity in Pakistan • the Unity / One Nation message is clear • cultural information has been checked • communities are represented respectfully • the work substantially reflects my own contribution • external materials are properly handled • any AI assistance has been declared • audio is understandable • necessary subtitles have been included • the Creator Statement is complete • required declarations are complete • I have checked the final uploaded video • the portal status shows "Submission Confirmed."

Suggested reflection for your portfolio: how did your video represent cultural difference while communicating unity? Explain one important creative decision, one thing you learned about culture, and one change you would make if you produced the video again.`,
    },
  ],

  faqs: [
    {
      question: "Do I have to cover all of Pakistan's cultures?",
      answer:
        "No. Students are not required to cover every culture or region — a focused and well-developed story is preferable to a superficial overview of Pakistan. Choose one meaningful cultural idea and develop it properly.",
    },
    {
      question: "How long should the video be, and what format?",
      answer:
        "3–5 minutes, MP4, landscape 16:9 and 1920×1080 recommended, with clear audio. English, Urdu or a Pakistani regional language is accepted, with subtitles required where needed for fair understanding by judges. The filename must follow CulturalScript-CandidateName-SchoolName-CampusName.mp4.",
    },
    {
      question: "Can I use footage I found online?",
      answer:
        "Only in a limited supporting role, and only where it is legally usable, properly credited and does not misrepresent authorship. A compilation made primarily from internet videos or stock clips does not demonstrate sufficient student ownership — original student-created footage is strongly encouraged.",
    },
    {
      question: "Will a professionally edited video win?",
      answer:
        "Not on production alone. Technical execution is worth 10 marks out of 100, while Cultural Understanding and Storytelling carry 20 each. A technically simple but authentic and thoughtful video may score higher than a polished one with weak student ownership or superficial cultural content.",
    },
    {
      question: "What counts as disrespectful representation?",
      answer:
        "Cultural mockery, ethnic stereotypes, discriminatory language, hate speech, humiliating portrayals, claims of cultural superiority, inflammatory political campaigning, content designed to create hostility between communities, and knowingly false cultural information. Treat cultural communities as people with identity and context, not as costumes or visual props.",
    },
    {
      question: "Is AI allowed?",
      answer:
        "For brainstorming, research questions, language checking, organising ideas, subtitles and learning editing techniques — yes, if declared. It must not generate the complete video or script, fabricate cultural information, create fake interviews, impersonate real individuals or present synthetic scenes as authentic documentary evidence.",
    },
    {
      question: "What is the Creator Statement?",
      answer:
        "A 50–100 word statement submitted with the video explaining your cultural idea, your intended message, and the connection you are drawing between diversity and unity. It is a required submission component alongside the video and the declarations.",
    },
  ],

  events: leagueDates(null, undefined, {
    workDeadline: true,
    activityNote: "Submission-based competition run through the League portal. Selected entries screen during the 5–6 December finale.",
  }),
};
