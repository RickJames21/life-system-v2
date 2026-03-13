# Phase 2: External Forces Experience - Research

**Researched:** 2026-03-12
**Domain:** Wikipedia REST API, React custom hooks, Framer Motion sheet expansion, CSS animation
**Confidence:** HIGH (all architectural decisions already locked; API details MEDIUM due to 403 on direct fetch)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Cycling Philosophy**
- Events are shuffled randomly on load — each session feels fresh, discovery-oriented
- No count shown (no "3 of 23") — just the event itself; meditative, not list-like
- At the last event, loop silently back to the first — no dead end indicator
- Saving an event is non-blocking — user can keep pressing "Show Next" after saving; the saved block stays visible below while cycling continues

**Trigger Button Language**
- Button label: Claude's discretion (pick based on existing app vocabulary — SystemStatus, CommandBar, mission language — the dashboard register)
- Section structure in note step: "External Forces" section label (matching the `> log entry` stepLabel pattern), then trigger button below, separated from the textarea by a subtle divider
- If a saved force already exists for this week when the log opens: show the saved force block with a small "replace" / "change" button — user can re-open cycling without losing their existing signal
- Saved force block label: "Signal" (not "External Force" — shorter, atmospheric, consistent with the dashboard register)

**Panel Layout**
- When events load, the sheet grows taller — textarea stays at 6 rows, the sheet slides up to accommodate the events panel. Do not shrink the textarea.
- Same layout on mobile — panel sits below textarea on all screen sizes. Touch-friendly buttons required (UX-01).
- Events panel is fixed height (~80px target) — long summaries truncate with ellipsis. No layout shift while cycling.
- Cancel/Save footer stays at the very bottom of the sheet — External Forces panel sits between textarea and the footer.

**Saved Force Editing Model**
- Editable field starts with the original Wikipedia summary text — user edits from there
- A "reset to original" button restores the Wikipedia text if user has modified it (original `summary` field preserved in store alongside `userText`)
- A small × / "clear" button on the saved block calls `clearExternalForce(weekKey)` — user can unsave and return to cycling
- Edited text is saved on change with a short debounce (same pattern as the note textarea) — no explicit save button needed
- Cycling position resets on return to the note step — if user navigates away and back, events shuffle fresh

**Loading State**
- While fetching: pulsing/blinking text in the muted italic style (e.g. "scanning..." or equivalent) — fits the amber cursor-blink aesthetic in CommandBar; no spinner
- All 7 daily fetches run in parallel (`Promise.all`) — single loading state for the whole batch; events appear all at once
- Partial pool is fine — if some days fail but others succeed, show the successful events silently. No indicator for partial failure.
- On full failure (all 7 fail or return no events): show "No external signal" + a small "retry" link to re-trigger the fetch
- After saving an event, "Show Next" relabels to "Change Signal" — signals that cycling now means replacing the saved choice
- API timeout: Claude's discretion — pick a sensible value given 7 parallel requests

**API Cache**
- Cache lasts the full browser session — opening and closing the log for the same week does not refetch
- Cache lives in a module-level Map (outside React, at the fetch hook's module scope): `Map<dateString, WikiEvent[]>` — survives component unmount/remount

### Claude's Discretion
- Exact trigger button label (pick from app register — SystemStatus, CommandBar tone)
- Exact API timeout value (reasonable for 7 parallel requests)
- Pulsing animation implementation (CSS keyframes or Framer Motion — use existing `global.css` keyframes if suitable)
- Exact `~80px` height value for the events panel — adjust if needed for readability

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| API-01 | Wikipedia "On This Day" events fetched on demand only — triggered by user button press, never automatically | Hook exposes trigger function, not auto-fetch on mount |
| API-02 | API responses cached in memory per calendar date — cycling and re-opening do not refetch | Module-level `Map<string, WikiEvent[]>` outside React component tree |
| API-03 | If API unavailable or returns no events, UI shows "No external signal" without breaking log flow | Try/catch in `Promise.all`, error state in hook, graceful render path |
| LOG-01 | "External Forces" section appears in note step below personal note, separated by subtle divider; trigger button inside | `ExternalForcesPanel` inserted in `LogSheet.tsx` at `logStep === 'note'` block, lines 145-168 |
| LOG-02 | After trigger + events load, panel displays one event at a time: `{year} — {one-line summary}` muted italic | Hook state: `events[]`, `currentIndex`; render uses `events[currentIndex]` |
| LOG-03 | Two buttons appear once loaded: "Show Next" cycles without saving, "Add to Record" saves current | Panel conditional render based on hook `status === 'loaded'` |
| LOG-04 | "Add to Record" saves currently displayed event to `externalForces` store for that week | Call `setExternalForce(weekKey, { year, summary: text, userText: text, url })` |
| LOG-05 | Saved external force displayed below personal notes in visually distinct block labeled "Signal" | Separate CSS block with `--bg-inset` background, `--text-dim` label; never merged with note text |
| LOG-06 | Saved external force block is editable inline | `textarea` pre-filled with `userText`, debounced `updateExternalForceText` on change |
| UX-01 | External Forces panel usable on mobile — touch-friendly cycle controls, readable text | Buttons sized ≥ 44px tap target; no hover-only interactions; tested at 375px viewport |
| UX-02 | Typography and color feel like a quiet annotation — muted, not competing with personal content | Use `--text-secondary` / `--text-dim` for event text; `font-style: italic`; subdued background |
</phase_requirements>

---

## Summary

Phase 2 delivers the complete External Forces UI on top of the Phase 1 store foundation (already complete: `externalForces` field, `setExternalForce`, `updateExternalForceText`, `clearExternalForce`). The implementation has two new files — `useExternalForces.ts` (fetch hook) and `ExternalForcesPanel.tsx` (component + CSS module) — plus a focused surgical edit to `LogSheet.tsx`.

The Wikipedia REST API (`en.wikipedia.org/api/rest_v1/feed/onthisday/events/MM/DD`) works from a browser with no authentication; CORS is supported for simple GET requests. Each event object has `year` (number) and `text` (string) fields that map directly to the display requirement. Seven parallel `fetch` calls cover the week's dates with `Promise.all`; a module-level `Map` keyed by `YYYY-MM-DD` satisfies the session-level cache requirement at zero cost.

The panel slots into the existing `logStep === 'note'` block between the textarea and `noteFooter`. Sheet height expansion reuses the existing Framer Motion spring config (`stiffness: 300, damping: 35`). The loading pulse reuses the `blink` keyframe already defined in `global.css`. No new dependencies are needed.

**Primary recommendation:** Build `useExternalForces` as a pure state machine hook (idle → loading → loaded → error) with the module-level cache, then wire `ExternalForcesPanel` as a presentational consumer of that hook. Keep all fetch logic out of the component.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 18 | ^18.3.1 | Component + hook authoring | Already in project |
| Framer Motion | ^11.3.31 | Sheet height animation, AnimatePresence | Already in project; matches existing spring config |
| Zustand | ^4.5.4 | Store reads/writes for external forces | Already in project; actions exist from Phase 1 |
| native `fetch` | browser built-in | Wikipedia API calls | Project pattern — no data-fetching libraries |
| CSS Modules | vite native | Scoped styles for ExternalForcesPanel | Project pattern throughout |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `global.css` `@keyframes blink` | existing | Loading pulse animation | Reuse for "scanning..." text; no new keyframe needed |
| `dateUtils.ts` `weekRange` | existing | Compute 7 dates from weekIdx | Use to generate fetch URLs |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `en.wikipedia.org/api/rest_v1` | `api.wikimedia.org/feed/v1` | Wikimedia endpoint requires `Api-User-Agent` header + optional OAuth; REST v1 works as anonymous CORS GET — simpler for a static app with no backend |
| module-level Map | `useRef` | `useRef` resets on unmount; module Map survives remount, satisfying the session-cache requirement at zero cost |
| CSS keyframe pulse | Framer Motion animate | CSS keyframe is simpler for text opacity blink; Framer Motion unnecessary overhead for a single blinking text node |

**Installation:** No new packages needed. All dependencies already present.

---

## Architecture Patterns

### Recommended Project Structure (new files only)

```
src/
  hooks/
    useExternalForces.ts      # Fetch, cache, state machine, cycling
  components/
    sheet/
      ExternalForcesPanel.tsx       # UI component — triggers, cycling, saved block
      ExternalForcesPanel.module.css
```

Edit to existing file:
```
src/components/sheet/LogSheet.tsx   # Insert <ExternalForcesPanel> in logStep==='note' block
```

### Pattern 1: Hook as State Machine

**What:** `useExternalForces` manages a clear set of states: `idle | loading | loaded | error`. The trigger function transitions from `idle` to `loading` to `loaded | error`. The component never calls fetch directly.

**When to use:** Any time async operations have meaningful intermediate states that drive UI branch rendering.

**Example:**
```typescript
// src/hooks/useExternalForces.ts

export interface WikiEvent {
  year: number
  text: string
  url?: string
}

type Status = 'idle' | 'loading' | 'loaded' | 'error'

// Session-level cache — survives unmount/remount
const cache = new Map<string, WikiEvent[]>()

export function useExternalForces(birthDate: string, weekIdx: number) {
  const [status, setStatus] = useState<Status>('idle')
  const [events, setEvents] = useState<WikiEvent[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)

  const trigger = useCallback(async () => {
    // Build 7 date strings for the week
    const dates = getDatesForWeek(birthDate, weekIdx)  // uses weekRange logic

    // Check if all 7 are already cached
    const allCached = dates.every(d => cache.has(d))
    if (allCached) {
      const pool = buildPool(dates)
      setEvents(shuffle(pool))
      setStatus('loaded')
      return
    }

    setStatus('loading')
    try {
      const results = await Promise.all(
        dates.map(d => fetchEventsForDate(d))
      )
      // Cache each date's result
      dates.forEach((d, i) => cache.set(d, results[i]))
      const pool = shuffle(results.flat())
      if (pool.length === 0) {
        setStatus('error')
        return
      }
      setEvents(pool)
      setCurrentIdx(0)
      setStatus('loaded')
    } catch {
      setStatus('error')
    }
  }, [birthDate, weekIdx])

  const next = useCallback(() => {
    setCurrentIdx(i => (i + 1) % events.length)
  }, [events.length])

  return { status, events, currentIdx, trigger, next }
}
```

### Pattern 2: Wikipedia API Fetch

**What:** Single-date fetch with AbortController timeout. Returns `WikiEvent[]` (empty array on any error — partial failures are silent).

**When to use:** Each of the 7 daily URL fetches.

**Example:**
```typescript
// Source: Wikipedia REST API (verified: endpoint pattern confirmed via multiple community sources)
// Endpoint: https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/MM/DD

const TIMEOUT_MS = 5000  // 5s per request; 7 parallel — worst case ~5s total

async function fetchEventsForDate(dateStr: string): Promise<WikiEvent[]> {
  // dateStr: "YYYY-MM-DD"
  const [, mm, dd] = dateStr.split('-')
  const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) return []
    const data = await res.json()
    // Response: { events: [ { year: number, text: string, pages: [...] } ] }
    return (data.events ?? []).map((e: { year: number; text: string }) => ({
      year: e.year,
      text: e.text,
    }))
  } catch {
    clearTimeout(timer)
    return []
  }
}
```

### Pattern 3: ExternalForcesPanel Component Structure

**What:** Presentational component receiving weekKey + weekIdx + birthDate. Reads saved force from store, calls hook for cycling state.

**When to use:** Inserted in `LogSheet.tsx` after textarea, before noteFooter, only when `logStep === 'note'`.

**Insertion point in LogSheet.tsx (lines 145-168):**
```tsx
if (logStep === 'note') {
  const rem = 500 - logNote.length
  body = (
    <>
      <div className={s.stepLabel}>&gt; log entry <span style={{ opacity: 0.5 }}>optional</span></div>
      <textarea ... />

      {/* INSERT HERE — between textarea and noteFooter */}
      <ExternalForcesPanel weekIdx={weekIdx} birthDate={birthDate} />

      <div className={s.noteFooter}>
        ...
      </div>
    </>
  )
}
```

### Pattern 4: Debounced Store Write

**What:** On change of the editable saved-force textarea, debounce the `updateExternalForceText` call — identical to how note autosave should work. Use a `useRef` for the timer.

**Example:**
```typescript
// Same pattern referenced in LogSheet for note text
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
  const val = e.target.value
  if (debounceRef.current) clearTimeout(debounceRef.current)
  debounceRef.current = setTimeout(() => {
    updateExternalForceText(weekKey, val)
  }, 400)
}
```

### Pattern 5: Sheet Height Expansion

**What:** The `LogSheet.tsx` sheet `motion.div` uses `animate={{ y: 0 }}` with spring transition. When `ExternalForcesPanel` mounts inside `.body`, the sheet naturally grows to fit its content because the sheet has no fixed `max-height` set (only `max-width: 540px`).

Verify the sheet `.body` has `overflow-y: auto` and `flex: 1` — confirmed in `LogSheet.module.css` line 74-78. The panel will simply push the sheet taller as its content renders. No explicit height animation required beyond the natural flexbox growth.

If smooth height transition is desired on panel appearance, wrap the panel in:
```tsx
<AnimatePresence>
  {panelVisible && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
    >
      <ExternalForcesPanel ... />
    </motion.div>
  )}
</AnimatePresence>
```

### Anti-Patterns to Avoid

- **Auto-fetching on mount:** Hook must only fetch when `trigger()` is called. No `useEffect` with auto-run. Violates API-01.
- **Storing events in Zustand:** Events are ephemeral session data. Only the saved force goes to the store. Storing events in Zustand persists stale Wikipedia data across sessions.
- **Merging saved force text into note text:** LOG-05 requires "never merged." The saved force block must be a separate `externalForces[weekKey]` record, rendered separately, never concatenated into `notes[weekKey]`.
- **Spinner or progress indicator:** Use blinking "scanning..." text only. No spinner element.
- **Hardcoded colors:** All colors must use `--var` tokens. Never hardcode hex inside `ExternalForcesPanel.module.css`.
- **useRef for cache:** Use module-level `Map`, not `useRef`. `useRef` resets when the component unmounts; module-level Map does not.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Shuffle algorithm | Custom Fisher-Yates | Standard Fisher-Yates in hook | Trivial but must be correct; use the well-known `for i from n-1 down to 1: swap(i, random(0,i))` exactly |
| Timeout on fetch | Manual `setTimeout` + `Promise.race` | `AbortController` + `setTimeout` calling `abort()` | `Promise.race` leaves the fetch running; `AbortController` actually cancels the network request and cleans up |
| Debounce | Inline timeout in event handler | `useRef`-based debounce (project pattern) | Inline handlers create new timers on every keystroke without cleanup |

**Key insight:** The Wikipedia API's response is already one-line summaries. Do not summarize or truncate the `text` field in JS — use CSS `text-overflow: ellipsis` on a single-line container so the full text is readable on large screens and gracefully truncated on small.

---

## Common Pitfalls

### Pitfall 1: Wikipedia API CORS — Wrong Endpoint

**What goes wrong:** `api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/MM/DD` returns CORS preflight errors in a browser without authentication headers because it requires an `Api-User-Agent` and may require a bearer token for some apps.

**Why it happens:** The Wikimedia API portal endpoint has stricter authentication requirements than the legacy REST v1 endpoint.

**How to avoid:** Use `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/MM/DD` — this endpoint is explicitly browser-accessible with anonymous CORS GET requests. No auth headers required.

**Warning signs:** 403 or CORS preflight failure in browser console on the first fetch attempt.

### Pitfall 2: Month/Day Zero-Padding

**What goes wrong:** `weekRange` returns dates in `en-US` locale format like "Mar 8, 2026". Using this string to build the Wikipedia URL produces `/M/D` (not zero-padded), which the API rejects.

**Why it happens:** The API expects `/MM/DD` (zero-padded, e.g. `/03/08`).

**How to avoid:** Compute dates from `birthDate` using `new Date(birthDate)` + `setDate(idx * 7 + dayOffset)`, then extract `.getMonth() + 1` and `.getDate()`, then use `.toString().padStart(2, '0')` for both.

**Warning signs:** API returns 404 for dates like `/3/8`.

### Pitfall 3: Empty Pool on All-Failure Treated as Success

**What goes wrong:** `Promise.all` resolves (because each individual fetch returns `[]` on error), but `results.flat()` is empty. If the code proceeds to `setStatus('loaded')` with an empty array, cycling breaks with no events.

**Why it happens:** Partial failure silently returns `[]` per date — the pool aggregation must check length before setting `loaded`.

**How to avoid:** After `results.flat()`, check `pool.length === 0` and set `status('error')` to render "No external signal" instead.

**Warning signs:** Panel shows "loaded" state with no event text visible.

### Pitfall 4: Cycling Index Out of Bounds After Reset

**What goes wrong:** User was at index 5 of 8 events. Log closes and reopens. Hook resets (`currentIdx = 0`) but if events were not cleared, stale index remains.

**Why it happens:** The CONTEXT.md decision is "Cycling position resets on return to the note step." If hook state is not reset on unmount/remount, stale index persists.

**How to avoid:** Hook starts at `status: 'idle'` and `currentIdx: 0` on each mount. Because the hook lives inside `ExternalForcesPanel` which only renders during `logStep === 'note'`, it unmounts when the log closes — React resets all hook state on remount. No explicit cleanup needed. The module-level cache persists (desired); the hook's local state does not.

### Pitfall 5: Saved Force Overwrite on "Show Next"

**What goes wrong:** After saving event A, user presses "Show Next" (which becomes "Change Signal"). If the cycling button immediately calls `setExternalForce` on every iteration, it overwrites the saved force each time without user intent.

**Why it happens:** Coupling the cycling action to the save action.

**How to avoid:** "Show Next" / "Change Signal" only updates `currentIdx` — it never calls `setExternalForce`. Only the "Add to Record" / explicit save button calls `setExternalForce`. Visually, the saved block persists below while the cycling panel shows unsaved candidates above.

### Pitfall 6: Sheet Body Scroll Interference

**What goes wrong:** The sheet `.body` has `overflow-y: auto`. Adding the External Forces panel increases content height. On small mobile screens, content may overflow and scroll inside the body div, pushing the `noteFooter` out of view.

**Why it happens:** The sheet has no explicit `max-height`, so very tall content on small screens could extend below the viewport.

**How to avoid:** Give the sheet a `max-height: 90vh` (or `min(90vh, 600px)`) CSS constraint. The `.body` flex child already has `overflow-y: auto` — this ensures the footer stays visible. Also keep the events panel at a fixed height (`~80px`) per the CONTEXT.md decision to prevent layout shift.

---

## Code Examples

### Wikipedia API — Verified Endpoint and Response Shape

```typescript
// Source: en.wikipedia.org/api/rest_v1 — confirmed accessible as anonymous CORS GET
// Response shape (MEDIUM confidence — confirmed via community sources and search results)

// GET https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/03/12
// Response:
// {
//   events: [
//     {
//       year: 1925,
//       text: "The first bus service...",
//       html: "<span>...</span>",
//       no_year_html: "...",
//       links: [ { title: "...", link: "https://en.wikipedia.org/wiki/..." } ],
//       pages: [ { title, displaytitle, thumbnail, ... } ]
//     },
//     ...
//   ]
// }

// For this feature: only `year` and `text` are consumed.
// `pages[0].content_urls.desktop.page` provides the article URL if needed for `ExternalForce.url`.
```

### Module-Level Cache Pattern

```typescript
// Outside the hook function — module scope
// Key: "YYYY-MM-DD", Value: WikiEvent[] (may be [] for dates with no results or failed fetches)
const eventCache = new Map<string, WikiEvent[]>()
```

### Loading State — Blink Animation

```css
/* ExternalForcesPanel.module.css */
/* Reuses @keyframes blink from global.css — no new keyframe needed */
.scanning {
  font-size: 12px;
  color: var(--text-dim);
  font-style: italic;
  font-family: var(--font-mono);
  animation: blink 1.2s step-end infinite;  /* same as CommandBar .cursor */
}
```

### Event Display — Fixed Height, Ellipsis

```css
/* ExternalForcesPanel.module.css */
.eventText {
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.eventYear {
  font-size: 11px;
  color: var(--text-dim);
  font-family: var(--font-mono);
  margin-bottom: 4px;
}
```

### Saved Force "Signal" Block

```css
/* ExternalForcesPanel.module.css */
.signalBlock {
  background: var(--bg-inset);
  border: 1px solid var(--border-dim);
  border-radius: var(--r-md);
  padding: 10px 12px;
  margin-top: 10px;
}

.signalLabel {
  font-size: 9px;
  color: var(--text-deep);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
  font-family: var(--font-mono);
}

.signalTextarea {
  width: 100%;
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  line-height: 1.6;
}
```

### Trigger Button (Claude's Discretion — Recommendation)

Based on the app vocabulary (CommandBar uses `>` prompt, SystemStatus uses status labels like NOMINAL/DEGRADED, mission language uses imperative verbs):

**Recommended label:** `"scan signal"` — verb phrase, lowercase, imperative, fits the terminal/mission-control register established by CommandBar (`> scan signal`).

After saving: label on cycling button becomes `"change signal"`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JSONP Wikipedia requests | CORS-enabled REST v1 | Wikipedia REST API v1 launched ~2015 | `fetch()` works directly; no JSONP workarounds |
| Wikipedia Action API (`/w/api.php`) | Feed REST API (`/api/rest_v1/feed/onthisday`) | REST v1 added ~2015, stable since | Structured JSON with typed fields; no wikitext parsing |

**Not deprecated:** The `en.wikipedia.org/api/rest_v1/feed/onthisday/events/MM/DD` endpoint is maintained and actively used by the Wikipedia mobile app. The `api.wikimedia.org` portal endpoint is the newer but stricter alternative — not needed here.

---

## Open Questions

1. **Wikipedia API exact `url` field for events**
   - What we know: `pages[0]` in the response contains article metadata including URLs
   - What's unclear: Whether a clean `content_urls.desktop.page` field exists on every event's pages array
   - Recommendation: Make `ExternalForce.url` optional (already typed as `url?: string`). Attempt to extract from `pages[0]?.content_urls?.desktop?.page` but do not break if absent.

2. **Wikipedia API rate limiting for 7 parallel requests**
   - What we know: The Wikimedia REST API has rate limits; anonymous requests are throttled more aggressively
   - What's unclear: Exact RPM limits for the `rest_v1` feed endpoint from anonymous browser clients
   - Recommendation: 7 parallel requests per session open is well within typical limits (Wikipedia mobile app makes equivalent calls). The session cache means a given week is only fetched once. No rate-limit handling needed for v1.

3. **Sheet `max-height` constraint**
   - What we know: The sheet currently has no explicit `max-height`; `.body` has `overflow-y: auto`
   - What's unclear: On very small devices (iPhone SE, 568px height), the sheet + panel may push the footer off screen
   - Recommendation: Add `max-height: min(92vh, 640px)` to `.sheet` in `LogSheet.module.css` as part of this phase. Safe change — only affects sheets taller than the viewport.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — no `vitest`, `jest`, or test files found in project |
| Config file | None — Wave 0 gap |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| API-01 | Fetch is not triggered on mount | unit | `vitest run tests/useExternalForces.test.ts` | ❌ Wave 0 |
| API-02 | Second trigger for same week uses cache, no new fetch | unit | `vitest run tests/useExternalForces.test.ts` | ❌ Wave 0 |
| API-03 | All-failure returns error status; partial failure returns loaded status with partial pool | unit | `vitest run tests/useExternalForces.test.ts` | ❌ Wave 0 |
| LOG-01 | ExternalForcesPanel renders in note step; not in other steps | unit | `vitest run tests/ExternalForcesPanel.test.tsx` | ❌ Wave 0 |
| LOG-02 | After trigger, event text rendered as `{year} — {text}` | unit | `vitest run tests/ExternalForcesPanel.test.tsx` | ❌ Wave 0 |
| LOG-03 | "Show Next" and "Add to Record" buttons appear after load | unit | `vitest run tests/ExternalForcesPanel.test.tsx` | ❌ Wave 0 |
| LOG-04 | "Add to Record" calls `setExternalForce` with correct weekKey and force object | unit | `vitest run tests/ExternalForcesPanel.test.tsx` | ❌ Wave 0 |
| LOG-05 | Saved block labeled "Signal"; rendered separately from note textarea | unit | `vitest run tests/ExternalForcesPanel.test.tsx` | ❌ Wave 0 |
| LOG-06 | Editing saved block textarea calls `updateExternalForceText` (debounced) | unit | `vitest run tests/ExternalForcesPanel.test.tsx` | ❌ Wave 0 |
| UX-01 | Buttons have min 44px tap target | manual | Inspect in browser DevTools at 375px | manual-only |
| UX-02 | Event text uses muted color, italic, not amber | manual | Visual inspection | manual-only |

### Sampling Rate

- **Per task commit:** `vitest run tests/useExternalForces.test.ts tests/ExternalForcesPanel.test.tsx`
- **Per wave merge:** Same (only two test files in this phase)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/useExternalForces.test.ts` — covers API-01, API-02, API-03; requires `vitest` + `@testing-library/react` + `msw` (Mock Service Worker) for fetch mocking
- [ ] `tests/ExternalForcesPanel.test.tsx` — covers LOG-01 through LOG-06; requires `@testing-library/react` + `jsdom`
- [ ] `vitest.config.ts` — framework config
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/user-event jsdom msw`

*Note: If the plan opts not to install a test framework in this phase, UX-01 and UX-02 remain manual-only, and API-01 through LOG-06 are validated by code review + manual testing. This is acceptable for a single-developer project of this size.*

---

## Sources

### Primary (HIGH confidence)
- `src/store/useStore.ts` — ExternalForce type, store actions, partialize config (all Phase 1 complete)
- `src/components/sheet/LogSheet.tsx` — exact insertion point for ExternalForcesPanel (lines 145-168)
- `src/styles/global.css` — `@keyframes blink` exists at line 24-27; reusable for scanning animation
- `src/components/commandBar/CommandBar.module.css` — `.cursor` uses `animation: blink 1.2s step-end infinite` (confirmed pattern)
- `src/styles/tokens.css` — all CSS custom properties verified
- `.planning/phases/02-external-forces-experience/02-CONTEXT.md` — all locked decisions

### Secondary (MEDIUM confidence)
- Wikipedia REST API endpoint `en.wikipedia.org/api/rest_v1/feed/onthisday/events/MM/DD` — confirmed via WebSearch cross-referencing multiple developer community posts and the Wikimedia API portal listing
- Response structure `{ events: [ { year, text, html, no_year_html, links, pages } ] }` — confirmed via history.muffinlabs.com documentation (which wraps the same Wikipedia data) and multiple community code examples
- CORS support for anonymous GET requests on `en.wikipedia.org/api/rest_v1` — confirmed via MediaWiki CORS documentation and freeCodeCamp forum discussions

### Tertiary (LOW confidence)
- `pages[0].content_urls.desktop.page` as URL field — inferred from Wikipedia API conventions; could not directly verify via fetch due to 403 on tool fetch (likely IP-based rate limit, not auth issue)
- 5-second timeout adequacy for 7 parallel requests — reasonable estimate; no official SLA documented

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project, no new dependencies
- Architecture: HIGH — insertion point precisely identified in existing code, store actions already exist
- Wikipedia API endpoint: MEDIUM — URL pattern verified via multiple sources; response shape verified via proxy documentation; could not do live fetch due to tool limitations
- Pitfalls: HIGH — derived from direct code inspection + API documented behavior
- CSS patterns: HIGH — all tokens and keyframes read directly from source files

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (Wikipedia REST API is stable; 30-day window appropriate)
