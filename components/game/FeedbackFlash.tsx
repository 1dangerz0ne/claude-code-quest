"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FeedbackFlashProps {
  type: "correct" | "wrong" | null;
}

/**
 * Full-screen color overlay flash for immediate visual feedback
 * Green pulse on correct, red pulse on wrong
 */
export function FeedbackFlash({ type }: FeedbackFlashProps) {
  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`fixed inset-0 pointer-events-none z-40 ${
            type === "correct"
              ? "bg-green-500/30"
              : "bg-red-500/30"
          }`}
        />
      )}
    </AnimatePresence>
  );
}
