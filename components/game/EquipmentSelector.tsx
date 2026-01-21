"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ARMORS,
  WEAPONS,
  SHIELDS,
  getTierForXP,
  type EquipmentItem,
  type Loadout,
} from "@/lib/avatar";
import { Avatar } from "./Avatar";

interface EquipmentSelectorProps {
  xp: number;
  currentLoadout: Loadout;
  onSave: (loadout: Loadout) => Promise<void>;
}

export function EquipmentSelector({
  xp,
  currentLoadout,
  onSave,
}: EquipmentSelectorProps) {
  const [loadout, setLoadout] = useState<Loadout>(currentLoadout);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const tier = getTierForXP(xp);

  const handleSelect = (type: keyof Loadout, style: string) => {
    setLoadout((prev) => ({ ...prev, [type]: style }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(loadout);
      setSaved(true);
    } catch (error) {
      console.error("Failed to save loadout:", error);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    loadout.armor !== currentLoadout.armor ||
    loadout.weapon !== currentLoadout.weapon ||
    loadout.shield !== currentLoadout.shield;

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex flex-col items-center p-6 bg-slate-800 rounded-2xl">
        <h3 className="text-sm text-slate-400 mb-4">Preview</h3>
        <Avatar
          xp={xp}
          loadout={loadout}
          size="lg"
          showTier={true}
          showProgress={true}
          animated={true}
        />
      </div>

      {/* Equipment sections */}
      <EquipmentSection
        title="Armor"
        icon="🛡️"
        items={ARMORS}
        selected={loadout.armor}
        tier={tier}
        onSelect={(style) => handleSelect("armor", style)}
      />

      <EquipmentSection
        title="Weapon"
        icon="⚔️"
        items={WEAPONS}
        selected={loadout.weapon}
        tier={tier}
        onSelect={(style) => handleSelect("weapon", style)}
      />

      <EquipmentSection
        title="Shield"
        icon="🔰"
        items={SHIELDS}
        selected={loadout.shield}
        tier={tier}
        onSelect={(style) => handleSelect("shield", style)}
      />

      {/* Save button */}
      <motion.button
        onClick={handleSave}
        disabled={!hasChanges || saving}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          hasChanges && !saving
            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
            : "bg-slate-700 text-slate-500 cursor-not-allowed"
        }`}
        whileTap={{ scale: hasChanges ? 0.98 : 1 }}
      >
        {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Loadout"}
      </motion.button>
    </div>
  );
}

// Individual equipment section
function EquipmentSection({
  title,
  icon,
  items,
  selected,
  tier,
  onSelect,
}: {
  title: string;
  icon: string;
  items: EquipmentItem[];
  selected: string;
  tier: ReturnType<typeof getTierForXP>;
  onSelect: (style: string) => void;
}) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4">
      <h3 className="flex items-center gap-2 font-semibold mb-3">
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <motion.button
            key={item.style}
            onClick={() => onSelect(item.style)}
            className={`p-3 rounded-xl border-2 transition-all ${
              selected === item.style
                ? "border-blue-500 bg-blue-500/20"
                : "border-slate-700 bg-slate-800 hover:border-slate-600"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {/* Equipment icon */}
            <div
              className="w-12 h-12 mx-auto mb-2"
              style={{ color: tier.color }}
            >
              <EquipmentIcon type={item.type} style={item.style} />
            </div>
            <p className="text-xs font-medium text-center">{item.name}</p>
            {selected === item.style && (
              <p className="text-xs text-blue-400 text-center mt-1">Equipped</p>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// SVG icons for equipment
function EquipmentIcon({ type, style }: { type: string; style: string }) {
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      {/* Armor icons */}
      {type === "armor" && style === "knight" && (
        <path
          d="M12 2L4 7v8c0 5 8 9 8 9s8-4 8-9V7l-8-5z"
          fill="currentColor"
        />
      )}
      {type === "armor" && style === "mage" && (
        <path
          d="M12 2C8 2 5 8 5 12c0 5 3 10 7 10s7-5 7-10c0-4-3-10-7-10z"
          fill="currentColor"
        />
      )}
      {type === "armor" && style === "ninja" && (
        <path
          d="M12 3l-2 4-4 1 3 3-1 4 4-2 4 2-1-4 3-3-4-1-2-4z"
          fill="currentColor"
        />
      )}

      {/* Weapon icons */}
      {type === "weapon" && style === "sword" && (
        <path
          d="M14.5 3L3 14.5l2.5 2.5L17 5.5 14.5 3zM3 19l2 2 2-2-2-2-2 2z"
          fill="currentColor"
        />
      )}
      {type === "weapon" && style === "staff" && (
        <>
          <line
            x1="12"
            y1="4"
            x2="12"
            y2="20"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="6" r="4" fill="currentColor" />
        </>
      )}
      {type === "weapon" && style === "daggers" && (
        <path
          d="M7 3l-4 11 4-2 4 2-4-11zM17 3l-4 11 4-2 4 2-4-11z"
          fill="currentColor"
        />
      )}

      {/* Shield icons */}
      {type === "shield" && style === "tower" && (
        <path
          d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z"
          fill="currentColor"
        />
      )}
      {type === "shield" && style === "orb" && (
        <circle cx="12" cy="12" r="8" fill="currentColor" />
      )}
      {type === "shield" && style === "cloak" && (
        <path
          d="M12 2C7 2 3 6 3 11v9l4-3v-6c0-3 2-5 5-5s5 2 5 5v6l4 3v-9c0-5-4-9-9-9z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}
