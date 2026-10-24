-- NEBULA DESTINY database schema for Supabase
-- Run this whole file in Supabase Dashboard → SQL Editor.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '' check (char_length(title) <= 120),
  body text not null default '' check (char_length(body) <= 10000),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
drop policy if exists "profile owner reads" on public.profiles;
create policy "profile owner reads" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "profile owner inserts" on public.profiles;
create policy "profile owner inserts" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "profile owner updates" on public.profiles;
create policy "profile owner updates" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "task owner all" on public.tasks;
create policy "task owner all" on public.tasks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "note owner all" on public.notes;
create policy "note owner all" on public.notes for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
-- Profiles are created when the user first saves their display name.
