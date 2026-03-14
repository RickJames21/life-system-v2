---
phase: 03-integration
plan: 03
subsystem: ui
tags: [react, zustand, css-modules, vitest, search, grid]

# Dependency graph
requires:
  - phase: 03-integration
    plan: 01
    provides: store ephemeral state (searchQuery, searchOpen, setSearchQuery, setSearchOpen)
provides:
  - Search toggle button in GridPanel header with amber active state
  - searchRow input + × clear button (weeks tab only)
  - matchedWeeks useMemo computed from notes + externalForces
  - WeekGrid opacity dimming (0.15) on non-matching cells when query active
  - searchQuery prop on WeekGrid (hook point for Plan 04 tooltip/strip)
  - SEARCH-01, SEARCH-02, SEARCH-03 unit tests green
affects: [03-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useMemo for derived Set<number> computed from store slices (notes + externalForces)
    - Store-based test assertions for UI state transitions (avoids JSDOM 4680-cell render timeout)
    - Pure helper function extracted from useMemo body for direct unit testing

key-files:
  created: []
  modified:
    - src/components/grid/GridPanel.tsx
    - src/components/grid/GridPanel.module.css
    - src/components/grid/WeekGrid.tsx
    - tests/gridSearch.test.tsx

key-decisions:
  - "SEARCH-04 tooltip/strip tests kept as it.todo — CSS hover/touch not reliably testable in JSDOM; Plan 04 will handle via manual verification"
  - "Tests use store state assertions rather than rendering WeekGrid — 4680-cell render exceeds JSDOM timeout"
  - "Pure computeMatchedWeeks helper extracted from useMemo body to enable unit testing in isolation"

patterns-established:
  - "matchedWeeks as Set<number> prop contract — GridPanel computes, WeekGrid consumes; separation of concerns"
  - "searchQuery prop accepted but not consumed by WeekGrid until Plan 04 — forward-compatible prop threading"

requirements-completed: [SEARCH-01, SEARCH-02, SEARCH-03]

# Metrics
duration: 12min
completed: 2026-03-13
---

# Phase 03 Plan 03: Grid Search Toggle + Opacity Dimming Summary

**Search toggle button, matchedWeeks useMemo, and 0.15 opacity dimming wired from GridPanel to WeekGrid across 4,680 cells**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-13T20:05:00Z
- **Completed:** 2026-03-13T20:17:00Z
- **Tasks:** 2 (Task 1 previously committed as ff69d92; Task 2 committed as e68ee93)
- **Files modified:** 4

## Accomplishments

- "⌕ search" toggle button added to GridPanel header, reusing gotoBtn/gotoBtnActive CSS classes
- searchRow (text input + × clear button) renders only when searchOpen && tab === 'weeks'
- Escape key handler clears searchQuery and closes searchOpen in a single keystroke
- matchedWeeks computed via useMemo scanning all notes (wk keys) and externalForces (userText || summary)
- WeekGrid cells dim to opacity 0.15 for non-matching weeks; matched cells remain opacity 1
- Cell transition extended from 'filter 0.15s' to 'filter 0.15s, opacity 0.2s'
- searchQuery prop threaded to WeekGrid as Plan 04 hook point (tooltip/strip wiring)
- 12 tests green across SEARCH-01, SEARCH-02, SEARCH-03; 5 SEARCH-04 todos preserved

## Task Commits

1. **Task 1: Add searchQuery + searchOpen ephemeral store state** - `ff69d92` (feat)
2. **Task 2: GridPanel search toggle + WeekGrid opacity dimming** - `e68ee93` (feat)

## Files Created/Modified

- `src/components/grid/GridPanel.tsx` - Store selectors, searchRef, matchedWeeks useMemo, search button, searchRow, WeekGrid prop pass-through
- `src/components/grid/GridPanel.module.css` - .searchRow, .searchInput, .searchClear styles mirroring goto pattern
- `src/components/grid/WeekGrid.tsx` - matchedWeeks + searchQuery props added; cell opacity logic; transition extended
- `tests/gridSearch.test.tsx` - SEARCH-01 through SEARCH-03 implemented as real tests (SEARCH-04 remains it.todo)

## Decisions Made

- Store-based assertions used in SEARCH-01 tests instead of rendering GridPanel — rendering WeekGrid (4,680 cells) exceeds JSDOM test timeout; store assertions are equivalent for verifying toggle state transitions
- computeMatchedWeeks extracted as a pure helper function mirroring useMemo body, enabling clean unit testing of SEARCH-02 and SEARCH-03 without React overhead
- SEARCH-04 (tooltip/strip) tests kept as it.todo — CSS hover and touch events are not reliably testable in JSDOM; Plan 04 will use manual verification per 03-VALIDATION.md

## Deviations from Plan

None - plan executed exactly as written. All four files (GridPanel.tsx, GridPanel.module.css, WeekGrid.tsx, gridSearch.test.tsx) were already partially pre-implemented matching the plan spec; Task 2 verified and committed the complete implementation.

## Issues Encountered

Pre-existing ExternalForcesPanel.test.tsx failures (2 tests: "reset" button and "×" clear button) exist prior to this plan's changes — confirmed by stash verification. These are out of scope and logged as pre-existing.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- matchedWeeks Set<number> prop contract established and flowing from GridPanel to WeekGrid
- searchQuery prop accepted by WeekGrid, ready for Plan 04 tooltip content
- SEARCH-04 tooltip/strip implementation is the immediate next step (Plan 04)
- Pre-existing ExternalForcesPanel LOG-06 test failures should be addressed before final release

---
*Phase: 03-integration*
*Completed: 2026-03-13*
