# Codebase Concerns

**Analysis Date:** 2026-03-08

## Tech Debt

**Stats are stale — `useStats` never re-derives on time passage:**
- Issue: `useStats()` memoizes on `[birthDate, lifespan]` only. `calcStats` calls `new Date()` inside. If the user leaves the app open across midnight (week boundary), stats will not update — `weeksLived`, `pct`, and `clockStr` will all be wrong until a re-render is triggered by some other state change.
- Files: `src/hooks/useStats.ts`, `src/lib/calcStats.ts`
- Impact: Wrong week highlighted as current, wrong cycle number shown in CommandBar and LogSheet, log goes to wrong week key.
- Fix approach: Add a `Date.now()` dependency, or a time-based invalidation tick (e.g., once per minute) in `useStats`.

**`useStore` flat mega-store — all UI toggles in one object:**
- Issue: All ephemeral UI flags (`legendOpen`, `gotoOpen`, `aiOpen`, `menuOpen`, `menuSheet`, `timeSheet`, `logSheet`) live in a single Zustand store alongside persisted data. Every toggle causes a re-render in all subscribers, including grid components with thousands of cells.
- Files: `src/store/useStore.ts`
- Impact: Potential performance degradation as more UI state is added; harder to reason about re-render scope.
- Fix approach: Split ephemeral UI state into a separate non-persisted Zustand slice or local `useState` within each component that owns the toggle.

**`navigateSheet` calls `calcStats` directly on every navigation:**
- Issue: `navigateSheet` inside the store calls `calcStats(birthDate, lifespan)` directly on every arrow key or swipe, bypassing the memoized `useStats` hook. This is a redundant re-computation.
- Files: `src/store/useStore.ts` lines 231, 250, 258, 263
- Impact: Minor CPU waste on navigation; inconsistency — store-computed stats and hook-computed stats could diverge if logic diverges.
- Fix approach: Pass `stats` as an argument to `navigateSheet`, or compute it once and pass via closure.

**`goConfig()` resets lifespan to 90 but does not clear notes/moods/missionLog:**
- Issue: `goConfig` sets `{ birthDate: '', lifespan: 90, mission: '' }` but leaves `notes`, `moods`, `missionLog`, and `missionStartWeek` intact. If a user reconfigures with a different birth date, all existing note keys (e.g., `w3450`) remain in localStorage referencing a different timeline origin.
- Files: `src/store/useStore.ts` line 159
- Impact: Ghost data from a previous configuration leaks into a new configuration. Week-key-to-date mapping becomes incorrect.
- Fix approach: Show a confirmation modal and offer to clear all data, or clear on `goConfig`.

**`importFile` CSV parser is fragile:**
- Issue: The CSV column parser uses a regex `(".*?"|[^,]+)(?=,|$)` that does not handle: trailing commas, empty last columns, or multi-line quoted fields. Notes with embedded newlines will silently corrupt.
- Files: `src/components/dashboard/ImportExport.tsx` line 79
- Impact: Silent data loss or misaligned column reads on malformed CSVs.
- Fix approach: Use a proper CSV parser or at minimum add tests for edge cases.

**`doRestore` does not validate imported data shape:**
- Issue: `doRestore` parses JSON and conditionally applies `d.notes`, `d.moods`, and `d.config` with no schema validation. Any JSON file can overwrite store state. No type guards, no key-format verification, no bounds checking on `lifespan`.
- Files: `src/components/dashboard/ImportExport.tsx` lines 47–59
- Impact: Corrupt or user-crafted JSON can put the store into an invalid state (e.g., `lifespan: -5`, or notes with keys that crash `navigateSheet`).
- Fix approach: Add a validation function that checks note key format, lifespan range, and birthDate validity before applying.

**`dl()` leaks object URLs:**
- Issue: `URL.createObjectURL(blob)` creates a blob URL that is never revoked with `URL.revokeObjectURL`. On browsers that don't GC quickly, this accumulates memory per export action.
- Files: `src/components/dashboard/ImportExport.tsx` lines 145–150
- Impact: Minor memory leak per export call; negligible in practice but a known anti-pattern.
- Fix approach: Call `URL.revokeObjectURL(a.href)` after `a.click()`.

**`pick()` creates a detached file input element that is never cleaned up:**
- Issue: The `pick` helper in `ImportExport.tsx` creates `document.createElement('input')`, attaches an `onchange` handler, then calls `.click()`. The element is never appended to or removed from the DOM, and the handler closure is never freed.
- Files: `src/components/dashboard/ImportExport.tsx` lines 152–163
- Impact: Minor closure leak per import/restore operation.
- Fix approach: Append to body, remove after use, or use a ref'd `<input>` element in JSX.

## Known Bugs

**Relog flow bypasses `openLogSheet` guard via direct `useStore.setState`:**
- Symptoms: The "relog cycle" button in the already-logged menu calls `openLogSheet(-1)` (which with index `-1` would look up `moods[wk(-1)]` and `notes[wk(-1)]`) then immediately overrides with `useStore.setState`. The `-1` week index is a sentinel hack that relies on implementation details of `openLogSheet`.
- Files: `src/components/sheet/LogSheet.tsx` lines 239–240
- Trigger: Tapping "relog cycle" from the already-logged menu.
- Workaround: `useStore.setState` override makes it work, but it's fragile — if `openLogSheet` logic changes, the sentinel may stop working or write to `wk(-1)`.

**`useLiveTickers` only updates `live-hb` and `live-orb`; `live-mw` and `live-net` are never ticked:**
- Symptoms: `TerminalCounters` renders four rows with IDs `live-hb`, `live-mw`, `live-orb`, `live-net`. `useLiveTickers` only writes to `live-hb` and `live-orb`. `live-mw` (memory writes) and `live-net` (connections) display the static value from initial render and never update.
- Files: `src/hooks/useLiveTickers.ts` lines 22–31, `src/components/instruments/TerminalCounters.tsx` lines 8–13
- Impact: `live-mw` and `live-net` are presented as live metrics but are actually frozen.

**`gotoDate` always uses the current `tab` from state, never switches to `weeks`:**
- Symptoms: If the user is on the "months" or "years" tab and uses goto-date, `highlightWeek` is set but the display remains on months/years. The `hl-cell` element will not be found and `scrollIntoView` silently does nothing.
- Files: `src/store/useStore.ts` lines 319–328
- Trigger: Open "months" tab, use goto date to navigate to a specific week.

**`navigateSheet` for `month` type parses noteKey incorrectly for month 0:**
- Symptoms: The month noteKey format is `m{y}_{m}`. Parsing splits on `'m'` and then `'_'` — this works when `y > 0` but when `y === 0` and `m > 9`, the split produces unexpected results (e.g., `m0_10` → split on `'m'` gives `['', '0_10']` which is correct, but the logic is fragile string manipulation).
- Files: `src/store/useStore.ts` lines 241–251
- Impact: Low — would only surface with unusual birth date/month combinations, but the parsing approach is fragile compared to using a dedicated key-parsing function.

## Security Considerations

**No input sanitization on note text before localStorage write:**
- Risk: Notes are stored and retrieved as raw strings. They are rendered as React text content (not dangerouslySetInnerHTML), so XSS via notes is not an immediate risk. However, if any future rendering changes to HTML interpolation, notes would be a direct injection surface.
- Files: `src/store/useStore.ts` (setNote, saveSheetNote), `src/components/sheet/Sheet.tsx`
- Current mitigation: React escapes text content by default.
- Recommendations: Keep note display as React text nodes; document this constraint.

**`doRestore` accepts any JSON and applies it as store state with no origin check:**
- Risk: A user tricked into restoring a crafted backup file can overwrite their `birthDate`, `lifespan`, or all notes/moods with attacker-controlled values. No verification of file origin.
- Files: `src/components/dashboard/ImportExport.tsx` lines 47–59
- Current mitigation: File picker is user-initiated; app is local-only with no server.
- Recommendations: Add structural validation before applying restored state.

**`navigator.clipboard.writeText` used without fallback:**
- Risk: On older browsers or non-HTTPS origins, `navigator.clipboard` is undefined. The `.catch` handler gracefully shows a toast, but the underlying error is silently swallowed.
- Files: `src/components/dashboard/ImportExport.tsx` lines 96–99
- Current mitigation: Catch block handles failure.
- Recommendations: Accept as-is for this app's deployment target.

## Performance Bottlenecks

**WeekGrid renders ~4,680 divs on every notes/moods change:**
- Problem: `WeekGrid` renders one `<div>` per week for a 90-year lifespan (90 × 52 = 4,680 cells). Each cell is a new JSX element created inline with full inline style objects. There is no virtualization. The grid subscribes to `notes` and `moods` store keys, so any note save re-renders the entire grid.
- Files: `src/components/grid/WeekGrid.tsx`
- Cause: No memoization of cells; notes/moods are subscribed at the grid level.
- Improvement path: Memoize individual row components with `React.memo`, or virtualize rows using a windowing approach. Alternatively, separate the `hasNote` dot indicator into a thin overlay component subscribed only to its own key.

**`getWeekColor` called 4,680 times on every WeekGrid render:**
- Problem: `getWeekColor` performs floating point lerp math per-cell on every render. It is not memoized.
- Files: `src/components/grid/WeekGrid.tsx` line 67, `src/lib/colorSystem.ts`
- Cause: No caching of color outputs.
- Improvement path: Pre-compute the color map once when `birthDate` changes and store it in a `useMemo`.

**`buildChildren` for decade type is O(years × months × weeks):**
- Problem: Opening a decade sheet triggers `buildChildren` which iterates up to 10 years × 12 months, and for each month calls `weekNotesForMonth` which iterates up to ~4.3 weeks. On a user with many notes, this is acceptable, but the complexity scales with age.
- Files: `src/components/sheet/Sheet.tsx` lines 218–243
- Cause: No memoization; full scan on every sheet open.
- Improvement path: Memoize decade children by decade key + notes keys within that range.

**`setInterval` at 250ms writes to DOM bypassing React reconciliation:**
- Problem: `useLiveTickers` runs a `setInterval` every 250ms writing directly to DOM nodes. This is intentional for performance (avoiding re-renders), but if the target elements are ever unmounted and remounted (e.g., by a parent conditional), the interval continues writing to detached elements. The cleanup (`clearInterval`) is tied only to the `stats.daysLived` dep, not component unmount.
- Files: `src/hooks/useLiveTickers.ts`
- Cause: The `useEffect` returns `clearInterval` which does run on unmount — this is actually correct. The concern is that detached element writes would silently fail rather than error.
- Improvement path: Low priority; current implementation is correct on unmount.

## Fragile Areas

**`useStats` memoization means stats are frozen at mount time intra-day:**
- Files: `src/hooks/useStats.ts`
- Why fragile: `calcStats` is time-sensitive (calls `new Date()`) but `useMemo` dependencies are `[birthDate, lifespan]`. Any component relying on `stats.weeksLived` will get the value computed at the last render that changed config — not the current real-time value.
- Safe modification: Do not add `stats`-derived values to persistent store. Always derive from `calcStats(birthDate, lifespan)` at call time for time-critical checks.

**`noteKey` string format is load-bearing with no type system enforcement:**
- Files: `src/lib/dateUtils.ts`, `src/store/useStore.ts` (navigateSheet), `src/components/sheet/Sheet.tsx` (buildChildren)
- Why fragile: Key formats (`w{i}`, `m{y}_{m}`, `y{y}`, `d{d}`) are parsed with string manipulation (`slice(1)`, `split('m')`, `replace('y', '')`) in multiple places with no shared parser. If the format ever changes, each site must be updated independently.
- Safe modification: Any change to key format must update `wk`, `mk`, `yk`, `dk` factory functions AND all parsing sites in `navigateSheet` and `buildChildren`. Use `Grep` for `slice(1)` and `split('m')` to find all sites.

**`LogSheet` renders two `AnimatePresence` trees in the same component:**
- Files: `src/components/sheet/LogSheet.tsx`
- Why fragile: Both the log flow sheet and the already-logged menu sheet live in the same component, each wrapped in `AnimatePresence`. The `menuSheet` state is separate from `logSheet` state. If both flags are set simultaneously (possible via the relog hack on line 239), both sheets render and stack visually.
- Safe modification: Guard against both flags being true at once, or merge the two flows.

**`Sheet` uses `AnimatePresence` without `mode="wait"`, causing double overlays:**
- Files: `src/components/sheet/Sheet.tsx` lines 40–157
- Why fragile: If `sheet` changes quickly (via keyboard navigation), `AnimatePresence` may animate both the exiting and entering sheet simultaneously. With spring physics this creates a brief visual double-stack.
- Safe modification: Add `mode="wait"` to the `AnimatePresence` in Sheet, or debounce navigation.

**`colorSystem.ts` season calculation uses hardcoded day-of-year splines:**
- Files: `src/lib/colorSystem.ts` lines 10–18
- Why fragile: The `SPEAKS` array defines a color spline with sentinel values at `d: -50` and `d: 470`. The loop logic at lines 35–39 has a bug: the `break` inside `d < SPEAKS[1].d` always takes priority, so weeks in winter before day 15 fall through correctly, but the loop body is entered for every iteration unnecessarily. This is an implicit correctness dependency on array ordering.
- Safe modification: Do not reorder `SPEAKS` entries. Test color output for birth dates in December and January.

## Test Coverage Gaps

**No tests exist at all:**
- What's not tested: The entire codebase has no test files, no test runner configured, and no testing dependency in `package.json`.
- Files: All of `src/`
- Risk: Any refactor of `calcStats`, `dateUtils`, `colorSystem`, or `navigateSheet` can silently break date arithmetic, week indexing, or note key parsing with no safety net.
- Priority: High — `calcStats`, `dateUtils` (especially `dateToWeekIdx`, `weekRange`), `colorSystem`, and the `navigateSheet` state machine are pure logic functions that are directly testable.

**No error boundary in the component tree:**
- What's not tested: There is no React error boundary wrapping the app. If any component throws during render (e.g., `calcStats` receiving a malformed `birthDate`), the entire app white-screens with no recovery UI.
- Files: `src/App.tsx`, `src/main.tsx`
- Risk: User sees blank screen with no path to recovery except clearing localStorage manually.
- Priority: Medium — add a top-level error boundary that shows a "reset" button.

---

*Concerns audit: 2026-03-08*
