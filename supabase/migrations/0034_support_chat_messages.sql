-- Anonymous support-chat transcripts for admin insight (what visitors ask about).
-- Inserts happen only from the server (service role). Admins read via service role / is_admin().

create table support_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_message text not null,
  assistant_reply text not null,
  page_path text,
  had_screenshot boolean not null default false,
  had_voice boolean not null default false,
  needs_human boolean not null default false,
  needs_login boolean not null default false,
  created_at timestamptz not null default now()
);

create index support_chat_messages_created_at_idx on support_chat_messages (created_at desc);
create index support_chat_messages_session_id_idx on support_chat_messages (session_id);

alter table support_chat_messages enable row level security;

-- No anon/authenticated client access. Server uses service role (bypasses RLS).
-- Keep an admin SELECT policy for tooling that uses an admin JWT + is_admin().
create policy "support_chat_messages_admin_read"
  on support_chat_messages
  for select
  using (is_admin());
