"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shareResults, type GameResult } from "@/lib/share";

interface ShareButtonProps {
  result: GameResult;
}

/**
 * Share button that copies game results to clipboard in Wordle-style format
 * Shows "Copied!" feedback animation when successful
 */
export function ShareButton({ result }: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared">("idle");

  const handleShare = async () => {
    const { shared, copied } = await shareResults(result);

    if (shared) {
      setStatus("shared");
    } else if (copied) {
      setStatus("copied");
    }

    // Reset status after 2 seconds
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <motion.button
      onClick={handleShare}
      className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-xl text-lg font-semibold transition-colors relative overflow-hidden"
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share Results
          </motion.span>
        )}

        {status === "copied" && (
          <motion.span
            key="copied"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2 text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Copied to clipboard!
          </motion.span>
        )}

        {status === "shared" && (
          <motion.span
            key="shared"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2 text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Shared!
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
