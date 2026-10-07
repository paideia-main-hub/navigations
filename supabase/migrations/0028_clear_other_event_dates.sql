-- Remove leftover "other" calendar dates. Pathway slots do not include this
-- type, so these rows never showed in admin Dates but still appeared on public cards.
delete from events
where type = 'other';
