-- Legacy IDs used the old FCS brand prefix. New numbers already use FRL
-- (Future Ready League). Rewrite stored FCS-* values so the UI is consistent.
-- Safe to re-run: rows that already start with FRL- are left alone.

update registrations
set registration_number = replace(registration_number, 'FCS-', 'FRL-')
where registration_number like 'FCS-%';

update students
set frl_id = replace(frl_id, 'FCS-', 'FRL-')
where frl_id like 'FCS-%';

update award_nominations
set nomination_number = replace(nomination_number, 'FCS-', 'FRL-')
where nomination_number like 'FCS-%';

-- School League IDs (added in 0032) would only contain FCS if seeded that way.
do $$ begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'schools' and column_name = 'frl_id'
  ) then
    update schools
    set frl_id = replace(frl_id, 'FCS-', 'FRL-')
    where frl_id like 'FCS-%';

    update schools
    set frl_id = replace(frl_id, 'FCS-S-', 'FRL-S-')
    where frl_id like 'FCS-S-%';
  end if;
end $$;
