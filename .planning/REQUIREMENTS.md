# Requirements: Life System V2 — External Forces

**Defined:** 2026-03-08
**Core Value:** A personal log entry becomes richer when grounded in what was happening in the world at the same moment.

## v1 Requirements

### API Integration

- [x] **API-01**: Events are fetched **on demand only** — triggered by user button press, never automatically on sheet open. Source is determined by week start year: **Guardian API** for weeks from 1999 onwards (real headlines from that specific week, top 10 by relevance); **Wikipedia "On This Day"** for weeks before 1999 (historical coincidences for those calendar dates). Guardian API key stored in `VITE_GUARDIAN_KEY` env var.
- [x] **API-02**: API responses are cached in memory **per weekIdx** so that cycling through events and re-opening the sheet do not make repeated network requests. Cache is a module-level Map (survives component unmount, resets on page reload).
- [x] **API-03**: If the API is unavailable or returns no events, the UI shows "No external signal" without breaking the log flow

### Log Flow (External Forces Panel)

- [ ] **LOG-01**: An "External Forces" section appears alongside the note-writing step in LogSheet (same step, below personal note input, separated by a subtle divider); initially empty with a single trigger button (on-brand label TBD — e.g. "Scan Signal" or "Read the Field")
- [ ] **LOG-02**: After the trigger button is pressed and events load, the panel displays one event at a time: `{year} — {one-line summary}` in muted italic styling
- [ ] **LOG-03**: Once events are loaded, two buttons appear: "Show Next" (cycles to the next event from the week's pool without saving) and "Add to Record" (saves the current event) — both on-brand with the app's language
- [ ] **LOG-04**: "Add to Record" saves the currently displayed event to the `externalForces` store field for that week
- [ ] **LOG-05**: A saved external force is displayed below personal notes in a visually distinct block (different background, labeled "External Force") — never merged with personal note text
- [ ] **LOG-06**: The saved external force block is editable inline — user can rewrite or expand on it after saving

### Data Store

- [x] **STORE-01**: Zustand store gains an `externalForces: Record<string, ExternalForce>` field, persisted to `ls_v3`, keyed by `wk(i)` (one external force per week)
- [x] **STORE-02**: `ExternalForce` type holds: `year`, `summary` (original Wikipedia text), `userText` (user's editable version), and optionally `url`
- [x] **STORE-03**: Store actions: `setExternalForce(weekKey, force)`, `updateExternalForceText(weekKey, text)`, `clearExternalForce(weekKey)`

### Grid Search / Filter

- [x] **SEARCH-01**: A search input is added to the UI (CommandBar or GridPanel) that accepts free text
- [x] **SEARCH-02**: While search is active, week cells that do not match the query (in notes OR external forces) are visually dimmed on the grid
- [x] **SEARCH-03**: Search works across all weeks, not just the current one
- [x] **SEARCH-04**: Search results clearly indicate (via cell styling or tooltip) whether the match came from a personal note or an external force

### Import / Export

- [x] **IO-01**: JSON backup export includes the `externalForces` field alongside `notes` and `moods`
- [x] **IO-02**: JSON backup import gracefully handles files without `externalForces` (backward compatible — missing field treated as empty)
- [x] **IO-03**: CSV export includes external force text as a clearly labeled separate column

### Polish & Mobile

- [ ] **UX-01**: External Forces panel layout is usable on mobile (touch-friendly cycle controls, readable text)
- [ ] **UX-02**: Typography and color of External Forces feel like a quiet annotation — muted, not competing with personal content

## v2 Requirements

### Future

- Multiple external forces per week (v1 allows one)
- Day-level date picker within a week (v1 pools all 7 days)
- Persistent API cache across sessions (v1 caches in memory only)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Additional non-Guardian/Wikipedia sources | Scope — two sources (Guardian + Wikipedia fallback) sufficient for v1 |
| Push notifications for external events | Not in keeping with contemplative tone |
| Automatic AI summarization of events | Adds complexity and cost; Wikipedia summaries are already concise |
| Separate External Forces feed / standalone view | Log-embedded is the right UX; dedicated view is overengineering for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STORE-01 | Phase 1 | Complete (2026-03-10) |
| STORE-02 | Phase 1 | Complete (2026-03-10) |
| STORE-03 | Phase 1 | Complete (2026-03-10) |
| API-01 | Phase 2 | Complete |
| API-02 | Phase 2 | Complete |
| API-03 | Phase 2 | Complete |
| LOG-01 | Phase 2 | Pending |
| LOG-02 | Phase 2 | Pending |
| LOG-03 | Phase 2 | Pending |
| LOG-04 | Phase 2 | Pending |
| LOG-05 | Phase 2 | Pending |
| LOG-06 | Phase 2 | Pending |
| UX-01 | Phase 2 | Pending |
| UX-02 | Phase 2 | Pending |
| IO-01 | Phase 3 | Complete |
| IO-02 | Phase 3 | Complete |
| IO-03 | Phase 3 | Complete |
| SEARCH-01 | Phase 3 | Complete |
| SEARCH-02 | Phase 3 | Complete |
| SEARCH-03 | Phase 3 | Complete |
| SEARCH-04 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-12 — API-01, API-02 updated to reflect hybrid Guardian + Wikipedia strategy*
