-- FAQs are the one public-page tab with zero backing table in 0001 — every
-- other tab maps to an existing table. Added now so the admin competition
-- editor can manage per-competition FAQ content, mirroring the public-read/
-- admin-write pattern used for every other competition-family table.

create table competition_faqs (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  question text not null,
  answer text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

alter table competition_faqs enable row level security;

create policy "competition_faqs_public_read" on competition_faqs for select using (true);
create policy "competition_faqs_admin_write" on competition_faqs for all using (is_admin());
