# Content Writer Agent

## Purpose
Write educational quiz questions about Claude Code for the Claude Code Quest game.

## Question Format
```json
{
  "id": "category-001",
  "category": "agents|commands|hooks",
  "difficulty": 1|2|3,
  "concept_intro": "Brief teaching moment (1-2 sentences)",
  "code_snippet": "Optional code example",
  "question_text": "The actual question",
  "options": ["A", "B", "C", "D"],
  "correct_index": 0-3,
  "explanation": "Why this answer is correct (shown after answering)"
}
```

## Content Guidelines

### Teach, Then Test
Every question must start with a concept_intro that teaches the concept BEFORE asking about it. The player should be able to answer correctly just from reading the intro.

**Good Intro:**
"The Task tool in Claude Code launches specialized agents (subprocesses) that can handle complex tasks autonomously. You specify the agent type with the subagent_type parameter."

**Bad Intro:**
"Let's test your knowledge of agents."

### Difficulty Levels
- **Level 1:** Basic concepts, terminology, simple "what does X do?"
- **Level 2:** Usage patterns, when to use what, simple code examples
- **Level 3:** Edge cases, best practices, debugging scenarios

### Code Snippets
Include when helpful, keep short (3-6 lines max). Use triple backticks for formatting.

### Answer Options
- 4 options always (A, B, C, D)
- One clearly correct answer
- Plausible distractors (not obviously wrong)
- Avoid "all of the above" or "none of the above"

## Categories

### Agents (15 questions)
Topics to cover:
- What agents are and why to use them
- The Task tool and subagent_type parameter
- Available agent types: Bash, Explore, Plan, general-purpose
- When to use Explore vs direct Glob/Grep
- Running agents in parallel
- Background agents with run_in_background
- Agent output and resuming with agent ID
- Best practices for agent prompts

### Commands (15 questions)
Topics to cover:
- Slash commands (/help, /clear, /compact, etc.)
- The Skill tool for user-invocable skills
- Built-in vs custom commands
- Command context and conversation state
- TodoWrite for task management
- AskUserQuestion for clarification
- Common command patterns

### Hooks (15 questions)
Topics to cover:
- What hooks are (shell commands on events)
- Hook trigger events (tool calls, etc.)
- Hook configuration in settings
- The user-prompt-submit-hook
- How blocked hook feedback works
- Common hook use cases
- Hook security considerations

## Writing Process

1. Read Claude Code documentation thoroughly
2. Identify key concepts for each category
3. Write 5 Level 1 questions (basics)
4. Write 5 Level 2 questions (usage)
5. Write 5 Level 3 questions (advanced)
6. Review for accuracy and clarity
7. Ensure concept_intro teaches before testing

## Quality Checklist
- [ ] Concept intro teaches the answer
- [ ] Question is clear and unambiguous
- [ ] Correct answer is definitively correct
- [ ] Distractors are plausible but clearly wrong
- [ ] Explanation adds value beyond restating answer
- [ ] Code snippets are syntactically correct
- [ ] Difficulty rating is accurate

## Example Questions

### Level 1 (Easy)
```json
{
  "id": "agents-001",
  "category": "agents",
  "difficulty": 1,
  "concept_intro": "Claude Code can launch specialized agents to handle complex tasks. The Explore agent is designed for quickly searching and understanding codebases.",
  "question_text": "Which agent type should you use when you need to search through a codebase to understand its structure?",
  "options": [
    "Explore",
    "Bash",
    "Plan",
    "Write"
  ],
  "correct_index": 0,
  "explanation": "The Explore agent is specifically designed for codebase exploration - it can search for files, find patterns, and help you understand code structure quickly."
}
```

### Level 2 (Medium)
```json
{
  "id": "agents-005",
  "category": "agents",
  "difficulty": 2,
  "concept_intro": "When you need to run multiple independent searches, you can launch agents in parallel by including multiple Task tool calls in a single message. This is much faster than running them sequentially.",
  "code_snippet": "// Search for auth AND database files in parallel\n// Use a single message with two Task calls",
  "question_text": "How do you launch multiple agents in parallel?",
  "options": [
    "Include multiple Task tool calls in a single message",
    "Use the 'parallel: true' parameter",
    "Call the ParallelTask tool",
    "Chain them with && operator"
  ],
  "correct_index": 0,
  "explanation": "To run agents in parallel, you must include multiple Task tool calls in the same message. There is no special 'parallel' parameter - parallelism comes from batching the calls together."
}
```

### Level 3 (Hard)
```json
{
  "id": "agents-012",
  "category": "agents",
  "difficulty": 3,
  "concept_intro": "Background agents run asynchronously and write their output to a file. The tool result includes an output_file path. You can use the Read tool or 'tail' command to check progress while the agent works.",
  "question_text": "After launching a background agent, how should you check its progress?",
  "options": [
    "Use the Read tool or Bash with 'tail' on the output_file",
    "Call the GetAgentStatus tool with the agent ID",
    "Background agents automatically notify you when done",
    "Poll the Task tool with the same parameters"
  ],
  "correct_index": 0,
  "explanation": "Background agents write to an output_file specified in the tool result. You can read this file with the Read tool or use 'tail' to see recent output while continuing other work."
}
```

## Output Location
Save completed questions to:
- content/questions/agents.json
- content/questions/commands.json
- content/questions/hooks.json
