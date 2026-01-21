# Next.js 15 Basics for Claude Code Quest

## App Router Structure

### File Conventions
- `page.tsx` - Route component (required for route to work)
- `layout.tsx` - Shared wrapper for child routes
- `loading.tsx` - Loading UI (automatic Suspense boundary)
- `error.tsx` - Error UI (automatic error boundary)
- `route.ts` - API route handler

### Route Groups
Folders in parentheses `(name)` don't affect URL:
```
app/
  (auth)/
    login/page.tsx      → /login
    callback/route.ts   → /callback
  (game)/
    play/page.tsx       → /play
    quick/page.tsx      → /quick
```

## Server vs Client Components

### Server Components (Default)
- Can fetch data directly
- Can access server-only code
- Cannot use hooks or browser APIs
- Cannot handle events

```tsx
// This is a server component by default
export default async function Page() {
  const data = await fetchData() // Direct data fetch
  return <div>{data.title}</div>
}
```

### Client Components
- Add `'use client'` at top of file
- Can use hooks (useState, useEffect)
- Can handle events (onClick, onChange)
- Required for interactivity

```tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

## Data Fetching

### In Server Components
```tsx
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'no-store' // or 'force-cache' for static
  })
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <main>{/* use data */}</main>
}
```

### In Client Components
Use React hooks or libraries like SWR:
```tsx
'use client'

import { useEffect, useState } from 'react'

export default function Data() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData)
  }, [])

  if (!data) return <div>Loading...</div>
  return <div>{data.title}</div>
}
```

## Server Actions

Define actions in a separate file or inline:

```tsx
// actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function submitScore(score: number) {
  // Save to database
  await db.scores.insert({ score })
  revalidatePath('/leaderboard')
}
```

Use in client component:
```tsx
'use client'

import { submitScore } from './actions'

export default function Game() {
  const handleWin = async () => {
    await submitScore(100)
  }
  return <button onClick={handleWin}>Submit</button>
}
```

## Navigation

### Link Component
```tsx
import Link from 'next/link'

<Link href="/play">Start Game</Link>
<Link href="/profile" prefetch={false}>Profile</Link>
```

### Programmatic Navigation
```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function Game() {
  const router = useRouter()

  const handleFinish = () => {
    router.push('/results')
    // or router.replace('/results') to not add to history
  }
}
```

## Middleware

`middleware.ts` at project root:
```tsx
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check auth, redirect, etc.
  return NextResponse.next()
}

export const config = {
  matcher: ['/play/:path*', '/profile/:path*']
}
```

## Environment Variables

- `NEXT_PUBLIC_*` - Exposed to browser
- Other variables - Server only

```tsx
// Client-safe
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

// Server-only (will be undefined in client)
const secretKey = process.env.SECRET_KEY
```

## Common Patterns for This Project

### Protected Page
```tsx
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Protected content for {user.email}</div>
}
```

### Game State in Client Component
```tsx
'use client'

import { useState, useCallback } from 'react'

type GameState = 'intro' | 'question' | 'feedback' | 'complete'

export default function GameFlow() {
  const [state, setState] = useState<GameState>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const handleNext = useCallback(() => {
    if (state === 'intro') setState('question')
    else if (state === 'question') setState('feedback')
    else if (state === 'feedback') {
      if (currentQuestion < 4) {
        setCurrentQuestion(q => q + 1)
        setState('intro')
      } else {
        setState('complete')
      }
    }
  }, [state, currentQuestion])

  // Render based on state...
}
```
