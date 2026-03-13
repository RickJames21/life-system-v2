# Deferred Items — Phase 03-integration

## Pre-existing Test Failures (out of scope for this phase)

### ExternalForcesPanel.test.tsx — 2 pre-existing failures

Found during: 03-01 execution (Task 2 verification)
Status: Pre-existing before Phase 3 started (confirmed by stash test)
Scope: Out of scope — failures existed before any Phase 3 changes

**Failure 1:** `"reset" button restores the original summary text`
- Test uses `getByRole('button', { name: /reset/i })`
- Component renders button with `aria-label="change signal"` not "reset"
- Component has no reset-to-summary button — test expectation vs implementation mismatch

**Failure 2:** `"×" / clear button calls clearExternalForce(weekKey)`
- Test uses `getByRole('button', { name: /×/ })`
- Component renders button with `aria-label="clear signal"` (not just "×")
- The button text is × but aria-label is "clear signal" — accessible role query by name uses aria-label

These are test/implementation mismatches introduced during Phase 2 implementation. Should be fixed in a dedicated cleanup task.
