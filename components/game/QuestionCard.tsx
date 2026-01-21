"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AnswerButton } from "./AnswerButton";
import { HighlightedText } from "@/components/ui/HighlightedText";
import { ShareTipButton } from "./LearnedShare";
import { playSound } from "@/lib/sounds";
import type { Question } from "@/lib/game/questions";

interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | null;
  isRevealed: boolean;
  onSelectAnswer: (index: number) => void;
  onContinue: () => void;
}

export function QuestionCard({
  question,
  selectedAnswer,
  isRevealed,
  onSelectAnswer,
  onContinue,
}: QuestionCardProps) {
  const isCorrect = selectedAnswer === question.correct_index;
  const hasPlayedSound = useRef(false);

  // Play sound when answer is revealed
  useEffect(() => {
    if (isRevealed && !hasPlayedSound.current) {
      hasPlayedSound.current = true;
      playSound(isCorrect ? "correct" : "wrong");
    }
  }, [isRevealed, isCorrect]);

  // Reset sound flag when question changes
  useEffect(() => {
    hasPlayedSound.current = false;
  }, [question]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      {/* Category badge */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium capitalize
          ${
            question.category === "agents"
              ? "bg-purple-900/50 text-purple-300"
              : question.category === "commands"
                ? "bg-blue-900/50 text-blue-300"
                : "bg-orange-900/50 text-orange-300"
          }`}
        >
          {question.category}
        </span>
        <span className="text-slate-500 text-sm">
          Difficulty: {"⭐".repeat(question.difficulty)}
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-xl font-semibold mb-6 leading-relaxed">
        <HighlightedText text={question.question_text} />
      </h2>

      {/* Code snippet if present */}
      {question.code_snippet && (
        <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm mb-6 overflow-x-auto">
          <pre className="text-green-400 whitespace-pre-wrap">
            {question.code_snippet}
          </pre>
        </div>
      )}

      {/* Answer options */}
      <div className="flex-1 flex flex-col gap-3">
        {question.options.map((option, index) => (
          <AnswerButton
            key={index}
            label={option}
            index={index}
            isSelected={selectedAnswer === index}
            isCorrect={index === question.correct_index}
            isRevealed={isRevealed}
            disabled={isRevealed}
            onClick={() => onSelectAnswer(index)}
          />
        ))}
      </div>

      {/* Explanation (shown after reveal) */}
      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-6"
        >
          <div
            className={`p-4 rounded-xl ${
              isCorrect
                ? "bg-green-900/30 border border-green-700"
                : "bg-red-900/30 border border-red-700"
            }`}
          >
            <p className="font-semibold mb-2">
              {isCorrect ? "🎉 Correct!" : "❌ Not quite..."}
            </p>
            <p className="text-slate-300 text-sm mb-3">
              <HighlightedText text={question.explanation} />
            </p>
            {/* Share this tip */}
            <div className="flex justify-end">
              <ShareTipButton
                explanation={question.explanation}
                category={question.category}
              />
            </div>
          </div>

          {/* Continue button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500
                       rounded-xl text-lg font-semibold transition-colors
                       min-h-[56px] mt-4"
          >
            Continue
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
