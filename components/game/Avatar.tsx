"use client";

import { motion } from "framer-motion";
import {
  getTierForXP,
  getNextTier,
  getTierProgress,
  findEquipment,
  ARMORS,
  WEAPONS,
  SHIELDS,
  type Loadout,
  type TierInfo,
} from "@/lib/avatar";

interface AvatarProps {
  xp: number;
  loadout?: Loadout;
  size?: "sm" | "md" | "lg";
  showTier?: boolean;
  showProgress?: boolean;
  animated?: boolean;
}

// Size configurations
const SIZES = {
  sm: { container: 80, icon: 20 },
  md: { container: 120, icon: 28 },
  lg: { container: 180, icon: 40 },
};

export function Avatar({
  xp,
  loadout = { armor: "knight", weapon: "sword", shield: "tower" },
  size = "md",
  showTier = true,
  showProgress = false,
  animated = true,
}: AvatarProps) {
  const tier = getTierForXP(xp);
  const nextTier = getNextTier(xp);
  const progress = getTierProgress(xp);
  const dimensions = SIZES[size];

  const armor = findEquipment("armor", loadout.armor) || ARMORS[0];
  const weapon = findEquipment("weapon", loadout.weapon) || WEAPONS[0];
  const shield = findEquipment("shield", loadout.shield) || SHIELDS[0];

  // Animation variants
  const glowAnimation = animated && tier.tier >= 3 ? {
    animate: {
      boxShadow: [
        `0 0 20px ${tier.glowColor}`,
        `0 0 40px ${tier.glowColor}`,
        `0 0 20px ${tier.glowColor}`,
      ],
    },
    transition: { duration: 2, repeat: Infinity },
  } : {};

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Avatar container with glow */}
      <motion.div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: dimensions.container,
          height: dimensions.container,
          background: `linear-gradient(135deg, ${tier.color}33 0%, ${tier.borderColor}33 100%)`,
          border: `3px solid ${tier.borderColor}`,
          boxShadow: tier.glowColor !== "transparent" ? `0 0 20px ${tier.glowColor}` : "none",
        }}
        {...glowAnimation}
      >
        {/* Character silhouette */}
        <div
          className="relative"
          style={{
            width: dimensions.container * 0.6,
            height: dimensions.container * 0.7,
          }}
        >
          {/* Body */}
          <svg
            viewBox="0 0 60 80"
            className="absolute inset-0 w-full h-full"
            style={{ color: tier.color }}
          >
            {/* Head */}
            <circle cx="30" cy="18" r="14" fill="currentColor" opacity="0.9" />
            {/* Body based on armor style */}
            {armor.style === "knight" && (
              <path
                d="M15 35 L30 28 L45 35 L45 65 L38 70 L30 65 L22 70 L15 65 Z"
                fill="currentColor"
              />
            )}
            {armor.style === "mage" && (
              <path
                d="M18 32 L30 28 L42 32 L45 75 L30 70 L15 75 Z"
                fill="currentColor"
              />
            )}
            {armor.style === "ninja" && (
              <path
                d="M20 33 L30 28 L40 33 L42 55 L30 60 L18 55 Z"
                fill="currentColor"
              />
            )}
          </svg>

          {/* Weapon (right side) */}
          <div
            className="absolute"
            style={{
              right: -dimensions.icon * 0.3,
              top: "40%",
              width: dimensions.icon,
              height: dimensions.icon,
              color: tier.color,
            }}
          >
            <svg viewBox="0 0 24 24" className="w-full h-full">
              {weapon.style === "sword" && (
                <path
                  d="M19 3L5 17l2 2L21 5l-2-2zM3 19l2 2 2-2-2-2-2 2z"
                  fill="currentColor"
                />
              )}
              {weapon.style === "staff" && (
                <>
                  <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="4" r="3" fill="currentColor" />
                </>
              )}
              {weapon.style === "daggers" && (
                <path
                  d="M8 2L4 14l4-2 4 2L8 2zM16 2l-4 12 4-2 4 2L16 2z"
                  fill="currentColor"
                />
              )}
            </svg>
          </div>

          {/* Shield (left side) */}
          <div
            className="absolute"
            style={{
              left: -dimensions.icon * 0.3,
              top: "40%",
              width: dimensions.icon,
              height: dimensions.icon,
              color: tier.color,
            }}
          >
            <svg viewBox="0 0 24 24" className="w-full h-full">
              {shield.style === "tower" && (
                <path
                  d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z"
                  fill="currentColor"
                />
              )}
              {shield.style === "orb" && (
                <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.8" />
              )}
              {shield.style === "cloak" && (
                <path
                  d="M12 2C7 2 3 6 3 11v9l4-3v-6c0-3 2-5 5-5s5 2 5 5v6l4 3v-9c0-5-4-9-9-9z"
                  fill="currentColor"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Tier badge */}
        {showTier && (
          <div
            className="absolute -bottom-1 -right-1 rounded-full px-2 py-0.5 text-xs font-bold"
            style={{
              backgroundColor: tier.borderColor,
              color: "white",
              border: `2px solid ${tier.color}`,
            }}
          >
            T{tier.tier}
          </div>
        )}
      </motion.div>

      {/* Tier name */}
      {showTier && (
        <div className="text-center">
          <p className="font-semibold" style={{ color: tier.color }}>
            {tier.name}
          </p>
        </div>
      )}

      {/* Progress to next tier */}
      {showProgress && nextTier && (
        <div className="w-full max-w-[150px]">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{tier.name}</span>
            <span>{nextTier.name}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: tier.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-slate-500 text-center mt-1">
            {nextTier.minXP - xp} XP to {nextTier.name}
          </p>
        </div>
      )}
    </div>
  );
}

// Mini avatar for leaderboards, etc.
export function MiniAvatar({
  xp,
  loadout,
}: {
  xp: number;
  loadout?: Loadout;
}) {
  return <Avatar xp={xp} loadout={loadout} size="sm" showTier={false} />;
}

// Tier badge only
export function TierBadge({ xp }: { xp: number }) {
  const tier = getTierForXP(xp);

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
      style={{
        backgroundColor: `${tier.color}33`,
        color: tier.color,
        border: `1px solid ${tier.borderColor}`,
      }}
    >
      T{tier.tier} {tier.name}
    </span>
  );
}
