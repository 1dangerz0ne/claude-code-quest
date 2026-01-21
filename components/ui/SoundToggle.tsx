"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getMuteState, toggleMute, initSounds, playSound } from "@/lib/sounds";

/**
 * Sound toggle button that shows speaker icon with mute state
 * Initializes sound system on first interaction (browser requirement)
 */
export function SoundToggle() {
  const [isMuted, setIsMuted] = useState(true); // Default muted until loaded
  const [mounted, setMounted] = useState(false);

  // Load saved mute state on mount
  useEffect(() => {
    setMounted(true);
    setIsMuted(getMuteState());
  }, []);

  const handleToggle = () => {
    // Initialize sounds on first user interaction
    initSounds();

    const newMuted = toggleMute();
    setIsMuted(newMuted);

    // Play a small sound when unmuting to confirm it works
    if (!newMuted) {
      playSound("tap");
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-slate-800" />
    );
  }

  return (
    <motion.button
      onClick={handleToggle}
      className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
      whileTap={{ scale: 0.95 }}
      aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {isMuted ? (
        // Muted icon (speaker with X)
        <svg
          className="w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
          />
        </svg>
      ) : (
        // Unmuted icon (speaker with waves)
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      )}
    </motion.button>
  );
}
