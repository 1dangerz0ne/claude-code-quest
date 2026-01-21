# Mobile-First Development Guide

## Core Principle
Design for the smallest screen (375px) first, then use Tailwind responsive prefixes to scale UP.

## Tailwind Breakpoints
```
Default (no prefix) = 0px and up (MOBILE)
sm: = 640px and up
md: = 768px and up
lg: = 1024px and up
xl: = 1280px and up
```

## Writing Mobile-First CSS

### Correct (Mobile-First)
```tsx
<div className="p-4 sm:p-6 md:p-8">
  <h1 className="text-xl sm:text-2xl md:text-3xl">Title</h1>
  <div className="flex flex-col sm:flex-row gap-4">
    {/* Stack on mobile, row on tablet+ */}
  </div>
</div>
```

### Wrong (Desktop-First)
```tsx
// DON'T do this - starts big and scales down
<div className="p-8 sm:p-6 xs:p-4">
```

## Touch Targets

**Minimum touch target: 44x44 pixels**

```tsx
// Good - large touch target
<button className="min-h-[44px] min-w-[44px] p-3">
  Click me
</button>

// Bad - too small
<button className="p-1 text-sm">
  Click me
</button>
```

### For Answer Buttons (Full Width on Mobile)
```tsx
<button className="w-full py-4 px-6 text-lg min-h-[56px]">
  Answer Option
</button>
```

## Viewport and Safe Areas

### Root Layout
```tsx
// app/layout.tsx
export const metadata = {
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1, // Prevents zoom on input focus
    userScalable: false,
  },
}
```

### Safe Area Padding (for notched phones)
```css
/* globals.css */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.safe-top {
  padding-top: env(safe-area-inset-top, 0);
}
```

## Common Mobile Patterns

### Full-Screen Game View
```tsx
<div className="min-h-screen flex flex-col bg-slate-900">
  {/* Header - fixed height */}
  <header className="h-14 flex items-center px-4">
    <h1>Quick Play</h1>
  </header>

  {/* Main content - fills remaining space */}
  <main className="flex-1 flex flex-col p-4 overflow-auto">
    {/* Game content */}
  </main>

  {/* Footer - fixed at bottom */}
  <footer className="safe-bottom p-4">
    <button className="w-full py-4">Next</button>
  </footer>
</div>
```

### Card Component
```tsx
<div className="bg-slate-800 rounded-2xl p-4 sm:p-6">
  <h2 className="text-lg sm:text-xl font-bold mb-3">
    Question
  </h2>
  <p className="text-slate-300 text-base leading-relaxed">
    Content here
  </p>
</div>
```

### Stacked Answer Buttons
```tsx
<div className="flex flex-col gap-3">
  {options.map((option, i) => (
    <button
      key={i}
      className="w-full py-4 px-6 bg-slate-700 rounded-xl text-left
                 text-base font-medium
                 active:bg-slate-600 transition-colors
                 min-h-[56px]"
    >
      {option}
    </button>
  ))}
</div>
```

## Animation Performance

### Use Transform and Opacity
```tsx
// Good - GPU accelerated
<motion.div
  animate={{ opacity: 1, scale: 1, x: 0 }}
/>

// Avoid - causes reflow
<motion.div
  animate={{ width: 100, height: 100 }}
/>
```

### Reduce Motion Preference
```tsx
import { useReducedMotion } from 'framer-motion'

function MyComponent() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { scale: 1.1 }}
    />
  )
}
```

## Testing on Real Devices

### Using Local Network
1. Find your computer's local IP:
   - Windows: `ipconfig` → IPv4 Address
   - Mac: `ifconfig` → en0 inet
2. Run dev server: `npm run dev`
3. On phone, visit: `http://192.168.x.x:3000`

### Common Mobile Issues

**Input Zoom on iOS:**
- Set `font-size: 16px` minimum on inputs
- Or disable zoom in viewport meta

**Tap Highlight:**
```css
/* Remove blue tap highlight on mobile */
button, a {
  -webkit-tap-highlight-color: transparent;
}
```

**300ms Click Delay:**
```css
/* Modern browsers don't need this, but just in case */
html {
  touch-action: manipulation;
}
```

**Overscroll/Bounce:**
```css
/* Prevent pull-to-refresh on game screens */
.no-overscroll {
  overscroll-behavior: none;
}
```

## Responsive Typography Scale

```tsx
// Headings
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
<h2 className="text-xl sm:text-2xl font-semibold">
<h3 className="text-lg sm:text-xl font-medium">

// Body
<p className="text-base sm:text-lg">
<span className="text-sm sm:text-base">
```

## Game-Specific Patterns

### Progress Bar
```tsx
<div className="h-2 bg-slate-700 rounded-full overflow-hidden">
  <div
    className="h-full bg-green-500 transition-all duration-300"
    style={{ width: `${(current / total) * 100}%` }}
  />
</div>
```

### Score Display
```tsx
<div className="flex justify-between items-center px-4 py-2">
  <span className="text-slate-400 text-sm">Score</span>
  <span className="text-2xl font-bold text-white">{score}</span>
</div>
```

### Combo Indicator
```tsx
<div className="flex items-center gap-2">
  <span className="text-orange-500 font-bold">
    {combo}x
  </span>
  <div className="flex gap-1">
    {[...Array(Math.min(combo, 5))].map((_, i) => (
      <div key={i} className="w-2 h-2 rounded-full bg-orange-500" />
    ))}
  </div>
</div>
```

## Checklist Before Ship

- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] All buttons at least 44px touch target
- [ ] No horizontal scroll
- [ ] Text readable without zooming
- [ ] Animations smooth (60fps)
- [ ] Works in landscape orientation
- [ ] Safe areas respected (notch, home indicator)
