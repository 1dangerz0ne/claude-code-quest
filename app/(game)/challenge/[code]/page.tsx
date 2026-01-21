"use client";

import { useState, useEffect, useCallback, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ConceptIntro } from "@/components/game/ConceptIntro";
import { QuestionCard } from "@/components/game/QuestionCard";
import { ComboMeter } from "@/components/game/ComboMeter";
import { XPGain } from "@/components/game/XPGain";
import { Confetti } from "@/components/game/Confetti";
import { FeedbackFlash } from "@/components/game/FeedbackFlash";
import { ChallengeComparison } from "@/components/game/ChallengeButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ShareButton } from "@/components/game/ShareButton";
import { getSeededQuestions, type Question } from "@/lib/game/questions";
import { calculateXP, calculateSessionScore } from "@/lib/game/scoring";
import {
  getChallengeByCode,
  submitChallengeAttempt,
  getChallengeAttempts,
  type Challenge,
  type ChallengeAttempt,
} from "@/lib/challenges";

type GamePhase = "loading" | "intro" | "question" | "complete" | "error";

interface AnswerRecord {
  correct: boolean;
  timeSeconds: number;
}

export default function ChallengePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const code = resolvedParams.code;

  // Challenge data
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [attempts, setAttempts] = useState<ChallengeAttempt[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  // Timing
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  // Scoring
  const [combo, setCombo] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [lastXPGain, setLastXPGain] = useState(0);
  const [showXPGain, setShowXPGain] = useState(false);

  // Visual feedback
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"correct" | "wrong" | null>(null);

  // Load challenge on mount
  useEffect(() => {
    const loadChallenge = async () => {
      const challengeData = await getChallengeByCode(code);

      if (!challengeData) {
        setError("Challenge not found or has expired");
        setPhase("error");
        return;
      }

      // Check if expired
      if (new Date(challengeData.expires_at) < new Date()) {
        setError("This challenge has expired");
        setPhase("error");
        return;
      }

      setChallenge(challengeData);

      // Load questions using the challenge seed
      const q = getSeededQuestions(challengeData.question_seed, challengeData.creator_total);
      setQuestions(q);
      setPhase("intro");
      setGameStartTime(Date.now());

      // Load existing attempts
      const existingAttempts = await getChallengeAttempts(challengeData.id);
      setAttempts(existingAttempts);
    };

    loadChallenge();
  }, [code]);

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
      const { totalXP: xpGained } = calculateXP(isCorrect, timeSeconds, newCombo);
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

  // Submit result when complete
  useEffect(() => {
    if (phase === "complete" && challenge) {
      const submitResult = async () => {
        const { correctCount } = calculateSessionScore(answers);
        const totalTimeSeconds = Math.round((Date.now() - gameStartTime) / 1000);

        await submitChallengeAttempt(
          challenge.id,
          totalXP,
          correctCount,
          questions.length,
          totalTimeSeconds
        );

        // Refresh attempts
        const updatedAttempts = await getChallengeAttempts(challenge.id);
        setAttempts(updatedAttempts);
      };

      submitResult();
    }
  }, [phase, challenge, answers, totalXP, questions.length, gameStartTime]);

  // Loading state
  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">⚔️</div>
          <div className="text-slate-400">Loading challenge...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (phase === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-xl font-bold mb-2">Challenge Not Found</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link
            href="/play"
            className="inline-block py-3 px-6 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
          >
            Play Your Own Game
          </Link>
        </div>
      </div>
    );
  }

  // Game complete screen
  if (phase === "complete" && challenge) {
    const { correctCount, maxCombo, avgTime } = calculateSessionScore(answers);
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const didWin = totalXP > challenge.creator_score;
    const isTie = totalXP === challenge.creator_score;

    return (
      <main className="min-h-screen flex flex-col p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto"
        >
          {/* Result icon */}
          <div className="text-6xl mb-4">
            {isTie ? "🤝" : didWin ? "🏆" : "💪"}
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {isTie ? "It's a Tie!" : didWin ? "You Win!" : "Good Effort!"}
          </h1>
          <p className="text-slate-400 mb-6">
            Challenge by {challenge.creator_username || "Anonymous"}
          </p>

          {/* Head to head comparison */}
          <ChallengeComparison
            creatorScore={challenge.creator_score}
            creatorCorrect={challenge.creator_correct}
            creatorTotal={challenge.creator_total}
            challengerScore={totalXP}
            challengerCorrect={correctCount}
            challengerTotal={questions.length}
            creatorName={challenge.creator_username || "Challenger"}
            challengerName="You"
          />

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm my-6">
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">{totalXP}</p>
              <p className="text-slate-400 text-sm">Your XP</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{accuracy}%</p>
              <p className="text-slate-400 text-sm">Accuracy</p>
            </div>
          </div>

          {/* All attempts leaderboard */}
          {attempts.length > 1 && (
            <div className="w-full max-w-sm mb-6">
              <h3 className="text-sm text-slate-400 mb-2">All Attempts</h3>
              <div className="bg-slate-800 rounded-xl overflow-hidden">
                {attempts.slice(0, 5).map((attempt, i) => (
                  <div
                    key={attempt.id}
                    className={`flex items-center justify-between px-4 py-2 ${
                      i > 0 ? "border-t border-slate-700" : ""
                    }`}
                  >
                    <span className="text-slate-400">#{i + 1}</span>
                    <span className="font-medium">{attempt.username}</span>
                    <span className="text-yellow-400 font-bold">
                      {attempt.score} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <ShareButton
              result={{
                answers: answers.map((a) => a.correct),
                totalXP,
                maxCombo,
                mode: "quick",
              }}
            />
            <Link
              href="/play"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold text-center transition-colors"
            >
              Play Your Own Game
            </Link>
          </div>
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
              ⚔️ Challenge
            </span>
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

      {/* Target score banner */}
      {challenge && (
        <div className="bg-orange-900/30 border-b border-orange-700/50 px-4 py-2 text-center text-sm">
          <span className="text-slate-400">Beat </span>
          <span className="text-orange-400 font-bold">
            {challenge.creator_username || "the challenger"}
          </span>
          <span className="text-slate-400">&apos;s score of </span>
          <span className="text-yellow-400 font-bold">{challenge.creator_score} XP</span>
        </div>
      )}

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
    </main>
  );
}
