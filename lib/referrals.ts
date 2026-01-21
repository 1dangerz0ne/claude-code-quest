"use client";

import { createClient } from "./supabase/client";

const REFERRAL_BONUS_XP = 50; // XP bonus for both referrer and new user

/**
 * Get user's referral code
 */
export async function getReferralCode(): Promise<string | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .single();

  return profile?.referral_code || null;
}

/**
 * Get referral stats for a user
 */
export async function getReferralStats(): Promise<{
  referralCode: string | null;
  referralCount: number;
  totalBonusXP: number;
}> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { referralCode: null, referralCount: 0, totalBonusXP: 0 };
  }

  // Get referral code
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .single();

  // Count referrals
  const { count: referralCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("referred_by", user.id);

  return {
    referralCode: profile?.referral_code || null,
    referralCount: referralCount || 0,
    totalBonusXP: (referralCount || 0) * REFERRAL_BONUS_XP,
  };
}

/**
 * Apply a referral code for a new user
 */
export async function applyReferralCode(
  code: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not logged in" };
  }

  // Find the referrer by code
  const { data: referrer } = await supabase
    .from("profiles")
    .select("id, xp")
    .eq("referral_code", code.toUpperCase())
    .single();

  if (!referrer) {
    return { success: false, error: "Invalid referral code" };
  }

  // Can't refer yourself
  if (referrer.id === user.id) {
    return { success: false, error: "You can't use your own referral code" };
  }

  // Check if user already has a referrer
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("referred_by")
    .eq("id", user.id)
    .single();

  if (currentProfile?.referred_by) {
    return { success: false, error: "You've already used a referral code" };
  }

  // Update new user's profile with referrer
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      referred_by: referrer.id,
      xp: (currentProfile as { xp?: number } | null)?.xp || 0 + REFERRAL_BONUS_XP,
    })
    .eq("id", user.id);

  if (updateError) {
    return { success: false, error: "Failed to apply referral code" };
  }

  // Give bonus XP to referrer
  await supabase
    .from("profiles")
    .update({ xp: referrer.xp + REFERRAL_BONUS_XP })
    .eq("id", referrer.id);

  // Log activity
  await supabase.from("activity_log").insert([
    {
      activity_type: "referral_used",
      user_id: user.id,
      metadata: { referrer_id: referrer.id, bonus_xp: REFERRAL_BONUS_XP },
    },
    {
      activity_type: "referral_success",
      user_id: referrer.id,
      metadata: { referred_user_id: user.id, bonus_xp: REFERRAL_BONUS_XP },
    },
  ]);

  return { success: true };
}

/**
 * Generate referral share URL
 */
export function getReferralShareUrl(code: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}?ref=${code}`;
  }
  return `/?ref=${code}`;
}

/**
 * Generate referral share text
 */
export function getReferralShareText(code: string): string {
  const url = getReferralShareUrl(code);

  return `Learn Claude Code with me on Claude Code Quest!

Use my referral code and we both get 50 bonus XP:
Code: ${code}

${url}

#ClaudeCodeQuest`;
}
