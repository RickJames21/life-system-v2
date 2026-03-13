---
phase: 02-external-forces-experience
plan: "02"
subsystem: api
tags: [react, typescript, hooks, msw, vitest, guardian-api, wikipedia-api, fetch, cache, tdd]

requires:
  - phase: 02-external-forces-experience
    plan: "01"
    provides: vitest + MSW test scaffold with todo stubs for useExternalForces

provides:
  - useExternalForces hook — state machine, hybrid fetch routing, session cache, cycling
  - ExternalEvent and FetchStatus types exported for use in ExternalForcesPanel
  - _clearCacheForTesting export for test isolation

affects:
  - 02-03-PLAN (ExternalForcesPanel consumes useExternalForces hook directly)

tech-stack:
  added: []
  patterns:
    - "Module-level Map cache keyed by weekIdx — outside React, survives unmount/remount"
    - "AbortController timeout on every fetch (8s Guardian, 5s Wikipedia per request)"
    - "Fisher-Yates shuffle applied to event pool before caching and exposing to consumers"
    - "vi.stubEnv('VITE_GUARDIAN_KEY') in test beforeEach to enable Guardian path testing without a real key"
    - "Export _clearCacheForTesting() for explicit cache reset between tests — avoids cross-test module cache pollution"

key-files:
  created:
    - src/hooks/useExternalForces.ts
  modified:
    - tests/useExternalForces.test.ts

key-decisions:
  - "apiKey passed as parameter to fetchGuardian helper — cleaner than reading env inside helper; routing logic centralized in trigger()"
  - "Guardian key absent → fall through to Wikipedia path silently (not an error); matches CONTEXT.md spec"
  - "_clearCacheForTesting exported from hook module — allows test suites to reset module-level Map between tests without exposing cache mutability to production callers"
  - "vi.stubEnv used in beforeEach for Guardian-path test groups — avoids modifying vitest.config.ts or setupTests.ts"
  - "Each describe group uses unique weekIdx values to avoid cross-test cache collisions even after clearing"

patterns-established:
  - "TDD: export a _clear*ForTesting() function from modules with module-level caches to enable safe test isolation"
  - "TDD: use vi.stubEnv in beforeEach to set environment variables for groups of related tests"
  - "Hook returns raw API data without sanitization — callers (ExternalForcesPanel) must sanitize with DOMPurify before rendering"

requirements-completed: [API-01, API-02, API-03]

duration: 5min
completed: 2026-03-13
---

# Phase 2 Plan 02: useExternalForces Hook Summary

**Hybrid Guardian/Wikipedia fetch hook with Fisher-Yates shuffle, module-level session cache, and status machine — 14 tests passing green**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-13T06:17:04Z
- **Completed:** 2026-03-13T06:21:30Z
- **Tasks:** 3 (RED → GREEN → REFACTOR)
- **Files modified:** 2 (1 created, 1 converted from stubs)

## Accomplishments

- `useExternalForces` hook implements the full spec: idle/loading/loaded/error state machine, Guardian path (year >= 1999), Wikipedia path (pre-1999), Fisher-Yates shuffle, session cache
- 13 `it.todo` stubs converted to real passing tests; 14 tests (includes one additional wrap test) pass green
- Module-level Map cache prevents duplicate fetches across component remounts; verified by test

## Task Commits

1. **Task RED: Convert stubs to real failing tests** - `4a1ed7c` (test)
2. **Task GREEN: Implement useExternalForces hook** - `03ef3ac` (feat)
3. **Task REFACTOR: Improve Guardian key handling and test isolation** - `2a9d2da` (refactor)

## Files Created/Modified

- `src/hooks/useExternalForces.ts` - State machine hook: Guardian/Wikipedia routing, AbortController timeouts, Fisher-Yates shuffle, module-level cache, cycling via `next()`
- `tests/useExternalForces.test.ts` - 14 real passing tests: API-01 (no auto-fetch), Guardian path (3 tests), Wikipedia path (4 tests), API-02 cache (2 tests), API-03 errors (2 tests), cycling (2 tests)

## Decisions Made

- **ApiKey parameter refactor:** Rather than reading `import.meta.env.VITE_GUARDIAN_KEY` inside `fetchGuardian`, the key is read once in `trigger()` and passed as a parameter — cleaner separation, routing logic stays centralized
- **Silent Guardian fallthrough:** When `VITE_GUARDIAN_KEY` is absent, the hook falls through to Wikipedia path instead of erroring — matches CONTEXT.md spec for graceful degradation
- **`_clearCacheForTesting` export:** Module-level Maps survive across test file imports, causing cross-test cache collisions. Exporting a test-only reset function is the standard fix without changing the production cache behavior
- **`vi.stubEnv` in `beforeEach`:** Guardian-path tests need the env var set; using `vi.stubEnv` per describe group is clean and auto-restores after each test via vitest's env restoration

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test isolation for module-level Map cache**
- **Found during:** GREEN phase (running tests)
- **Issue:** Module-level `cache` Map persists across test runs within the same vitest file. Wikipedia-path tests using the same `weekIdx` (783) would hit the cache from a prior test, making fetch call counts appear as 0
- **Fix:** Exported `_clearCacheForTesting()` from hook module; added global `beforeEach(() => _clearCacheForTesting())` to test file
- **Files modified:** `src/hooks/useExternalForces.ts`, `tests/useExternalForces.test.ts`
- **Verification:** All 14 tests pass; Wikipedia 7-call count test and partial-failure test both show correct behavior
- **Committed in:** `2a9d2da` (refactor commit)

**2. [Rule 1 - Bug] Guardian tests failing due to missing env var**
- **Found during:** GREEN phase (running tests)
- **Issue:** `VITE_GUARDIAN_KEY` not set in test environment causes hook to fall through to Wikipedia path silently, making Guardian fetch call counts 0
- **Fix:** Added `vi.stubEnv('VITE_GUARDIAN_KEY', 'test-guardian-key')` in `beforeEach` for all Guardian-path describe blocks; MSW intercepts the request so no real key is needed
- **Files modified:** `tests/useExternalForces.test.ts`
- **Verification:** Guardian path tests pass with callCount = 1 and URL params verified
- **Committed in:** `2a9d2da` (refactor commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — test infrastructure bugs)
**Impact on plan:** Both fixes are test-infrastructure concerns, not feature-scope changes. No production code was affected. Plan executed as designed.

## Issues Encountered

None beyond the two auto-fixed deviations above.

## User Setup Required

For production use: `VITE_GUARDIAN_KEY=<key>` in `.env.local`. Tests use MSW mocks so no live key needed.

## Next Phase Readiness

- `useExternalForces` hook is the complete fetch/cache/cycling core; `ExternalForcesPanel` (Plan 02-03) can import and consume it directly
- Hook exports `ExternalEvent`, `FetchStatus`, `useExternalForces` — all types ExternalForcesPanel needs
- 14 tests passing; no known issues
- Security note: hook returns raw API strings — `ExternalForcesPanel` must sanitize with DOMPurify before rendering per CLAUDE.md security rules

---
*Phase: 02-external-forces-experience*
*Completed: 2026-03-13*

## Self-Check: PASSED

- src/hooks/useExternalForces.ts: FOUND
- tests/useExternalForces.test.ts: FOUND
- .planning/phases/02-external-forces-experience/02-02-SUMMARY.md: FOUND
- Commit 4a1ed7c (RED): FOUND
- Commit 03ef3ac (GREEN): FOUND
- Commit 2a9d2da (REFACTOR): FOUND
