-- Two short lines an admin types for each competition. The Important Dates
-- carousel on the home page shows them as a pair of small cards under the
-- competition name. Nullable so existing competitions keep listing until
-- someone fills them in.

alter table competitions
  add column dates_card_one text,
  add column dates_card_two text;
