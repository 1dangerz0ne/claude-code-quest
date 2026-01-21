"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createChallenge,
  getChallengeShareUrl,
  getChallengeShareText,
} from "@/lib/challenges";
import { playSound } from "@/lib/sounds";

interface ChallengeButtonProps {
  score: number;
  correct: number;
  total: number;
  timeSeconds: number | null;
  questionSeed: number;
}

export function ChallengeButton({
  score,
  correct,
  total,
  timeSeconds,
  questionSeed,
}: ChallengeButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [challengeCode, setChallengeCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateChallenge = async () => {
    setIsCreating(true);
    setError(null);

    const result = await createChallenge(
      score,
      correct,
      total,
      timeSeconds,
      questionSeed
    );

    if (result.success && result.challengeCode) {
      setChallengeCode(result.challengeCode);
      playSound("correct");
    } else {
      setError(result.error || "Failed to create challenge");
    }

    setIsCreating(false);
  };

  const handleCopy = async () => {
    if (!challengeCode) return;

    const shareText = getChallengeShareText(challengeCode, score, correct, total);

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Claude Code Quest Challenge",
          text: shareText,
          url: getChallengeShareUrl(challengeCode),
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      playSound("tap");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  // If challenge hasn't been created yet
  if (!challengeCode) {
    return (
      <button
        onClick={handleCreateChallenge}
        disabled={isCreating}
        className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800
                   rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {isCreating ? (
          <>
            <span className="animate-spin">...</span>
            Creating Challenge...
          </>
        ) : (
          <>
            <span>Challenge a Friend</span>
          </>
        )}
      </button>
    );
  }

  // Challenge created - show share UI
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-3"
    >
      {/* Challenge code display */}
      <div className="bg-slate-800 rounded-xl p-4 text-center">
        <p className="text-sm text-slate-400 mb-2">Challenge Code</p>
        <p className="text-3xl font-mono font-bold tracking-wider text-orange-400">
          {challengeCode}
        </p>
      </div>

      {/* Copy/Share button */}
      <button
        onClick={handleCopy}
        className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500
                   rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Copied! Share with friends
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Copy Challenge Link
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Error display */}
      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}
    </motion.div>
  );
}

// Challenge result comparison component
export function ChallengeComparison({
  creatorScore,
  creatorCorrect,
  creatorTotal,
  challengerScore,
  challengerCorrect,
  challengerTotal,
  creatorName,
  challengerName,
}: {
  creatorScore: number;
  creatorCorrect: number;
  creatorTotal: number;
  challengerScore: number;
  challengerCorrect: number;
  challengerTotal: number;
  creatorName: string;
  challengerName: string;
}) {
  const creatorWins = creatorScore > challengerScore;
  const tie = creatorScore === challengerScore;

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-center font-bold mb-4">
        {tie ? "It's a Tie!" : creatorWins ? `${creatorName} Wins!` : `${challengerName} Wins!`}
      </h3>

      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Creator stats */}
        <div className={!creatorWins && !tie ? "opacity-60" : ""}>
          <p className="text-sm text-slate-400 truncate">{creatorName}</p>
          <p className="text-2xl font-bold text-yellow-400">{creatorScore}</p>
          <p className="text-xs text-slate-500">
            {creatorCorrect}/{creatorTotal}
          </p>
        </div>

        {/* VS divider */}
        <div className="flex items-center justify-center">
          <span className="text-slate-500 font-bold">VS</span>
        </div>

        {/* Challenger stats */}
        <div className={creatorWins && !tie ? "opacity-60" : ""}>
          <p className="text-sm text-slate-400 truncate">{challengerName}</p>
          <p className="text-2xl font-bold text-yellow-400">{challengerScore}</p>
          <p className="text-xs text-slate-500">
            {challengerCorrect}/{challengerTotal}
          </p>
        </div>
      </div>
    </div>
  );
}
