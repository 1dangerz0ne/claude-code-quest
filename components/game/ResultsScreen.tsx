"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShareButton } from "./ShareButton";
import { ChallengeButton } from "./ChallengeButton";
import { Avatar, TierBadge } from "./Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getTierForXP, getNextTier, getTierProgress } from "@/lib/avatar";
import type { Loadout } from "@/lib/avatar";

interface ResultsScreenProps {
  // Core stats
  totalXP: number;
  correctCount: number;
  totalQuestions: number;
  maxCombo: number;
  avgTime: number;
  timeSeconds: number;
  mode: "quick" | "daily";

  // User data (if logged in)
  userXP?: number;
  username?: string;
  loadout?: Loadout;
  rank?: { rank: number; total: number; percentile: number } | null;
  streak?: number;

  // Actions
  onPlayAgain: () => void;
  isGuest?: boolean;

  // For challenge creation
  questionSeed?: number;
}

export function ResultsScreen({
  totalXP,
  correctCount,
  totalQuestions,
  maxCombo,
  avgTime,
  timeSeconds,
  mode,
  userXP = 0,
  username,
  loadout,
  rank,
  streak,
  onPlayAgain,
  isGuest = false,
  questionSeed = Date.now(),
}: ResultsScreenProps) {
  const accuracy = Math.round((correctCount / totalQuestions) * 100);
  const isPerfect = accuracy === 100;

  // Tier progress
  const currentTier = getTierForXP(userXP);
  const nextTier = getNextTier(userXP);
  const tierProgress = getTierProgress(userXP);

  // Result emoji and message
  const getResultEmoji = () => {
    if (isPerfect) return "🏆";
    if (accuracy >= 80) return "🎉";
    if (accuracy >= 60) return "👍";
    if (accuracy >= 40) return "💪";
    return "📚";
  };

  const getResultMessage = () => {
    if (isPerfect) return "Perfect Score!";
    if (accuracy >= 80) return "Excellent!";
    if (accuracy >= 60) return "Good Job!";
    if (accuracy >= 40) return "Keep Practicing!";
    return "Keep Learning!";
  };

  return (
    <main className="min-h-screen flex flex-col p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full"
      >
        {/* Header with result */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-6xl mb-3"
          >
            {getResultEmoji()}
          </motion.div>
          <h1 className="text-3xl font-bold mb-1">{getResultMessage()}</h1>
          <p className="text-slate-400">
            {mode === "daily" ? "Daily Challenge" : "Quick Play"} Complete
          </p>
        </div>

        {/* Avatar with tier (if logged in) */}
        {!isGuest && (
          <div className="mb-6">
            <Avatar
              xp={userXP}
              loadout={loadout}
              size="md"
              showTier={true}
              showProgress={true}
            />
          </div>
        )}

        {/* Main score */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-2xl p-6 mb-6 w-full text-center border border-yellow-700/50"
        >
          <p className="text-yellow-300 text-sm mb-1">XP Earned</p>
          <p className="text-5xl font-bold text-yellow-400 mb-2">+{totalXP}</p>
          {!isGuest && (
            <p className="text-sm text-slate-400">
              Total: {userXP.toLocaleString()} XP
            </p>
          )}
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <StatCard
            label="Accuracy"
            value={`${accuracy}%`}
            subtext={`${correctCount}/${totalQuestions}`}
            color="green"
            delay={0.3}
          />
          <StatCard
            label="Max Combo"
            value={`${maxCombo}x`}
            subtext={maxCombo >= 10 ? "On fire!" : ""}
            color="orange"
            delay={0.35}
          />
          <StatCard
            label="Avg Time"
            value={`${avgTime.toFixed(1)}s`}
            subtext={avgTime < 5 ? "Speed bonus!" : ""}
            color="blue"
            delay={0.4}
          />
          {rank ? (
            <StatCard
              label="Rank"
              value={`#${rank.rank}`}
              subtext={`Top ${100 - rank.percentile}%`}
              color="purple"
              delay={0.45}
            />
          ) : (
            <StatCard
              label="Time"
              value={`${timeSeconds}s`}
              subtext="Total time"
              color="purple"
              delay={0.45}
            />
          )}
        </div>

        {/* Streak indicator (daily mode) */}
        {mode === "daily" && streak !== undefined && streak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-orange-900/30 border border-orange-600 rounded-xl px-4 py-3 mb-6 w-full text-center"
          >
            <span className="text-2xl mr-2">🔥</span>
            <span className="font-bold text-orange-400">{streak} Day Streak!</span>
          </motion.div>
        )}

        {/* Guest signup prompt */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800 rounded-xl p-4 mb-6 w-full"
          >
            <p className="text-sm text-slate-300 mb-3 text-center">
              Sign in to save your progress, unlock achievements, and compete on the leaderboard!
            </p>
            <Link
              href="/login"
              className="block w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-center font-medium transition-colors"
            >
              Sign In with Google
            </Link>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 w-full">
          {/* Share button */}
          <ShareButton
            result={{
              answers: Array(totalQuestions)
                .fill(false)
                .map((_, i) => i < correctCount),
              totalXP,
              maxCombo,
              mode,
            }}
          />

          {/* Challenge a friend (logged in only) */}
          {!isGuest && (
            <ChallengeButton
              score={totalXP}
              correct={correctCount}
              total={totalQuestions}
              timeSeconds={timeSeconds}
              questionSeed={questionSeed}
            />
          )}

          {/* Play again */}
          <button
            onClick={onPlayAgain}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold transition-colors"
          >
            Play Again
          </button>

          {/* Back to menu */}
          <Link
            href="/play"
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-lg font-semibold text-center transition-colors"
          >
            Back to Menu
          </Link>
        </div>

        {/* Tier progress hint */}
        {!isGuest && nextTier && (
          <p className="text-xs text-slate-500 text-center mt-4">
            {nextTier.minXP - userXP} XP until {nextTier.name} tier
          </p>
        )}
      </motion.div>
    </main>
  );
}

// Stat card component
function StatCard({
  label,
  value,
  subtext,
  color,
  delay = 0,
}: {
  label: string;
  value: string;
  subtext?: string;
  color: "green" | "orange" | "blue" | "purple" | "yellow";
  delay?: number;
}) {
  const colorClasses = {
    green: "text-green-400",
    orange: "text-orange-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    yellow: "text-yellow-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-slate-800 rounded-xl p-4 text-center"
    >
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
      <p className="text-slate-400 text-sm">{label}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </motion.div>
  );
}
