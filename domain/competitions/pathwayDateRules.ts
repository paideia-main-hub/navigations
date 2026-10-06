import type { CompetitionPathway, EventType } from "@/domain/competitions/types";

/** Categories that meet at a physical venue. */
export function pathwayRequiresVenue(pathway: CompetitionPathway | null): boolean {
  return pathway === "applied_skills" || pathway === "project_showcase" || pathway === "live_response";
}

/** Independent Submission always has online work upload. */
export function pathwayRequiresOnlineSubmission(pathway: CompetitionPathway | null): boolean {
  return pathway === "independent_submission";
}

/** Applied Skills, Project Showcase, and Live Performances can optionally add online upload. */
export function pathwayAllowsOnlineSubmissionToggle(pathway: CompetitionPathway | null): boolean {
  return pathway === "applied_skills" || pathway === "project_showcase" || pathway === "live_response";
}

/** Effective flag after applying pathway rules. */
export function effectiveHasOnlineSubmission(
  pathway: CompetitionPathway | null,
  hasOnlineSubmission: boolean,
): boolean {
  if (pathwayRequiresOnlineSubmission(pathway)) return true;
  if (pathwayAllowsOnlineSubmissionToggle(pathway)) return hasOnlineSubmission;
  return hasOnlineSubmission;
}

const BASE_PHYSICAL: EventType[] = ["registration_close", "round", "result_date", "final_event"];
const BASE_INDEPENDENT: EventType[] = [
  "registration_close",
  "submission_deadline",
  "result_date",
  "final_event",
];

/**
 * Date types an admin may set for this competition.
 * When pathway is unset, all known types stay available so existing drafts are editable.
 */
export function allowedEventTypes(
  pathway: CompetitionPathway | null,
  hasOnlineSubmission: boolean,
): EventType[] {
  const online = effectiveHasOnlineSubmission(pathway, hasOnlineSubmission);

  if (!pathway) {
    const all: EventType[] = [
      "registration_close",
      "round",
      "submission_deadline",
      "result_date",
      "final_event",
      "other",
    ];
    return all;
  }

  if (pathway === "independent_submission") return [...BASE_INDEPENDENT];

  // applied_skills | project_showcase | live_response
  return online ? [...BASE_PHYSICAL, "submission_deadline"] : [...BASE_PHYSICAL];
}

/** Whether this competition may receive a bulk/random date of the given type. */
export function competitionAllowsEventType(
  pathway: CompetitionPathway | null,
  hasOnlineSubmission: boolean,
  type: EventType,
): boolean {
  return allowedEventTypes(pathway, hasOnlineSubmission).includes(type);
}
