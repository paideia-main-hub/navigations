-- Pathway-aware competition dates:
-- 1. venue — physical location for Applied Skills, Project Showcase, Live Performance
-- 2. has_online_submission — optional online upload for Applied Skills / Project Showcase;
--    always true for Independent Submission (enforced in app + backfill below)
-- 3. submission_deadline — event_type for the last day of online work upload

do $$ begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on e.enumtypid = t.oid
    where t.typname = 'event_type'
      and e.enumlabel = 'submission_deadline'
  ) then
    alter type event_type add value 'submission_deadline';
  end if;
end $$;

alter table competitions
  add column if not exists venue text,
  add column if not exists has_online_submission boolean not null default false;

-- Independent Submission always takes online work.
update competitions
set has_online_submission = true
where pathway = 'independent_submission'
   or slug in ('inquiryquest', 'culturescript', 'message-for-humanity');

comment on column competitions.venue is
  'Physical venue for contest / performance day. Null for Independent Submission.';
comment on column competitions.has_online_submission is
  'When true, competition accepts online work upload and needs a submission_deadline event.';
