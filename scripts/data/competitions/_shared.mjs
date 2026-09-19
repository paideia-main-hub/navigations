// Shared 2026 League dates, from the published calendar
// (documentation/FRL_Website_Competition_Calendar_2026.docx). Every
// competition uses the same registration window, work deadline and finale;
// only its own activity date differs.

export const REGISTRATION_CLOSE = "2026-10-10";
export const WORK_DEADLINE = "2026-10-23";
export const FINAL_EVENT = "2026-11-07";

/** Builds the Important Dates rows for a competition.
 * @param activityDate ISO date of the competition's own scheduled day, or
 *        null for submission-only competitions with no live slot. */
export function leagueDates(activityDate, activityTitle = "Competition day", opts = {}) {
  const dates = [
    { type: "registration_close", title: "Registration closes", eventDate: REGISTRATION_CLOSE, description: "Last date to register through your school or individual account." },
  ];

  if (opts.workDeadline) {
    dates.push({
      type: "other",
      title: "Work submission deadline",
      eventDate: WORK_DEADLINE,
      description: "Upload all required advance work, project records and supporting files.",
    });
  }

  if (activityDate) {
    dates.push({ type: "round", title: activityTitle, eventDate: activityDate, description: opts.activityNote ?? null });
  }

  dates.push({
    type: "result_date",
    title: "Results published",
    eventDate: FINAL_EVENT,
    description: "Results are published after moderation and admin approval.",
  });
  dates.push({
    type: "final_event",
    title: "League award ceremony",
    eventDate: FINAL_EVENT,
    description: "Closing ceremony on final event day two.",
  });

  return dates;
}
