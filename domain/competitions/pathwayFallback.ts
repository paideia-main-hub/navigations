import type { CompetitionPathway } from "./types";

/** Route 1's four categories, by competition slug — straight from
 * documentation/FRL_Catalogue_REVISED_Nov_Dec_2026.docx, matching
 * scripts/data/competitions/*.mjs exactly.
 *
 * This exists because migration 0018 (competitions.pathway / image_url)
 * hasn't been applied to the database yet, so the `pathway` column the CMS
 * would normally read from doesn't exist there — every competition comes
 * back with a null pathway despite the seeded data files being correct, and
 * every category filter on the site (home page and /competitions) silently
 * shows nothing.
 *
 * The repository falls back to this map only when a competition's own DB
 * value is null, so once the migration lands and an admin edits a pathway
 * from the CMS, the real column takes over automatically — nothing here
 * needs to change or be removed at that point, it just stops being used for
 * competitions an admin has touched. */
export const PATHWAY_BY_SLUG: Record<string, CompetitionPathway> = {
  "argumentor": "applied_skills",
  "codecircuit": "applied_skills",
  "culturescript": "independent_submission",
  "digitalhorizon": "project_showcase",
  "ecosphere": "applied_skills",
  "ethosquest": "live_response",
  "imaginarium": "applied_skills",
  "inquiryquest": "independent_submission",
  "leadlab-summit": "applied_skills",
  "lexiquest": "live_response",
  "message-for-humanity": "independent_submission",
  "mindgames-championships": "live_response",
  "mindworks-decathlon": "applied_skills",
  "oratoris-cup": "applied_skills",
  "picture-detective": "live_response",
  "pixelproof": "project_showcase",
  "quantiva": "live_response",
  "scivanta": "project_showcase",
  "storyspark": "live_response",
  "think-masters-championship": "live_response",
  "ventureminds": "applied_skills",
  "wordwave": "live_response",
  "worldview": "applied_skills",
  "young-orator": "applied_skills",
  "young-scientist-observation": "live_response",
};
