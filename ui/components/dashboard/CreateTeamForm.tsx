"use client";

import type { StudentProfile } from "@/domain/students/types";
import { SchoolTeamEditor } from "@/ui/components/dashboard/SchoolTeamEditor";

export function CreateTeamForm({ roster }: { roster: StudentProfile[] }) {
  const tooFew = roster.length < 2;

  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Teams</h2>
      <SchoolTeamEditor
        roster={roster}
        mode={{ kind: "create" }}
        trigger="+ Create team"
        triggerDisabled={tooFew}
        triggerDisabledReason="Add at least 2 students to your roster before creating a team."
        triggerClassName="shrink-0 cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}
