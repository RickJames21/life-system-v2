# Requirements: Life System V2 — External Forces

**Defined:** 2026-03-08
**Core Value:** A personal log entry becomes richer when grounded in what was happening in the world at the same moment.

## v1 Requirements

### API Integration

- [ ] **API-01**: Wikipedia "On This Day" events are fetched **on demand only** — triggered by user button press, never automatically on sheet open
- [ ] **API-02**: API responses are cached in memory per calendar date so that cycling through events and re-opening the sheet do not make repeated network requests
- [ ] **API-03**: If the API is unavailable or returns no events, the UI shows "No external signal" without breaking the log flow

### Log Flow (External Forces Panel)

- [ ] **LOG-01**: An "External Forces" section appears alongside the note-writing step in LogSheet (same step, below personal note input, separated by a subtle divider); initially empty with a single trigger button (on-brand label TBD — e.g. "Scan Signal" or "Read the Field")
- [ ] **LOG-02**: After the trigger button is pressed and events load, the panel displays one event at a time: `{year} — {one-line summary}` in muted italic styling
- [ ] **LOG-03**: Once events are loaded, two buttons appear: "Show Next" (cycles to the next event from the week's pool without saving) and "Add to Record" (saves the current event) — both on-brand with the app's language
- [ ] **LOG-04**: "Add to Record" saves the currently displayed event to the `externalForces` store field for that week
- [ ] **LOG-05**: A saved external force is displayed below personal notes in a visually distinct block (different background, labeled "External Force") — never merged with personal note text
- [ ] **LOG-06**: The saved external force block is editable inline — user can rewrite or expand on it after saving

### Data Store

- [ ] **STORE-01**: Zustand store gains an `externalForces: Record<string, ExternalForce>` field, persisted to `ls_v3`, keyed by `wk(i)` (one external force per week)
- [ ] **STORE-02**: `ExternalForce` type holds: `year`, `summary` (original Wikipedia text), `userText` (user's editable version), and optionally `url`
- [ ] **STORE-03**: Store actions: `setExternalForce(weekKey, force)`, `updateExternalForceText(weekKey, text)`, `clearExternalForce(weekKey)`

### Grid Search / Filter

- [ ] **SEARCH-01**: A search input is added to the UI (CommandBar or GridPanel) that accepts free text
- [ ] **SEARCH-02**: While search is active, week cells that do not match the query (in notes OR external forces) are visually dimmed on the grid
- [ ] **SEARCH-03**: Search works across all weeks, not just the current one
- [ ] **SEARCH-04**: Search results clearly indicate (via cell styling or tooltip) whether the match came from a personal note or an external force

### Import / Export

- [ ] **IO-01**: JSON backup export includes the `externalForces` field alongside `notes` and `moods`
- [ ] **IO-02**: JSON backup import gracefully handles files without `externalForces` (backward compatible — missing field treated as empty)
- [ ] **IO-03**: CSV export includes external force text as a clearly labeled separate column

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
| Non-Wikipedia sources | Scope — single curated source sufficient for v1 |
| Push notifications for external events | Not in keeping with contemplative tone |
| Automatic AI summarization of events | Adds complexity and cost; Wikipedia summaries are already concise |
| Separate External Forces feed / standalone view | Log-embedded is the right UX; dedicated view is overengineering for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STORE-01 | Phase 1 | Pending |
| STORE-02 | Phase 1 | Pending |
| STORE-03 | Phase 1 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 2 | Pending |
| LOG-01 | Phase 2 | Pending |
| LOG-02 | Phase 2 | Pending |
| LOG-03 | Phase 2 | Pending |
| LOG-04 | Phase 2 | Pending |
| LOG-05 | Phase 2 | Pending |
| LOG-06 | Phase 2 | Pending |
| UX-01 | Phase 2 | Pending |
| UX-02 | Phase 2 | Pending |
| IO-01 | Phase 3 | Pending |
| IO-02 | Phase 3 | Pending |
| IO-03 | Phase 3 | Pending |
| SEARCH-01 | Phase 3 | Pending |
| SEARCH-02 | Phase 3 | Pending |
| SEARCH-03 | Phase 3 | Pending |
| SEARCH-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 — traceability populated by roadmap*
