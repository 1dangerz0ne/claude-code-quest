# Claude Code Quest - Project Instructions

## Project Overview
A mobile-first educational game teaching Claude Code skills through Duolingo-style gamification.

**Target:** Ship playable MVP in 7 days

## Tech Stack
- **Framework:** Next.js 15 (App Router, React 19)
- **Styling:** Tailwind CSS (mobile-first)
- **Database:** Supabase (PostgreSQL + Auth)
- **Auth:** Google OAuth via Supabase
- **Animation:** Framer Motion
- **Sound:** Howler.js
- **Deploy:** Railway

## Key Patterns

### File Structure
```
app/           - Next.js App Router pages
components/    - React components (game/ and ui/ subdirs)
lib/           - Utilities and Supabase clients
content/       - Question JSON files
public/sounds/ - Audio files
supabase/      - Schema and migrations
```

### Mobile-First Development
- Always design for 375px width first
- Use Tailwind's responsive prefixes (sm:, md:, lg:) to scale UP
- Touch targets minimum 44x44px
- Test on actual phone, not just DevTools

### Component Patterns
- Use TypeScript for all components
- Keep components small and focused
- Colocate styles with Tailwind classes
- Use Framer Motion for animations

### Supabase Patterns
- Use `createBrowserClient` for client components
- Use `createServerClient` for server components/actions
- All tables have RLS enabled
- User data tied to `auth.uid()`

## Game Mechanics

### Scoring System
```
Base XP: 10 per correct answer
Speed Bonus: +5 if < 5 seconds
Combo Multiplier:
  - 1-2 streak: 1x
  - 3-4 streak: 1.5x
  - 5-9 streak: 2x
  - 10+: 3x
```

### Level Thresholds
| Level | XP Required | Title |
|-------|-------------|-------|
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

## Development Workflow

### Running Locally
```bash
npm run dev
```
Open http://localhost:3000 on your phone (use local IP)

### Building
```bash
npm run build
```
Must pass before deploying

### Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Current Status

### Completed (2026-01-21)
- [x] Project structure created
- [x] Supabase schema configured
- [x] Dark theme layout complete
- [x] Core game loop (QuestionCard, AnswerButton, ConceptIntro)
- [x] Quick Play mode with scoring
- [x] Daily Challenge with leaderboard
- [x] **Viral Features Implemented:**
  - Wordle-style shareable results (`lib/share.ts`, `ShareButton.tsx`)
  - Sound system with Howler.js (`lib/sounds.ts`, `SoundToggle.tsx`)
  - Visual feedback: confetti, screen flash (`Confetti.tsx`, `FeedbackFlash.tsx`)
  - Supabase persistence (`lib/supabase/saveGameResult.ts`)
  - Level-up celebration modal (`LevelUpModal.tsx`)
  - Social proof elements (`lib/stats.ts`)
- [x] GitHub repo: https://github.com/1dangerz0ne/claude-code-quest

### What's Next
- Deploy to Railway (add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Add sound files to `public/sounds/` (tap, correct, wrong, combo, levelup, streak .mp3)
- Configure Google OAuth in Supabase dashboard
- Test on actual mobile device

## Important Notes

### Don't Forget
- Test on actual phone after each feature
- Keep touch targets at least 44x44px
- Sound effects need user interaction first (browser policy)
- Daily Challenge uses deterministic date-based seed

### Known Limitations (MVP)
- Google OAuth only (no email/password)
- 3 categories only (Agents, Commands, Hooks)
- 45 questions total
- No offline support
