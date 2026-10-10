"use client";

import { useState } from "react";
import type { School } from "@/domain/schools/types";
import { QuickLink } from "@/ui/components/dashboard/QuickLink";
import { SchoolProfileCard } from "@/ui/components/dashboard/SchoolProfileCard";
import { StatCard } from "@/ui/components/dashboard/StatCard";

export function SchoolOverview({
  school,
  coordinatorName,
  avatarUrl,
  studentCount,
  teamCount,
  registrationCount,
  pendingCount,
}: {
  school: School;
  coordinatorName: string;
  avatarUrl: string | null;
  studentCount: number;
  teamCount: number;
  registrationCount: number;
  pendingCount: number;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <SchoolProfileCard school={school} coordinatorName={coordinatorName} avatarUrl={avatarUrl} onEditingChange={setEditing} />
      {editing ? null : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Students" value={studentCount} />
            <StatCard label="Teams" value={teamCount} />
            <StatCard label="Registrations" value={registrationCount} />
            <StatCard label="Pending" value={pendingCount} />
          </div>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink href="/dashboard/registrations" icon="📋" title="Registrations" body="Track every active registration." />
            <QuickLink href="/dashboard/students" icon="🎓" title="Manage Students" body="View and add to your school roster." />
            <QuickLink href="/dashboard/teams" icon="👥" title="Manage Teams" body="Create and organize competition teams." />
            <QuickLink href="/dashboard/history" icon="📜" title="History & Results" body="Concluded competitions and winners." />
          </section>
        </>
      )}
    </>
  );
}
