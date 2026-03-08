# Life System V2 — External Forces

## What This Is

Life System V2 is a personal life-logging dashboard that visualises a human lifespan as a grid of weeks, months, years, and decades. The current milestone adds **External Forces** — a Wikipedia-powered historical events panel embedded in the log flow. When the user logs any week (current or historical), they see real-world events from that week in history, can cycle through them, and optionally attach the most resonant one to their log entry as a quiet contextual annotation.

## Core Value

A personal log entry becomes richer when grounded in what was happening in the world at the same moment. External Forces makes that connection effortless and contemplative — not newsy.

## Requirements

### Validated

- ✓ Life dashboard renders as week/month/year/decade grids — existing
- ✓ Sacred log flow: mood (0–3) → mission Y/N → personal note — existing
- ✓ Notes and moods persisted to localStorage (key `ls_v3`) — existing
- ✓ Bottom sheet (Sheet, LogSheet) navigation via keyboard + swipe — existing
- ✓ Import/export (CSV + JSON backup/restore) — existing
- ✓ Command bar, mission tracking, system status — existing

### Active

- [ ] Wikipedia "On This Day" API integration — fetch events for all 7 days of the logged week
- [ ] External Forces panel in LogSheet, alongside the note-writing step
- [ ] Cycle UI — browse through all events from the week; shows year + one-line summary
- [ ] "Add to Log" button — saves selected event to a new `externalForces` store key
- [ ] Saved external force is visually distinct from personal notes, editable after saving
- [ ] API response caching per date (no repeated Wikipedia calls)
- [ ] Graceful failure — "No external signal today" if API unavailable or no events
- [ ] Grid filter / search — text search dims non-matching week cells across notes + external forces
- [ ] Import/export includes external forces (backward compatible — old exports without them still import fine)
- [ ] Mobile-compatible layout for External Forces panel

### Out of Scope

- Multiple external forces per week entry — v2 (v1: one per week)
- Day-level date picker within a week (v1: all 7 days pooled)
- Push notifications or external forces surfaced outside the log flow
- Non-Wikipedia sources

## Context

**Existing stack:** React 18 + Vite + TypeScript + Zustand + Framer Motion + CSS Modules. No backend. Local-only SPA deployed to Netlify.

**Store shape:** All user data in Zustand persisted to `ls_v3`. Notes keyed by `wk(i)`, `mk(y,m)`, `yk(y)`, `dk(d)`. External forces will be stored as a new `externalForces: Record<string, ExternalForce>` field on the store, keyed by `wk(i)` (one entry per week), where `ExternalForce` holds the saved event year, summary, optional URL, and user's edited text.

**API:** `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/MM/DD` — free, no auth, returns array of events. Fetch all 7 days of the week in parallel on sheet open; cache per date in memory (not persisted — fine to re-fetch on next session).

**Design language:** Dark dashboard, amber accents. External Forces should feel like a quiet annotation — muted, italic, clearly secondary to personal content. Section header: "External Forces". Event format: `{year} — {one-line summary}`.

## Constraints

- **Tech stack**: No new frameworks. Pure React/TS additions to existing component tree.
- **Store**: Must use `partialize` pattern already established — `externalForces` should be persisted alongside `notes` and `moods`.
- **Sacred rules**: Log flow step order (mood → mission → note) must not change. External Forces is additive to the note step, not a replacement.
- **Backward compat**: Import/export must handle old backup files without `externalForces` field.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Separate `externalForces` store key | Clean separation from notes; enables independent search/export/display | — Pending |
| Pool all 7 days of week for cycling | User sees broader historical context; simple UX with just cycle arrows | — Pending |
| Cache in memory (not persisted) | Wikipedia data is canonical — no need to store; re-fetch is fine | — Pending |
| Grid filter as search UX | Fits existing grid-centric navigation paradigm; no new UI surface needed | — Pending |

---
*Last updated: 2026-03-08 after initialization*
