// Question types and utilities for Claude Code Quest

export interface Question {
  id: string;
  category: "agents" | "commands" | "hooks";
  difficulty: 1 | 2 | 3;
  concept_intro: string;
  code_snippet?: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

// Import questions from JSON files
import agentsQuestions from "@/content/questions/agents.json";
import commandsQuestions from "@/content/questions/commands.json";
import hooksQuestions from "@/content/questions/hooks.json";

// Get all questions
export function getAllQuestions(): Question[] {
  return [
    ...(agentsQuestions as Question[]),
    ...(commandsQuestions as Question[]),
    ...(hooksQuestions as Question[]),
  ];
}

// Get questions by category
export function getQuestionsByCategory(
  category: "agents" | "commands" | "hooks"
): Question[] {
  const all = getAllQuestions();
  return all.filter((q) => q.category === category);
}

// Get random questions for Quick Play
export function getRandomQuestions(count: number = 5): Question[] {
  const all = getAllQuestions();
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Get daily questions (deterministic based on date)
export function getDailyQuestions(date: Date, count: number = 10): Question[] {
  const all = getAllQuestions();

  // Create a seed from the date (YYYYMMDD format)
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, "");
  const seed = parseInt(dateString, 10);

  // Seeded random shuffle (Fisher-Yates with seeded random)
  const shuffled = [...all];
  let currentSeed = seed;

  function seededRandom() {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    return currentSeed / 0x7fffffff;
  }

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

// Get today's date string for daily challenge
export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}
