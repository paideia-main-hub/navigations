-- One League bank account, edited by an admin and shown wherever a
-- student or coordinator is asked to upload a fee receipt.

create table payment_account (
  id smallint primary key default 1 check (id = 1),
  bank_name text not null default '',
  account_title text not null default '',
  account_number text not null default '',
  iban text not null default '',
  updated_at timestamptz not null default now()
);

insert into payment_account (id) values (1);

alter table payment_account enable row level security;

create policy "payment_account_public_read" on payment_account for select using (true);
create policy "payment_account_admin_write" on payment_account for all using (is_admin());

comment on table payment_account is
  'Singleton row (id = 1). Bank details shown next to every fee-receipt upload.';
