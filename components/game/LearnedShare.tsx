"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "@/lib/sounds";

interface LearnedShareProps {
  concept: string;
  explanation: string;
  category: string;
}

/**
 * Generate share text for a learned concept
 */
function generateLearnedShareText(
  concept: string,
  explanation: string,
  category: string
): string {
  // Truncate explanation if too long
  const shortExplanation =
    explanation.length > 200
      ? explanation.substring(0, 200) + "..."
      : explanation;

  return `TIL about ${category} in Claude Code:

${shortExplanation}

Learn more at claudequest.app

#ClaudeCode #TIL #CodingTips`;
}

export function LearnedShare({ concept, explanation, category }: LearnedShareProps) {
  const [copied, setCopied] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleShare = async () => {
    const shareText = generateLearnedShareText(concept, explanation, category);

    // Try Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TIL: ${concept}`,
          text: shareText,
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
      setShowPopup(true);
      setTimeout(() => {
        setCopied(false);
        setShowPopup(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs
                   bg-slate-700 hover:bg-slate-600 rounded-full
                   text-slate-300 transition-colors"
      >
        <ShareIcon />
        <span>{copied ? "Copied!" : "Share this tip"}</span>
      </button>

      {/* Success popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                       px-3 py-2 bg-green-600 rounded-lg text-xs font-medium
                       whitespace-nowrap"
          >
            Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline share for explanation box
export function ShareTipButton({
  explanation,
  category,
}: {
  explanation: string;
  category: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareText = `TIL about ${category} in Claude Code:

${explanation.length > 250 ? explanation.substring(0, 250) + "..." : explanation}

#ClaudeCode #CodingTips`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      playSound("tap");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore errors
    }
  };

  return (
    <button
      onClick={handleShare}
      className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
    >
      <ShareIcon size={12} />
      <span>{copied ? "Copied!" : "Share tip"}</span>
    </button>
  );
}

// Share icon component
function ShareIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

// Featured tip card for home page
export function FeaturedTip({
  tip,
  category,
}: {
  tip: string;
  category: string;
}) {
  const [copied, setCopied] = useState(false);

  const categoryColors = {
    agents: "border-purple-500 bg-purple-900/20",
    commands: "border-blue-500 bg-blue-900/20",
    hooks: "border-orange-500 bg-orange-900/20",
  };

  const handleShare = async () => {
    const shareText = `Claude Code Tip (${category}):

${tip}

Learn more at claudequest.app`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <div
      className={`rounded-xl p-4 border ${
        categoryColors[category as keyof typeof categoryColors] || "border-slate-700 bg-slate-800/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className="text-xs uppercase tracking-wide text-slate-500">
            {category}
          </span>
          <p className="text-sm text-slate-300 mt-1">{tip}</p>
        </div>
        <button
          onClick={handleShare}
          className="p-2 text-slate-500 hover:text-white transition-colors shrink-0"
        >
          <ShareIcon size={16} />
        </button>
      </div>
      {copied && (
        <p className="text-xs text-green-400 mt-2">Copied to clipboard!</p>
      )}
    </div>
  );
}
