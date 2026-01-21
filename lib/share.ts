/**
 * Shareable Results - Wordle-style emoji grid generator
 * Creates a visual representation of game performance that can be shared on social media
 */

export interface GameResult {
  answers: boolean[]; // Array of correct/incorrect for each question
  totalXP: number;
  maxCombo: number;
  mode: "quick" | "daily";
  date?: string; // For daily challenge
}

/**
 * Generates a Wordle-style emoji grid showing game results
 * Green squares = correct, Red squares = wrong
 * Arranges in rows of 5 for visual appeal
 */
export function generateEmojiGrid(answers: boolean[]): string {
  const emojis = answers.map((correct) => (correct ? "🟩" : "🟥"));

  // Arrange in rows of 5
  const rows: string[] = [];
  for (let i = 0; i < emojis.length; i += 5) {
    rows.push(emojis.slice(i, i + 5).join(""));
  }

  return rows.join("\n");
}

/**
 * Generates the full shareable text including stats and grid
 */
export function generateShareText(result: GameResult): string {
  const { answers, totalXP, maxCombo, mode, date } = result;

  const correctCount = answers.filter(Boolean).length;
  const totalCount = answers.length;
  const accuracy = Math.round((correctCount / totalCount) * 100);

  const grid = generateEmojiGrid(answers);

  // Build the share text
  const lines: string[] = [];

  if (mode === "daily") {
    lines.push(`Claude Code Quest Daily 📅`);
    lines.push(date || new Date().toISOString().split("T")[0]);
  } else {
    lines.push(`Claude Code Quest ⚡`);
  }

  lines.push("");
  lines.push(`${accuracy}% | ${correctCount}/${totalCount} | ${maxCombo > 1 ? `${maxCombo}x combo` : "No combo"}`);
  lines.push("");
  lines.push(grid);
  lines.push("");
  lines.push(`🎯 ${totalXP} XP earned`);
  lines.push("");
  lines.push(`Play: claudecodequest.com`);

  return lines.join("\n");
}

/**
 * Copies text to clipboard with fallback for older browsers
 * Returns true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textArea);
    return success;
  } catch {
    console.error("Failed to copy to clipboard");
    return false;
  }
}

/**
 * Shares results using Web Share API if available, otherwise copies to clipboard
 * Returns { shared: boolean, copied: boolean } to indicate which method was used
 */
export async function shareResults(
  result: GameResult
): Promise<{ shared: boolean; copied: boolean }> {
  const shareText = generateShareText(result);

  // Try Web Share API first (mobile-friendly)
  if (navigator.share) {
    try {
      await navigator.share({
        text: shareText,
      });
      return { shared: true, copied: false };
    } catch (err) {
      // User cancelled or share failed - fall through to copy
      if ((err as Error).name === "AbortError") {
        return { shared: false, copied: false };
      }
    }
  }

  // Fall back to clipboard
  const copied = await copyToClipboard(shareText);
  return { shared: false, copied };
}
