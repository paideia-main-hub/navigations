-- Wires up the results/winners pipeline that 0001 already modeled but never
-- used (results, winner_media): judges score every registered entrant in a
-- competition -> admin generates a draft standing (average score per
-- registration, ranked, top 3 auto-awarded gold/silver/bronze, everyone else
-- scored gets "finalist") -> admin reviews/overrides/publishes -> published
-- rows drive the public winners gallery/results page and the student/school
-- dashboards simultaneously (FR-15/16/17).

-- One results row per registration: "generate" is re-run any time a judge's
-- score changes, and must update the existing draft rather than duplicate it.
alter table results
  add constraint results_registration_id_key unique (registration_id);

-- One photo/consent record per result, so "set winner photo" can upsert by
-- result_id instead of juggling existing-row lookups.
alter table winner_media
  add constraint winner_media_result_id_key unique (result_id);
