"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getReferralStats,
  getReferralShareUrl,
  getReferralShareText,
} from "@/lib/referrals";
import { playSound } from "@/lib/sounds";

export function ReferralCard() {
  const [stats, setStats] = useState<{
    referralCode: string | null;
    referralCount: number;
    totalBonusXP: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const data = await getReferralStats();
      setStats(data);
      setLoading(false);
    };
    loadStats();
  }, []);

  const handleShare = async () => {
    if (!stats?.referralCode) return;

    const shareText = getReferralShareText(stats.referralCode);

    // Try Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Claude Code Quest",
          text: shareText,
          url: getReferralShareUrl(stats.referralCode),
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      playSound("tap");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/2 mb-3"></div>
        <div className="h-10 bg-slate-700 rounded mb-3"></div>
        <div className="h-10 bg-slate-700 rounded"></div>
      </div>
    );
  }

  if (!stats?.referralCode) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-700/50"
    >
      <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
        <span>👋</span>
        Invite Friends
      </h3>

      {/* Referral code display */}
      <div className="bg-slate-800/80 rounded-lg p-3 mb-3">
        <p className="text-xs text-slate-400 mb-1">Your Referral Code</p>
        <p className="text-2xl font-mono font-bold text-purple-400 tracking-wider">
          {stats.referralCode}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-xl font-bold text-blue-400">{stats.referralCount}</p>
          <p className="text-xs text-slate-500">Friends Invited</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-xl font-bold text-yellow-400">+{stats.totalBonusXP}</p>
          <p className="text-xs text-slate-500">Bonus XP Earned</p>
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors"
      >
        {copied ? "Copied!" : "Share & Earn 50 XP"}
      </button>

      <p className="text-xs text-slate-500 text-center mt-2">
        You both get 50 XP when a friend signs up!
      </p>
    </motion.div>
  );
}

// Compact referral badge for profile
export function ReferralBadge({
  referralCount,
  onClick,
}: {
  referralCount: number;
  onClick?: () => void;
}) {
  if (referralCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1 bg-purple-900/30 border border-purple-700 rounded-full text-xs text-purple-300 hover:bg-purple-900/50 transition-colors"
    >
      <span>👋</span>
      <span>{referralCount} referral{referralCount !== 1 ? "s" : ""}</span>
    </button>
  );
}
