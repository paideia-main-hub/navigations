-- Short line under the award card title stays in `description`.
-- Expanded body copy under the divider lives in `details`.
alter table award_categories
  add column if not exists details text;

-- Existing rows already store the long body in description — move it to details
-- so the seed can refill description with the short under-title line.
update award_categories
set details = description
where details is null
  and description is not null
  and length(trim(description)) > 0;
