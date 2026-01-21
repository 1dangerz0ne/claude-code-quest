"use client";

import { useMemo } from "react";
import { findTermsInText, CATEGORY_COLORS, type TermCategory } from "@/lib/terminology";

interface HighlightedTextProps {
  text: string;
  className?: string;
}

// Renders text with Claude Code terminology highlighted in category colors
export function HighlightedText({ text, className = "" }: HighlightedTextProps) {
  const segments = useMemo(() => {
    const matches = findTermsInText(text);

    if (matches.length === 0) {
      return [{ type: "text" as const, content: text }];
    }

    const result: Array<
      | { type: "text"; content: string }
      | { type: "highlight"; content: string; category: TermCategory }
    > = [];

    let lastEnd = 0;

    for (const match of matches) {
      // Add plain text before this match
      if (match.start > lastEnd) {
        result.push({ type: "text", content: text.slice(lastEnd, match.start) });
      }

      // Add the highlighted term
      result.push({
        type: "highlight",
        content: match.term,
        category: match.category,
      });

      lastEnd = match.end;
    }

    // Add remaining text after last match
    if (lastEnd < text.length) {
      result.push({ type: "text", content: text.slice(lastEnd) });
    }

    return result;
  }, [text]);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={index}>{segment.content}</span>;
        }

        const colors = CATEGORY_COLORS[segment.category];
        return (
          <span
            key={index}
            className={`${colors.text} ${colors.bg} px-1 py-0.5 rounded font-medium`}
          >
            {segment.content}
          </span>
        );
      })}
    </span>
  );
}
