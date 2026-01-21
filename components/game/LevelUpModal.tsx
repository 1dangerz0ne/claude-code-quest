"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Confetti } from "./Confetti";
import { playSound } from "@/lib/sounds";
import { LEVEL_THRESHOLDS } from "@/lib/game/scoring";

interface LevelUpModalProps {
  show: boolean;
  level: number;
  title: string;
  onClose: () => void;
}

/**
 * Full-screen celebration modal for leveling up
 * Big dopamine hit with confetti, sound, and animations
 */
export function LevelUpModal({ show, level, title, onClose }: LevelUpModalProps) {
  // Play level up sound when modal appears
  useEffect(() => {
    if (show) {
      playSound("levelup");
    }
  }, [show]);

  // Get next level info for motivation
  const nextLevel = LEVEL_THRESHOLDS.find((t) => t.level === level + 1);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Confetti in background */}
          <Confetti show={show} count={50} />

          {/* Modal overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-6"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 max-w-sm w-full text-center border border-yellow-500/30 shadow-2xl shadow-yellow-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Trophy icon with glow */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="text-8xl mb-4 animate-bounce">
                  {level >= 8 ? "👑" : level >= 5 ? "🏆" : "🎉"}
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 text-8xl blur-xl opacity-50 -z-10">
                  {level >= 8 ? "👑" : level >= 5 ? "🏆" : "🎉"}
                </div>
              </motion.div>

              {/* Level up text */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-yellow-400 text-2xl font-bold mb-2">
                  LEVEL UP!
                </h2>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-5xl font-bold text-white">
                    {level}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-slate-200 mb-2">
                  {title}
                </p>
              </motion.div>

              {/* Next level tease */}
              {nextLevel && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-400 text-sm mt-4"
                >
                  Next: <span className="text-slate-300">{nextLevel.title}</span>
                </motion.p>
              )}

              {/* Close button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={onClose}
                className="w-full py-4 mt-6 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-xl text-lg font-bold transition-colors"
              >
                Awesome!
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
