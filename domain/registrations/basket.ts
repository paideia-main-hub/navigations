// Shared types for the student's multi-competition registration checkout
// ("pick several competitions, answer the questions once, pay one total").
// Plain types only, so both the checkout UI and its server action import them.

/** One competition the student picked, with the entry details collected for it. */
export interface BasketItemInput {
  competitionSlug: string;
  entryType: "individual" | "team";
  /** team entries only */
  teamName?: string;
  /** team entries only: the other members' names (the student is added automatically) */
  teammateNames?: string[];
}

export interface BasketLine {
  competitionTitle: string;
  registrationNumber: string;
  categoryLabel: string;
  entryType: "individual" | "team";
  fee: number;
}

export type BasketResult =
  | { ok: true; frlId: string | null; lines: BasketLine[]; total: number }
  | { ok: false; error: string };
