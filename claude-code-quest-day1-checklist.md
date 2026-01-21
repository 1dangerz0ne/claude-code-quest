# Claude Code Quest - Day 1 Checklist

## Before You Start (15-20 minutes)

### Create Accounts

**Supabase** (https://supabase.com)
- [ ] Create free account
- [ ] Create project named "claude-code-quest"
- [ ] Wait for project to initialize (~2 min)
- [ ] Go to Settings > API and copy:
  - Project URL: `________________________`
  - Anon/public key: `________________________`

**Google Cloud Console** (https://console.cloud.google.com)
- [ ] Create project named "claude-code-quest"
- [ ] Go to APIs & Services > OAuth consent screen
  - Select "External"
  - Fill in app name, email
  - Add your email as test user
- [ ] Go to APIs & Services > Credentials
  - Create OAuth 2.0 Client ID (Web application)
  - Add Authorized redirect URIs:
    - `http://localhost:3000/auth/callback`
    - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
  - Copy Client ID and Secret

**Enable Google in Supabase**
- [ ] Go to Supabase > Authentication > Providers > Google
- [ ] Enable it
- [ ] Paste Client ID and Secret
- [ ] Save

### Local Setup
- [ ] Create folder: `Claude Code Quest` (wherever you keep projects)
- [ ] Open folder in VS Code
- [ ] Open terminal (Ctrl + ` or View > Terminal)

---

## Kickoff (5 minutes)

- [ ] Run `claude` to start Claude Code
- [ ] Paste the kickoff prompt
- [ ] Wait for files to be created
- [ ] Verify key files exist:
  - `package.json`
  - `app/layout.tsx`
  - `app/page.tsx`
  - `.env.local.example`
  - `supabase/schema.sql`

---

## Install & Configure (10 minutes)

### Install Dependencies
```bash
npm install
```
- [ ] No errors (warnings are okay)

### Environment Variables
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Fill in:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

### Test Dev Server
```bash
npm run dev
```
- [ ] Open http://localhost:3000
- [ ] See something (even if basic)
- [ ] No errors in terminal

---

## Database Setup (10 minutes)

### Run Schema
- [ ] Open Supabase dashboard
- [ ] Go to SQL Editor
- [ ] Copy contents of `supabase/schema.sql`
- [ ] Run it
- [ ] Check Table Editor - should see:
  - `profiles`
  - `category_progress`
  - `daily_results`
  - `questions`

---

## Test on Phone (5 minutes)

### Find Your Local IP
Windows:
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (like `192.168.1.105`)

Mac:
```bash
ifconfig | grep "inet "
```

- [ ] Write your IP: `________________________`

### Test
- [ ] Make sure phone is on same WiFi as computer
- [ ] On phone browser, go to: `http://YOUR-IP:3000`
- [ ] Page loads!

If it doesn't work:
```bash
npm run dev -- --hostname 0.0.0.0
```
Then try again.

---

## Build Auth (30-45 minutes)

Ask Claude Code:
> "Build the login page with Google sign-in. Make the button large and touch-friendly (minimum 44px height). After successful auth, redirect to /play."

- [ ] `/login` page exists
- [ ] Big "Sign in with Google" button
- [ ] Test on desktop: click button, Google popup, redirects back
- [ ] Check Supabase > Table Editor > `profiles` > new row created
- [ ] Test on phone: same flow works

Ask Claude Code:
> "Add middleware to protect /play routes. If not logged in, redirect to /login."

- [ ] Going to `/play` when logged out redirects to `/login`
- [ ] Going to `/play` when logged in shows the page

---

## Build Basic Layout (30 minutes)

Ask Claude Code:
> "Build a responsive layout with:
> - Dark background (#0a0a0a)
> - Clean sans-serif font for UI, monospace for code
> - A simple header showing the app name and user's XP/level (placeholder values for now)
> - Content area that's centered and max-width on desktop, full-width on mobile
> - Test it at 375px width in DevTools"

- [ ] Looks good on desktop
- [ ] Looks good at 375px (mobile)
- [ ] Dark theme applied
- [ ] Header shows

---

## End of Day 1 Checklist

By end of Day 1, you should have:

- [ ] Project created and running locally
- [ ] Database tables created in Supabase
- [ ] Google OAuth working (can sign in and out)
- [ ] Protected routes (can't access /play without auth)
- [ ] Basic dark theme layout
- [ ] Tested on actual phone

### Concepts You Should Understand

- [ ] **What is Supabase?** (Database + Auth in one)
- [ ] **What is OAuth?** (Letting Google handle login)
- [ ] **What is middleware?** (Code that runs before page loads)
- [ ] **Server vs Client components** (Ask Claude to explain if unclear)

---

## Day 1 Notes

**What I built:**


**What I learned:**


**What confused me:**


**Phone test results:**


---

## Tomorrow (Day 2): Core Game Loop

You'll build:
- QuestionCard component
- AnswerButton with tap feedback
- ConceptIntro (the teaching part)
- Basic game flow: intro → question → answer → feedback → next
- Connect to real questions from database

Start prompt for Day 2:
> "Let's build the core game loop. I want to display a question with 4 answer buttons. When I tap an answer, show green flash if correct, red shake if wrong. Show an explanation after. Then move to next question. Start with the QuestionCard and AnswerButton components."
