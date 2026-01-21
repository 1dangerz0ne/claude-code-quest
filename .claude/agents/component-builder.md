# Component Builder Agent

## Purpose
Build React components for the Claude Code Quest game following project conventions.

## Component Conventions

### File Structure
```tsx
// 1. 'use client' directive if needed
'use client'

// 2. Imports (React, libraries, then local)
import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// 3. Types
interface ComponentProps {
  // props here
}

// 4. Component
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // hooks first
  // handlers next
  // render last
}
```

### Styling Rules
- Use Tailwind CSS exclusively
- Mobile-first: base styles for mobile, then sm:, md:, lg:
- Use `cn()` utility for conditional classes
- Dark theme: bg-slate-900, bg-slate-800, text-white, text-slate-300

### Animation Patterns
```tsx
// Simple fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
>

// Scale on tap
<motion.button
  whileTap={{ scale: 0.95 }}
>

// Correct answer flash
<motion.div
  animate={isCorrect ? { backgroundColor: ['#22c55e', '#1e293b'] } : {}}
  transition={{ duration: 0.3 }}
>
```

### Touch Target Requirements
- Minimum 44x44px for all interactive elements
- Answer buttons: full width, min-height 56px
- Use py-4 px-6 for comfortable touch targets

## Component Templates

### Game Component Template
```tsx
'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface Props {
  // Define props
}

export function GameComponent({ }: Props) {
  const [state, setState] = useState()

  const handleAction = useCallback(() => {
    // Handle action
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4"
    >
      {/* Component content */}
    </motion.div>
  )
}
```

### UI Component Template
```tsx
import { cn } from '@/lib/utils'

interface Props {
  className?: string
  // Other props
}

export function UIComponent({ className, ...props }: Props) {
  return (
    <div className={cn('base-classes', className)} {...props}>
      {/* Content */}
    </div>
  )
}
```

## Components to Build

### Game Components (components/game/)
1. **QuestionCard** - Displays question with code snippet
2. **AnswerButton** - Tappable answer option with feedback
3. **ConceptIntro** - Teaching moment before question
4. **ComboMeter** - Shows current combo streak
5. **StreakDisplay** - Shows daily streak fire icon
6. **XPGain** - Animated XP earned popup
7. **ShareCard** - Generated result card for sharing

### UI Components (components/ui/)
1. **Button** - Reusable button with variants
2. **ProgressBar** - Category/game progress indicator

## Color Palette
```
Background: slate-900 (#0f172a)
Card: slate-800 (#1e293b)
Card hover: slate-700 (#334155)
Text primary: white
Text secondary: slate-300 (#cbd5e1)
Text muted: slate-400 (#94a3b8)
Correct: green-500 (#22c55e)
Wrong: red-500 (#ef4444)
Combo: orange-500 (#f97316)
XP: yellow-500 (#eab308)
```

## Testing Checklist
- [ ] Works on mobile viewport (375px)
- [ ] Touch targets are 44px+
- [ ] Animations are smooth
- [ ] Handles loading/empty states
- [ ] Accessible (keyboard, screen reader)
