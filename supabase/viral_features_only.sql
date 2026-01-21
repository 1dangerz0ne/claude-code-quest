-- =============================================
-- VIRAL FEATURES SCHEMA ADDITIONS
-- Run this if you already have the base tables
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
drop policy if exists "Anyone can view achievements" on achievements;
create policy "Anyone can view achievements"
  on achievements for select
  using (true);

-- RLS Policies for user_achievements
drop policy if exists "Users can view own achievements" on user_achievements;
create policy "Users can view own achievements"
  on user_achievements for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own achievements" on user_achievements;
create policy "Users can insert own achievements"
  on user_achievements for insert
  with check (auth.uid() = user_id);

drop policy if exists "Anyone can view all user achievements" on user_achievements;
create policy "Anyone can view all user achievements"
  on user_achievements for select
  using (true);

-- RLS Policies for challenges
drop policy if exists "Anyone can view challenges" on challenges;
create policy "Anyone can view challenges"
  on challenges for select
  using (true);

drop policy if exists "Users can create challenges" on challenges;
create policy "Users can create challenges"
  on challenges for insert
  with check (auth.uid() = creator_id);

-- RLS Policies for challenge_attempts
drop policy if exists "Anyone can view challenge attempts" on challenge_attempts;
create policy "Anyone can view challenge attempts"
  on challenge_attempts for select
  using (true);

drop policy if exists "Anyone can insert challenge attempts" on challenge_attempts;
create policy "Anyone can insert challenge attempts"
  on challenge_attempts for insert
  with check (true);

-- RLS Policies for activity_log
drop policy if exists "Anyone can view activity log" on activity_log;
create policy "Anyone can view activity log"
  on activity_log for select
  using (true);

drop policy if exists "System can insert activity" on activity_log;
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
