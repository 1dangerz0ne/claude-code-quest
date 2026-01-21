-- Add loadout column to profiles for avatar equipment customization
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS loadout jsonb
DEFAULT '{"armor": "knight", "weapon": "sword", "shield": "tower"}'::jsonb;
