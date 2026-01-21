"use client";

import { motion, AnimatePresence } from "framer-motion";

interface XPGainProps {
  amount: number;
  show: boolean;
}

export function XPGain({ amount, show }: XPGainProps) {
  if (!show || amount <= 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                   pointer-events-none z-50"
      >
        <motion.div
          animate={{
            y: [-10, -30],
            opacity: [1, 0],
          }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-4xl font-bold text-yellow-400 drop-shadow-lg"
        >
          +{amount} XP
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Smaller inline version for the header
export function XPGainSmall({
  amount,
  show,
}: {
  amount: number;
  show: boolean;
}) {
  if (!show || amount <= 0) return null;

  return (
    <AnimatePresence>
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        className="text-yellow-400 font-bold text-sm ml-2"
      >
        +{amount}
      </motion.span>
    </AnimatePresence>
  );
}
