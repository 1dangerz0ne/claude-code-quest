"use client";

import { motion } from "framer-motion";
import { RARITY_COLORS, type Achievement } from "@/lib/achievements";

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: boolean;
  unlockedAt?: string;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  onClick?: () => void;
}

const SIZES = {
  sm: { container: "w-12 h-12", icon: "text-xl", text: "text-xs" },
  md: { container: "w-16 h-16", icon: "text-3xl", text: "text-sm" },
  lg: { container: "w-20 h-20", icon: "text-4xl", text: "text-base" },
};

export function AchievementBadge({
  achievement,
  unlocked = true,
  unlockedAt,
  size = "md",
  showDetails = false,
  onClick,
}: AchievementBadgeProps) {
  const colors = RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS];
  const sizeConfig = SIZES[size];

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 ${onClick ? "cursor-pointer" : ""}`}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
    >
      {/* Badge circle */}
      <div
        className={`
          ${sizeConfig.container} rounded-full flex items-center justify-center
          border-2 ${colors.border} ${colors.bg} ${colors.glow}
          ${!unlocked ? "opacity-40 grayscale" : ""}
          transition-all duration-200
        `}
      >
        <span className={sizeConfig.icon}>
          {unlocked ? achievement.icon : "🔒"}
        </span>
      </div>

      {/* Achievement name */}
      {showDetails && (
        <div className="text-center max-w-[100px]">
          <p className={`${sizeConfig.text} font-semibold ${colors.text} truncate`}>
            {achievement.name}
          </p>
          {unlocked && unlockedAt && (
            <p className="text-xs text-slate-500">
              {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Compact inline badge for lists
export function AchievementBadgeInline({
  achievement,
  unlocked = true,
}: {
  achievement: Achievement;
  unlocked?: boolean;
}) {
  const colors = RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS];

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg
        border ${colors.border} ${colors.bg}
        ${!unlocked ? "opacity-40 grayscale" : ""}
      `}
    >
      <span className="text-xl">{unlocked ? achievement.icon : "🔒"}</span>
      <div>
        <p className={`text-sm font-semibold ${colors.text}`}>
          {achievement.name}
        </p>
        <p className="text-xs text-slate-400">{achievement.description}</p>
      </div>
      {achievement.xp_reward > 0 && unlocked && (
        <span className="text-xs text-yellow-400 font-bold ml-auto">
          +{achievement.xp_reward} XP
        </span>
      )}
    </div>
  );
}

// Achievement unlock notification
export function AchievementUnlockToast({
  achievement,
  onClose,
}: {
  achievement: Achievement;
  onClose: () => void;
}) {
  const colors = RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3 px-4 py-3 rounded-xl
        border-2 ${colors.border} ${colors.bg} ${colors.glow}
        backdrop-blur-sm
      `}
    >
      <span className="text-3xl">{achievement.icon}</span>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide">
          Achievement Unlocked!
        </p>
        <p className={`font-bold ${colors.text}`}>{achievement.name}</p>
        <p className="text-xs text-slate-400">{achievement.description}</p>
      </div>
      {achievement.xp_reward > 0 && (
        <div className="text-right">
          <p className="text-yellow-400 font-bold">+{achievement.xp_reward}</p>
          <p className="text-xs text-slate-500">XP</p>
        </div>
      )}
      <button
        onClick={onClose}
        className="ml-2 text-slate-500 hover:text-white"
      >
        ×
      </button>
    </motion.div>
  );
}
