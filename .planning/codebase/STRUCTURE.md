# Directory Structure

**Analysis Date:** 2026-03-08

## Root Layout

```
life-system-v2/
├── index.html              # App shell, Google Fonts CDN link, #root mount
├── package.json            # npm scripts: dev, build, preview
├── package-lock.json
├── vite.config.ts          # @vitejs/plugin-react
├── tsconfig.json           # strict: true, moduleResolution: bundler
├── netlify.toml            # Build: npm run build → dist/; SPA redirects
└── src/
    ├── main.tsx            # React root — ReactDOM.createRoot('#root')
    ├── App.tsx             # Top-level routing: Setup vs Dashboard
    ├── vite-env.d.ts       # CSS module type declarations (*.module.css)
    ├── styles/
    │   ├── tokens.css      # All --var design tokens on :root
    │   └── global.css      # Reset, scrollbar, @keyframes
    ├── lib/
    │   ├── dateUtils.ts    # wk/mk/yk/dk key factories, weekRange, MILESTONES, MOOD_LABELS
    │   ├── colorSystem.ts  # Season lerp, decade palette, getWeekColor()
    │   └── calcStats.ts    # calcStats(birthDate, lifespan) → Stats
    ├── hooks/
    │   ├── useStats.ts     # useMemo wrapper over calcStats — derived stats
    │   └── useLiveTickers.ts  # setInterval → writes to DOM ids: live-hb, live-orb
    ├── store/
    │   └── useStore.ts     # All state + actions, persisted to ls_v3
    └── components/
        ├── Setup/          # Onboarding form (birth date + lifespan input)
        ├── SkyDisplay/     # SVG sky arc + clock overlay
        ├── instruments/
        │   ├── ArcDial.tsx         # 270° arc gauge, useSpring needle
        │   ├── AnalogClock.tsx     # Analog clock face, spring hands
        │   ├── TwinBar.tsx         # Twin column SVG bars (motion.rect)
        │   └── TerminalCounters.tsx # Live metric rows, DOM-id wired
        ├── grid/
        │   ├── GridPanel.tsx   # Tab bar, legend, goto date, grid switcher
        │   ├── WeekGrid.tsx    # 52-col week grid, season colors
        │   ├── MonthGrid.tsx   # 12-col month grid
        │   ├── YearGrid.tsx    # 10-col year grid, decade palette
        │   └── DecadeGrid.tsx  # 4-per-row decade blocks
        ├── sheet/
        │   ├── Sheet.tsx       # AnimatePresence bottom sheet, nested notes
        │   └── LogSheet.tsx    # Sacred 4-step log flow
        ├── commandBar/
        │   └── CommandBar.tsx  # Fixed bottom bar, amber cursor blink
        ├── dashboard/
        │   ├── SystemStatus.tsx    # NOMINAL/DEGRADED/OPTIMAL/CRITICAL row
        │   ├── MissionBanner.tsx   # Active mission display
        │   ├── Observations.tsx    # Computed bullet observations
        │   ├── TimeRemaining.tsx   # Countdown cards
        │   ├── TimeItemSheet.tsx   # Edit time items sheet
        │   └── ImportExport.tsx    # CSV/JSON/backup/restore + AI prompt
        └── common/
            └── Toast.tsx       # Portal-based toast, global showToast()
```

## Key File Locations

| Purpose | File |
|---------|------|
| Global state store | `src/store/useStore.ts` |
| All design tokens | `src/styles/tokens.css` |
| Date/week math | `src/lib/dateUtils.ts` |
| Stats derivation | `src/lib/calcStats.ts` |
| Color math | `src/lib/colorSystem.ts` |
| Live DOM tickers | `src/hooks/useLiveTickers.ts` |
| App entry | `src/main.tsx` |
| Setup/Dashboard routing | `src/App.tsx` |
| Netlify deploy config | `netlify.toml` |

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `WeekGrid.tsx`)
- CSS Modules: `ComponentName.module.css` co-located with component
- Hooks: `useCamelCase.ts`
- Lib utilities: `camelCase.ts`
- Store: `useStoreName.ts`

**CSS Modules:**
- Co-located with their component file in the same directory
- Imported as `import styles from './ComponentName.module.css'`
- Classes accessed as `styles.className`

**Exports:**
- Components: default export
- Lib functions: named exports
- Store: default export (the hook)

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript — strict mode, bundler resolution |
| `vite.config.ts` | Vite — React plugin only, no aliases |
| `netlify.toml` | Deploy: `npm run build`, publish `dist/`, SPA redirect |
| `package.json` | npm scripts: `dev`, `build` (`tsc && vite build`), `preview` |

---

*Structure analysis: 2026-03-08*
