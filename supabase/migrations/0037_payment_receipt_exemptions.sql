-- Per-school fee receipt upload exemptions. Admin adds schools one at a time
-- on the bank page; many schools may be exempt concurrently. Exempt
-- coordinators skip bank details, receipt upload, and OCR at checkout.
-- Waived payments still appear in Directory for Approve/Reject.

create table payment_receipt_exemptions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null unique references schools(id) on delete cascade,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table payment_receipt_exemptions enable row level security;

-- Service-role (admin dashboard) bypasses RLS. Coordinators only need to
-- read whether their own school is exempt via authenticated select.
create policy "payment_receipt_exemptions_select_authenticated"
  on payment_receipt_exemptions
  for select
  to authenticated
  using (true);

alter table registration_payments
  alter column receipt_url drop not null;

alter table registration_payments
  add column if not exists receipt_waived boolean not null default false;

comment on table payment_receipt_exemptions is
  'Schools whose coordinators are excused from uploading a fee receipt.';

comment on column registration_payments.receipt_waived is
  'True when the payer school was exempt from uploading a fee receipt.';
