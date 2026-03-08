# Testing

**Analysis Date:** 2026-03-08

## Current State

**No tests exist.** The codebase has zero test files, no test runner configured, and no testing library in `package.json`.

```json
// package.json devDependencies — no test framework present
{
  "typescript": "^5.5.3",
  "vite": "^5.4.1",
  "@vitejs/plugin-react": "^4.3.1"
  // no vitest, jest, @testing-library, etc.
}
```

There is no `test` script in `package.json`.

## Risk Assessment

The absence of tests is high-risk for the following pure logic modules — these are directly testable with no DOM or React dependency:

| Module | Functions | Risk if broken |
|--------|-----------|----------------|
| `src/lib/calcStats.ts` | `calcStats(birthDate, lifespan)` | All stats wrong — every display value broken |
| `src/lib/dateUtils.ts` | `wk`, `mk`, `yk`, `dk`, `weekRange`, `dateToWeekIdx` | Note keys wrong — data written to wrong cells |
| `src/lib/colorSystem.ts` | `getWeekColor`, season lerp | Visual-only; lower risk |
| `src/store/useStore.ts` | `navigateSheet` state machine | Sheet navigation broken |

## Recommended Test Setup

If tests are added, the natural fit for this stack is **Vitest**:

```bash
npm install -D vitest
```

```json
// package.json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

```ts
// vite.config.ts addition
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
```

## Highest-Priority Test Cases

If tests were written today, these would be the most valuable:

**`calcStats` — core math:**
```ts
// Verify week count, percentage, days lived for a known birth date
calcStats('1990-01-01', 90) → { weeksLived: ~1880, pct: ~0.4, ... }
```

**`dateUtils` key factories:**
```ts
wk(0)      → 'w0'
wk(100)    → 'w100'
mk(5, 11)  → 'm5_11'
yk(30)     → 'y30'
dk(365)    → 'd365'
```

**`dateUtils` week range:**
```ts
weekRange(0, birthDate) → { start: Date, end: Date }
// Verify 7-day span, correct day-of-week
```

**`navigateSheet` boundary conditions:**
- Navigation stops at week 0 (birth)
- Navigation stops at `weeksTotal - 1`
- Month navigation wraps correctly at month 11 → month 0 of next year

## Component Testing

No component tests exist. The architecture makes component testing straightforward for stateless display components (SVG dials, grid cells), but the store-coupled components would require a Zustand mock.

Recommended approach if added:
- `@testing-library/react` for component tests
- Mock `useStore` at the module level for isolation
- Only test components with complex local logic (e.g., `LogSheet` step machine)

## Manual Testing Checklist

Current QA process is manual. Key flows to verify after changes:

- [ ] First-time setup (enter birth date, see dashboard populate)
- [ ] Log flow: mood → mission Y/N → note (all 3 steps, correct order)
- [ ] Mission completed: Y → immediate new mission prompt
- [ ] Navigate sheets: arrow keys / swipe through weeks/months/years
- [ ] Import/export: JSON round-trip preserves all notes and moods
- [ ] Goto date: navigates to correct week cell
- [ ] Tab switching: weeks → months → years → decades all render

---

*Testing analysis: 2026-03-08*
