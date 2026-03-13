# Phase 2: External Forces Experience - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the complete user-facing External Forces experience: on-demand Wikipedia fetch for any logged week, in-log-flow panel with event cycling and saving, visual treatment for saved forces, graceful API failure handling, and mobile-compatible layout.

This phase does NOT include import/export of external forces or grid search — those are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Cycling Philosophy
- Events are **shuffled randomly on load** — each session feels fresh, discovery-oriented
- **No count shown** (no "3 of 23") — just the event itself; meditative, not list-like
- At the last event, **loop silently back to the first** — no dead end indicator
- Saving an event is **non-blocking** — user can keep pressing "Show Next" after saving; the saved block stays visible below while cycling continues

### Trigger Button Language
- Button label: **Claude's discretion** — pick based on existing app vocabulary (SystemStatus, CommandBar, mission language — the dashboard register)
- Section structure in note step: **"External Forces" section label** (matching the `> log entry` stepLabel pattern), then trigger button below, separated from the textarea by a subtle divider
- If a saved force **already exists** for this week when the log opens: show the saved force block with a small **"replace" / "change" button** — user can re-open cycling without losing their existing signal
- Saved force block label: **"Signal"** (not "External Force" — shorter, atmospheric, consistent with the dashboard register)

### Panel Layout
- When events load, the **sheet grows taller** — textarea stays at 6 rows, the sheet slides up to accommodate the events panel. Do not shrink the textarea.
- **Same layout on mobile** — panel sits below textarea on all screen sizes. Touch-friendly buttons required (UX-01).
- Events panel is **fixed height** (~80px target) — long summaries truncate with ellipsis. No layout shift while cycling.
- **Cancel/Save footer stays at the very bottom** of the sheet — External Forces panel sits between textarea and the footer.

### Saved Force Editing Model
- Editable field **starts with the original Wikipedia summary text** — user edits from there
- A **"reset to original" button** restores the Wikipedia text if user has modified it (original `summary` field preserved in store alongside `userText`)
- A **small × / "clear" button** on the saved block calls `clearExternalForce(weekKey)` — user can unsave and return to cycling
- Edited text is saved **on change with a short debounce** (same pattern as the note textarea) — no explicit save button needed
- Cycling position **resets on return** to the note step — if user navigates away and back, events shuffle fresh

### Loading State
- While fetching: **pulsing/blinking text** in the muted italic style (e.g. "scanning..." or equivalent) — fits the amber cursor-blink aesthetic in CommandBar; no spinner
- All 7 daily fetches run in parallel (`Promise.all`) — **single loading state** for the whole batch; events appear all at once
- **Partial pool is fine** — if some days fail but others succeed, show the successful events silently. No indicator for partial failure.
- On full failure (all 7 fail or return no events): show **"No external signal"** + a small **"retry" link** to re-trigger the fetch
- After saving an event, **"Show Next" relabels to "Change Signal"** — signals that cycling now means replacing the saved choice
- **API timeout: Claude's discretion** — pick a sensible value given 7 parallel requests

### API Cache
- Cache **lasts the full browser session** — opening and closing the log for the same week does not refetch
- Cache lives in a **module-level Map** (outside React, at the fetch hook's module scope): `Map<dateString, WikiEvent[]>` — survives component unmount/remount

### Claude's Discretion
- Exact trigger button label (pick from app register — SystemStatus, CommandBar tone)
- Exact API timeout value (reasonable for 7 parallel requests)
- Pulsing animation implementation (CSS keyframes or Framer Motion — use existing `global.css` keyframes if suitable)
- Exact `~80px` height value for the events panel — adjust if needed for readability

</decisions>

<specifics>
## Specific Ideas

- The "scanning..." loading text should feel like the amber cursor blink in CommandBar — the dashboard already has that keyframe/pattern
- The saved block label is "Signal" (not "External Force") — keeps it short and consistent with the terminal/mission-control register
- The sheet already uses `AnimatePresence` + spring — height expansion should use the same spring config (`stiffness: 300, damping: 35`) for consistency

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `LogSheet.tsx:145-168` — `logStep === 'note'` block is the exact insertion point; External Forces panel goes after the textarea, before the `noteFooter`
- `LogSheet.module.css` — `s.stepLabel` pattern (`> log entry`) is reusable for the "External Forces" section header
- `useStore.ts` — `setExternalForce`, `updateExternalForceText`, `clearExternalForce` actions already exist from Phase 1; `externalForces` field already persisted
- `global.css` — existing `@keyframes` for amber cursor blink; check if reusable for the "scanning..." pulse
- `CommandBar.tsx` — reference for the amber cursor-blink style that loading state should match
- `Toast.tsx` — portal pattern, shows how to layer UI outside normal flow if needed

### Established Patterns
- CSS Modules + `--var` design tokens — all new styles must use tokens, never hardcoded colors
- Zustand selector pattern: `const { value, action } = useStore(s => ({ ... }))` — use in new ExternalForcesPanel component
- Framer Motion `AnimatePresence` + spring for sheet height expansion — same `stiffness: 300, damping: 35`
- No data-fetching libraries — raw `fetch` in a custom hook; module-level Map for cache (no `useRef`)
- Note textarea debounce pattern — reference when implementing `updateExternalForceText` debounce

### Integration Points
- **New component:** `src/components/sheet/ExternalForcesPanel.tsx` (and `.module.css`) — rendered inside `LogSheet.tsx` `logStep === 'note'` block
- **New hook:** `src/hooks/useExternalForces.ts` — handles fetch, cache (module-level Map), loading/error state, cycling index, shuffle
- **Store connection:** `useStore` → `externalForces[wk(weekIdx)]` for read; `setExternalForce`, `updateExternalForceText`, `clearExternalForce` for writes
- **`dateUtils.ts`** — `weekRange(birthDate, weekIdx)` already returns the 7 dates of the week; hook will use these to build 7 fetch URLs

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-external-forces-experience*
*Context gathered: 2026-03-12*
