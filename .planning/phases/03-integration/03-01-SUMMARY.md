---
phase: 03-integration
plan: 01
subsystem: testing
tags: [vitest, testing-library, react, typescript, tdd]

# Dependency graph
requires:
  - phase: 02-external-forces-experience
    provides: ExternalForcesPanel, useExternalForces hook, externalForces store key
provides:
  - Failing test stubs for all Phase 3 requirements (IO-01, IO-02, IO-03, SEARCH-01 through SEARCH-04)
  - importExport.test.ts with 13 it.todo stubs (doBackup, doRestore, exportCSV, importFile CSV)
  - gridSearch.test.tsx with 17 it.todo stubs (search toggle, cell dimming, match scope, match preview)
affects:
  - 03-02-PLAN.md (IO implementation — turns importExport stubs green)
  - 03-03-PLAN.md (search implementation — turns gridSearch stubs green)
  - 03-04-PLAN.md (final verification — all stubs should be green)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "it.todo stubs over it.skip for RED wave — todos appear as pending in CI output, skips are silent"
    - "JSDOM hover limitation documented in stubs for SEARCH-04 — manual verification required"

key-files:
  created:
    - tests/importExport.test.ts
    - tests/gridSearch.test.tsx
    - .planning/phases/03-integration/deferred-items.md
  modified:
    - vitest.config.ts

key-decisions:
  - "passWithNoTests: false set in vitest.config.ts so Wave 0 stubs register as pending not silently pass"
  - "SEARCH-04 tooltip/strip tests kept as it.todo with JSDOM limitation comment — CSS hover is not reliably testable in JSDOM"

patterns-established:
  - "Wave 0 pattern: all Phase 3 requirement stubs created before any implementation begins (Nyquist compliance)"

requirements-completed: [IO-01, IO-02, IO-03, SEARCH-01, SEARCH-02, SEARCH-03, SEARCH-04]

# Metrics
duration: 4min
completed: 2026-03-13
---

# Phase 3 Plan 01: Integration Test Stubs Summary

**30 it.todo stubs covering all 7 Phase 3 requirements (IO-01 through SEARCH-04) in two structured test files with mock documentation for Wave 1 implementation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-13T23:08:52Z
- **Completed:** 2026-03-13T23:12:58Z
- **Tasks:** 2 of 2
- **Files modified:** 3 (2 created, 1 modified)

## Accomplishments
- Created `tests/importExport.test.ts` with 13 it.todo stubs (doBackup, doRestore, exportCSV, importFile CSV) covering IO-01 through IO-03
- Created `tests/gridSearch.test.tsx` with 17 it.todo stubs (search toggle, cell dimming, match scope, match preview) covering SEARCH-01 through SEARCH-04
- Updated `vitest.config.ts` from `passWithNoTests: true` to `false` so stubs register as pending (not silently passing) in CI output

## Task Commits

Each task was committed atomically:

1. **Task 1: Create importExport.test.ts stubs (IO-01, IO-02, IO-03)** - `7aa0605` (test)
2. **Task 2: Create gridSearch.test.tsx stubs (SEARCH-01 through SEARCH-04)** - `ab8030f` (test)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `tests/importExport.test.ts` - 13 it.todo stubs for ImportExport functions (doBackup, doRestore, exportCSV, importFile CSV); includes mock setup documentation for Wave 1
- `tests/gridSearch.test.tsx` - 17 it.todo stubs for grid search UI (SEARCH-01 toggle, SEARCH-02 dimming, SEARCH-03 scope, SEARCH-04 preview); JSDOM limitation noted for hover/touch tests
- `vitest.config.ts` - Changed passWithNoTests from true to false for Phase 3 stub registration
- `.planning/phases/03-integration/deferred-items.md` - Documents 2 pre-existing ExternalForcesPanel test failures (out of scope)

## Decisions Made
- `passWithNoTests: false` ensures all Wave 0 stubs appear as pending in CI output rather than silently passing, maintaining Nyquist compliance visibility
- SEARCH-04 tooltip/strip stubs are kept as it.todo with a documented JSDOM limitation comment — CSS hover and touch events are not reliably testable in JSDOM, requiring manual verification per 03-VALIDATION.md

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Two pre-existing failures in `tests/ExternalForcesPanel.test.tsx` (LOG-06 inline editing tests) were discovered during Task 2 full-suite verification. These are out of scope — they existed before Phase 3 began (confirmed by git stash isolation test). The failures are test/implementation mismatches: tests query buttons by `/reset/i` and `/×/` but the component uses `aria-label="change signal"` and `aria-label="clear signal"`. Logged to `deferred-items.md`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 30 stubs (13 IO + 17 SEARCH) registered as pending todos in vitest output
- Plans 02-04 can use `npx vitest run tests/importExport.test.ts` and `npx vitest run tests/gridSearch.test.tsx` as automated verify targets
- Pre-existing ExternalForcesPanel failures documented in deferred-items.md — should be addressed before 03-04 final verification

---
*Phase: 03-integration*
*Completed: 2026-03-13*
