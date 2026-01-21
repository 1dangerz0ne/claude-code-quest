"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ConceptIntro } from "@/components/game/ConceptIntro";
import { QuestionCard } from "@/components/game/QuestionCard";
import { ComboMeter } from "@/components/game/ComboMeter";
import { XPGain } from "@/components/game/XPGain";
import { Confetti } from "@/components/game/Confetti";
import { FeedbackFlash } from "@/components/game/FeedbackFlash";
import { LevelUpModal } from "@/components/game/LevelUpModal";
import { ResultsScreen } from "@/components/game/ResultsScreen";
import { AchievementModal } from "@/components/game/AchievementModal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  buildAchievementContext,
  checkAchievements,
  getUserAchievements,
  unlockAchievements,
  type Achievement,
} from "@/lib/achievements";
import { createClient } from "@/lib/supabase/client";
import { getRandomQuestions, type Question } from "@/lib/game/questions";
import { calculateXP, calculateSessionScore } from "@/lib/game/scoring";
import { ShareButton } from "@/components/game/ShareButton";
import { saveGameResult, type SaveResult } from "@/lib/supabase/saveGameResult";
import { Suspense } from "react";

type GamePhase = "intro" | "question" | "complete";

interface AnswerRecord {
  correct: boolean;
  timeSeconds: number;
}

function QuickPlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuest = searchParams.get("guest") === "true";

  // Game state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

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
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Achievement state
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [questionSeed] = useState(() => Date.now());

  // Load questions on mount
  useEffect(() => {
    const q = getRandomQuestions(5);
    setQuestions(q);
  }, []);

  // Save game result when complete (only for logged-in users)
  useEffect(() => {
    if (phase === "complete" && !isGuest && !isSaving && !saveResult) {
      const saveGame = async () => {
        setIsSaving(true);
        const { correctCount, maxCombo, avgTime } = calculateSessionScore(answers);
        const totalTimeSeconds = Math.round(avgTime * answers.length);

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
            mode: "quick",
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
  }, [phase, isGuest, isSaving, saveResult, answers, questions, totalXP]);

  // Show level up modal when player levels up
  useEffect(() => {
    if (saveResult?.leveledUp) {
      setShowLevelUp(true);
    }
  }, [saveResult]);

  // Check for achievements after game save
  useEffect(() => {
    if (saveResult && !isGuest) {
      const checkAndUnlockAchievements = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { correctCount, maxCombo } = calculateSessionScore(answers);
        const isPerfect = correctCount === questions.length;

        // Build context and get already unlocked
        const context = await buildAchievementContext(user.id, {
          maxCombo,
          fastAnswers: answers.filter((a) => a.timeSeconds < 3).length,
          isPerfect,
        });

        const userAchievements = await getUserAchievements(user.id);
        const alreadyUnlocked = userAchievements.map((ua) => ua.achievement_id);

        // Check for new achievements
        const newIds = checkAchievements(context, alreadyUnlocked);

        if (newIds.length > 0) {
          // Unlock and get achievement details
          const result = await unlockAchievements(user.id, newIds);
          if (result.achievements.length > 0) {
            setNewAchievements(result.achievements);
            setTimeout(() => setShowAchievements(true), saveResult.leveledUp ? 2000 : 500);
          }
        }
      };

      checkAndUnlockAchievements();
    }
  }, [saveResult, isGuest, answers, questions.length]);

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

  // Play again
  const handlePlayAgain = () => {
    const newQuestions = getRandomQuestions(5);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setPhase("intro");
    setSelectedAnswer(null);
    setIsRevealed(false);
    setAnswers([]);
    setCombo(0);
    setTotalXP(0);
    setSaveResult(null);
    setIsSaving(false);
  };

  // Loading state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading questions...</div>
      </div>
    );
  }

  // Game complete screen
  if (phase === "complete") {
    const { correctCount, maxCombo, avgTime } = calculateSessionScore(answers);
    const totalTimeSeconds = Math.round(avgTime * answers.length);

    return (
      <>
        <ResultsScreen
          totalXP={totalXP}
          correctCount={correctCount}
          totalQuestions={questions.length}
          maxCombo={maxCombo}
          avgTime={avgTime}
          timeSeconds={totalTimeSeconds}
          mode="quick"
          userXP={saveResult?.profile?.xp || 0}
          onPlayAgain={handlePlayAgain}
          isGuest={isGuest}
          questionSeed={questionSeed}
        />

        {/* Achievement Modal */}
        <AchievementModal
          show={showAchievements}
          achievements={newAchievements}
          totalXP={newAchievements.reduce((sum, a) => sum + (a.xp_reward || 0), 0)}
          onClose={() => setShowAchievements(false)}
        />

        {/* Level up celebration */}
        <LevelUpModal
          show={showLevelUp}
          level={saveResult?.newLevel || 1}
          title={saveResult?.newTitle || "Newcomer"}
          onClose={() => setShowLevelUp(false)}
        />
      </>
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
            <span className="text-slate-400 text-sm">
              {currentIndex + 1}/{questions.length}
            </span>
            <ComboMeter combo={combo} show={!showXPGain} />
          </div>
          <ProgressBar
            value={currentIndex + (phase === "question" && isRevealed ? 1 : 0)}
            max={questions.length}
            size="sm"
            color="blue"
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

export default function QuickPlayPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-slate-400">Loading...</div>
        </main>
      }
    >
      <QuickPlayContent />
    </Suspense>
  );
}
