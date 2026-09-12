import { listRegistrations, addRegistration } from "@/data/repositories/registrations.repository";
import type { Registration, RegistrationStatus } from "./types";

export function listAllRegistrations(): Registration[] {
  return listRegistrations();
}

export function upcomingDeadlinesFor(registrations: Registration[], deadlines: Record<string, string>) {
  return registrations
    .map((r) => ({ ...r, deadline: deadlines[r.competitionSlug] }))
    .filter((r) => r.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
}

function generateRegistrationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FCS-${year}-${random}`;
}

export interface SubmitRegistrationInput {
  competitionSlug: string;
  competitionTitle: string;
  entryType: "individual" | "team";
  entrantName: string;
}

/** Business rule: create a new registration with a generated number and pending status. */
export function submitRegistration(input: SubmitRegistrationInput): Registration {
  const registration: Registration = {
    id: `reg-${Date.now()}`,
    registrationNumber: generateRegistrationNumber(),
    competitionSlug: input.competitionSlug,
    competitionTitle: input.competitionTitle,
    entryType: input.entryType,
    entrantName: input.entrantName,
    status: "pending" as RegistrationStatus,
    submittedAt: new Date().toISOString(),
  };
  addRegistration(registration);
  return registration;
}
