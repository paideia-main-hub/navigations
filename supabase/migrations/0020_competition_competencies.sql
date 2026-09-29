-- Competencies a competition develops, so competitions can be categorised
-- and filtered by competency as well as by Route 1 category.
--
-- Each entry is either a framework code from the Future Competence
-- Framework (e.g. 'C01', see domain/competitions/competencies.ts for the
-- code -> name list) or, for anything outside that list, the competency's
-- plain name as the admin typed it.

alter table competitions
  add column if not exists competencies text[] not null default '{}';

-- Directory filtering is "does this competition include competency X",
-- which is what a GIN index on an array column serves.
create index if not exists competitions_competencies_idx on competitions using gin (competencies);
