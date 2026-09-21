// The published Future Ready League 2026 calendar, transcribed from
// documentation/FRL_Website_Calendar_REVISED_Nov_Dec_2026.docx (REVISED
// EDITION, November and December 2026), cross-checked against
// documentation/FRL_Catalogue_REVISED_Nov_Dec_2026.docx for the 23
// individual competition dates. Static on purpose: this is one fixed
// published programme, not per-competition dates an admin edits — those
// still come from the CMS and render separately at the bottom of the
// calendar page.
//
// Registration for both routes: 8 October – 10 November 2026. Competition
// work / Route 2 nomination deadline: 22 November 2026. League opens
// Monday 23 November 2026. Applied Skills Challenges run weekdays only,
// 23 November – 4 December. Final celebrations, live arenas and showcases:
// Saturday 5 – Sunday 6 December 2026. Closing awards ceremony: Sunday 6
// December (proposed session).

export type ActivityFormat = "One-day activity" | "Live performance" | "Project showcase" | "Submission" | "Screening" | "Award ceremony";

export const CALENDAR_INTRO =
  "Join the Future Ready League for reasoning challenges, live performances, creative activities and project showcases. Register for Route 1 competitions and Route 2 special recognition awards from 8 October to 10 November 2026. Submit required advance work and Route 2 nominations by 22 November. Weekday Applied Skills Challenges begin on 23 November, followed by the final showcase, live arenas and awards programme on 5 and 6 December.";

export const CALENDAR_STRAPLINE = ["Registration 8 October – 10 November", "Submissions close 22 November", "League begins 23 November"];

export interface KeyDate {
  milestone: string;
  date: string;
  note: string;
}

export const KEY_DATES: KeyDate[] = [
  { milestone: "Registration opens", date: "Thursday 8 October 2026", note: "School and individual registration opens for both routes." },
  { milestone: "Registration closes", date: "Tuesday 10 November 2026", note: "Last date to register for Route 1 competitions and Route 2 awards." },
  {
    milestone: "Work & nomination deadline",
    date: "Sunday 22 November 2026",
    note: "Upload all required advance work, project records and Route 2 nomination evidence.",
  },
  { milestone: "League opens", date: "Monday 23 November 2026", note: "Applied Skills Challenges begin — weekdays only, through 4 December." },
  { milestone: "Final celebrations day one", date: "Saturday 5 December 2026", note: "Live arenas, project showcases and selected screenings." },
  { milestone: "Final celebrations day two", date: "Sunday 6 December 2026", note: "Continued displays and screenings, followed by the closing award ceremony (proposed session)." },
];

export const FORMAT_LEGEND: { format: ActivityFormat; description: string }[] = [
  { format: "One-day activity", description: "Complete a timed task, practical challenge or creative activity on the scheduled date." },
  { format: "Live performance", description: "Speak, debate, pitch, tell a story or present to a judging panel in person." },
  { format: "Project showcase", description: "Display a completed project, model, poster or photograph and explain it where required." },
  { format: "Submission", description: "Upload the required work or nomination evidence through the website by 22 November." },
];

export interface ScheduledActivity {
  date: string;
  day: string;
  name: string;
  nature: string;
  formats: ActivityFormat[];
}

export const WEEK_ONE: ScheduledActivity[] = [
  { date: "23 Nov", day: "Monday", name: "MindWorks Decathlon", nature: "Ten timed reasoning and evidence stations, followed by reflection and defence.", formats: ["One-day activity"] },
  { date: "24 Nov", day: "Tuesday", name: "Oratoris Cup", nature: "Scenario speech after 20 minutes of preparation, followed by adaptive speaking.", formats: ["One-day activity", "Live performance"] },
  { date: "25 Nov", day: "Wednesday", name: "Argumentor", nature: "Motion-based team debate with evidence, cross-questioning, rebuttal and final reply.", formats: ["One-day activity", "Live performance"] },
  { date: "26 Nov", day: "Thursday", name: "CodeCircuit", nature: "Progressive coding tasks from decomposition and algorithm design to testing and debugging.", formats: ["One-day activity"] },
  { date: "27 Nov", day: "Friday", name: "LeadLab Summit", nature: "Student Senate simulation with a policy brief, amendments, speeches and voting.", formats: ["One-day activity", "Live performance"] },
];

export const WEEK_TWO: ScheduledActivity[] = [
  { date: "30 Nov", day: "Monday", name: "WorldView", nature: "One-page global briefing, live presentation and panel questions.", formats: ["One-day activity", "Live performance"] },
  { date: "1 Dec", day: "Tuesday", name: "Imaginarium", nature: "Controlled live sketching from theme interpretation to final artwork and rationale.", formats: ["One-day activity"] },
  { date: "2 Dec", day: "Wednesday", name: "VentureMinds", nature: "Microbusiness pitch and panel defence. Business model due 22 November.", formats: ["Submission", "Live performance"] },
  { date: "3 Dec", day: "Thursday", name: "EcoSphere", nature: "School improvement action plan from an issued issue and evidence pack, then presented live.", formats: ["One-day activity", "Live performance"] },
  { date: "4 Dec", day: "Friday", name: "Young Orator", nature: "Brief preparation, a short speech on a familiar topic and a simple judge response.", formats: ["One-day activity", "Live performance"] },
];

export const WEEKEND_GAP_NOTE = "28 and 29 November: no regular League activities scheduled. Final weekend celebrations on 5–6 December are the planned exception.";

export const ON_THE_DAY_NOTE =
  "For on-the-day competitions, the assessed work is produced during the scheduled event. The 22 November deadline applies to advance materials only where the competition rules require them; it does not require contestants to submit unseen live tasks early.";

export const FINAL_EVENT_PROGRAMME: { date: string; detail: string }[] = [
  {
    date: "5 December",
    detail:
      "WordWave, EthosQuest, Picture Detective and MindGames Championships run live. Project displays open for DigitalHorizon, SciVanta and PixelProof. Selected CultureScript and Message for Humanity entries screen.",
  },
  {
    date: "6 December",
    detail:
      "Think Masters Championship final defence, StorySpark and Young Scientist Observation run live. Project displays and selected screenings continue. The closing award ceremony (proposed session) recognises competition distinctions, school awards, Spotlight recipients, supportive teachers and parents, student athletes and up to 50 selected principals.",
  },
];

export const FINAL_EVENT_NOTE =
  "Parallel rooms and staggered category sessions are required across both finale days. Finalists will receive their reporting times and venue details before the event; exact times, capacity and attendance instructions will appear on registration confirmations. Work displayed at the finale must match the entry submitted by 22 November, subject to the competition's stated rules.";

export interface SubmissionEntry {
  competition: string;
  requirement: string;
  formats: ActivityFormat[];
  presentation: string;
}

export const SUBMISSION_CALENDAR_INTRO =
  "Register from 8 October to 10 November. Upload the required work by Sunday 22 November 2026. Physical and project-based entries are brought to the final event according to the organiser's setup instructions; the online deadline covers their project records and supporting files.";

export const SUBMISSION_CALENDAR: SubmissionEntry[] = [
  {
    competition: "InquiryQuest",
    requirement:
      "Scientific inquiry report with question, method, evidence, analysis and conclusion. Proposed 13–22 November task window, opening when the official problem brief is released.",
    formats: ["Submission"],
    presentation: "Online assessment; no mandatory live slot",
  },
  {
    competition: "CultureScript",
    requirement: "Original five-minute cultural film. Selected entries screen during the finale.",
    formats: ["Submission", "Screening"],
    presentation: "Selected films screened 5–6 December",
  },
  {
    competition: "Message for Humanity",
    requirement: "Original positive message for humanity, no more than two minutes. Separate Junior, Senior and Teacher categories. Selected entries screen during the finale.",
    formats: ["Submission", "Screening"],
    presentation: "Selected videos screened 5–6 December",
  },
  {
    competition: "DigitalHorizon",
    requirement: "Environmental awareness poster with source list and design rationale. Upload the final poster file.",
    formats: ["Submission", "Project showcase"],
    presentation: "Displayed 5–6 December",
  },
  {
    competition: "SciVanta",
    requirement: "Safe robotics model addressing environmental pollution. Upload the project record; demonstrate the model at the finale.",
    formats: ["Submission", "Project showcase"],
    presentation: "Displayed and demonstrated 5–6 December",
  },
  {
    competition: "PixelProof",
    requirement: "One original photograph and caption for a curated display.",
    formats: ["Submission", "Project showcase"],
    presentation: "Displayed 5–6 December",
  },
  {
    competition: "Think Masters Championship",
    requirement: "Researched school-life problem, evidence and a two-page summary.",
    formats: ["Submission", "Live performance"],
    presentation: "6 December live final defence",
  },
  {
    competition: "VentureMinds",
    requirement: "Original microbusiness model and pitch materials.",
    formats: ["Submission", "Live performance"],
    presentation: "2 December live pitch",
  },
];

export interface AwardSubmissionEntry {
  award: string;
  nature: string;
  whoMaySubmit: string;
}

export const AWARD_SUBMISSION_INTRO =
  "Register the Route 2 nomination from 8 October to 10 November 2026 and submit the complete nomination by 22 November. Spotlight contains three assessed categories and Sports contains two; Teacher and Parent recognition is nomination-only. Proposed review window: 23 November – 4 December, with recognition during the 5–6 December celebrations.";

export const AWARD_SUBMISSIONS: AwardSubmissionEntry[] = [
  {
    award: "Idea of the Year",
    nature: "An implemented idea with evidence of results from the preceding two years, or a proposal for the upcoming edition with a feasible plan and supporting evidence.",
    whoMaySubmit: "Independent applicant or school nomination",
  },
  {
    award: "Story of the Year",
    nature: "A true success story from home, school, work or community, with context, challenge, actions, outcome and supporting evidence.",
    whoMaySubmit: "Independent applicant or school nomination",
  },
  {
    award: "Young Changemaker",
    nature: "A positive change led by the applicant, the people involved, personal contribution and verified outcomes, with evidence and a reference.",
    whoMaySubmit: "Independent applicant or school nomination",
  },
  {
    award: "Supportive Teacher Award",
    nature: "Nominee name, designation, school and a brief account of contribution and cooperation in the League.",
    whoMaySubmit: "School nomination only",
  },
  {
    award: "Supportive Parent Award",
    nature: "Nominee name, school association and a brief account of contribution and cooperation in the League.",
    whoMaySubmit: "School nomination only",
  },
  {
    award: "Excellence Athlete Award",
    nature: "Dated record of consistent performance in one sport over the preceding two years, with verified results and a school or coach endorsement.",
    whoMaySubmit: "School nomination only",
  },
  {
    award: "Blazer Athlete Award",
    nature: "Separate evidence for three sports — performance records, dates, level of participation and a school or coach endorsement for each.",
    whoMaySubmit: "School nomination only",
  },
];

export const ADDITIONAL_NOMINATIONS_NOTE =
  "Every valid school-nominated Supportive Teacher and Supportive Parent receives recognition through administrative verification only — there is no competitive assessment for either. Best Principal of Future Ready League recognition is an additional, separately announced category capped at 50 recipients, and is not counted among the seven Route 2 nomination categories above.";

export const SCHEDULING_NOTE =
  "The regular Applied Skills activity calendar excludes Saturday 28 and Sunday 29 November. Saturday 5 and Sunday 6 December are the expressly scheduled finale exception. Online registration for both routes remains open through Tuesday 10 November. All deadlines are shown in Pakistan Standard Time; exact closing times, venues and session details will be published in each competition's rules before registration.";
