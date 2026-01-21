// Registry of Claude Code terms and their categories
// Used for color-coded highlighting in the game

export type TermCategory = "agents" | "tools" | "parameters" | "concepts";

interface TermDefinition {
  term: string;
  category: TermCategory;
  // Optional: terms can be case-sensitive or not
  caseSensitive?: boolean;
}

// Master list of terms to highlight
// Terms are matched as whole words (not partial matches)
export const TERMINOLOGY: TermDefinition[] = [
  // Agents
  { term: "agents", category: "agents" },
  { term: "agent", category: "agents" },
  { term: "Explore agent", category: "agents", caseSensitive: true },
  { term: "Plan agent", category: "agents", caseSensitive: true },
  { term: "subagent", category: "agents" },
  { term: "subagents", category: "agents" },
  { term: "Task tool", category: "agents", caseSensitive: true },

  // Tools
  { term: "tools", category: "tools" },
  { term: "tool", category: "tools" },
  { term: "Read", category: "tools", caseSensitive: true },
  { term: "Write", category: "tools", caseSensitive: true },
  { term: "Edit", category: "tools", caseSensitive: true },
  { term: "Bash", category: "tools", caseSensitive: true },
  { term: "Glob", category: "tools", caseSensitive: true },
  { term: "Grep", category: "tools", caseSensitive: true },
  { term: "WebFetch", category: "tools", caseSensitive: true },
  { term: "WebSearch", category: "tools", caseSensitive: true },
  { term: "TodoWrite", category: "tools", caseSensitive: true },
  { term: "NotebookEdit", category: "tools", caseSensitive: true },
  { term: "AskUser", category: "tools", caseSensitive: true },

  // Parameters/Commands
  { term: "commands", category: "parameters" },
  { term: "command", category: "parameters" },
  { term: "/init", category: "parameters", caseSensitive: true },
  { term: "/help", category: "parameters", caseSensitive: true },
  { term: "/clear", category: "parameters", caseSensitive: true },
  { term: "/compact", category: "parameters", caseSensitive: true },
  { term: "/config", category: "parameters", caseSensitive: true },
  { term: "/cost", category: "parameters", caseSensitive: true },
  { term: "/memory", category: "parameters", caseSensitive: true },
  { term: "/review", category: "parameters", caseSensitive: true },
  { term: "/terminal-setup", category: "parameters", caseSensitive: true },
  { term: "CLAUDE.md", category: "parameters", caseSensitive: true },
  { term: ".claude", category: "parameters", caseSensitive: true },
  { term: "settings.json", category: "parameters", caseSensitive: true },

  // Concepts
  { term: "hooks", category: "concepts" },
  { term: "hook", category: "concepts" },
  { term: "pre-tool-use", category: "concepts" },
  { term: "post-tool-use", category: "concepts" },
  { term: "notification", category: "concepts" },
  { term: "MCP", category: "concepts", caseSensitive: true },
  { term: "Model Context Protocol", category: "concepts" },
  { term: "context window", category: "concepts" },
  { term: "permissions", category: "concepts" },
  { term: "permission", category: "concepts" },
];

// Color mappings for each category
export const CATEGORY_COLORS: Record<TermCategory, { text: string; bg: string }> = {
  agents: { text: "text-purple-300", bg: "bg-purple-900/30" },
  tools: { text: "text-blue-300", bg: "bg-blue-900/30" },
  parameters: { text: "text-orange-300", bg: "bg-orange-900/30" },
  concepts: { text: "text-cyan-300", bg: "bg-cyan-900/30" },
};

// Build a lookup map for faster term matching
// Sort by term length (longest first) to match "Explore agent" before "agent"
const sortedTerms = [...TERMINOLOGY].sort((a, b) => b.term.length - a.term.length);

export function findTermsInText(text: string): Array<{ start: number; end: number; term: string; category: TermCategory }> {
  const matches: Array<{ start: number; end: number; term: string; category: TermCategory }> = [];
  const usedRanges: Array<{ start: number; end: number }> = [];

  for (const termDef of sortedTerms) {
    const { term, category, caseSensitive } = termDef;
    const searchText = caseSensitive ? text : text.toLowerCase();
    const searchTerm = caseSensitive ? term : term.toLowerCase();

    let startIndex = 0;
    while (true) {
      const index = searchText.indexOf(searchTerm, startIndex);
      if (index === -1) break;

      const end = index + term.length;

      // Check if this match overlaps with any existing match
      const overlaps = usedRanges.some(
        range => (index >= range.start && index < range.end) ||
                 (end > range.start && end <= range.end)
      );

      if (!overlaps) {
        // Check for word boundaries (don't match "agent" inside "subagent")
        const charBefore = index > 0 ? text[index - 1] : " ";
        const charAfter = end < text.length ? text[end] : " ";
        const isWordBoundaryBefore = !/[a-zA-Z0-9]/.test(charBefore);
        const isWordBoundaryAfter = !/[a-zA-Z0-9]/.test(charAfter);

        if (isWordBoundaryBefore && isWordBoundaryAfter) {
          matches.push({ start: index, end, term: text.slice(index, end), category });
          usedRanges.push({ start: index, end });
        }
      }

      startIndex = index + 1;
    }
  }

  // Sort by position
  return matches.sort((a, b) => a.start - b.start);
}
