// Mock registrations for both the Student and School dashboards. A freshly
// submitted registration (from the registration wizard) is appended here
// in-memory for the lifetime of the server process — it is NOT persisted,
// since there's no database wiring yet. Restarting the dev server resets it.

import type { Registration } from "@/domain/registrations/types";

const registrations: Registration[] = [
  {
    id: "reg-1",
    registrationNumber: "FCS-2026-00114",
    competitionSlug: "young-innovators-challenge",
    competitionTitle: "Young Innovators Challenge",
    entryType: "team",
    entrantName: "Circuit Breakers",
    status: "qualified",
    submittedAt: "2026-09-02T10:00:00.000Z",
  },
  {
    id: "reg-2",
    registrationNumber: "FCS-2026-00212",
    competitionSlug: "digital-literacy-cup",
    competitionTitle: "Digital Literacy Cup",
    entryType: "individual",
    entrantName: "Amara Khan",
    status: "pending",
    submittedAt: "2026-09-10T14:30:00.000Z",
  },
  {
    id: "reg-3",
    registrationNumber: "FCS-2026-00318",
    competitionSlug: "environmental-science-fair",
    competitionTitle: "Environmental Science Fair",
    entryType: "team",
    entrantName: "EcoWatch",
    status: "approved",
    submittedAt: "2026-09-05T09:15:00.000Z",
  },
];

export function listRegistrations(): Registration[] {
  return registrations;
}

export function addRegistration(registration: Registration): void {
  registrations.push(registration);
}
