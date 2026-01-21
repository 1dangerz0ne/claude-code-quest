"use client";

import { motion } from "framer-motion";

interface CategoryProgress {
  category: string;
  correct: number;
  total: number;
}

interface CategoryMasteryProps {
  progress: CategoryProgress[];
  showLabels?: boolean;
  compact?: boolean;
}

// Category styling
const CATEGORY_STYLES = {
  agents: {
    color: "#a855f7", // purple
    bgColor: "bg-purple-900/30",
    borderColor: "border-purple-500",
    icon: "🤖",
    name: "Agents",
  },
  commands: {
    color: "#3b82f6", // blue
    bgColor: "bg-blue-900/30",
    borderColor: "border-blue-500",
    icon: "⌨️",
    name: "Commands",
  },
  hooks: {
    color: "#f97316", // orange
    bgColor: "bg-orange-900/30",
    borderColor: "border-orange-500",
    icon: "🪝",
    name: "Hooks",
  },
  config: {
    color: "#10b981", // emerald/green
    bgColor: "bg-emerald-900/30",
    borderColor: "border-emerald-500",
    icon: "⚙️",
    name: "Config",
  },
};

// Mastery levels
const MASTERY_LEVELS = [
  { name: "Novice", minPercent: 0, color: "#6b7280" },
  { name: "Apprentice", minPercent: 25, color: "#22c55e" },
  { name: "Journeyman", minPercent: 50, color: "#3b82f6" },
  { name: "Expert", minPercent: 75, color: "#a855f7" },
  { name: "Master", minPercent: 90, color: "#f59e0b" },
];

function getMasteryLevel(percent: number) {
  for (let i = MASTERY_LEVELS.length - 1; i >= 0; i--) {
    if (percent >= MASTERY_LEVELS[i].minPercent) {
      return MASTERY_LEVELS[i];
    }
  }
  return MASTERY_LEVELS[0];
}

export function CategoryMastery({
  progress,
  showLabels = true,
  compact = false,
}: CategoryMasteryProps) {
  // Ensure all categories are represented
  const categories = ["agents", "commands", "hooks", "config"];
  const categoryData = categories.map((cat) => {
    const found = progress.find((p) => p.category === cat);
    return {
      category: cat,
      correct: found?.correct || 0,
      total: found?.total || 0,
      percent: found ? Math.round((found.correct / Math.max(found.total, 1)) * 100) : 0,
    };
  });

  if (compact) {
    return (
      <div className="flex gap-2">
        {categoryData.map((cat) => {
          const style = CATEGORY_STYLES[cat.category as keyof typeof CATEGORY_STYLES];
          const mastery = getMasteryLevel(cat.percent);

          return (
            <div
              key={cat.category}
              className={`flex-1 ${style.bgColor} rounded-lg p-2 text-center border ${style.borderColor}`}
            >
              <span className="text-lg">{style.icon}</span>
              <p className="text-xs font-bold" style={{ color: style.color }}>
                {cat.percent}%
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categoryData.map((cat, index) => {
        const style = CATEGORY_STYLES[cat.category as keyof typeof CATEGORY_STYLES];
        const mastery = getMasteryLevel(cat.percent);

        return (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${style.bgColor} rounded-xl p-4 border ${style.borderColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{style.icon}</span>
                <span className="font-semibold" style={{ color: style.color }}>
                  {style.name}
                </span>
              </div>
              {showLabels && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${mastery.color}33`,
                    color: mastery.color,
                  }}
                >
                  {mastery.name}
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: style.color }}
                initial={{ width: 0 }}
                animate={{ width: `${cat.percent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            {/* Stats */}
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>
                {cat.correct}/{cat.total} correct
              </span>
              <span className="font-bold" style={{ color: style.color }}>
                {cat.percent}%
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Mini mastery indicator for profiles
export function MasteryIndicator({ category, percent }: { category: string; percent: number }) {
  const style = CATEGORY_STYLES[category as keyof typeof CATEGORY_STYLES];
  const mastery = getMasteryLevel(percent);

  if (!style) return null;

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm">{style.icon}</span>
      <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: style.color,
          }}
        />
      </div>
    </div>
  );
}

// Overall mastery score
export function OverallMastery({ progress }: { progress: CategoryProgress[] }) {
  const totalCorrect = progress.reduce((sum, p) => sum + p.correct, 0);
  const totalQuestions = progress.reduce((sum, p) => sum + p.total, 0);
  const overallPercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const mastery = getMasteryLevel(overallPercent);

  return (
    <div className="text-center p-4 bg-slate-800 rounded-xl">
      <p className="text-sm text-slate-400 mb-1">Overall Mastery</p>
      <p className="text-3xl font-bold" style={{ color: mastery.color }}>
        {overallPercent}%
      </p>
      <p className="text-sm" style={{ color: mastery.color }}>
        {mastery.name}
      </p>
      <p className="text-xs text-slate-500 mt-2">
        {totalCorrect} / {totalQuestions} questions
      </p>
    </div>
  );
}
