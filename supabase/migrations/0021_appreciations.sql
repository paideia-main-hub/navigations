-- Appreciations an admin writes for the home page: a heading, a description,
-- the schools being recognised, and who the note is from.

create table appreciations (
  id uuid primary key default gen_random_uuid(),
  heading text not null,
  description text not null,
  school_names text not null,
  by_line text not null,
  created_at timestamptz not null default now()
);

alter table appreciations enable row level security;

create policy "appreciations_public_read" on appreciations for select using (true);
create policy "appreciations_admin_write" on appreciations for all using (is_admin());
