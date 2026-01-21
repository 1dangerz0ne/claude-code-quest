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

### Equipment Tier System
Players can equip armor, weapons, and shields. Each has 3 style options, all upgradeable through 5 tiers:

| Tier | Name | XP Required | Color |
|------|------|-------------|-------|
| 1 | Common | 0 | Gray |
| 2 | Uncommon | 200 | Green |
| 3 | Rare | 800 | Blue |
| 4 | Epic | 2,500 | Purple |
| 5 | Legendary | 6,000 | Gold |

**Equipment Options:**
- **Armor:** Plate (Knight), Robes (Mage), Shadow Garb (Ninja)
- **Weapons:** Code Blade (Sword), Syntax Staff, Debug Daggers
- **Shields:** Tower Shield, Magic Orb, Shadow Cloak

### Achievement Categories
- **Milestone:** First Blood, game count milestones, level achievements
- **Skill:** Perfect games, speed records, combo streaks
- **Social:** Challenges created/won, referrals
- **Special:** Night Owl, Early Bird, Weekend Warrior

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
- [x] **Viral Features V1:**
  - Wordle-style shareable results (`lib/share.ts`, `ShareButton.tsx`)
  - Sound system with Howler.js (`lib/sounds.ts`, `SoundToggle.tsx`)
  - Visual feedback: confetti, screen flash (`Confetti.tsx`, `FeedbackFlash.tsx`)
  - Supabase persistence (`lib/supabase/saveGameResult.ts`)
  - Level-up celebration modal (`LevelUpModal.tsx`)
  - Social proof elements (`lib/stats.ts`)
- [x] **Viral Features V2 (NEW):**
  - Achievement/Badge system with 25 achievements (`lib/achievements.ts`, `AchievementBadge.tsx`, `AchievementModal.tsx`)
  - Avatar with upgradeable equipment - 3 armor/weapon/shield styles x 5 tiers (`lib/avatar.ts`, `Avatar.tsx`)
  - Challenge a Friend - shareable challenge codes (`lib/challenges.ts`, `ChallengeButton.tsx`, `/challenge/[code]`)
  - Live player counter with real-time updates (`LiveCounter.tsx`)
  - Category mastery visualization with progress bars (`CategoryMastery.tsx`)
  - Enhanced screenshot-worthy results screen (`ResultsScreen.tsx`)
  - Referral system with bonus XP (`lib/referrals.ts`, `ReferralCard.tsx`)
  - "Share this tip" on every explanation (`LearnedShare.tsx`)
- [x] GitHub repo: https://github.com/1dangerz0ne/claude-code-quest

### What's Next

#### Step 1: Run Database Migrations
Run the updated `supabase/schema.sql` in your Supabase SQL Editor to create:
- `achievements` table with 25 pre-seeded achievements
- `user_achievements` table for tracking unlocks
- `challenges` and `challenge_attempts` tables for friend challenges
- `activity_log` table for live counter
- New profile columns: `referral_code`, `referred_by`, `avatar_armor`, `games_played`, etc.

#### Step 2: Wire New Components into Existing Pages

**Home Page (`app/page.tsx`):**
```tsx
import { LiveCounter } from "@/components/game/LiveCounter";
// Add <LiveCounter /> next to the social proof section
```

**Play Menu (`app/(game)/play/page.tsx`):**
```tsx
import { Avatar } from "@/components/game/Avatar";
import { CategoryMastery } from "@/components/game/CategoryMastery";
import { ReferralCard } from "@/components/game/ReferralCard";
// Add Avatar component showing user's equipment
// Replace category stats with CategoryMastery component
// Add ReferralCard at bottom of page
```

**Quick Play Results (`app/(game)/quick/page.tsx`):**
```tsx
import { ResultsScreen } from "@/components/game/ResultsScreen";
import { AchievementModal } from "@/components/game/AchievementModal";
// Replace the complete phase JSX with ResultsScreen component
// Add achievement checking after game save
// Show AchievementModal when new badges unlock
```

**Daily Challenge (`app/(game)/daily/page.tsx`):**
```tsx
// Same integration as Quick Play
// Add streak display from ResultsScreen
```

**Profile Page (`app/(game)/profile/page.tsx`):**
```tsx
import { Avatar } from "@/components/game/Avatar";
import { AchievementBadge } from "@/components/game/AchievementBadge";
import { CategoryMastery, OverallMastery } from "@/components/game/CategoryMastery";
// Show Avatar with equipment selection
// Display unlocked achievements grid
// Add OverallMastery component
```

#### Step 3: Environment & Deploy
- Add sound files to `public/sounds/` (tap, correct, wrong, combo, levelup, streak .mp3)
- Configure Google OAuth in Supabase dashboard
- Deploy to Railway with env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Test challenge flow: create challenge → share link → friend plays → compare results

#### Step 4: Future Enhancements
- Equipment selection UI (let users choose armor/weapon/shield style)
- Achievement progress tracking (show "3/5 perfect games" progress)
- Push notifications for streak reminders
- Weekly tournaments with prizes

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
