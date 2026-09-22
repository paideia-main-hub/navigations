-- Fee payment tracking for competition registrations, plus a public bucket
-- for the student profile photos collected at registration time (the
-- `students.photo_url` column already exists from 0001_init_schema.sql —
-- this migration is what actually lets something get written into it and
-- reviewed).
--
-- One `registration_payments` row can cover more than one registration: a
-- school coordinator registering several students into the same competition
-- pays once (fee x number of students) and uploads one receipt, which is
-- why this is its own table with a one-to-many link from `registrations`,
-- rather than columns bolted directly onto `registrations`.
--
-- Apply this in the Supabase SQL Editor, the same way as 0018.

create type payment_status as enum ('pending_review', 'approved', 'rejected');

create table registration_payments (
  id uuid primary key default gen_random_uuid(),
  competition_slug text not null,
  competition_title text not null,
  submitted_by uuid not null references profiles(id),
  submitted_by_name text not null,          -- snapshot: the name to show admin, without a profiles join
  school_id uuid references schools(id) on delete set null,
  school_name text,                         -- snapshot, same reason
  entry_count int not null default 1,
  amount_expected numeric,                  -- fee_amount * entry_count, snapshot at submission time
  receipt_url text not null,
  status payment_status not null default 'pending_review',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);

alter table registrations
  add column payment_id uuid references registration_payments(id) on delete set null;

create index registration_payments_status_idx on registration_payments (status);
create index registrations_payment_id_idx on registrations (payment_id);

alter table registration_payments enable row level security;

-- A student or coordinator reads only the payments they submitted; admin
-- reads everything through the service-role client, which bypasses RLS.
create policy "registration_payments_owner_select" on registration_payments
  for select using (submitted_by = auth.uid());

create policy "registration_payments_owner_insert" on registration_payments
  for insert with check (submitted_by = auth.uid());

-- Fee receipts are financial documents, so the bucket is private (same
-- shape as award-evidence in 0016_awards.sql): the uploader can read their
-- own file back, admin views everything through a signed URL from the
-- service-role client.
insert into storage.buckets (id, name, public)
values ('fee-receipts', 'fee-receipts', false)
on conflict (id) do nothing;

create policy "fee_receipts_owner_read" on storage.objects for select
  using (bucket_id = 'fee-receipts' and owner = auth.uid());
create policy "fee_receipts_owner_insert" on storage.objects for insert
  with check (bucket_id = 'fee-receipts' and owner = auth.uid());

-- Student photos are shown publicly on Results/Winners once a result is
-- published, same as the existing winner-photos bucket, so this one is
-- public-read with writes going through the service-role client only (see
-- domain/storage/actions.ts's uploadOwnImage).
insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', true)
on conflict (id) do nothing;

create policy "student_photos_bucket_public_read" on storage.objects for select
  using (bucket_id = 'student-photos');
