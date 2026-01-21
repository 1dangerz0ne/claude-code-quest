"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ConceptIntro } from "@/components/game/ConceptIntro";
import { QuestionCard } from "@/components/game/QuestionCard";
import { ComboMeter } from "@/components/game/ComboMeter";
import { XPGain } from "@/components/game/XPGain";
import { Confetti } from "@/components/game/Confetti";
import { FeedbackFlash } from "@/components/game/FeedbackFlash";
import { LevelUpModal } from "@/components/game/LevelUpModal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  getDailyQuestions,
  getTodayDateString,
  type Question,
} from "@/lib/game/questions";
import { calculateXP, calculateSessionScore } from "@/lib/game/scoring";
import { ShareButton } from "@/components/game/ShareButton";
import { saveGameResult, type SaveResult } from "@/lib/supabase/saveGameResult";
import { createClient } from "@/lib/supabase/client";

type GamePhase = "intro" | "question" | "complete";

interface AnswerRecord {
  correct: boolean;
  timeSeconds: number;
}

export default function DailyChallengePage() {
  // Game state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  // Timing
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  // Scoring
  const [combo, setCombo] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [lastXPGain, setLastXPGain] = useState(0);
  const [showXPGain, setShowXPGain] = useState(false);

  // Visual feedback
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"correct" | "wrong" | null>(null);

  // Save result state
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Daily challenge date
  const todayDate = getTodayDateString();

  // Load questions on mount
  useEffect(() => {
    const q = getDailyQuestions(new Date(), 10);
    setQuestions(q);
    setGameStartTime(Date.now());
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  // Save game result when complete (only for logged-in users)
  useEffect(() => {
    if (phase === "complete" && isLoggedIn && !isSaving && !saveResult) {
      const saveGame = async () => {
        setIsSaving(true);
        const { correctCount, maxCombo } = calculateSessionScore(answers);
        const totalTimeSeconds = Math.round((Date.now() - gameStartTime) / 1000);

        // Calculate category scores from questions
        const categoryMap = new Map<string, { correct: number; total: number }>();
        questions.forEach((q, i) => {
          const answer = answers[i];
          if (answer) {
            const cat = categoryMap.get(q.category) || { correct: 0, total: 0 };
            cat.total++;
            if (answer.correct) cat.correct++;
            categoryMap.set(q.category, cat);
          }
        });
        const categoryScores = Array.from(categoryMap.entries()).map(([category, stats]) => ({
          category,
          ...stats,
        }));

        const result = await saveGameResult(
          {
            mode: "daily",
            score: totalXP,
            correct: correctCount,
            total: questions.length,
            maxCombo,
            timeSeconds: totalTimeSeconds,
            xpEarned: totalXP,
          },
          categoryScores
        );

        setSaveResult(result);
        setIsSaving(false);
      };

      saveGame();
    }
  }, [phase, isLoggedIn, isSaving, saveResult, answers, questions, totalXP, gameStartTime]);

  // Show level up modal when player levels up
  useEffect(() => {
    if (saveResult?.leveledUp) {
      setShowLevelUp(true);
    }
  }, [saveResult]);

  const currentQuestion = questions[currentIndex];

  // Handle moving from intro to question
  const handleIntroComplete = useCallback(() => {
    setPhase("question");
    setQuestionStartTime(Date.now());
  }, []);

  // Handle selecting an answer
  const handleSelectAnswer = useCallback(
    (index: number) => {
      if (isRevealed || !currentQuestion) return;

      setSelectedAnswer(index);
      setIsRevealed(true);

      const timeSeconds = (Date.now() - questionStartTime) / 1000;
      const isCorrect = index === currentQuestion.correct_index;

      // Update combo
      const newCombo = isCorrect ? combo + 1 : 0;
      setCombo(newCombo);

      // Calculate XP
      const { totalXP: xpGained } = calculateXP(
        isCorrect,
        timeSeconds,
        newCombo
      );
      setLastXPGain(xpGained);
      setTotalXP((prev) => prev + xpGained);
      setShowXPGain(isCorrect);

      // Record answer
      setAnswers((prev) => [...prev, { correct: isCorrect, timeSeconds }]);

      // Trigger visual feedback
      setFeedbackType(isCorrect ? "correct" : "wrong");
      if (isCorrect) {
        setShowConfetti(true);
      }

      // Hide effects after a moment
      setTimeout(() => {
        setShowXPGain(false);
        setFeedbackType(null);
        setShowConfetti(false);
      }, 1500);
    },
    [currentQuestion, questionStartTime, combo, isRevealed]
  );

  // Handle continuing to next question
  const handleContinue = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setPhase("intro");
      setSelectedAnswer(null);
      setIsRevealed(false);
    } else {
      setPhase("complete");
    }
  }, [currentIndex, questions.length]);

  // Loading state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading daily challenge...</div>
      </div>
    );
  }

  // Game complete screen
  if (phase === "complete") {
    const { correctCount, maxCombo } = calculateSessionScore(answers);
    const totalTimeSeconds = Math.round((Date.now() - gameStartTime) / 1000);
    const accuracy = Math.round((correctCount / questions.length) * 100);

    return (
      <main className="min-h-screen flex flex-col p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center"
        >
          {/* Result icon */}
          <div className="text-6xl mb-4">
            {accuracy >= 80 ? "🏆" : accuracy >= 60 ? "🎯" : "💪"}
          </div>

          <h1 className="text-3xl font-bold mb-2">Daily Challenge Complete!</h1>
          <p className="text-slate-400 mb-2">{todayDate}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm my-8">
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">{totalXP}</p>
              <p className="text-slate-400 text-sm">XP Earned</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{accuracy}%</p>
              <p className="text-slate-400 text-sm">Accuracy</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-orange-400">{maxCombo}</p>
              <p className="text-slate-400 text-sm">Max Combo</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">
                {Math.floor(totalTimeSeconds / 60)}:
                {String(totalTimeSeconds % 60).padStart(2, "0")}
              </p>
              <p className="text-slate-400 text-sm">Total Time</p>
            </div>
          </div>

          {/* Score bar */}
          <div className="w-full max-w-sm mb-8">
            <div className="flex justify-between text-sm text-slate-400 mb-1">
              <span>Score</span>
              <span>
                {correctCount}/{questions.length} correct
              </span>
            </div>
            <ProgressBar
              value={correctCount}
              max={questions.length}
              color="green"
              size="lg"
            />
          </div>

          {/* Leaderboard prompt */}
          <div className="bg-slate-800 rounded-xl p-4 mb-6 w-full max-w-sm">
            <p className="text-sm text-slate-300 mb-3">
              Check how you rank against other players!
            </p>
            <Link
              href="/leaderboard"
              className="block w-full py-3 bg-orange-600 hover:bg-orange-500 rounded-lg text-center font-medium transition-colors"
            >
              View Leaderboard
            </Link>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <ShareButton
              result={{
                answers: answers.map((a) => a.correct),
                totalXP,
                maxCombo,
                mode: "daily",
                date: todayDate,
              }}
            />
            <Link
              href="/quick"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold text-center transition-colors"
            >
              Play Quick Mode
            </Link>
            <Link
              href="/play"
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-lg font-semibold text-center transition-colors"
            >
              Back to Menu
            </Link>
          </div>

          {/* Come back tomorrow */}
          <p className="text-slate-500 text-sm mt-6">
            New daily challenge tomorrow! 🗓️
          </p>
        </motion.div>
      </main>
    );
  }

  // Main game screen
  return (
    <main className="min-h-screen flex flex-col no-overscroll">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-800">
        {/* Progress */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-orange-400 text-sm font-medium">
              Daily Challenge
            </span>
            <span className="text-slate-500 text-sm">•</span>
            <span className="text-slate-400 text-sm">
              {currentIndex + 1}/{questions.length}
            </span>
            <ComboMeter combo={combo} show={!showXPGain} />
          </div>
          <ProgressBar
            value={currentIndex + (phase === "question" && isRevealed ? 1 : 0)}
            max={questions.length}
            size="sm"
            color="orange"
          />
        </div>

        {/* XP */}
        <div className="flex items-center gap-2 ml-4">
          <span className="text-yellow-400 font-bold">{totalXP} XP</span>
        </div>

        {/* Close button */}
        <Link
          href="/play"
          className="ml-4 p-2 text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </Link>
      </header>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-auto">
        <AnimatePresence mode="wait">
          {phase === "intro" && currentQuestion && (
            <ConceptIntro
              key={`intro-${currentIndex}`}
              intro={currentQuestion.concept_intro}
              codeSnippet={currentQuestion.code_snippet}
              onContinue={handleIntroComplete}
            />
          )}

          {phase === "question" && currentQuestion && (
            <QuestionCard
              key={`question-${currentIndex}`}
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              isRevealed={isRevealed}
              onSelectAnswer={handleSelectAnswer}
              onContinue={handleContinue}
            />
          )}
        </AnimatePresence>
      </div>

      {/* XP Gain animation */}
      <XPGain amount={lastXPGain} show={showXPGain} />

      {/* Visual feedback effects */}
      <Confetti show={showConfetti} />
      <FeedbackFlash type={feedbackType} />

      {/* Level up celebration */}
      <LevelUpModal
        show={showLevelUp}
        level={saveResult?.newLevel || 1}
        title={saveResult?.newTitle || "Newcomer"}
        onClose={() => setShowLevelUp(false)}
      />
    </main>
  );
}
