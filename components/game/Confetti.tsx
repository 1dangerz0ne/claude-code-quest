"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  rotation: number;
  delay: number;
  size: number;
}

interface ConfettiProps {
  show: boolean;
  count?: number;
}

// Festive colors for confetti
const COLORS = [
  "#22c55e", // green
  "#eab308", // yellow
  "#3b82f6", // blue
  "#ec4899", // pink
  "#8b5cf6", // purple
  "#f97316", // orange
];

/**
 * Confetti celebration effect that bursts from the top of the screen
 * Triggers on correct answers and achievements
 */
export function Confetti({ show, count = 30 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // Percentage across screen
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        delay: Math.random() * 0.3,
        size: 8 + Math.random() * 8, // 8-16px
      }));
      setPieces(newPieces);

      // Clear after animation
      const timer = setTimeout(() => setPieces([]), 2500);
      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [show, count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              y: -20,
              x: `${piece.x}vw`,
              rotate: piece.rotation,
              opacity: 1,
            }}
            animate={{
              y: "100vh",
              rotate: piece.rotation + 720,
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2 + Math.random(),
              delay: piece.delay,
              ease: "easeIn",
            }}
            style={{
              position: "absolute",
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
