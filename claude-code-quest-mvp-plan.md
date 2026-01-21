# Claude Code Quest - 1-Week MVP Plan

## What We Learned From Duolingo

| Mechanic | Impact | We're Including? |
|----------|--------|------------------|
| **Streaks** | 7-day streakers are 3.6x more likely to stay engaged | ✅ Yes - core feature |
| **Streak Freeze** | Reduced churn by 21% | ❌ Post-MVP |
| **Leaderboards** | 40% more lessons completed | ✅ Yes - Daily Challenge only |
| **Instant feedback** | Green checkmark + sound = satisfaction | ✅ Yes - core feature |
| **XP + Levels** | Progression keeps users engaged | ✅ Yes - simplified |
| **Bite-sized lessons** | 1-2 minute sessions work | ✅ Yes - Quick Play = 5 questions |
| **Try before signup** | 20% retention increase | ✅ Yes - play 1 round before auth |
| **Loss aversion** | People hate losing streaks | ✅ Yes - streak is prominent |
| **Variable rewards** | Unpredictability creates dopamine | ❌ Post-MVP (loot drops) |

---

## MVP Scope (Ship in 1 Week)

### What's IN

**Core Game**
- 2 game modes only:
  - **Quick Play**: 5 random questions, ~2 minutes
  - **Daily Challenge**: 10 curated questions, same for everyone, once per day
- 3 categories to start (most useful for beginners):
  - Agents
  - Commands  
  - Hooks
- 15 questions per category = **45 questions total**
- 3 difficulty levels: Beginner / Intermediate / Advanced
- User selects difficulty at profile setup

**Teaching Flow (Pokemon-style)**
1. Brief concept intro (1-2 sentences + code snippet)
2. "Got it? Let's test!" 
3. Question appears
4. Instant feedback (green flash + sound OR red shake + sound)
5. If wrong: Show explanation + correct answer
6. Next question

**Addiction Mechanics**
- Daily streak (consecutive days playing)
- In-game combo (consecutive correct answers)
- XP earned per correct answer (+ speed bonus + combo multiplier)
- Level system (XP thresholds)
- Progress bar per category
- Daily Challenge leaderboard

**Sound Design (6 core sounds)**
1. Button tap / select
2. Correct answer (satisfying chime)
3. Wrong answer (soft error)
4. Combo increment (rising tone)
5. Streak continue (celebration)
6. Level up (fanfare)

**Visual Feedback**
- Green flash/pulse on correct
- Red shake on wrong
- Combo meter that grows
- Streak fire icon
- XP flying into total (particles)
- Progress bars filling

**Auth**
- Google OAuth only (simplest)
- Guest play for 1 round (try before signup - Duolingo's 20% retention trick)
- After first round: "Sign in to save progress"

**Daily Challenge Specifics**
- Same 10 questions for everyone that day
- Resets at midnight Eastern Time
- One attempt per day (no retries)
- Shareable result card (for Twitter/LinkedIn)
- Separate "Daily Streak" counter
- Leaderboard shows top 50 + your rank

**Mobile + Desktop**
- Mobile-first responsive design
- Works in browser (Chrome, Safari)
- Touch-friendly (44px+ tap targets)
- Simplified UI on mobile (no heavy effects)

---

### What's OUT (Post-MVP)

- ❌ Lightning Round (timed mode)
- ❌ Category Focus (deep dive mode)
- ❌ Marathon mode
- ❌ X (Twitter) OAuth
- ❌ Magic link auth
- ❌ PWA / offline support
- ❌ Real-time cross-device sync
- ❌ Loot drops / variable rewards
- ❌ Collections (badges, themes, cards)
- ❌ Titles progression
- ❌ Skill tree visualization
- ❌ 6 categories (only 3 for MVP)
- ❌ 300 questions (only 45 for MVP)
- ❌ Streak freeze
- ❌ Friend challenges
- ❌ Push notifications

---

## Question Content Strategy

### How Questions Get Written

The `content-writer` agent will:
1. Read the "Everything Claude Code" repo thoroughly
2. Extract key concepts from each category
3. Write questions that teach, not just test
4. Include code snippets where helpful
5. Write clear explanations for wrong answers

### Question Format

```json
{
  "id": "agents-001",
  "category": "agents",
  "difficulty": 1,
  "concept_intro": "Agents are specialized helpers you can delegate tasks to. They have limited tools and a focused purpose.",
  "code_snippet": "---\nname: code-reviewer\ntools: Read, Grep, Glob\nmodel: sonnet\n---",
  "question": "What does the 'tools' field in an agent definition control?",
  "options": [
    "Which programming languages the agent knows",
    "Which Claude Code tools the agent can use",
    "Which files the agent can access",
    "Which APIs the agent can call"
  ],
  "correct_index": 1,
  "explanation": "The 'tools' field specifies which Claude Code tools (Read, Grep, Glob, Bash, Edit, etc.) the agent is allowed to use. This limits its scope and keeps it focused on its specialty."
}
```

### Question Distribution

| Category | Beginner (1) | Intermediate (2) | Advanced (3) | Total |
|----------|--------------|------------------|--------------|-------|
| Agents | 5 | 5 | 5 | 15 |
| Commands | 5 | 5 | 5 | 15 |
| Hooks | 5 | 5 | 5 | 15 |
| **Total** | 15 | 15 | 15 | **45** |

---

## Scoring System

### XP Calculation

```
Base XP per correct answer: 10
Speed bonus: +5 if answered in < 5 seconds
Combo multiplier:
  - 1-2 streak: 1x
  - 3-4 streak: 1.5x
  - 5-9 streak: 2x  
  - 10+: 3x

Final XP = (Base + Speed Bonus) × Combo Multiplier
```

### Level Thresholds

| Level | Total XP Required | Title |
|-------|-------------------|-------|
| 1 | 0 | Newcomer |
| 2 | 100 | Apprentice |
| 3 | 300 | Learner |
| 4 | 600 | Practitioner |
| 5 | 1000 | Skilled |
| 6 | 1500 | Advanced |
| 7 | 2500 | Expert |
| 8 | 4000 | Master |
| 9 | 6000 | Grandmaster |
| 10 | 10000 | Legend |

---

## Database Schema (Simplified for MVP)

```sql
-- User profiles
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

-- Questions (seeded)
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

-- RLS
alter table profiles enable row level security;
alter table category_progress enable row level security;
alter table daily_results enable row level security;

create policy "Users own their profile" on profiles for all using (auth.uid() = id);
create policy "Users own their progress" on category_progress for all using (auth.uid() = user_id);
create policy "Users own their daily results" on daily_results for all using (auth.uid() = user_id);
create policy "Questions are public" on questions for select using (true);
```

---

## File Structure (Simplified)

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
│   ├── page.tsx (landing + guest play)
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts
│   └── (game)/
│       ├── play/page.tsx (mode selection)
│       ├── quick/page.tsx
│       ├── daily/page.tsx
│       └── leaderboard/page.tsx
├── components/
│   ├── game/
│   │   ├── QuestionCard.tsx
│   │   ├── AnswerButton.tsx
│   │   ├── ConceptIntro.tsx
│   │   ├── ComboMeter.tsx
│   │   ├── StreakDisplay.tsx
│   │   ├── XPGain.tsx
│   │   └── ResultCard.tsx (shareable)
│   └── ui/
│       ├── Button.tsx
│       ├── ProgressBar.tsx
│       └── Modal.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── game/
│   │   ├── scoring.ts
│   │   └── daily-challenge.ts
│   └── sounds/
│       └── audio.ts
├── content/
│   └── questions/
│       ├── agents.json
│       ├── commands.json
│       └── hooks.json
├── public/
│   └── sounds/
│       ├── tap.mp3
│       ├── correct.mp3
│       ├── wrong.mp3
│       ├── combo.mp3
│       ├── streak.mp3
│       └── levelup.mp3
├── supabase/
│   └── schema.sql
└── package.json
```

---

## Build Schedule (7 Days)

### Day 1: Foundation
- [ ] Project setup (Next.js, Tailwind, TypeScript)
- [ ] Supabase project + schema
- [ ] Google OAuth working
- [ ] Basic layout with mobile-first responsive shell
- [ ] Landing page

### Day 2: Core Game Loop
- [ ] QuestionCard component
- [ ] AnswerButton with tap feedback
- [ ] ConceptIntro component (teach before test)
- [ ] Basic game flow: intro → question → answer → feedback → next
- [ ] Connect to questions from database

### Day 3: Quick Play Mode
- [ ] Mode selection screen
- [ ] Quick Play flow (5 random questions)
- [ ] Scoring logic (base + speed + combo)
- [ ] End screen with results
- [ ] Save results to database

### Day 4: Daily Challenge
- [ ] Daily question selection (same for everyone)
- [ ] One-attempt-per-day logic
- [ ] Daily leaderboard
- [ ] Shareable result card
- [ ] Daily streak tracking

### Day 5: Polish - Sound & Animation
- [ ] Integrate Howler.js
- [ ] Add all 6 sounds
- [ ] Green flash on correct
- [ ] Red shake on wrong
- [ ] ComboMeter animation
- [ ] XP gain animation
- [ ] Sound toggle in settings

### Day 6: Streaks & Progress
- [ ] Daily streak logic + display
- [ ] Category progress bars
- [ ] Level system + XP display
- [ ] Profile page showing stats
- [ ] Guest play → sign up flow

### Day 7: Testing & Deploy
- [ ] Test on real phone
- [ ] Fix mobile issues
- [ ] Test all flows end-to-end
- [ ] Deploy to Vercel
- [ ] Test production

---

## Parallel Agent Strategy

**Day 1-2:**
- Main terminal: Project setup, auth, layout
- Agent (content-writer): Writing all 45 questions

**Day 3-4:**
- Main terminal: Game modes, scoring, database
- Agent (component-builder): UI components (buttons, progress bars, modals)

**Day 5-6:**
- Main terminal: Integration, streaks, levels
- Agent (component-builder): Animations, visual polish

**Day 7:**
- Main terminal only: Testing, fixes, deploy

---

## Success Criteria for MVP

By end of Day 7, a user should be able to:

1. ✅ Open the app on their phone
2. ✅ Play one Quick Play round as a guest
3. ✅ See "Sign in to save progress" prompt
4. ✅ Sign in with Google
5. ✅ See their profile with XP and level
6. ✅ Play Quick Play (5 questions with teaching intros)
7. ✅ Hear sounds on correct/wrong
8. ✅ See combo meter grow
9. ✅ Earn XP and potentially level up
10. ✅ Play Daily Challenge (if they haven't today)
11. ✅ See their rank on leaderboard
12. ✅ Share their Daily Challenge result
13. ✅ Come back next day and see streak increment
14. ✅ Feel like they actually LEARNED something about Claude Code

---

## Question Topics by Category

### Agents (15 questions)
**Beginner:**
- What are agents?
- Agent file structure (name, description, tools, model)
- When to delegate vs do it yourself
- Built-in agents overview
- Where agents live (.claude/agents/)

**Intermediate:**
- Choosing the right model for an agent
- Tool permissions and why they matter
- Agent prompt writing best practices
- Combining agents in workflows
- Agent output handling

**Advanced:**
- Custom agent creation patterns
- Agent context management
- Multi-agent orchestration
- Agent testing strategies
- Performance optimization for agents

### Commands (15 questions)
**Beginner:**
- What are slash commands?
- Command file structure
- Built-in commands overview
- Where commands live (.claude/commands/)
- Running commands

**Intermediate:**
- Creating custom commands
- Command arguments and parameters
- Commands vs agents - when to use which
- Command chaining
- Common command patterns

**Advanced:**
- Complex command workflows
- Command output formatting
- Error handling in commands
- Command performance
- Project-specific vs global commands

### Hooks (15 questions)
**Beginner:**
- What are hooks?
- Hook trigger types (PreToolUse, PostToolUse, Stop)
- Where hooks are configured
- Simple hook examples
- When hooks fire

**Intermediate:**
- Hook matchers and patterns
- Conditional hook execution
- Hook command scripts
- Multiple hooks for same trigger
- Hook debugging

**Advanced:**
- Complex hook patterns
- Hook performance considerations
- Hooks for code quality enforcement
- Hooks for automated documentation
- Production hook strategies

---

## Daily Challenge Format

**Display Name:** "Daily Quest"

**Structure:**
- 10 questions total
- Mix of all 3 categories
- Mix of difficulties (weighted toward user's level)
- Same questions for everyone on same day
- Questions selected by hash of date (deterministic)

**Scoring:**
- Base: 10 points per correct
- Speed bonus: +5 if < 5 seconds
- Combo bonus: same as Quick Play
- Max possible: ~200 points (all correct, all fast, full combo)

**Leaderboard:**
- Shows top 50 globally
- Shows your rank even if not in top 50
- Updates in real-time-ish (on page load)
- Resets at midnight EST

**Shareable Card:**
```
╔═══════════════════════════════╗
║  CLAUDE CODE QUEST            ║
║  Daily Quest - Jan 21, 2026   ║
╠═══════════════════════════════╣
║  🎯 9/10 correct              ║
║  ⚡ 185 points                 ║
║  🔥 Day 7 streak              ║
║  📊 Rank #23                  ║
╚═══════════════════════════════╝
        Play at [URL]
```

---

## Ready to Build!

This scope is tight but achievable in 1 week. The focus is:

1. **Core loop must feel GOOD** (sound, animation, instant feedback)
2. **Teaching must happen** (concept intro before every question)
3. **Streaks create habit** (daily streak is THE hook)
4. **Sharing creates growth** (Daily Challenge result cards)
5. **Mobile must work** (test on phone every single day)

Let's do this! 🚀
