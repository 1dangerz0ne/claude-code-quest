// Scoring system for Claude Code Quest

// Level thresholds
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "Newcomer" },
  { level: 2, xp: 100, title: "Apprentice" },
  { level: 3, xp: 300, title: "Learner" },
  { level: 4, xp: 600, title: "Practitioner" },
  { level: 5, xp: 1000, title: "Skilled" },
  { level: 6, xp: 1500, title: "Advanced" },
  { level: 7, xp: 2500, title: "Expert" },
  { level: 8, xp: 4000, title: "Master" },
  { level: 9, xp: 6000, title: "Grandmaster" },
  { level: 10, xp: 10000, title: "Legend" },
];

// Calculate level from total XP
export function getLevelFromXP(xp: number): {
  level: number;
  title: string;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
} {
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i];
      break;
    }
  }

  const currentLevelXP = xp - currentLevel.xp;
  const xpForNextLevel = nextLevel.xp - currentLevel.xp;
  const progress =
    xpForNextLevel > 0 ? (currentLevelXP / xpForNextLevel) * 100 : 100;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentXP: currentLevelXP,
    nextLevelXP: xpForNextLevel,
    progress: Math.min(progress, 100),
  };
}

// Get combo multiplier based on current streak
export function getComboMultiplier(streak: number): number {
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

// Calculate XP earned for a single answer
export function calculateXP(
  isCorrect: boolean,
  timeSeconds: number,
  combo: number
): {
  baseXP: number;
  speedBonus: number;
  multiplier: number;
  totalXP: number;
} {
  if (!isCorrect) {
    return { baseXP: 0, speedBonus: 0, multiplier: 1, totalXP: 0 };
  }

  const baseXP = 10;
  const speedBonus = timeSeconds < 5 ? 5 : 0;
  const multiplier = getComboMultiplier(combo);
  const totalXP = Math.floor((baseXP + speedBonus) * multiplier);

  return { baseXP, speedBonus, multiplier, totalXP };
}

// Calculate score for the entire game session
export function calculateSessionScore(
  answers: Array<{ correct: boolean; timeSeconds: number }>
): {
  totalXP: number;
  correctCount: number;
  maxCombo: number;
  avgTime: number;
} {
  let totalXP = 0;
  let currentCombo = 0;
  let maxCombo = 0;
  let correctCount = 0;
  let totalTime = 0;

  for (const answer of answers) {
    totalTime += answer.timeSeconds;

    if (answer.correct) {
      currentCombo++;
      correctCount++;
      maxCombo = Math.max(maxCombo, currentCombo);
      const { totalXP: xp } = calculateXP(true, answer.timeSeconds, currentCombo);
      totalXP += xp;
    } else {
      currentCombo = 0;
    }
  }

  return {
    totalXP,
    correctCount,
    maxCombo,
    avgTime: answers.length > 0 ? totalTime / answers.length : 0,
  };
}

// Check if user leveled up
export function checkLevelUp(
  oldXP: number,
  newXP: number
): { leveledUp: boolean; newLevel: number; newTitle: string } | null {
  const oldLevel = getLevelFromXP(oldXP);
  const newLevel = getLevelFromXP(newXP);

  if (newLevel.level > oldLevel.level) {
    return {
      leveledUp: true,
      newLevel: newLevel.level,
      newTitle: newLevel.title,
    };
  }

  return null;
}
