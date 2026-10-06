import { eventTypeAdminLabels, eventTypeLabels, type CompetitionEvent, type EventType } from "@/domain/competitions/types";

/** Compact two-word (or short) labels for public date chips. */
export const shortEventLabels: Record<EventType, string> = {
  registration_close: "Registration closes",
  round: "Contest day",
  submission_deadline: "Online submission date",
  result_date: "Results out",
  final_event: "Final event",
  other: "Other date",
};

const LEGACY_SUBMISSION_TITLES = new Set([
  "Submission deadline",
  "Submission ends",
  "Online submission last date",
  "Work submission deadline",
]);

const TYPE_ORDER: EventType[] = [
  "registration_close",
  "round",
  "submission_deadline",
  "result_date",
  "final_event",
  "other",
];

export function isDefaultEventTitle(event: CompetitionEvent): boolean {
  const title = event.title?.trim();
  if (!title) return true;
  return (
    title === eventTypeLabels[event.type] ||
    title === eventTypeAdminLabels[event.type] ||
    title === shortEventLabels[event.type] ||
    LEGACY_SUBMISSION_TITLES.has(title)
  );
}

export function shortLabelForEvent(event: CompetitionEvent): string {
  const title = event.title?.trim();
  if (title && !isDefaultEventTitle(event)) {
    const words = title.split(/\s+/).filter(Boolean);
    if (words.length > 0 && words.length <= 3) return words.join(" ");
  }
  return shortEventLabels[event.type] ?? "Other date";
}

export function sortCompetitionEvents(events: CompetitionEvent[]): CompetitionEvent[] {
  return [...events].sort((a, b) => {
    const byDate = new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
    if (byDate !== 0) return byDate;
    return TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
  });
}
