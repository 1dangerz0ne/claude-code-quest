"use client";

import { createClient } from "./supabase/client";

// Challenge data structure
export interface Challenge {
  id: string;
  challenge_code: string;
  creator_id: string;
  creator_score: number;
  creator_correct: number;
  creator_total: number;
  creator_time_seconds: number | null;
  question_seed: number;
  created_at: string;
  expires_at: string;
  creator_username?: string;
}

export interface ChallengeAttempt {
  id: string;
  challenge_id: string;
  user_id: string | null;
  guest_name: string | null;
  score: number;
  correct: number;
  total: number;
  time_seconds: number | null;
  completed_at: string;
  username?: string;
}

/**
 * Generate a unique challenge code
 */
function generateChallengeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Create a new challenge from a completed game
 */
export async function createChallenge(
  score: number,
  correct: number,
  total: number,
  timeSeconds: number | null,
  questionSeed: number
): Promise<{ success: boolean; challengeCode?: string; error?: string }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Must be logged in to create a challenge" };
  }

  const challengeCode = generateChallengeCode();

  const { error } = await supabase.from("challenges").insert({
    challenge_code: challengeCode,
    creator_id: user.id,
    creator_score: score,
    creator_correct: correct,
    creator_total: total,
    creator_time_seconds: timeSeconds,
    question_seed: questionSeed,
  });

  if (error) {
    console.error("Error creating challenge:", error);
    return { success: false, error: error.message };
  }

  // Log activity
  await supabase.from("activity_log").insert({
    activity_type: "challenge_created",
    user_id: user.id,
    metadata: { challenge_code: challengeCode },
  });

  return { success: true, challengeCode };
}

/**
 * Get challenge by code
 */
export async function getChallengeByCode(
  code: string
): Promise<Challenge | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("challenges")
    .select(`
      *,
      profiles!creator_id(username)
    `)
    .eq("challenge_code", code.toUpperCase())
    .single();

  if (error || !data) {
    console.error("Error fetching challenge:", error);
    return null;
  }

  return {
    ...data,
    creator_username: (data.profiles as { username?: string })?.username,
  };
}

/**
 * Submit a challenge attempt
 */
export async function submitChallengeAttempt(
  challengeId: string,
  score: number,
  correct: number,
  total: number,
  timeSeconds: number | null,
  guestName?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("challenge_attempts").insert({
    challenge_id: challengeId,
    user_id: user?.id || null,
    guest_name: !user ? guestName || "Anonymous" : null,
    score,
    correct,
    total,
    time_seconds: timeSeconds,
  });

  if (error) {
    console.error("Error submitting challenge attempt:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get all attempts for a challenge
 */
export async function getChallengeAttempts(
  challengeId: string
): Promise<ChallengeAttempt[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("challenge_attempts")
    .select(`
      *,
      profiles(username)
    `)
    .eq("challenge_id", challengeId)
    .order("score", { ascending: false });

  if (error) {
    console.error("Error fetching challenge attempts:", error);
    return [];
  }

  return (data || []).map((attempt) => ({
    ...attempt,
    username: attempt.profiles?.username || attempt.guest_name || "Anonymous",
  }));
}

/**
 * Generate shareable challenge link
 */
export function getChallengeShareUrl(code: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/challenge/${code}`;
  }
  return `/challenge/${code}`;
}

/**
 * Generate challenge share text
 */
export function getChallengeShareText(
  code: string,
  score: number,
  correct: number,
  total: number
): string {
  const accuracy = Math.round((correct / total) * 100);
  const url = getChallengeShareUrl(code);

  return `I scored ${score} XP (${accuracy}% accuracy) on Claude Code Quest!

Can you beat my score?

${url}

#ClaudeCodeQuest`;
}
