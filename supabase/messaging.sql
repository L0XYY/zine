-- ===========================================================================
-- Zine — Direct Messages (focused, idempotent). Run this ONE block in
-- Supabase → SQL Editor → New query → Run. Safe to run more than once.
--
-- NOTE: Messaging works WITHOUT running this. The app (src/lib/data.ts) probes
-- for these tables once per session and, if they don't exist, transparently
-- falls back to a browser-local store (src/lib/messages-store.ts) so DMs work
-- out of the box. Run this migration only when you want real, cross-device
-- messaging backed by Supabase — the app then upgrades to it automatically.
-- ===========================================================================

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  last_message text,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_idx
  on public.messages(conversation_id, created_at);

create or replace function public.on_new_message()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations
    set last_message = new.body, last_message_at = new.created_at
    where id = new.conversation_id;
  return new;
end; $$;
drop trigger if exists on_message_created on public.messages;
create trigger on_message_created after insert on public.messages
  for each row execute function public.on_new_message();

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Idempotent policies (drop first so re-running never errors)
drop policy if exists "conversations read" on public.conversations;
drop policy if exists "conversations insert" on public.conversations;
drop policy if exists "messages read" on public.messages;
drop policy if exists "messages insert" on public.messages;

create policy "conversations read" on public.conversations for select
  using (auth.uid() = user_a or auth.uid() = user_b);
create policy "conversations insert" on public.conversations for insert
  with check (auth.uid() = user_a or auth.uid() = user_b);
create policy "messages read" on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (c.user_a = auth.uid() or c.user_b = auth.uid())
  ));
create policy "messages insert" on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );
