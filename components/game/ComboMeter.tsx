"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getComboMultiplier } from "@/lib/game/scoring";
import { playComboSound } from "@/lib/sounds";

interface ComboMeterProps {
  combo: number;
  show: boolean;
}

export function ComboMeter({ combo, show }: ComboMeterProps) {
  const multiplier = getComboMultiplier(combo);
  const prevCombo = useRef(combo);

  // Play combo sound at milestones
  useEffect(() => {
    // Only play when combo increases (not on reset or initial render)
    if (combo > prevCombo.current) {
      playComboSound(combo);
    }
    prevCombo.current = combo;
  }, [combo]);

  if (!show || combo < 2) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="flex items-center gap-2 px-4 py-2 bg-orange-600/20 rounded-full border border-orange-500"
      >
        {/* Combo count */}
        <motion.span
          key={combo}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className="text-orange-400 font-bold text-lg"
        >
          {combo}🔥
        </motion.span>

        {/* Multiplier */}
        {multiplier > 1 && (
          <span className="text-orange-300 text-sm font-medium">
            {multiplier}x XP
          </span>
        )}

        {/* Combo dots */}
        <div className="flex gap-1">
          {[...Array(Math.min(combo, 5))].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="w-2 h-2 rounded-full bg-orange-500"
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
