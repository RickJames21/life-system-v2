# Architecture

**Analysis Date:** 2026-03-08

## Pattern

**Single-page application (SPA) — client-only, no backend.**

Architecture style: **Component-driven with centralized state + derived stats**

Two major modes governed by a top-level conditional in `src/App.tsx`:
1. **Setup** — user hasn't entered `birthDate` yet → renders `<Setup />`
2. **Dashboard** — configured → renders instrument panel + grids + sheets

## Layers

```
┌─────────────────────────────────────────────┐
│                  App.tsx                    │  Entry: Setup vs Dashboard routing
├─────────────────────────────────────────────┤
│   Components (View Layer)                   │  Pure presentational + event handlers
│   SkyDisplay / InstrumentPanel / GridPanel  │
│   Sheet / LogSheet / CommandBar / Dashboard │
├─────────────────────────────────────────────┤
│   Hooks (Derived State)                     │  useStats, useLiveTickers
├─────────────────────────────────────────────┤
│   Store (Source of Truth)                   │  useStore (Zustand + persist)
├─────────────────────────────────────────────┤
│   Lib (Pure Functions)                      │  calcStats, dateUtils, colorSystem
└─────────────────────────────────────────────┘
```

## Data Flow

```
User input → store action → store state change
                         ↓
                   useStats() hook (memoized derived)
                         ↓
                   Components re-render

Time passage → useLiveTickers setInterval (250ms)
                         ↓
               Direct DOM writes (bypasses React)
               document.getElementById('live-hb') etc.
```

**Key invariant:** All time-based stats derive at runtime from `birthDate + lifespan`. Nothing time-sensitive is stored — only config and user-written notes/moods.

## State Architecture

**Persisted (localStorage key `ls_v3`):**
- `birthDate: string` — ISO date string
- `lifespan: number` — years (default 90)
- `mission: string` — current mission text
- `notes: Record<string, string>` — keyed by `wk(i)`, `mk(y,m)`, `yk(y)`, `dk(d)`
- `moods: Record<string, number>` — keyed same as notes, value 0–3
- `missionLog: MissionLog[]` — completed missions

**Ephemeral (in-store, not persisted):**
- UI flags: `legendOpen`, `gotoOpen`, `aiOpen`, `menuOpen`, `menuSheet`, `timeSheet`, `logSheet`
- Navigation: `sheet` (current open sheet descriptor), `tab` (weeks/months/years/decades)
- `highlightWeek: number | null` — goto-date target

**Derived (never stored):**
- Everything in `Stats` — computed by `calcStats(birthDate, lifespan)` at render time
- `weeksLived`, `pct`, `clockStr`, current week index, etc.

## Key Abstractions

**Note keys** (`src/lib/dateUtils.ts`):
- `wk(i)` → `w{i}` — week index from birth
- `mk(y, m)` → `m{y}_{m}` — month within year
- `yk(y)` → `y{y}` — year index from birth
- `dk(d)` → `d{d}` — day index from birth

These keys are load-bearing — used in store actions, sheet navigation, and grid rendering.

**Sheet descriptor** (`sheet` in store): Object describing which cell is open:
```ts
{ type: 'week' | 'month' | 'year' | 'decade', index: number, noteKey: string }
```

**Stats object** (returned by `calcStats`): All derived time values including `weeksLived`, `weeksRemaining`, `pct`, `daysLived`, heartbeats, etc.

## Entry Points

- `index.html` → loads `src/main.tsx`
- `src/main.tsx` → mounts `<App />` into `#root`
- `src/App.tsx` → Setup/Dashboard routing, global toast listener
- `src/store/useStore.ts` → Zustand store, all state + actions

## SVG Instrument Math

All SVG dials in `src/components/instruments/ArcDial.tsx`:
- 0° = 12 o'clock, increases clockwise
- `polarToCartesian(cx, cy, r, angleDeg)`: `angle_rad = (deg - 90) * π/180`
- Start angle: 225° (7 o'clock), total sweep: 270°
- Needle: `useSpring` + `useTransform` → `motion.line` x2/y2
- Elapsed arc: `style={{ pathLength: springPct }}` (Framer Motion stroke-dashoffset)

---

*Architecture analysis: 2026-03-08*
