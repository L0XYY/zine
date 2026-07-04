-- ===========================================================================
-- Zine — Supabase database schema
-- Run this once in your Supabase project: SQL Editor → New query → paste → Run.
-- It is safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE where possible).
-- ===========================================================================

-- --- Enums (as CHECK constraints keeps it simple & migratable) --------------
-- role:     OWNER | ADMIN | MODERATOR | PARTNER | VERIFIED | USER
-- category: GAMING | ROBLOX | MINECRAFT | MEMES | EDITS | IRL | CHALLENGES
-- report:   PENDING | REVIEWING | RESOLVED | DISMISSED

-- ===========================================================================
-- Tables
-- ===========================================================================

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique not null,
  username     text unique not null,
  display_name text not null,
  avatar_url   text,
  banner_url   text,
  bio          text check (char_length(bio) <= 280),
  role         text not null default 'USER'
               check (role in ('OWNER','ADMIN','MODERATOR','PARTNER','VERIFIED','USER')),
  verified     boolean not null default false,
  partnered    boolean not null default false,
  banned       boolean not null default false,
  badges       text[] not null default '{}',
  followers    integer not null default 0,
  following    integer not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.videos (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  title          text not null check (char_length(title) <= 120),
  caption        text check (char_length(caption) <= 280),
  video_url      text not null,
  thumbnail_url  text,
  duration       real not null,
  category       text not null default 'MEMES'
                 check (category in ('GAMING','ROBLOX','MINECRAFT','MEMES','EDITS','IRL','CHALLENGES')),
  views          integer not null default 0,
  loops          integer not null default 0,
  likes_count    integer not null default 0,
  comments_count integer not null default 0,
  is_featured    boolean not null default false,
  is_trending    boolean not null default false,
  is_deleted     boolean not null default false,
  challenge_slug text,
  created_at     timestamptz not null default now()
);
create index if not exists videos_user_idx on public.videos(user_id);
create index if not exists videos_created_idx on public.videos(created_at desc);

create table if not exists public.likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  video_id   uuid not null references public.videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, video_id)
);

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  video_id   uuid not null references public.videos(id) on delete cascade,
  body       text not null check (char_length(body) <= 500),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists comments_video_idx on public.comments(video_id);

create table if not exists public.follows (
  id           uuid primary key default gen_random_uuid(),
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  video_id    uuid references public.videos(id) on delete cascade,
  reason      text not null default 'OTHER',
  detail      text check (char_length(detail) <= 500),
  status      text not null default 'PENDING'
              check (status in ('PENDING','REVIEWING','RESOLVED','DISMISSED')),
  created_at  timestamptz not null default now()
);

create table if not exists public.challenges (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text not null,
  category    text not null,
  banner_url  text,
  is_active   boolean not null default true,
  entries     integer not null default 0,
  ends_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- ===========================================================================
-- Auto-create a profile when a user signs up.
-- Reserves the founder username (loxy) as OWNER with the founder badges.
-- The client passes username + display_name via signUp({ options: { data }}).
-- ===========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  uname text := lower(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  dname text := coalesce(new.raw_user_meta_data->>'display_name', uname);
  is_founder boolean := uname = 'loxy';
begin
  insert into public.profiles (id, email, username, display_name, role, verified, badges)
  values (
    new.id,
    new.email,
    uname,
    dname,
    case when is_founder then 'OWNER' else 'USER' end,
    is_founder,
    case when is_founder then array['FOUNDER','STAFF','VERIFIED','EARLY'] else array['EARLY'] end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is the current user a staff member?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('OWNER','ADMIN','MODERATOR')
  );
$$;

-- ===========================================================================
-- Row Level Security
-- ===========================================================================

alter table public.profiles   enable row level security;
alter table public.videos     enable row level security;
alter table public.likes      enable row level security;
alter table public.comments   enable row level security;
alter table public.follows    enable row level security;
alter table public.reports    enable row level security;
alter table public.challenges enable row level security;

-- profiles: world-readable; you can edit your own; staff can edit anyone
create policy "profiles read"        on public.profiles for select using (true);
create policy "profiles update self" on public.profiles for update using (auth.uid() = id);
create policy "profiles staff write" on public.profiles for update using (public.is_admin());

-- videos: public can read live ones; owners manage their own; staff manage all
create policy "videos read"    on public.videos for select using (not is_deleted or user_id = auth.uid() or public.is_admin());
create policy "videos insert"  on public.videos for insert with check (auth.uid() = user_id);
create policy "videos update"  on public.videos for update using (auth.uid() = user_id or public.is_admin());
create policy "videos delete"  on public.videos for delete using (auth.uid() = user_id or public.is_admin());

-- likes: read all; manage your own
create policy "likes read"   on public.likes for select using (true);
create policy "likes insert" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes delete" on public.likes for delete using (auth.uid() = user_id);

-- comments: read live ones; write your own; staff can moderate
create policy "comments read"   on public.comments for select using (not is_deleted or public.is_admin());
create policy "comments insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments update" on public.comments for update using (auth.uid() = user_id or public.is_admin());

-- follows: read all; manage your own
create policy "follows read"   on public.follows for select using (true);
create policy "follows insert" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows delete" on public.follows for delete using (auth.uid() = follower_id);

-- reports: any signed-in user can file; only staff can read/update
create policy "reports insert" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "reports staff read"   on public.reports for select using (public.is_admin());
create policy "reports staff update" on public.reports for update using (public.is_admin());

-- challenges: world-readable; staff-managed
create policy "challenges read"  on public.challenges for select using (true);
create policy "challenges write" on public.challenges for all using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- Storage: the "zines" bucket for uploaded videos + thumbnails.
-- ===========================================================================

insert into storage.buckets (id, name, public)
values ('zines', 'zines', true)
on conflict (id) do nothing;

create policy "zines public read"
  on storage.objects for select
  using (bucket_id = 'zines');

-- Uploads go to a "<user-id>/..." folder; check the first path segment.
create policy "zines authed upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'zines'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "zines owner delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'zines'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ===========================================================================
-- Seed the launch challenges (safe to re-run).
-- ===========================================================================

insert into public.challenges (slug, title, description, category, is_active, entries)
values
  ('6s-speedrun', '6s Speedrun', 'Beat any level, obby, or task in a single 6-second loop.', 'CHALLENGES', true, 0),
  ('loop-it', 'Loop It', 'Make an edit where the last frame flows perfectly into the first.', 'EDITS', true, 0),
  ('one-block', 'One Block Build', 'Build something wild starting from a single block.', 'MINECRAFT', true, 0)
on conflict (slug) do nothing;
