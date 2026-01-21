"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RARITY_COLORS, type Achievement } from "@/lib/achievements";
import { playSound } from "@/lib/sounds";
import { Confetti } from "./Confetti";

interface AchievementModalProps {
  show: boolean;
  achievements: Achievement[];
  totalXP: number;
  onClose: () => void;
}

export function AchievementModal({
  show,
  achievements,
  totalXP,
  onClose,
}: AchievementModalProps) {
  // Play sound when modal opens
  useEffect(() => {
    if (show && achievements.length > 0) {
      playSound("levelup");
    }
  }, [show, achievements.length]);

  if (!show || achievements.length === 0) return null;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Confetti */}
          <Confetti show={true} count={50} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 m-auto max-w-sm max-h-[80vh] z-50 flex items-center justify-center"
          >
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl w-full overflow-auto">
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="text-5xl mb-3"
                >
                  🏆
                </motion.div>
                <h2 className="text-2xl font-bold mb-1">
                  Achievement{achievements.length > 1 ? "s" : ""} Unlocked!
                </h2>
                <p className="text-slate-400 text-sm">
                  You earned {achievements.length} new badge{achievements.length > 1 ? "s" : ""}
                </p>
              </div>

              {/* Achievement list */}
              <div className="space-y-3 mb-6">
                {achievements.map((achievement, index) => {
                  const colors = RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS];

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl
                        border ${colors.border} ${colors.bg} ${colors.glow}
                      `}
                    >
                      <span className="text-3xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className={`font-bold ${colors.text}`}>
                          {achievement.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.xp_reward > 0 && (
                        <div className="text-right">
                          <p className="text-yellow-400 font-bold">
                            +{achievement.xp_reward}
                          </p>
                          <p className="text-xs text-slate-500">XP</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Total XP bonus */}
              {totalXP > 0 && (
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6 text-center">
                  <p className="text-sm text-yellow-300 mb-1">Total Bonus XP</p>
                  <p className="text-3xl font-bold text-yellow-400">+{totalXP}</p>
                </div>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold transition-colors"
              >
                Awesome!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Mini achievement notification (toast style)
export function AchievementToast({
  achievement,
  onClose,
}: {
  achievement: Achievement;
  onClose: () => void;
}) {
  const colors = RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS];

  useEffect(() => {
    playSound("correct");
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: -30 }}
      className={`
        fixed top-4 left-1/2 z-50
        flex items-center gap-3 px-4 py-3 rounded-xl
        border-2 ${colors.border} ${colors.bg} ${colors.glow}
        backdrop-blur-sm shadow-xl
      `}
    >
      <span className="text-2xl">{achievement.icon}</span>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide">
          Achievement Unlocked
        </p>
        <p className={`font-bold ${colors.text}`}>{achievement.name}</p>
      </div>
      {achievement.xp_reward > 0 && (
        <span className="text-yellow-400 font-bold text-sm">
          +{achievement.xp_reward} XP
        </span>
      )}
    </motion.div>
  );
}
