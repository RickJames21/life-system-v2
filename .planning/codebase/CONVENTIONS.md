# Coding Conventions

**Analysis Date:** 2026-03-08

## Code Style

**Language:** TypeScript with `strict: true`. No `any` in practice — all types explicit.

**JSX:** TSX files throughout. Automatic JSX transform — no `import React` needed except for type imports (`import type { FC } from 'react'`).

**Formatting:** No Prettier/ESLint config present. Code is consistently formatted by hand — 2-space indentation, single quotes in TS, double quotes in JSX attributes.

## Component Patterns

**Functional components only** — no class components.

```tsx
// Standard component shape
export default function ComponentName({ prop1, prop2 }: Props) {
  const { storeValue, action } = useStore(s => ({ ... }))
  const stats = useStats()
  // ...
  return <div className={styles.root}>...</div>
}
```

**Zustand subscriptions** — always use selector to minimize re-renders:
```ts
const { value, action } = useStore(s => ({ value: s.value, action: s.action }))
```

**No prop drilling** — most components reach into the global store directly. Props are used for primitive display values or callbacks only.

## CSS Modules

```tsx
import styles from './ComponentName.module.css'
// Usage:
<div className={styles.container}>
<div className={`${styles.base} ${isActive ? styles.active : ''}`}>
```

**Design tokens** accessed via CSS custom properties:
```css
/* In .module.css: */
.container {
  background: var(--bg-panel);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
```

**Never hardcode colors** — always use `--var` tokens from `tokens.css`.

## State Management Patterns

**Store actions** are defined inline in the Zustand `create()` call:
```ts
export const useStore = create<State>()(persist((set, get) => ({
  // state
  birthDate: '',
  // actions
  setBirthDate: (d) => set({ birthDate: d }),
}), { ... }))
```

**Derived state** lives in hooks, never in the store:
```ts
// src/hooks/useStats.ts
export function useStats() {
  const { birthDate, lifespan } = useStore(s => ({ ... }))
  return useMemo(() => calcStats(birthDate, lifespan), [birthDate, lifespan])
}
```

**Note key pattern** (critical — must use these exact factories from `dateUtils.ts`):
```ts
wk(i)     // → "w{i}"       week index
mk(y, m)  // → "m{y}_{m}"  month within year
yk(y)     // → "y{y}"       year index
dk(d)     // → "d{d}"       day index
```

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Components | PascalCase | `WeekGrid`, `LogSheet` |
| Hooks | `use` prefix | `useStats`, `useLiveTickers` |
| Store actions | verb + noun | `setNote`, `openLogSheet`, `goConfig` |
| CSS classes | camelCase (via Modules) | `styles.gridCell`, `styles.activeWeek` |
| Note keys | single letter prefix | `w`, `m`, `y`, `d` |
| Design tokens | `--` kebab-case | `--bg-panel`, `--text-primary` |
| Event handlers | `handle` or `on` prefix | `handleClick`, `onClose` |

## Animation Patterns

**Framer Motion** for all transitions:

```tsx
// Spring needle animation
const spring = useSpring(pct, { stiffness: 60, damping: 20 })
const x2 = useTransform(spring, [0, 1], [startX, endX])
return <motion.line x2={x2} />

// Sheet slide-up
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', ... }}
    />
  )}
</AnimatePresence>
```

## SVG Patterns

SVG instruments use `polarToCartesian` for all angle calculations:
```ts
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
```

Arc paths built with `describeArc(cx, cy, r, startAngle, endAngle)` returning SVG path `d` string.

## Error Handling

**Minimal** — this is a local personal app. Error handling exists only at:
- Import/restore operations (try/catch in `ImportExport.tsx`)
- Clipboard writes (`.catch` on `navigator.clipboard.writeText`)

No error boundaries. No form validation beyond required fields in Setup.

## Live DOM Updates

`useLiveTickers` bypasses React for performance — writes directly to DOM:
```ts
const el = document.getElementById('live-hb')
if (el) el.textContent = String(Math.round(stats.heartbeats))
```

Target elements must have matching `id` attributes in JSX. This is intentional to avoid 250ms React re-renders for cosmetic counters.

---

*Conventions analysis: 2026-03-08*
