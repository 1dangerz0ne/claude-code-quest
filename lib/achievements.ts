"use client";

import { createClient } from "./supabase/client";

// Achievement definitions (mirrors database)
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "milestone" | "skill" | "social" | "special";
  xp_reward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

// Achievement check context
export interface AchievementContext {
  gamesPlayed: number;
  totalCorrect: number;
  perfectGames: number;
  maxCombo: number;
  currentStreak: number;
  fastAnswers: number; // answers under 3 seconds
  hour: number; // current hour (0-23)
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  level: number;
  categoryCorrect: Record<string, number>;
  challengesCreated: number;
  challengesWon: number;
  referralCount: number;
}

// Rarity colors for UI
export const RARITY_COLORS = {
  common: {
    bg: "bg-slate-700",
    border: "border-slate-600",
    text: "text-slate-300",
    glow: "",
  },
  rare: {
    bg: "bg-blue-900/50",
    border: "border-blue-500",
    text: "text-blue-300",
    glow: "shadow-lg shadow-blue-500/20",
  },
  epic: {
    bg: "bg-purple-900/50",
    border: "border-purple-500",
    text: "text-purple-300",
    glow: "shadow-lg shadow-purple-500/30",
  },
  legendary: {
    bg: "bg-yellow-900/50",
    border: "border-yellow-500",
    text: "text-yellow-300",
    glow: "shadow-lg shadow-yellow-500/40 animate-pulse",
  },
};

/**
 * Check which achievements should be unlocked based on current context
 */
export function checkAchievements(
  context: AchievementContext,
  alreadyUnlocked: string[]
): string[] {
  const newAchievements: string[] = [];

  const check = (id: string, condition: boolean) => {
    if (condition && !alreadyUnlocked.includes(id)) {
      newAchievements.push(id);
    }
  };

  // Milestone achievements
  check("first_blood", context.gamesPlayed >= 1);
  check("ten_games", context.gamesPlayed >= 10);
  check("fifty_games", context.gamesPlayed >= 50);
  check("hundred_games", context.gamesPlayed >= 100);

  // Skill achievements
  check("perfect_game", context.perfectGames >= 1);
  check("five_perfect", context.perfectGames >= 5);
  check("speed_demon", context.fastAnswers >= 5);
  check("combo_master", context.maxCombo >= 10);
  check("combo_legend", context.maxCombo >= 20);

  // Streak achievements
  check("streak_3", context.currentStreak >= 3);
  check("streak_7", context.currentStreak >= 7);
  check("streak_30", context.currentStreak >= 30);

  // Time achievements
  check("night_owl", context.hour >= 0 && context.hour < 5);
  check("early_bird", context.hour >= 5 && context.hour < 6);
  check(
    "weekend_warrior",
    context.dayOfWeek === 0 || context.dayOfWeek === 6
  );

  // Social achievements
  check("first_challenge", context.challengesCreated >= 1);
  check("challenge_winner", context.challengesWon >= 1);
  check("referral_1", context.referralCount >= 1);
  check("referral_5", context.referralCount >= 5);

  // Category mastery
  check("agents_master", (context.categoryCorrect.agents || 0) >= 50);
  check("commands_master", (context.categoryCorrect.commands || 0) >= 50);
  check("hooks_master", (context.categoryCorrect.hooks || 0) >= 50);

  // Level achievements
  check("level_5", context.level >= 5);
  check("level_10", context.level >= 10);

  return newAchievements;
}

/**
 * Fetch all achievements from database
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("category")
    .order("rarity");

  if (error) {
    console.error("Error fetching achievements:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch user's unlocked achievements
 */
export async function getUserAchievements(
  userId: string
): Promise<UserAchievement[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at, achievements(*)")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });

  if (error) {
    console.error("Error fetching user achievements:", error);
    return [];
  }

  return (data || []).map((item) => ({
    achievement_id: item.achievement_id,
    unlocked_at: item.unlocked_at,
    achievement: item.achievements as unknown as Achievement,
  }));
}

/**
 * Unlock achievements for a user
 */
export async function unlockAchievements(
  userId: string,
  achievementIds: string[]
): Promise<{ success: boolean; xpEarned: number; achievements: Achievement[] }> {
  if (achievementIds.length === 0) {
    return { success: true, xpEarned: 0, achievements: [] };
  }

  const supabase = createClient();

  // Get achievement details for XP rewards
  const { data: achievementData } = await supabase
    .from("achievements")
    .select("*")
    .in("id", achievementIds);

  const achievements = achievementData || [];
  const totalXP = achievements.reduce((sum, a) => sum + (a.xp_reward || 0), 0);

  // Insert user achievements
  const { error: insertError } = await supabase
    .from("user_achievements")
    .insert(
      achievementIds.map((id) => ({
        user_id: userId,
        achievement_id: id,
      }))
    );

  if (insertError) {
    console.error("Error unlocking achievements:", insertError);
    return { success: false, xpEarned: 0, achievements: [] };
  }

  // Update user XP
  if (totalXP > 0) {
    const { error: xpError } = await supabase.rpc("increment_xp", {
      user_id: userId,
      amount: totalXP,
    });

    if (xpError) {
      console.error("Error adding achievement XP:", xpError);
    }
  }

  // Log activity
  for (const achievement of achievements) {
    await supabase.from("activity_log").insert({
      activity_type: "achievement_unlock",
      user_id: userId,
      metadata: { achievement_id: achievement.id, achievement_name: achievement.name },
    });
  }

  return { success: true, xpEarned: totalXP, achievements };
}

/**
 * Build achievement context from user profile and game data
 */
export async function buildAchievementContext(
  userId: string,
  sessionData?: {
    maxCombo: number;
    fastAnswers: number;
    isPerfect: boolean;
  }
): Promise<AchievementContext> {
  const supabase = createClient();

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // Fetch category progress
  const { data: categoryProgress } = await supabase
    .from("category_progress")
    .select("category, correct")
    .eq("user_id", userId);

  // Count challenges created
  const { count: challengesCreated } = await supabase
    .from("challenges")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", userId);

  // Count referrals
  const { count: referralCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("referred_by", userId);

  const now = new Date();
  const categoryCorrect: Record<string, number> = {};
  (categoryProgress || []).forEach((cp) => {
    categoryCorrect[cp.category] = cp.correct;
  });

  return {
    gamesPlayed: (profile?.games_played || 0) + 1, // +1 for current game
    totalCorrect: profile?.total_correct || 0,
    perfectGames: (profile?.perfect_games || 0) + (sessionData?.isPerfect ? 1 : 0),
    maxCombo: Math.max(profile?.max_combo || 0, sessionData?.maxCombo || 0),
    currentStreak: profile?.daily_streak || 0,
    fastAnswers: sessionData?.fastAnswers || 0,
    hour: now.getHours(),
    dayOfWeek: now.getDay(),
    level: profile?.level || 1,
    categoryCorrect,
    challengesCreated: challengesCreated || 0,
    challengesWon: 0, // Would need separate tracking
    referralCount: referralCount || 0,
  };
}
