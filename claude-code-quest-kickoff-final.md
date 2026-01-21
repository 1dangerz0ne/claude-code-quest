# Claude Code Quest - MVP Kickoff Prompt

Copy and paste this entire block into Claude Code after creating your project folder.

---

I'm building "Claude Code Quest" - a mobile-first learning game that teaches Claude Code skills through Duolingo-style gamification. I need to ship an MVP in 1 week.

## My Context
- I'm a beginner coder learning as I build
- My global CLAUDE.md is at ~/.claude/CLAUDE.md - follow those preferences
- I have dangerouslySkipPermissions enabled
- I want to LEARN from building this - add "// LEARNING NOTE:" comments
- I'll test on my actual phone throughout development

## What We're Building (MVP Only)

### Core Features
- **2 Game Modes:**
  - Quick Play: 5 random questions, ~2 minutes
  - Daily Challenge: 10 questions, same for everyone, once per day, leaderboard
- **3 Categories:** Agents, Commands, Hooks (15 questions each = 45 total)
- **3 Difficulty Levels:** Beginner / Intermediate / Advanced (user picks at signup)
- **Teaching Flow:** Brief concept intro → Question → Instant feedback → Explanation if wrong
- **Google OAuth only** (plus guest play for 1 round before signup)

### Addiction Mechanics (Duolingo-inspired)
- Daily streak (consecutive days playing)
- In-game combo (consecutive correct answers)
- XP + Level system
- Category progress bars
- Daily Challenge leaderboard
- 6 core sounds (tap, correct, wrong, combo, streak, level-up)

### Visual Feedback
- Green flash on correct answer
- Red shake on wrong answer
- Combo meter that grows
- XP particles flying to total
- Streak fire icon

### Mobile-First
- Design for 375px width first
- Touch targets 44px minimum
- No hover-dependent interactions
- Test on real phone daily

## What I Need You To Create

### 1. Project CLAUDE.md
Include:
- MVP overview and 1-week timeline
- Simplified tech stack with explanations
- File structure map
- Day-by-day build checklist
- Mobile testing reminder
- "Beginner Notes" section

### 2. Skills (in .claude/skills/)

**nextjs-basics.md**
- File-based routing (app directory)
- Server vs Client components ('use client')
- API routes
- Layout and page patterns

**supabase-auth.md**
- Client setup
- Google OAuth flow
- Session handling
- Middleware for protected routes

**mobile-first.md**
- Touch target sizes (44px+)
- Responsive patterns
- Testing on real devices
- Common mobile gotchas

### 3. Agents (in .claude/agents/)

**component-builder.md**
- Builds React components with Tailwind
- Tools: Read, Write, Edit, Glob
- Model: sonnet
- Instructions: Mobile-first, touch-friendly, use Framer Motion for animations

**content-writer.md**
- Writes quiz questions based on the Everything Claude Code repo
- Tools: Read, Write, WebFetch
- Model: opus (needs to understand technical content deeply)
- Instructions: 
  - Each question needs: concept_intro, code_snippet (optional), question, 4 options, correct_index, explanation
  - Questions should TEACH, not just test
  - Research the actual Claude Code documentation and best practices
  - Make explanations beginner-friendly

### 4. Database Schema (supabase/schema.sql)

```sql
-- Profiles
create table profiles (
  id uuid references auth.users primary key,
  username text unique,
  difficulty int default 1, -- 1=beginner, 2=intermediate, 3=advanced
  xp int default 0,
  level int default 1,
  daily_streak int default 0,
  longest_daily_streak int default 0,
  last_played_date date,
  created_at timestamptz default now()
);

-- Category progress
create table category_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  category text not null,
  correct int default 0,
  total int default 0,
  unique(user_id, category)
);

-- Daily challenge results
create table daily_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  challenge_date date not null,
  score int not null,
  correct int not null,
  total int not null,
  time_seconds int,
  completed_at timestamptz default now(),
  unique(user_id, challenge_date)
);

-- Questions
create table questions (
  id text primary key,
  category text not null,
  difficulty int not null,
  concept_intro text not null,
  code_snippet text,
  question_text text not null,
  options jsonb not null,
  correct_index int not null,
  explanation text not null
);

-- Enable RLS
alter table profiles enable row level security;
alter table category_progress enable row level security;
alter table daily_results enable row level security;

create policy "Users own profile" on profiles for all using (auth.uid() = id);
create policy "Users own progress" on category_progress for all using (auth.uid() = user_id);
create policy "Users own daily results" on daily_results for all using (auth.uid() = user_id);
create policy "Questions public" on questions for select using (true);
```

### 5. File Structure

```
claude-code-quest/
├── CLAUDE.md
├── .claude/
│   ├── skills/
│   │   ├── nextjs-basics.md
│   │   ├── supabase-auth.md
│   │   └── mobile-first.md
│   └── agents/
│       ├── component-builder.md
│       └── content-writer.md
├── app/
│   ├── layout.tsx
│   ├── page.tsx (landing + guest play option)
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts
│   └── (game)/
│       ├── play/page.tsx (mode selection)
│       ├── quick/page.tsx
│       ├── daily/page.tsx
│       ├── leaderboard/page.tsx
│       └── profile/page.tsx
├── components/
│   ├── game/
│   │   ├── QuestionCard.tsx
│   │   ├── AnswerButton.tsx
│   │   ├── ConceptIntro.tsx
│   │   ├── ComboMeter.tsx
│   │   ├── StreakDisplay.tsx
│   │   ├── XPGain.tsx
│   │   └── ShareCard.tsx
│   └── ui/
│       ├── Button.tsx
│       └── ProgressBar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── game/
│   │   ├── scoring.ts
│   │   └── questions.ts
│   └── sounds.ts
├── content/
│   └── questions/
│       ├── agents.json (15 questions)
│       ├── commands.json (15 questions)
│       └── hooks.json (15 questions)
├── public/
│   └── sounds/
│       └── .gitkeep
├── supabase/
│   └── schema.sql
├── .env.local.example
├── package.json
├── tailwind.config.ts
└── next.config.js
```

### 6. Package.json Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "framer-motion": "^11.x",
    "howler": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^19.x",
    "@types/node": "^22.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "@types/howler": "^2.x"
  }
}
```

### 7. Seed Questions

Create 5 starter questions in `content/questions/agents.json` so I can test immediately. Use this format:

```json
[
  {
    "id": "agents-001",
    "category": "agents",
    "difficulty": 1,
    "concept_intro": "Agents are specialized helpers that handle specific tasks. You delegate to them by name, and they work with limited tools.",
    "code_snippet": "---\nname: code-reviewer\ntools: Read, Grep, Glob\nmodel: sonnet\n---",
    "question_text": "What does the 'tools' field in an agent definition control?",
    "options": [
      "Which programming languages the agent knows",
      "Which Claude Code tools the agent can use",
      "Which files the agent can read",
      "Which APIs the agent can call"
    ],
    "correct_index": 1,
    "explanation": "The 'tools' field specifies which Claude Code tools (Read, Grep, Glob, Bash, Edit, etc.) the agent is allowed to use. Limiting tools keeps agents focused on their specific task."
  }
]
```

### 8. Scoring Logic (lib/game/scoring.ts)

```typescript
// XP Calculation
// Base: 10 per correct answer
// Speed bonus: +5 if answered in < 5 seconds
// Combo multiplier:
//   1-2 streak: 1x
//   3-4 streak: 1.5x
//   5-9 streak: 2x
//   10+: 3x

// Level thresholds
// Level 1: 0 XP (Newcomer)
// Level 2: 100 XP (Apprentice)
// Level 3: 300 XP (Learner)
// Level 4: 600 XP (Practitioner)
// Level 5: 1000 XP (Skilled)
// Level 6: 1500 XP (Advanced)
// Level 7: 2500 XP (Expert)
// Level 8: 4000 XP (Master)
// Level 9: 6000 XP (Grandmaster)
// Level 10: 10000 XP (Legend)
```

## Styling Direction

**Terminal-inspired but modern and clean:**
- Dark background (#0a0a0a or similar)
- Accent color: Electric cyan (#06b6d4) or green (#10b981)
- Monospace font for code snippets (JetBrains Mono or Fira Code from Google Fonts)
- Clean sans-serif for UI text
- No heavy CRT effects on mobile (save battery, reduce distraction)
- Subtle glow on active elements
- Cards with slight border and shadow

## After Creating Files

1. Explain what each major file/folder does in plain English
2. Explain "server vs client components" - I'll see this a lot
3. Give me commands to:
   - Install dependencies
   - Set up Supabase project and run schema
   - Configure Google OAuth
   - Run dev server
   - Test on my phone (what's my local IP?)
4. Tell me what to build on Day 1

## Critical Reminders

- **Mobile-first:** Test on phone every day, not just browser DevTools
- **Instant feedback:** No delays, no spinners for core game actions
- **Sound matters:** Get sounds working early, they're 50% of the feel
- **Teaching first:** Every question should have a concept intro
- **Ship in 7 days:** If it's not on the MVP list, don't build it

Let's build something people will actually want to play every day!
