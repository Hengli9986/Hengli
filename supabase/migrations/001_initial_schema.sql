-- ============================================================
-- Phase 3: Supabase Database Schema Migration
-- Project: geek-douyin-station
-- Run this in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Profiles table (extends auth.users)
-- Automatically created via trigger when user signs up
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  role text default 'member' check (role in ('member', 'admin')),
  created_at timestamptz default now()
);

-- 2. Accounts table (user's Douyin accounts)
create table if not exists accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  douyin_id text,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- 3. Live sessions table (imported live stream data)
create table if not exists live_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references accounts on delete set null,
  
  -- Core data fields (match Excel import columns)
  live_date date,
  duration_minutes integer,
  avg_watch integer,
  gmv numeric(12,2),
  orders integer,
  new_fans integer,
  interactions integer,
  
  -- Raw JSON for flexible schema (stores all original columns)
  raw_data jsonb,
  
  created_at timestamptz default now()
);

-- 4. Videos table (imported short video data)
create table if not exists videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references accounts on delete set null,
  
  -- Core data fields
  title text,
  publish_time timestamptz,
  play_count integer,
  like_count integer,
  comment_count integer,
  share_count integer,
  collect_count integer,
  completion_rate numeric(5,2),
  
  -- Raw JSON for flexible schema
  raw_data jsonb,
  
  created_at timestamptz default now()
);

-- 5. Import logs table (tracks import history)
create table if not exists import_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  import_type text not null check (import_type in ('live', 'video')),
  record_count integer not null,
  file_name text,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS) - CRITICAL: Each user only sees their own data
-- ============================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table accounts enable row level security;
alter table live_sessions enable row level security;
alter table videos enable row level security;
alter table import_logs enable row level security;

-- Profiles: users can only access their own profile
-- Note: Allow insert for trigger, but users can only read/update their own
create policy "Users can read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

-- Accounts: users can only CRUD their own accounts
create policy "Users can access own accounts"
  on accounts for all
  using (user_id = auth.uid());

-- Live sessions: users can only CRUD their own sessions
create policy "Users can access own live sessions"
  on live_sessions for all
  using (user_id = auth.uid());

-- Videos: users can only CRUD their own videos
create policy "Users can access own videos"
  on videos for all
  using (user_id = auth.uid());

-- Import logs: users can only read their own logs
create policy "Users can access own import logs"
  on import_logs for all
  using (user_id = auth.uid());

-- ============================================================
-- Auto-create profile on signup trigger
-- ============================================================

-- Function: create profile when new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Trigger: run after insert on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- ============================================================
-- Indexes for performance
-- ============================================================

create index if not exists idx_accounts_user_id on accounts(user_id);
create index if not exists idx_live_sessions_user_id on live_sessions(user_id);
create index if not exists idx_live_sessions_account_id on live_sessions(account_id);
create index if not exists idx_videos_user_id on videos(user_id);
create index if not exists idx_videos_account_id on videos(account_id);
create index if not exists idx_import_logs_user_id on import_logs(user_id);

-- ============================================================
-- Verification queries (run these to verify setup)
-- ============================================================

-- Check all tables exist
-- select table_name from information_schema.tables where table_schema = 'public';

-- Check RLS is enabled
-- select tablename, rowsecurity from pg_tables where schemaname = 'public';

-- Check policies exist
-- select schemaname, tablename, policyname, permissive, roles, cmd, qual from pg_policies where schemaname = 'public';
