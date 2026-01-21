"use client";

import { Howl } from "howler";

/**
 * Sound effects manager for Claude Code Quest
 * Uses Howler.js for reliable cross-browser audio playback
 *
 * Sound files should be placed in public/sounds/ directory:
 * - tap.mp3      - Button clicks
 * - correct.mp3  - Correct answer (bright chime)
 * - wrong.mp3    - Wrong answer (low buzz)
 * - combo.mp3    - Combo milestone (rising tone)
 * - levelup.mp3  - Level up (fanfare)
 * - streak.mp3   - Daily streak achieved
 */

// Sound file paths
const SOUNDS = {
  tap: "/sounds/tap.mp3",
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  combo: "/sounds/combo.mp3",
  levelup: "/sounds/levelup.mp3",
  streak: "/sounds/streak.mp3",
} as const;

export type SoundName = keyof typeof SOUNDS;

// Howl instances cache
const soundCache = new Map<SoundName, Howl>();

// Global mute state (persisted to localStorage)
let isMuted = false;
let isInitialized = false;

/**
 * Initialize sound system - call this on first user interaction
 * This loads sounds and respects saved mute preference
 */
export function initSounds(): void {
  if (isInitialized) return;
  isInitialized = true;

  // Load mute preference from localStorage
  if (typeof window !== "undefined") {
    isMuted = localStorage.getItem("soundMuted") === "true";
  }

  // Preload all sounds
  Object.entries(SOUNDS).forEach(([name, src]) => {
    const howl = new Howl({
      src: [src],
      preload: true,
      volume: name === "tap" ? 0.3 : 0.5, // Tap is quieter
    });
    soundCache.set(name as SoundName, howl);
  });
}

/**
 * Play a sound effect by name
 * Silently fails if sound not found or muted
 */
export function playSound(name: SoundName): void {
  if (isMuted) return;

  // Auto-initialize on first play attempt
  if (!isInitialized) {
    initSounds();
  }

  const howl = soundCache.get(name);
  if (howl) {
    howl.play();
  }
}

/**
 * Toggle mute state and persist to localStorage
 * Returns new mute state
 */
export function toggleMute(): boolean {
  isMuted = !isMuted;

  if (typeof window !== "undefined") {
    localStorage.setItem("soundMuted", String(isMuted));
  }

  return isMuted;
}

/**
 * Get current mute state
 */
export function getMuteState(): boolean {
  // Load from localStorage on first call
  if (typeof window !== "undefined" && !isInitialized) {
    isMuted = localStorage.getItem("soundMuted") === "true";
  }
  return isMuted;
}

/**
 * Set mute state explicitly
 */
export function setMuted(muted: boolean): void {
  isMuted = muted;

  if (typeof window !== "undefined") {
    localStorage.setItem("soundMuted", String(isMuted));
  }
}

/**
 * Play combo milestone sound with increasing pitch based on combo count
 */
export function playComboSound(comboCount: number): void {
  if (isMuted) return;

  // Only play on milestone combos: 3, 5, 10, 15, 20, etc.
  const milestones = [3, 5, 10, 15, 20, 25, 30];
  if (!milestones.includes(comboCount)) return;

  if (!isInitialized) {
    initSounds();
  }

  const howl = soundCache.get("combo");
  if (howl) {
    // Increase pitch slightly for higher combos
    const pitch = 1 + (milestones.indexOf(comboCount) * 0.1);
    howl.rate(Math.min(pitch, 1.5));
    howl.play();
  }
}
