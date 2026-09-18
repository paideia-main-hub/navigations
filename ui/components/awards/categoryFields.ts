// Per-category free-text fields for the nomination form. Every entry here
// becomes one "field_<key>" input, which submitNominationAction
// (domain/award-nominations/actions.ts) collects into the nomination's
// form_data jsonb blob — this is what lets one generic wizard serve nine
// differently-shaped category forms without a column per field.
export interface CategoryFieldDef {
  key: string;
  label: string;
  type: "text" | "textarea";
}

export const CATEGORY_FIELDS: Record<string, CategoryFieldDef[]> = {
  "idea-of-the-year": [
    { key: "title", label: "Title", type: "text" },
    { key: "summary", label: "Short summary", type: "textarea" },
    { key: "problem", label: "The problem you identified", type: "textarea" },
    { key: "intended_users", label: "Who is this for", type: "textarea" },
    { key: "idea", label: "Your idea / solution", type: "textarea" },
    { key: "personal_contribution", label: "Your personal contribution", type: "textarea" },
    { key: "implementation_plan", label: "Implementation or action plan", type: "textarea" },
    { key: "results_success_measures", label: "Results or success measures", type: "textarea" },
    { key: "next_steps", label: "Next steps", type: "textarea" },
  ],
  "story-of-the-year": [{ key: "narrative", label: "Your story (600–1,000 words, or describe your audio/video account)", type: "textarea" }],
  "young-changemaker": [
    { key: "need_description", label: "The need you identified", type: "textarea" },
    { key: "actions_taken", label: "What you did", type: "textarea" },
    { key: "response_from_others", label: "How others responded / got involved", type: "textarea" },
    { key: "positive_change_result", label: "The result — the positive change", type: "textarea" },
    { key: "continuity_plan", label: "How the change can continue", type: "textarea" },
  ],
  "supportive-teacher": [{ key: "contribution_statement", label: "Their contribution to the League experience", type: "textarea" }],
  "supportive-parent": [{ key: "contribution_statement", label: "Their contribution to the League experience", type: "textarea" }],
  "excellence-athlete": [
    { key: "development_summary", label: "Development summary", type: "textarea" },
    { key: "reflection", label: "Reflection on progress and personal contribution", type: "textarea" },
  ],
  "blazer-athlete": [
    { key: "development_summary", label: "Development summary", type: "textarea" },
    { key: "reflection", label: "Reflection on all-round development", type: "textarea" },
  ],
  "best-principal": [{ key: "support_account", label: "Short account of their support for League coordination", type: "textarea" }],
};
