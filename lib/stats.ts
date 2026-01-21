"use client";

import { createClient } from "./supabase/client";

/**
 * Get total number of registered players
 */
export async function getTotalPlayers(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching total players:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Get number of players who completed today's daily challenge
 */
export async function getTodayPlayers(): Promise<number> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { count, error } = await supabase
    .from("daily_results")
    .select("*", { count: "exact", head: true })
    .eq("challenge_date", today);

  if (error) {
    console.error("Error fetching today's players:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Get user's rank percentile for today's daily challenge
 * Returns null if user hasn't completed today's challenge
 */
export async function getUserDailyRank(
  userId: string
): Promise<{ rank: number; total: number; percentile: number } | null> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  // Get all today's results ordered by score
  const { data, error } = await supabase
    .from("daily_results")
    .select("user_id, score")
    .eq("challenge_date", today)
    .order("score", { ascending: false });

  if (error || !data) {
    console.error("Error fetching daily rankings:", error);
    return null;
  }

  // Find user's position
  const userIndex = data.findIndex((r) => r.user_id === userId);

  if (userIndex === -1) {
    return null;
  }

  const rank = userIndex + 1;
  const total = data.length;
  const percentile = Math.round(((total - rank + 1) / total) * 100);

  return { rank, total, percentile };
}

/**
 * Get user's global XP rank
 */
export async function getUserGlobalRank(
  userId: string
): Promise<{ rank: number; total: number; percentile: number } | null> {
  const supabase = createClient();

  // Get all profiles ordered by XP
  const { data, error } = await supabase
    .from("profiles")
    .select("id, xp")
    .order("xp", { ascending: false });

  if (error || !data) {
    console.error("Error fetching global rankings:", error);
    return null;
  }

  // Find user's position
  const userIndex = data.findIndex((p) => p.id === userId);

  if (userIndex === -1) {
    return null;
  }

  const rank = userIndex + 1;
  const total = data.length;
  const percentile = Math.round(((total - rank + 1) / total) * 100);

  return { rank, total, percentile };
}

/**
 * Get global stats for display on landing page
 */
export async function getGlobalStats(): Promise<{
  totalPlayers: number;
  totalGames: number;
  todayPlayers: number;
}> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  // Run all queries in parallel
  const [profilesResult, sessionsResult, todayResult] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("game_sessions").select("*", { count: "exact", head: true }),
    supabase
      .from("daily_results")
      .select("*", { count: "exact", head: true })
      .eq("challenge_date", today),
  ]);

  return {
    totalPlayers: profilesResult.count || 0,
    totalGames: sessionsResult.count || 0,
    todayPlayers: todayResult.count || 0,
  };
}
