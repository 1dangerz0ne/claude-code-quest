"use client";

import { motion } from "framer-motion";
import { HighlightedText } from "@/components/ui/HighlightedText";

interface ConceptIntroProps {
  intro: string;
  codeSnippet?: string;
  onContinue: () => void;
}

export function ConceptIntro({
  intro,
  codeSnippet,
  onContinue,
}: ConceptIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💡</span>
        <h2 className="text-lg font-semibold text-blue-400">Learn First</h2>
      </div>

      {/* Concept text */}
      <div className="flex-1">
        <p className="text-lg leading-relaxed text-slate-200 mb-6">
          <HighlightedText text={intro} />
        </p>

        {/* Code snippet if present */}
        {codeSnippet && (
          <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-green-400 whitespace-pre-wrap">
              {codeSnippet}
            </pre>
          </div>
        )}
      </div>

      {/* Continue button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500
                   rounded-xl text-lg font-semibold transition-colors
                   min-h-[56px] mt-6"
      >
        Got it! Show me the question
      </motion.button>
    </motion.div>
  );
}
