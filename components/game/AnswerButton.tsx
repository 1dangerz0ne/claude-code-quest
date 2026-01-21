"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { playSound, initSounds } from "@/lib/sounds";

interface AnswerButtonProps {
  label: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean | null; // null = not revealed yet
  isRevealed: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function AnswerButton({
  label,
  index,
  isSelected,
  isCorrect,
  isRevealed,
  disabled,
  onClick,
}: AnswerButtonProps) {
  const letters = ["A", "B", "C", "D"];

  // Determine styling based on state
  const getStyles = () => {
    if (!isRevealed) {
      // Not yet revealed - show selection state only
      return isSelected
        ? "bg-blue-600 border-blue-400"
        : "bg-slate-800 border-slate-700 hover:bg-slate-700";
    }

    // Revealed - show correct/incorrect
    if (isCorrect) {
      return "bg-green-600/30 border-green-500";
    }

    if (isSelected && !isCorrect) {
      return "bg-red-600/30 border-red-500";
    }

    return "bg-slate-800/50 border-slate-700 opacity-50";
  };

  // Handle click with sound
  const handleClick = () => {
    initSounds(); // Initialize on first user interaction
    playSound("tap");
    onClick();
  };

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.98 }}
      animate={
        isRevealed && isSelected && !isCorrect
          ? { x: [0, -5, 5, -5, 5, 0] }
          : {}
      }
      transition={{ duration: 0.4 }}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "w-full py-4 px-4 rounded-xl text-left transition-all",
        "border-2 min-h-[60px]",
        "flex items-center gap-3",
        "disabled:cursor-not-allowed",
        getStyles()
      )}
    >
      {/* Letter badge */}
      <span
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          "text-sm font-bold",
          isRevealed && isCorrect
            ? "bg-green-500 text-white"
            : isRevealed && isSelected && !isCorrect
              ? "bg-red-500 text-white"
              : "bg-slate-700 text-slate-300"
        )}
      >
        {letters[index]}
      </span>

      {/* Answer text */}
      <span className="flex-1 text-base">{label}</span>

      {/* Result icon */}
      {isRevealed && (
        <span className="flex-shrink-0 text-xl">
          {isCorrect ? "✓" : isSelected ? "✗" : ""}
        </span>
      )}
    </motion.button>
  );
}
