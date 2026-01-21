"use client";

// =============================================
// AVATAR EQUIPMENT SYSTEM
// 3 items (Armor, Weapon, Shield) x 3 styles each x 5 tiers
// =============================================

export type EquipmentType = "armor" | "weapon" | "shield";
export type EquipmentStyle = string; // e.g., "knight", "mage", "ninja"
export type Tier = 1 | 2 | 3 | 4 | 5;

export interface EquipmentItem {
  type: EquipmentType;
  style: string;
  name: string;
  description: string;
}

export interface TierInfo {
  tier: Tier;
  name: string;
  prefix: string;
  minXP: number;
  color: string;
  glowColor: string;
  borderColor: string;
}

// Tier progression (same for all equipment)
export const TIERS: TierInfo[] = [
  {
    tier: 1,
    name: "Common",
    prefix: "Worn",
    minXP: 0,
    color: "#6b7280", // gray
    glowColor: "transparent",
    borderColor: "#4b5563",
  },
  {
    tier: 2,
    name: "Uncommon",
    prefix: "Sturdy",
    minXP: 200,
    color: "#22c55e", // green
    glowColor: "rgba(34, 197, 94, 0.3)",
    borderColor: "#16a34a",
  },
  {
    tier: 3,
    name: "Rare",
    prefix: "Refined",
    minXP: 800,
    color: "#3b82f6", // blue
    glowColor: "rgba(59, 130, 246, 0.4)",
    borderColor: "#2563eb",
  },
  {
    tier: 4,
    name: "Epic",
    prefix: "Masterwork",
    minXP: 2500,
    color: "#a855f7", // purple
    glowColor: "rgba(168, 85, 247, 0.5)",
    borderColor: "#9333ea",
  },
  {
    tier: 5,
    name: "Legendary",
    prefix: "Legendary",
    minXP: 6000,
    color: "#f59e0b", // amber/gold
    glowColor: "rgba(245, 158, 11, 0.6)",
    borderColor: "#d97706",
  },
];

// =============================================
// ARMOR OPTIONS (3 styles)
// =============================================
export const ARMORS: EquipmentItem[] = [
  {
    type: "armor",
    style: "knight",
    name: "Plate Armor",
    description: "Heavy armor for defenders of code",
  },
  {
    type: "armor",
    style: "mage",
    name: "Robes",
    description: "Flowing robes of a code wizard",
  },
  {
    type: "armor",
    style: "ninja",
    name: "Shadow Garb",
    description: "Light armor for swift coders",
  },
];

// =============================================
// WEAPON OPTIONS (3 styles)
// =============================================
export const WEAPONS: EquipmentItem[] = [
  {
    type: "weapon",
    style: "sword",
    name: "Code Blade",
    description: "A sharp blade to cut through bugs",
  },
  {
    type: "weapon",
    style: "staff",
    name: "Syntax Staff",
    description: "Channel the power of clean code",
  },
  {
    type: "weapon",
    style: "daggers",
    name: "Debug Daggers",
    description: "Twin blades for quick fixes",
  },
];

// =============================================
// SHIELD OPTIONS (3 styles)
// =============================================
export const SHIELDS: EquipmentItem[] = [
  {
    type: "shield",
    style: "tower",
    name: "Tower Shield",
    description: "Maximum protection from errors",
  },
  {
    type: "shield",
    style: "orb",
    name: "Magic Orb",
    description: "A floating defensive sphere",
  },
  {
    type: "shield",
    style: "cloak",
    name: "Shadow Cloak",
    description: "Evade problems with stealth",
  },
];

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Get the tier info for a given XP amount
 */
export function getTierForXP(xp: number): TierInfo {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].minXP) {
      return TIERS[i];
    }
  }
  return TIERS[0];
}

/**
 * Get the next tier (for progress display)
 */
export function getNextTier(xp: number): TierInfo | null {
  const currentTier = getTierForXP(xp);
  const nextIndex = TIERS.findIndex((t) => t.tier === currentTier.tier) + 1;
  return nextIndex < TIERS.length ? TIERS[nextIndex] : null;
}

/**
 * Calculate progress to next tier (0-100)
 */
export function getTierProgress(xp: number): number {
  const currentTier = getTierForXP(xp);
  const nextTier = getNextTier(xp);

  if (!nextTier) return 100;

  const xpRange = nextTier.minXP - currentTier.minXP;
  const xpProgress = xp - currentTier.minXP;

  return Math.min(100, Math.round((xpProgress / xpRange) * 100));
}

/**
 * Get full equipment name with tier prefix
 */
export function getEquipmentName(item: EquipmentItem, tier: TierInfo): string {
  return `${tier.prefix} ${item.name}`;
}

/**
 * Default loadout for new players
 */
export const DEFAULT_LOADOUT = {
  armor: "knight",
  weapon: "sword",
  shield: "tower",
};

/**
 * User's equipment loadout
 */
export interface Loadout {
  armor: string;
  weapon: string;
  shield: string;
}

/**
 * Get all equipment options
 */
export function getAllEquipment(): {
  armors: EquipmentItem[];
  weapons: EquipmentItem[];
  shields: EquipmentItem[];
} {
  return {
    armors: ARMORS,
    weapons: WEAPONS,
    shields: SHIELDS,
  };
}

/**
 * Find equipment item by type and style
 */
export function findEquipment(
  type: EquipmentType,
  style: string
): EquipmentItem | undefined {
  const collections = {
    armor: ARMORS,
    weapon: WEAPONS,
    shield: SHIELDS,
  };
  return collections[type].find((item) => item.style === style);
}

// =============================================
// SVG ICON PATHS (for visual representation)
// =============================================

export const EQUIPMENT_ICONS = {
  // Armor icons
  armor: {
    knight: `<path d="M12 2L4 7v8c0 5 8 9 8 9s8-4 8-9V7l-8-5z" fill="currentColor"/>`,
    mage: `<path d="M12 2C8 2 5 8 5 12c0 5 3 10 7 10s7-5 7-10c0-4-3-10-7-10z" fill="currentColor"/>`,
    ninja: `<path d="M12 3l-2 4-4 1 3 3-1 4 4-2 4 2-1-4 3-3-4-1-2-4z" fill="currentColor"/>`,
  },
  // Weapon icons
  weapon: {
    sword: `<path d="M14.5 3L3 14.5l2.5 2.5L17 5.5 14.5 3zM3 19l2 2 2-2-2-2-2 2z" fill="currentColor"/>`,
    staff: `<path d="M12 2v16m-4-4l4 4 4-4M8 6l4-2 4 2" stroke="currentColor" stroke-width="2" fill="none"/>`,
    daggers: `<path d="M7 3l-4 11 4-2 4 2-4-11zM17 3l-4 11 4-2 4 2-4-11z" fill="currentColor"/>`,
  },
  // Shield icons
  shield: {
    tower: `<path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" fill="currentColor"/>`,
    orb: `<circle cx="12" cy="12" r="8" fill="currentColor"/>`,
    cloak: `<path d="M12 2C7 2 3 6 3 11v9l4-3v-6c0-3 2-5 5-5s5 2 5 5v6l4 3v-9c0-5-4-9-9-9z" fill="currentColor"/>`,
  },
};

/**
 * Get SVG icon for equipment
 */
export function getEquipmentIcon(type: EquipmentType, style: string): string {
  return EQUIPMENT_ICONS[type]?.[style as keyof (typeof EQUIPMENT_ICONS)[typeof type]] || "";
}
