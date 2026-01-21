# Full Schema - Copy This

Copy everything below and paste into your Supabase SQL Editor:

```sql
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
  mode text not null,
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

-- =============================================
-- VIRAL FEATURES SCHEMA ADDITIONS
-- =============================================

-- Add referral code and avatar fields to profiles
alter table profiles add column if not exists referral_code text unique;
alter table profiles add column if not exists referred_by uuid references profiles(id);
alter table profiles add column if not exists avatar_armor text default 'starter';
alter table profiles add column if not exists games_played int default 0;
alter table profiles add column if not exists total_correct int default 0;
alter table profiles add column if not exists fastest_answer_ms int;
alter table profiles add column if not exists perfect_games int default 0;

-- Create unique referral code on profile creation
create or replace function public.generate_referral_code()
returns trigger as $$
begin
  new.referral_code = upper(substring(md5(random()::text) from 1 for 8));
  return new;
end;
$$ language plpgsql;

drop trigger if exists generate_referral_code_trigger on profiles;
create trigger generate_referral_code_trigger
  before insert on profiles
  for each row
  when (new.referral_code is null)
  execute procedure public.generate_referral_code();

-- Achievements table
create table if not exists achievements (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  category text not null,
  xp_reward int default 0,
  rarity text default 'common'
);

-- User achievements (unlocked badges)
create table if not exists user_achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  achievement_id text references achievements(id) not null,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_id)
);

-- Friend challenges
create table if not exists challenges (
  id uuid default gen_random_uuid() primary key,
  challenge_code text unique not null,
  creator_id uuid references profiles(id) on delete cascade not null,
  creator_score int not null,
  creator_correct int not null,
  creator_total int not null,
  creator_time_seconds int,
  question_seed int not null,
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '7 days'
);

-- Challenge attempts (people who accepted the challenge)
create table if not exists challenge_attempts (
  id uuid default gen_random_uuid() primary key,
  challenge_id uuid references challenges(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade,
  guest_name text,
  score int not null,
  correct int not null,
  total int not null,
  time_seconds int,
  completed_at timestamptz default now()
);

-- Live activity log (for real-time counter)
create table if not exists activity_log (
  id uuid default gen_random_uuid() primary key,
  activity_type text not null,
  user_id uuid references profiles(id) on delete cascade,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Enable RLS on new tables
alter table achievements enable row level security;
alter table user_achievements enable row level security;
alter table challenges enable row level security;
alter table challenge_attempts enable row level security;
alter table activity_log enable row level security;

-- RLS Policies for achievements (everyone can view)
create policy "Anyone can view achievements"
  on achievements for select
  using (true);

-- RLS Policies for user_achievements
create policy "Users can view own achievements"
  on user_achievements for select
  using (auth.uid() = user_id);

create policy "Users can insert own achievements"
  on user_achievements for insert
  with check (auth.uid() = user_id);

-- Allow viewing other users' achievements for social features
create policy "Anyone can view all user achievements"
  on user_achievements for select
  using (true);

-- RLS Policies for challenges
create policy "Anyone can view challenges"
  on challenges for select
  using (true);

create policy "Users can create challenges"
  on challenges for insert
  with check (auth.uid() = creator_id);

-- RLS Policies for challenge_attempts
create policy "Anyone can view challenge attempts"
  on challenge_attempts for select
  using (true);

create policy "Anyone can insert challenge attempts"
  on challenge_attempts for insert
  with check (true);

-- RLS Policies for activity_log
create policy "Anyone can view activity log"
  on activity_log for select
  using (true);

create policy "System can insert activity"
  on activity_log for insert
  with check (true);

-- Index for faster challenge lookups
create index if not exists challenges_code_idx on challenges(challenge_code);
create index if not exists activity_log_created_idx on activity_log(created_at desc);

-- =============================================
-- SEED ACHIEVEMENT DATA
-- =============================================

insert into achievements (id, name, description, icon, category, xp_reward, rarity) values
  ('first_blood', 'First Blood', 'Complete your first game', '🎮', 'milestone', 25, 'common'),
  ('ten_games', 'Getting Started', 'Play 10 games', '🔟', 'milestone', 50, 'common'),
  ('fifty_games', 'Dedicated Learner', 'Play 50 games', '📚', 'milestone', 100, 'rare'),
  ('hundred_games', 'Centurion', 'Play 100 games', '💯', 'milestone', 250, 'epic'),
  ('perfect_game', 'Perfectionist', 'Get 100% on any game', '✨', 'skill', 50, 'rare'),
  ('five_perfect', 'Flawless', 'Get 5 perfect games', '💎', 'skill', 150, 'epic'),
  ('speed_demon', 'Speed Demon', 'Answer 5 questions under 3 seconds each', '⚡', 'skill', 75, 'rare'),
  ('combo_master', 'Combo Master', 'Reach a 10x combo', '🔥', 'skill', 100, 'rare'),
  ('combo_legend', 'Combo Legend', 'Reach a 20x combo', '🌟', 'skill', 200, 'epic'),
  ('streak_3', 'On Fire', '3-day streak', '🔥', 'milestone', 30, 'common'),
  ('streak_7', 'Week Warrior', '7-day streak', '📅', 'milestone', 75, 'rare'),
  ('streak_30', 'Monthly Master', '30-day streak', '🏆', 'milestone', 300, 'legendary'),
  ('night_owl', 'Night Owl', 'Play after midnight', '🦉', 'special', 25, 'common'),
  ('early_bird', 'Early Bird', 'Play before 6 AM', '🐦', 'special', 25, 'common'),
  ('weekend_warrior', 'Weekend Warrior', 'Play on Saturday and Sunday', '🎉', 'special', 40, 'common'),
  ('first_challenge', 'Challenger', 'Create your first challenge', '⚔️', 'social', 30, 'common'),
  ('challenge_winner', 'Victorious', 'Beat someone in a challenge', '🏅', 'social', 50, 'rare'),
  ('referral_1', 'Recruiter', 'Refer your first friend', '👋', 'social', 50, 'common'),
  ('referral_5', 'Influencer', 'Refer 5 friends', '📢', 'social', 150, 'rare'),
  ('agents_master', 'Agent Expert', 'Get 50 correct in Agents category', '🤖', 'skill', 100, 'rare'),
  ('commands_master', 'Command Expert', 'Get 50 correct in Commands category', '⌨️', 'skill', 100, 'rare'),
  ('hooks_master', 'Hooks Expert', 'Get 50 correct in Hooks category', '🪝', 'skill', 100, 'rare'),
  ('level_5', 'Skilled', 'Reach Level 5', '⭐', 'milestone', 100, 'rare'),
  ('level_10', 'Legend', 'Reach Level 10', '👑', 'milestone', 500, 'legendary')
on conflict (id) do nothing;
```
