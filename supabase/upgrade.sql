-- ===========================================================================
-- Zine — upgrade migration
-- Adds: view/loop counters, comment reports, anti-bot rate limits, and DMs.
-- Run once in Supabase → SQL Editor (safe to re-run).
-- ===========================================================================

-- --- View / loop counters (callable by anyone; bypass RLS via definer) ------
create or replace function public.increment_views(vid uuid)
returns void language sql security definer set search_path = public as $$
  update public.videos set views = views + 1 where id = vid and is_deleted = false;
$$;

create or replace function public.increment_loops(vid uuid)
returns void language sql security definer set search_path = public as $$
  update public.videos set loops = loops + 1 where id = vid and is_deleted = false;
$$;

-- --- Comment reports: let reports point at a comment ------------------------
alter table public.reports
  add column if not exists comment_id uuid references public.comments(id) on delete cascade;

-- ===========================================================================
-- Anti-bot: server-side rate limits (cannot be bypassed by a client/bot)
-- ===========================================================================
create or replace function public.rate_limit_comments()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.comments
      where user_id = new.user_id and created_at > now() - interval '1 minute') >= 10 then
    raise exception 'Too many comments — slow down and try again shortly.';
  end if;
  return new;
end; $$;
drop trigger if exists rate_limit_comments_trg on public.comments;
create trigger rate_limit_comments_trg before insert on public.comments
  for each row execute function public.rate_limit_comments();

create or replace function public.rate_limit_follows()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.follows
      where follower_id = new.follower_id and created_at > now() - interval '1 minute') >= 25 then
    raise exception 'Too many follows — slow down.';
  end if;
  return new;
end; $$;
drop trigger if exists rate_limit_follows_trg on public.follows;
create trigger rate_limit_follows_trg before insert on public.follows
  for each row execute function public.rate_limit_follows();

-- ===========================================================================
-- Direct messages
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

-- keep the conversation preview + sort order fresh
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

-- rate limit messages too
create or replace function public.rate_limit_messages()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.messages
      where sender_id = new.sender_id and created_at > now() - interval '1 minute') >= 30 then
    raise exception 'Too many messages — slow down.';
  end if;
  return new;
end; $$;
drop trigger if exists rate_limit_messages_trg on public.messages;
create trigger rate_limit_messages_trg before insert on public.messages
  for each row execute function public.rate_limit_messages();

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

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
