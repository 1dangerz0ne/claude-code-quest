"use client";

import { createClient } from "./client";
import { getLevelFromXP, checkLevelUp } from "@/lib/game/scoring";

// Types matching the schema
export interface GameSessionData {
  mode: "quick" | "daily";
  score: number;
  correct: number;
  total: number;
  maxCombo: number;
  timeSeconds: number;
  xpEarned: number;
  categories?: string[]; // Categories of questions answered
}

export interface CategoryScore {
  category: string;
  correct: number;
  total: number;
}

export interface SaveResult {
  success: boolean;
  leveledUp: boolean;
  newLevel?: number;
  newTitle?: string;
  newStreak?: number;
  error?: string;
  profile?: {
    xp: number;
    level: number;
    daily_streak: number;
    games_played: number;
    perfect_games: number;
  };
}

/**
 * Saves a game result to Supabase
 * - Inserts game session
 * - Updates user XP and level
 * - Updates streak (for daily mode)
 * - Updates category progress
 */
export async function saveGameResult(
  data: GameSessionData,
  categoryScores?: CategoryScore[]
): Promise<SaveResult> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, leveledUp: false, error: "User not authenticated" };
  }

  try {
    // 1. Get current profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("xp, level, daily_streak, longest_daily_streak, last_played_date")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return { success: false, leveledUp: false, error: profileError.message };
    }

    const currentXP = profile?.xp || 0;
    const newXP = currentXP + data.xpEarned;

    // Check for level up
    const levelUpResult = checkLevelUp(currentXP, newXP);
    const newLevelData = getLevelFromXP(newXP);

    // 2. Insert game session
    const { error: sessionError } = await supabase.from("game_sessions").insert({
      user_id: user.id,
      mode: data.mode,
      score: data.score,
      correct: data.correct,
      total: data.total,
      max_combo: data.maxCombo,
      time_seconds: data.timeSeconds,
      xp_earned: data.xpEarned,
    });

    if (sessionError) {
      console.error("Error inserting game session:", sessionError);
      return { success: false, leveledUp: false, error: sessionError.message };
    }

    // 3. Calculate streak update (for daily mode)
    let newStreak = profile?.daily_streak || 0;
    if (data.mode === "daily") {
      const today = new Date().toISOString().split("T")[0];
      const lastPlayed = profile?.last_played_date;

      if (lastPlayed) {
        const lastDate = new Date(lastPlayed);
        const todayDate = new Date(today);
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          // Consecutive day - increment streak
          newStreak = (profile?.daily_streak || 0) + 1;
        } else if (diffDays > 1) {
          // Streak broken - reset to 1
          newStreak = 1;
        }
        // If same day, keep current streak
      } else {
        // First time playing - start streak
        newStreak = 1;
      }

      // 4. Insert daily result
      const { error: dailyError } = await supabase.from("daily_results").insert({
        user_id: user.id,
        challenge_date: today,
        score: data.score,
        correct: data.correct,
        total: data.total,
        time_seconds: data.timeSeconds,
      });

      // Ignore duplicate error (user already completed today's daily)
      if (dailyError && !dailyError.message.includes("duplicate")) {
        console.error("Error inserting daily result:", dailyError);
      }
    }

    // 5. Update profile with new XP, level, and streak
    const profileUpdate: Record<string, unknown> = {
      xp: newXP,
      level: newLevelData.level,
    };

    if (data.mode === "daily") {
      profileUpdate.daily_streak = newStreak;
      profileUpdate.longest_daily_streak = Math.max(
        newStreak,
        profile?.longest_daily_streak || 0
      );
      profileUpdate.last_played_date = new Date().toISOString().split("T")[0];
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return { success: false, leveledUp: false, error: updateError.message };
    }

    // 6. Update category progress using upsert
    if (categoryScores && categoryScores.length > 0) {
      for (const cat of categoryScores) {
        // First try to get existing record
        const { data: existing } = await supabase
          .from("category_progress")
          .select("correct, total")
          .eq("user_id", user.id)
          .eq("category", cat.category)
          .single();

        if (existing) {
          // Update existing
          const { error: updateCatError } = await supabase
            .from("category_progress")
            .update({
              correct: existing.correct + cat.correct,
              total: existing.total + cat.total,
            })
            .eq("user_id", user.id)
            .eq("category", cat.category);

          if (updateCatError) {
            console.error("Error updating category progress:", updateCatError);
          }
        } else {
          // Insert new
          const { error: insertCatError } = await supabase
            .from("category_progress")
            .insert({
              user_id: user.id,
              category: cat.category,
              correct: cat.correct,
              total: cat.total,
            });

          if (insertCatError) {
            console.error("Error inserting category progress:", insertCatError);
          }
        }
      }
    }

    // Get updated profile for return
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("xp, level, daily_streak, games_played, perfect_games")
      .eq("id", user.id)
      .single();

    return {
      success: true,
      leveledUp: levelUpResult !== null,
      newLevel: levelUpResult?.newLevel,
      newTitle: levelUpResult?.newTitle,
      newStreak: data.mode === "daily" ? newStreak : undefined,
      profile: updatedProfile ? {
        xp: updatedProfile.xp || 0,
        level: updatedProfile.level || 1,
        daily_streak: updatedProfile.daily_streak || 0,
        games_played: updatedProfile.games_played || 0,
        perfect_games: updatedProfile.perfect_games || 0,
      } : undefined,
    };
  } catch (err) {
    console.error("Unexpected error saving game result:", err);
    return { success: false, leveledUp: false, error: "Unexpected error" };
  }
}

/**
 * Get the current user's profile
 */
export async function getUserProfile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

/**
 * Check if user has completed today's daily challenge
 */
export async function hasCompletedTodayDaily(): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_results")
    .select("id")
    .eq("user_id", user.id)
    .eq("challenge_date", today)
    .single();

  if (error) {
    // No result found means not completed
    return false;
  }

  return !!data;
}

/**
 * Get today's leaderboard
 */
export async function getTodayLeaderboard(limit = 10) {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_results")
    .select(
      `
      score,
      correct,
      total,
      time_seconds,
      profiles!inner(username)
    `
    )
    .eq("challenge_date", today)
    .order("score", { ascending: false })
    .order("time_seconds", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  return data;
}
