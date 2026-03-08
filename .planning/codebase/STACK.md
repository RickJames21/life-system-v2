# Technology Stack

**Analysis Date:** 2026-03-08

## Languages

**Primary:**
- TypeScript 5.9.3 - All source files under `src/`

**Template Language:**
- TSX (React JSX) - All component files under `src/components/`

**Style:**
- CSS (plain, CSS Modules) - `src/styles/`, per-component `*.module.css` files

## Runtime

**Environment:**
- Browser (no Node.js server runtime)
- Single-page application — all computation runs client-side

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.3.1 - UI rendering, component model, hooks
- Framer Motion 11.18.2 - Animations: spring needles, AnimatePresence sheet transitions, motion.rect bars, motion.line SVG elements

**State Management:**
- Zustand 4.5.7 with `persist` middleware - Single global store at `src/store/useStore.ts`, persisted to `localStorage` under key `ls_v3`

**Build/Dev:**
- Vite 5.4.21 - Dev server and production bundler
- `@vitejs/plugin-react` 4.7.0 - Babel-based React Fast Refresh for Vite

## Key Dependencies

**Critical:**
- `zustand` 4.5.7 - Global state + localStorage persistence via `partialize`. Removing or changing breaks all data persistence.
- `framer-motion` 11.18.2 - Drives all needle animations, sheet slide-ups, and SVG bar animations. Deeply embedded throughout `src/components/instruments/` and `src/components/sheet/`.

**Infrastructure:**
- No backend dependencies. All logic is pure frontend JavaScript.

## TypeScript Configuration

**Compiler targets:** ES2020, DOM, DOM.Iterable

**Key settings (`tsconfig.json`):**
- `strict: true` — strict type checking enforced
- `moduleResolution: "bundler"` — Vite-native module resolution
- `jsx: "react-jsx"` — automatic JSX transform (no `import React` required except for types)
- `noEmit: true` — TypeScript is type-check only; Vite handles transpilation
- `isolatedModules: true` — each file transpilable independently

**No path aliases configured** — all imports use relative paths.

## CSS Architecture

**Approach:** CSS Modules + CSS custom properties (design tokens)

**Global tokens:** `src/styles/tokens.css` — all `--var` design tokens on `:root`

**Global resets:** `src/styles/global.css` — reset, scrollbar styles, keyframes

**Per-component:** `ComponentName.module.css` co-located with component file

**Fonts:** Google Fonts loaded via CDN link in `index.html` — Inter (200/300/400/500) and JetBrains Mono (300/400)

## Build Output

**Command:** `tsc && vite build`

**Output directory:** `dist/`

**Bundle size:** 329KB uncompressed, ~105KB gzip (as of last clean build)

**Entry:** `index.html` → `src/main.tsx`

## Platform Requirements

**Development:**
- Node.js (version not pinned — no `.nvmrc` or `.node-version` file)
- `npm install` then `npm run dev`

**Production:**
- Static file hosting only (no server required)
- SPA routing: all routes redirect to `index.html` (configured in `netlify.toml`)
- Deployed to Netlify via `netlify.toml`

---

*Stack analysis: 2026-03-08*
