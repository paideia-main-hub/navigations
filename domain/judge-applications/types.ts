export type JudgeApplicationStatus = "pending" | "interview_scheduled" | "approved" | "rejected";
export type InterviewMode = "online" | "physical";

export interface JudgeApplication {
  id: string;
  competitionSlug: string;
  competitionTitle: string;
  status: JudgeApplicationStatus;
  interviewMode: InterviewMode | null;
  interviewAt: string | null;
  interviewLocation: string | null;
  adminNotes: string | null;
  createdAt: string;
}

/** Admin overview: same shape, plus who applied. */
export interface AdminJudgeApplication extends JudgeApplication {
  judgeId: string;
  judgeName: string;
  judgeEmail: string | null;
}

export const judgeApplicationStatusLabels: Record<JudgeApplicationStatus, string> = {
  pending: "Pending review",
  interview_scheduled: "Interview scheduled",
  approved: "Approved",
  rejected: "Rejected",
};

export const interviewModeLabels: Record<InterviewMode, string> = {
  online: "Online",
  physical: "In person",
};
