-- Claude Code Quest Database Schema
-- Run this in your Supabase SQL Editor

-- User profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  xp int default 0,
  level int default 1,
  daily_streak int default 0,
  longest_daily_streak int default 0,
  last_played_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Category progress (tracks correct/total per category)
create table if not exists category_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  category text not null,
  correct int default 0,
  total int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, category)
);

-- Daily challenge results
create table if not exists daily_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  challenge_date date not null,
  score int not null,
  correct int not null,
  total int not null,
  time_seconds int,
  completed_at timestamptz default now(),
  unique(user_id, challenge_date)
);

-- Game sessions (track individual game plays)
create table if not exists game_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  mode text not null, -- 'quick' or 'daily'
  score int not null,
  correct int not null,
  total int not null,
  max_combo int default 0,
  time_seconds int,
  xp_earned int default 0,
  completed_at timestamptz default now()
);

-- Enable Row Level Security on all tables
alter table profiles enable row level security;
alter table category_progress enable row level security;
alter table daily_results enable row level security;
alter table game_sessions enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- RLS Policies for category_progress
create policy "Users can view own category progress"
  on category_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own category progress"
  on category_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own category progress"
  on category_progress for update
  using (auth.uid() = user_id);

-- RLS Policies for daily_results
create policy "Users can view own daily results"
  on daily_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily results"
  on daily_results for insert
  with check (auth.uid() = user_id);

-- Allow viewing leaderboard (all users can see all daily results)
create policy "Anyone can view daily leaderboard"
  on daily_results for select
  using (true);

-- RLS Policies for game_sessions
create policy "Users can view own game sessions"
  on game_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own game sessions"
  on game_sessions for insert
  with check (auth.uid() = user_id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure public.update_updated_at();

create trigger category_progress_updated_at
  before update on category_progress
  for each row execute procedure public.update_updated_at();

-- Index for faster leaderboard queries
create index if not exists daily_results_date_score_idx
  on daily_results(challenge_date, score desc);

-- Index for faster profile lookups
create index if not exists profiles_xp_idx
  on profiles(xp desc);
