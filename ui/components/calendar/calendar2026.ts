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
// 23 November – 4 December. Independent Submissions are held on Monday 30
// November. Final showcases, live competitions and screenings conclude on
// Saturday 12 December 2026; the closing and awards ceremony is Sunday 13
// December 2026.

export type ActivityFormat =
  | "Applied Skills Challenge"
  | "Independent Submission"
  | "Live performance"
  | "Project showcase"
  | "Submission"
  | "Screening"
  | "Award ceremony";

export const CALENDAR_INTRO =
  "Join the Future Ready League for reasoning challenges, live performances, creative activities and project showcases.";

export const CALENDAR_STRAPLINE = [
  { label: "Registration", detail: "8 October – 10 November" },
  { label: "Submissions close", detail: "22 November" },
  { label: "League begins", detail: "23 November" },
] as const;

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
  { milestone: "Final celebrations day one", date: "Saturday 12 December 2026", note: "Live performances, project showcases and selected screenings." },
  { milestone: "Final celebrations day two", date: "Sunday 13 December 2026", note: "Closing and awards ceremony." },
];

export interface ScheduledActivity {
  date: string;
  day: string;
  name: string;
  nature: string;
  formats: ActivityFormat[];
}

export const WEEK_ONE: ScheduledActivity[] = [
  { date: "23 Nov", day: "Monday", name: "MindWorks Decathlon", nature: "Ten timed reasoning and evidence stations, followed by reflection and defence.", formats: ["Applied Skills Challenge"] },
  { date: "24 Nov", day: "Tuesday", name: "Oratoris Cup", nature: "Scenario speech after 20 minutes of preparation, followed by adaptive speaking.", formats: ["Applied Skills Challenge"] },
  { date: "25 Nov", day: "Wednesday", name: "Argumentor", nature: "Motion-based team debate with evidence, cross-questioning, rebuttal and final reply.", formats: ["Applied Skills Challenge"] },
  { date: "26 Nov", day: "Thursday", name: "CodeCircuit", nature: "Progressive coding tasks from decomposition and algorithm design to testing and debugging.", formats: ["Applied Skills Challenge"] },
  { date: "27 Nov", day: "Friday", name: "LeadLab Summit", nature: "Student Senate simulation with a policy brief, amendments, speeches and voting.", formats: ["Applied Skills Challenge"] },
];

export const WEEK_TWO: ScheduledActivity[] = [
  { date: "30 Nov", day: "Monday", name: "WorldView", nature: "One-page global briefing, live presentation and panel questions.", formats: ["Applied Skills Challenge"] },
  { date: "1 Dec", day: "Tuesday", name: "Imaginarium", nature: "Controlled live sketching from theme interpretation to final artwork and rationale.", formats: ["Applied Skills Challenge"] },
  { date: "2 Dec", day: "Wednesday", name: "VentureMinds", nature: "Microbusiness pitch and panel defence. Business model due 22 November.", formats: ["Applied Skills Challenge"] },
  { date: "3 Dec", day: "Thursday", name: "EcoSphere", nature: "School improvement action plan from an issued issue and evidence pack, then presented live.", formats: ["Applied Skills Challenge"] },
  { date: "4 Dec", day: "Friday", name: "Young Orator", nature: "Brief preparation, a short speech on a familiar topic and a simple judge response.", formats: ["Applied Skills Challenge"] },
];

export const INDEPENDENT_SUBMISSIONS: ScheduledActivity[] = [
  { date: "30 Nov", day: "Monday", name: "InquiryQuest", nature: "Scientific inquiry report with question, method, evidence, analysis and conclusion.", formats: ["Independent Submission"] },
  { date: "30 Nov", day: "Monday", name: "CultureScript", nature: "Original five-minute cultural film.", formats: ["Independent Submission"] },
  {
    date: "30 Nov",
    day: "Monday",
    name: "Message for Humanity",
    nature: "Original positive message for humanity, no more than two minutes. Separate Junior, Senior and Teacher categories.",
    formats: ["Independent Submission"],
  },
];

export const WEEKEND_GAP_NOTE = "28 and 29 November: no regular League activities scheduled. The final celebrations on 12–13 December are the planned exception.";

export const ON_THE_DAY_NOTE =
  "For on-the-day competitions, the assessed work is produced during the scheduled event. The 22 November deadline applies to advance materials only where the competition rules require them; it does not require contestants to submit unseen live tasks early.";

export interface FinalEventDay {
  date: string;
  day: string;
  title: string;
  summary: string;
  groups: { label: string; items: string[] }[];
}

export const FINAL_EVENT_PROGRAMME: FinalEventDay[] = [
  {
    date: "11 December",
    day: "Friday",
    title: "Final competitions & showcases",
    summary: "Every final competition, project display and screening takes place and concludes on this day.",
    groups: [
      {
        label: "Live competitions",
        items: [
          "WordWave",
          "EthosQuest",
          "Picture Detective",
          "MindGames Championships",
          "Think Masters Championship (final defence)",
          "StorySpark",
          "Young Scientist Observation",
        ],
      },
      { label: "Project displays", items: ["DigitalHorizon", "SciVanta", "PixelProof"] },
      { label: "Screenings", items: ["CultureScript", "Message for Humanity"] },
    ],
  },
  {
    date: "12 December",
    day: "Saturday",
    title: "Closing & awards ceremony",
    summary: "No competitions or screenings. The day is dedicated to the closing ceremony and presenting the awards.",
    groups: [
      {
        label: "Recognition presented",
        items: [
          "Competition distinctions",
          "School awards",
          "Spotlight recipients",
          "Supportive teachers and parents",
          "Student athletes",
          "Up to 50 selected principals",
        ],
      },
    ],
  },
];

/** `date`/`day` are when the work is presented or displayed, which is what
 * the calendar page groups these entries under. */
export interface SubmissionEntry {
  date: string;
  day: string;
  competition: string;
  requirement: string;
  formats: ActivityFormat[];
  presentation: string;
}

export const SUBMISSION_CALENDAR_INTRO =
  "Register from 8 October to 10 November. Upload the required work by Sunday 22 November 2026. Physical and project-based entries are brought to the final event according to the organiser's setup instructions; the online deadline covers their project records and supporting files.";

export const SUBMISSION_CALENDAR: SubmissionEntry[] = [
  {
    date: "2 Dec",
    day: "Wednesday",
    competition: "VentureMinds",
    requirement: "Original microbusiness model and pitch materials.",
    formats: ["Submission", "Live performance"],
    presentation: "2 December live pitch",
  },
  {
    date: "11 Dec",
    day: "Friday",
    competition: "CultureScript",
    requirement: "Original five-minute cultural film. Selected entries screen during the finale.",
    formats: ["Submission", "Screening"],
    presentation: "Selected films screened 11 December",
  },
  {
    date: "11 Dec",
    day: "Friday",
    competition: "Message for Humanity",
    requirement: "Original positive message for humanity, no more than two minutes. Separate Junior, Senior and Teacher categories. Selected entries screen during the finale.",
    formats: ["Submission", "Screening"],
    presentation: "Selected videos screened 11 December",
  },
  {
    date: "11 Dec",
    day: "Friday",
    competition: "DigitalHorizon",
    requirement: "Environmental awareness poster with source list and design rationale. Upload the final poster file.",
    formats: ["Submission", "Project showcase"],
    presentation: "Displayed 11 December",
  },
  {
    date: "11 Dec",
    day: "Friday",
    competition: "SciVanta",
    requirement: "Safe robotics model addressing environmental pollution. Upload the project record; demonstrate the model at the finale.",
    formats: ["Submission", "Project showcase"],
    presentation: "Displayed and demonstrated 11 December",
  },
  {
    date: "11 Dec",
    day: "Friday",
    competition: "PixelProof",
    requirement: "One original photograph and caption for a curated display.",
    formats: ["Submission", "Project showcase"],
    presentation: "Displayed 11 December",
  },
  {
    date: "11 Dec",
    day: "Friday",
    competition: "Think Masters Championship",
    requirement: "Researched school-life problem, evidence and a two-page summary.",
    formats: ["Submission", "Live performance"],
    presentation: "11 December live final defence",
  },
  {
    date: "Online",
    day: "No live slot",
    competition: "InquiryQuest",
    requirement:
      "Scientific inquiry report with question, method, evidence, analysis and conclusion. Proposed 13–22 November task window, opening when the official problem brief is released.",
    formats: ["Submission"],
    presentation: "Online assessment; no mandatory live slot",
  },
];

/** `group`/`groupNote` are the award family the calendar page lists each
 * award under. */
export interface AwardSubmissionEntry {
  group: string;
  groupNote: string;
  award: string;
  nature: string;
  whoMaySubmit: string;
}

export const AWARD_SUBMISSION_INTRO =
  "Register the Route 2 nomination from 8 October to 10 November 2026 and submit the complete nomination by 22 November. Spotlight contains three assessed categories and Sports contains two; Teacher and Parent recognition is nomination-only. Proposed review window: 23 November – 4 December, with recognition at the closing and awards ceremony on 12 December.";

export const AWARD_SUBMISSIONS: AwardSubmissionEntry[] = [
  {
    group: "Spotlight",
    groupNote: "Assessed",
    award: "Idea of the Year",
    nature: "An implemented idea with evidence of results from the preceding two years, or a proposal for the upcoming edition with a feasible plan and supporting evidence.",
    whoMaySubmit: "Independent applicant or school nomination",
  },
  {
    group: "Spotlight",
    groupNote: "Assessed",
    award: "Story of the Year",
    nature: "A true success story from home, school, work or community, with context, challenge, actions, outcome and supporting evidence.",
    whoMaySubmit: "Independent applicant or school nomination",
  },
  {
    group: "Spotlight",
    groupNote: "Assessed",
    award: "Young Changemaker",
    nature: "A positive change led by the applicant, the people involved, personal contribution and verified outcomes, with evidence and a reference.",
    whoMaySubmit: "Independent applicant or school nomination",
  },
  {
    group: "Sports",
    groupNote: "Assessed",
    award: "Excellence Athlete Award",
    nature: "Dated record of consistent performance in one sport over the preceding two years, with verified results and a school or coach endorsement.",
    whoMaySubmit: "School nomination only",
  },
  {
    group: "Sports",
    groupNote: "Assessed",
    award: "Blazer Athlete Award",
    nature: "Separate evidence for three sports — performance records, dates, level of participation and a school or coach endorsement for each.",
    whoMaySubmit: "School nomination only",
  },
  {
    group: "Teacher & Parent",
    groupNote: "Nomination only",
    award: "Supportive Teacher Award",
    nature: "Nominee name, designation, school and a brief account of contribution and cooperation in the League.",
    whoMaySubmit: "School nomination only",
  },
  {
    group: "Teacher & Parent",
    groupNote: "Nomination only",
    award: "Supportive Parent Award",
    nature: "Nominee name, school association and a brief account of contribution and cooperation in the League.",
    whoMaySubmit: "School nomination only",
  },
];

