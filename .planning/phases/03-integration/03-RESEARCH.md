# Phase 3: Integration - Research

**Researched:** 2026-03-13
**Domain:** CSV/JSON import-export extension + client-side text search with grid dimming
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Search Input Placement**
- Search input lives in the GridPanel header row — same area as the existing "legend" and "⌖ date" toggles
- Toggled — hidden until activated by a search button/icon; consistent with legend and goto-date pattern
- Dismissed via Escape key or an × clear button — same UX as the goto-date input
- Search works on the weeks tab only — months/years/decades are unaffected

**Search Dimming**
- Non-matching cells dim to opacity 0.15–0.2 — aggressive contrast so matching cells pop
- Matching cells get no extra highlight — not being dimmed is sufficient
- Search matches against userText first, then summary as fallback

**Search Match Preview (SEARCH-04)**
- Desktop: hovering a matched cell shows a tooltip with full preview — format: `Week {N} · note: "{excerpt}" · signal: "{excerpt}"`
- Mobile: first tap shows a preview strip below the grid (above CommandBar) with week label + full note excerpt + full signal excerpt; second tap (or tapping the strip) opens full LogSheet
- The preview strip / tooltip distinguishes match source by section label ("note:" vs "signal:")
- No separate dot color or border for match source

**JSON Backup (IO-01, IO-02)**
- `doBackup` exports `{ notes, moods, externalForces, config }` — `externalForces` at top level
- `doRestore` adds `if (d.externalForces) useStore.setState({ externalForces: d.externalForces })` — backward compat

**CSV Export (IO-03)**
- New column: `external_force_text` — contains `userText` if set, otherwise falls back to `summary`
- Existing columns unchanged: `date, title, note` + new `external_force_text` column appended
- All past weeks up to current are included even if both columns are empty

**CSV Import (round-trip)**
- `importFile` reads `external_force_text` column when present — writes to `externalForces` store as `{ userText: value, summary: value, year: '', url: undefined }`
- Backward compatible — CSVs without the column import notes-only as before
- Imported values are treated as `userText`

### Claude's Discretion
- Search button icon/label in the GridPanel header (pick from existing vocabulary — consistent with "⌖ date" style)
- Exact mobile preview strip layout and animation (use existing sheet spring config)
- Debounce duration for search input filtering (~150ms)
- Preview strip dismissal (tapping outside, Escape, or automatic on search clear)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| IO-01 | JSON backup export includes the `externalForces` field alongside `notes` and `moods` | `doBackup` in ImportExport.tsx line 41–45; single-line addition to the serialized object |
| IO-02 | JSON backup import gracefully handles files without `externalForces` (backward compat — missing treated as empty) | `doRestore` in ImportExport.tsx line 47–59; conditional `if (d.externalForces)` guard pattern already used for `d.notes` and `d.moods` |
| IO-03 | CSV export includes external force text as a clearly labeled separate column | `exportCSV` in ImportExport.tsx line 14–26; extend row construction to append `externalForces[wk(idx)]?.userText \|\| externalForces[wk(idx)]?.summary \|\| ''`; loop must cover all past weeks, not just `Object.keys(notes)` |
| SEARCH-01 | Search input added to GridPanel header area | GridPanel.tsx header already has `gotoBtn`/`gotoOpen` toggle pattern; search replicates it with a text `<input>` instead of `<input type="date">` |
| SEARCH-02 | Non-matching week cells are visually dimmed while search is active | WeekGrid.tsx cell `style` object already has `transition: 'filter 0.15s'`; add `opacity` to that inline style based on match set |
| SEARCH-03 | Search works across all past weeks, not just current | Match set is computed once across all `externalForces` + `notes` keys; WeekGrid reads computed set via Zustand selector |
| SEARCH-04 | Match source indicated via tooltip (desktop) / preview strip (mobile) | Desktop: HTML `title` attr replaced with a custom tooltip div on hover. Mobile: a fixed strip rendered in GridPanel below the grid and above CommandBar |
</phase_requirements>

## Summary

Phase 3 is a pure wiring phase — no new data structures, no new API calls, no new persistence keys. Everything it needs already exists: the `externalForces` store field (STORE-01), the `ExternalForce` type with `userText`/`summary`, the `ImportExport.tsx` functions with clearly identified insertion points, and the GridPanel header toggle pattern. The highest-complexity work is the WeekGrid search dimming: 4,680 cells re-render on any state change, so the matched-set computation must happen outside the render loop via a Zustand selector or `useMemo` keyed to the search query string, never inline per-cell.

The CSV export loop requires a scope change: today `exportCSV` iterates `Object.keys(notes)` which only covers weeks with notes. The new requirement is all past weeks up to current (empty rows included) so the round-trip edit workflow is viable. This means driving the loop from `weekIdx 0..weeksLived` rather than from the notes keys. The CSV import parser uses positional column index; extending it requires reading column index 3 (`external_force_text`) and writing to `externalForces` store.

The mobile preview strip is new UI surface, but the aesthetic and animation model are identical to the existing bottom-sheet: `AnimatePresence` + spring `{ stiffness: 300, damping: 35 }`, dark `var(--bg-panel)` background, amber accents, CSS Modules tokens. No library additions are required for any part of Phase 3.

**Primary recommendation:** Implement in three plans — (1) IO changes only (doBackup, doRestore, exportCSV, importFile), (2) search state + WeekGrid dimming, (3) tooltip + mobile preview strip.

## Standard Stack

### Core (already installed — no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | existing | search query state + setSearchQuery action | Single store pattern; search query must be global so preview strip can read tapped cell |
| React 18 | existing | GridPanel search row, preview strip rendering | Project stack |
| Framer Motion | existing | preview strip slide-up animation | `AnimatePresence` + spring already used for all sheets |
| CSS Modules | existing | search input + preview strip styles | No hardcoded values — tokens.css only |

### No New Dependencies
Phase 3 requires zero new npm packages. Search is pure client-side string matching. Export is `Blob` + `URL.createObjectURL`. Import is `FileReader`. All are native browser APIs already used in ImportExport.tsx.

**Installation:**
```bash
# No new packages required
```

## Architecture Patterns

### Recommended File Changes
```
src/
  components/
    dashboard/
      ImportExport.tsx          # doBackup, doRestore, exportCSV, importFile changes
    grid/
      GridPanel.tsx             # search toggle button, searchRow, pass query to WeekGrid
      GridPanel.module.css      # searchInput, searchRow, searchBtn, searchClear styles
      WeekGrid.tsx              # accept searchQuery prop or store selector; apply dim opacity
  store/
    useStore.ts                 # searchQuery: string + setSearchQuery action (ephemeral UI state)
tests/
  importExport.test.ts          # unit tests for IO-01, IO-02, IO-03 (pure logic, no DOM needed)
  gridSearch.test.tsx           # unit tests for SEARCH-01 through SEARCH-04
```

### Pattern 1: Toggle Row (matches existing gotoOpen pattern)
**What:** A boolean UI state in the store drives conditional rendering of a row below the GridPanel header.
**When to use:** The search input row appears/disappears exactly as `gotoRow` does — same conditional mount, same CSS class, same focus-on-open behavior.

Existing goto pattern:
```typescript
// Source: GridPanel.tsx line 89-100
{gotoOpen && (
  <div className={s.gotoRow}>
    <input ref={gotoRef} type="date" className={s.gotoInput} ... />
    <button className={s.gotoGo} onClick={handleGoto}>go →</button>
  </div>
)}
```

Search pattern mirrors this:
```typescript
// New: searchOpen state + searchQuery state in store
{searchOpen && tab === 'weeks' && (
  <div className={s.searchRow}>
    <input
      ref={searchRef}
      type="text"
      className={s.searchInput}
      placeholder="search notes + signals…"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Escape' && (setSearchQuery(''), setSearchOpen(false))}
    />
    {searchQuery && (
      <button className={s.searchClear} onClick={() => setSearchQuery('')}>×</button>
    )}
  </div>
)}
```

### Pattern 2: Computed Match Set (outside render loop)
**What:** Derive the set of matching week indices once, as a `Set<number>`, keyed to the current `searchQuery`. Pass it as a prop to WeekGrid or read via a store-derived value.
**When to use:** Always. The WeekGrid render loop touches 4,680 cells. String matching inside the loop per-cell is a per-render O(n) cost that will noticeably lag on mid-range mobile when the user types.

```typescript
// Source: STATE.md concern — WeekGrid re-renders 4,680 cells on any note save
// Place this computation in GridPanel, pass as prop:
const matchedWeeks = useMemo<Set<number>>(() => {
  if (!searchQuery.trim()) return new Set()
  const q = searchQuery.toLowerCase()
  const matched = new Set<number>()
  // Check notes
  Object.entries(notes).forEach(([key, text]) => {
    if (key.startsWith('w') && text.toLowerCase().includes(q)) {
      matched.add(+key.slice(1))
    }
  })
  // Check externalForces
  Object.entries(externalForces).forEach(([key, ef]) => {
    const searchText = (ef.userText || ef.summary || '').toLowerCase()
    if (searchText.includes(q)) matched.add(+key.slice(1))
  })
  return matched
}, [searchQuery, notes, externalForces])
```

### Pattern 3: Cell Dimming (opacity on inline style)
**What:** WeekGrid cells already have `transition: 'filter 0.15s'` in their inline style. Add `opacity` to the same style object.
**When to use:** When `searchQuery` is non-empty and cell index is not in `matchedWeeks`.

```typescript
// Source: WeekGrid.tsx line 86-96 (existing style object)
style={{
  flex: 1,
  aspectRatio: '1',
  borderRadius: 1,
  background: bg,
  border,
  boxShadow: shadow,
  position: 'relative',
  minWidth: 0,
  cursor: 'pointer',
  userSelect: 'none',
  // NEW: dim non-matching cells when search is active
  opacity: searchQuery && !matchedWeeks.has(i) ? 0.15 : 1,
  transition: 'filter 0.15s, opacity 0.2s',
}}
```

### Pattern 4: CSV Loop Scope Change
**What:** Today `exportCSV` iterates `Object.keys(notes)` — only weeks with notes. New requirement: iterate from week 0 to `weeksLived` inclusive.
**When to use:** For the new `exportCSV` that must produce rows for every past week even if empty.

```typescript
// Source: ImportExport.tsx line 14-26 — replace notes-key iteration with index loop
function exportCSV() {
  const stats = calcStats(birthDate, lifespan)
  const rows = [['date', 'title', 'note', 'external_force_text']]
  for (let idx = 0; idx <= stats.weeksLived; idx++) {
    const s = new Date(birthDate)
    s.setDate(s.getDate() + idx * 7)
    const dateStr = s.toISOString().split('T')[0]
    const note = notes[wk(idx)] || ''
    const ef = externalForces[wk(idx)]
    const efText = ef ? (ef.userText || ef.summary || '') : ''
    rows.push([dateStr, `week ${idx + 1}`, note, efText])
  }
  const csv = rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n')
  dl(new Blob([csv], { type: 'text/csv' }), 'life-system-timeline.csv')
  showToast('csv exported')
}
```

### Pattern 5: CSV Import Column Extension (positional parsing)
**What:** `importFile` CSV branch parses columns by positional index. `cols[0]` = date, `cols[1]` = title, `cols[2]` = note, `cols[3]` = external_force_text (new). The column is optional for backward compat.

```typescript
// Source: ImportExport.tsx line 77-87
text.trim().split('\n').slice(1).forEach((line) => {
  const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || []
  const clean = (c: string) => c.replace(/^"|"$/g, '').replace(/""/g, '"')
  const ds = clean(cols[0] || '')
  const note = clean(cols[2] || cols[1] || '')
  const efText = cols[3] ? clean(cols[3]) : ''  // NEW: optional column
  if (!ds) return
  const idx = dateToWeekIdx(birthDate, ds)
  if (idx >= 0) {
    updates[wk(idx)] = note.slice(0, 140)
    if (efText) {
      efUpdates[wk(idx)] = { userText: efText, summary: efText, year: 0, url: undefined }
    }
    imported++
  }
})
useStore.setState((s) => ({ notes: { ...s.notes, ...updates } }))
if (Object.keys(efUpdates).length > 0) {
  useStore.setState((s) => ({ externalForces: { ...s.externalForces, ...efUpdates } }))
}
```

### Pattern 6: Mobile Preview Strip
**What:** A fixed-position panel rendered inside GridPanel (not a portal) that slides up from below the grid when a matched cell is tapped on mobile. Uses the same spring animation as Sheet.tsx.
**When to use:** When `searchQuery` is active AND a matched cell has been tapped AND we're on mobile (detected via `window.innerWidth <= 640` or a CSS media query class).

The strip renders:
- Week label: `Week {N} · {weekRange}`
- If note match: `note: "{excerpt up to 80 chars}"`
- If signal match: `signal: "{ef.userText or ef.summary}"`
- Second tap on the strip (or "open" button) calls `openSheet(...)` for that week

```typescript
// Animation — same config as Sheet.tsx line 59
<motion.div
  initial={{ y: '100%', opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: '100%', opacity: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 35 }}
  className={s.previewStrip}
>
  {/* strip content */}
</motion.div>
```

### Pattern 7: Desktop Tooltip for Match Preview
**What:** A custom `div` shown on `onMouseEnter` positioned relative to the cell, replacing the native `title` attribute (which doesn't support multi-line styled content). The tooltip is rendered as a child of the cell `div` with `position: absolute` + z-index.
**When to use:** Desktop only. Mobile gets the strip instead.

```typescript
// Inside the cell render, when searchQuery && matchedWeeks.has(i)
{showTooltip && (
  <div className={s.matchTooltip}>
    <span className={s.tooltipWeek}>Week {i + 1}</span>
    {notes[wk(i)] && <span className={s.tooltipNote}>note: "{notes[wk(i)].slice(0, 60)}"</span>}
    {externalForces[wk(i)] && (
      <span className={s.tooltipSignal}>
        signal: "{(externalForces[wk(i)].userText || externalForces[wk(i)].summary || '').slice(0, 60)}"
      </span>
    )}
  </div>
)}
```

### Anti-Patterns to Avoid
- **String matching inside the WeekGrid render loop:** Compute the matched Set once in GridPanel via `useMemo`; pass as prop. Never compute per-cell.
- **Using `innerHTML` for tooltip content:** Tooltip text comes from user notes — must use React JSX, not `innerHTML`.
- **Modifying the CSV regex parser for multi-column:** The existing `match(/(".*?"|[^,]+)(?=,|$)/g)` regex has a known limitation with empty trailing columns. For the new column 3, always default to `cols[3] ? clean(cols[3]) : ''` with the optional guard.
- **Storing `searchQuery` in local component state:** It must be in the Zustand store (ephemeral, not persisted) so GridPanel, WeekGrid, and the preview strip can all read it without prop-drilling.
- **Making `exportCSV` loop `Object.keys(notes)` for the new format:** This would miss weeks that have an external force but no personal note. Loop from `0..weeksLived`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slide-up preview strip animation | Custom CSS keyframe | Framer Motion `AnimatePresence` + spring | Already installed; spring config defined in Sheet.tsx |
| CSV parsing | Custom state machine | Existing regex + `clean()` helper in importFile | Pattern already handles quoting; just extend positionally |
| Debouncing search input | `setTimeout`/`clearTimeout` raw | Same debounce pattern as ExternalForcesPanel textarea (400ms) | Keep consistent debounce approach; ~150ms for search |
| Portal for tooltip | `ReactDOM.createPortal` | Inline absolute-positioned child of the cell | Simpler; cells are already `position: relative` |

**Key insight:** This phase has no new infrastructure — all patterns are established. The risk is breaking existing behavior (existing CSV import, existing backup restore) via the scope changes.

## Common Pitfalls

### Pitfall 1: CSV Regex Misses Empty Trailing Columns
**What goes wrong:** The existing regex `match(/(".*?"|[^,]+)(?=,|$)/g)` does not match empty fields at the end of a line. If `external_force_text` is an empty quoted string `""`, the match array may have only 3 entries instead of 4.
**Why it happens:** The regex pattern requires at least one character between commas or at end-of-line; empty `""` at the trailing position may not match.
**How to avoid:** Always use `cols[3] ? clean(cols[3]) : ''` with the optional guard. Also ensure the export always writes 4 columns (even if empty), so the import can rely on index 3 being present in well-formed files from this app.
**Warning signs:** Unit test where an exported CSV with empty `external_force_text` is re-imported — verify the import does not write a spurious empty-string entry to the store.

### Pitfall 2: WeekGrid Re-render Storm on Each Keystroke
**What goes wrong:** If `searchQuery` is read directly inside WeekGrid or matched per-cell, every keystroke causes the store to update, WeekGrid re-renders 4,680 cells, and `String.includes()` runs 4,680 times synchronously.
**Why it happens:** Zustand re-renders all subscribers when subscribed state changes.
**How to avoid:** Compute `matchedWeeks: Set<number>` in GridPanel via `useMemo` before rendering WeekGrid. Pass as a prop. WeekGrid only needs the Set for opacity, not the raw query string.
**Warning signs:** >16ms frame time during typing; jank on mid-range devices.

### Pitfall 3: Debounce and Derived Set Mismatch
**What goes wrong:** If search query is debounced at the store level (i.e., `setSearchQuery` is debounced), the displayed input value will lag the typed characters.
**Why it happens:** Input `value` is bound to store state; debouncing the setter makes the input feel broken.
**How to avoid:** Keep the input as uncontrolled OR store raw `searchQuery` immediately (no debounce on the string itself). Debounce only the expensive computation — the `useMemo` recomputes synchronously but only when `searchQuery` changes; that is cheap enough. The ~150ms debounce was intended for the `useMemo` computation trigger, not the input's displayed value. Use a `useDeferredValue(searchQuery)` pattern if needed for React 18 concurrency, but given the app's existing non-concurrent render model, a plain `useMemo` is sufficient.
**Warning signs:** Input feels laggy or shows stale characters while user types.

### Pitfall 4: doBackup Missing `externalForces` Selector
**What goes wrong:** `doBackup` currently reads `notes` and `moods` from the component's `useStore` selectors but does not select `externalForces`. Adding it to the backup JSON without selecting it from the store means it will always export an empty object.
**Why it happens:** ImportExport.tsx only selects what it needs; `externalForces` is not currently in the selector list.
**How to avoid:** Add `const externalForces = useStore((s) => s.externalForces)` to the ImportExport component, then include it in `doBackup`.
**Warning signs:** Backup file has `"externalForces": {}` even though forces are saved — verify by checking localStorage `ls_v3` vs backup file content.

### Pitfall 5: Preview Strip Z-index Conflict
**What goes wrong:** The preview strip rendered below the grid may be occluded by the CommandBar (fixed bottom bar).
**Why it happens:** CommandBar is likely `position: fixed` with a high `z-index`.
**How to avoid:** Render the strip with `position: fixed; bottom: {CommandBar height + margin}px; z-index: {above grid, below sheet}`. Check existing z-index layers. The strip is not a sheet — it should sit above grid content but below LogSheet/Sheet overlays.
**Warning signs:** Strip is invisible or partially clipped on mobile; Framer Motion animation still runs but strip is behind CommandBar.

### Pitfall 6: CONCERNS.md Object URL and Input Leaks
**What goes wrong:** The existing `dl()` function leaks object URLs (`URL.createObjectURL` without `revokeObjectURL`), and `pick()` creates unattached `<input>` elements. Phase 3 calls both functions in the new CSV path.
**Why it happens:** Pre-existing issue documented in CONCERNS.md.
**How to avoid:** Do not make this worse. The plan should acknowledge the pre-existing leak and add a comment noting it, but Phase 3 should not introduce new leak sites. If time permits, add `URL.revokeObjectURL(a.href)` after `a.click()` in `dl()`.

## Code Examples

Verified patterns from reading the actual source files:

### doBackup Change (IO-01)
```typescript
// Source: ImportExport.tsx line 41–45 — current
function doBackup() {
  const data = JSON.stringify({ notes, moods, config: { birthDate, lifespan, mission } }, null, 2)
  dl(new Blob([data], { type: 'application/json' }), 'life-system-backup.json')
  showToast('backup downloaded')
}

// New — add externalForces at top level alongside notes and moods
function doBackup() {
  const data = JSON.stringify({ notes, moods, externalForces, config: { birthDate, lifespan, mission } }, null, 2)
  dl(new Blob([data], { type: 'application/json' }), 'life-system-backup.json')
  showToast('backup downloaded')
}
```

### doRestore Change (IO-02)
```typescript
// Source: ImportExport.tsx line 47–59 — current
function doRestore() {
  pick('.json', (text) => {
    try {
      const d = JSON.parse(text)
      if (d.notes) useStore.setState({ notes: d.notes })
      if (d.moods) useStore.setState({ moods: d.moods })
      if (d.config?.birthDate) {
        useStore.setState({ birthDate: d.config.birthDate, lifespan: d.config.lifespan || 90, mission: d.config.mission || '' })
      }
      showToast('restore complete')
    } catch { showToast('invalid backup file') }
  })
}

// New — add externalForces guard (backward compat: missing field → empty, no error)
// Insert after d.moods check:
if (d.externalForces) useStore.setState({ externalForces: d.externalForces })
```

### Store Changes (searchQuery state)
```typescript
// Source: useStore.ts — add to State interface (ephemeral, not persisted)
searchQuery: string
searchOpen: boolean

// Add to actions:
setSearchQuery: (q: string) => void
setSearchOpen: (open: boolean) => void

// Initial state:
searchQuery: '',
searchOpen: false,

// Implementations:
setSearchQuery: (q) => set({ searchQuery: q }),
setSearchOpen: (open) => set({ searchOpen: open }),
// searchQuery and searchOpen are NOT added to partialize()
```

### GridPanel Header Addition (SEARCH-01)
```typescript
// Source: GridPanel.tsx line 36-48 — existing header, add search button alongside gotoBtn
<button
  className={`${s.gotoBtn} ${searchOpen ? s.gotoBtnActive : ''}`}
  onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchRef.current?.focus(), 60) }}
>
  ⌕ search
</button>
```

### WeekGrid Props Extension (SEARCH-02, SEARCH-03)
```typescript
// Source: WeekGrid.tsx line 9-13 — extend Props
interface Props {
  stats: Stats
  birthDate: string
  searchQuery?: string       // empty string or undefined = no active search
  matchedWeeks?: Set<number> // pre-computed in GridPanel
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Object.keys(notes) loop in exportCSV | Loop from 0..weeksLived for complete row coverage | Phase 3 | Larger CSV file; all past weeks present for round-trip editing |
| Backup omits externalForces | Backup includes externalForces at top level | Phase 3 | Full portability; old backups still restore gracefully |
| No grid search | Search toggle in GridPanel header, opacity dimming in WeekGrid | Phase 3 | Discoverability across 4,680 cells |

**Deprecated/outdated:**
- None. This phase adds to existing code without removing existing behavior.

## Open Questions

1. **CSV regex and empty trailing column**
   - What we know: The existing regex `match(/(".*?"|[^,]+)(?=,|$)/g)` is used in `importFile`. It has known behavior with trailing empty fields.
   - What's unclear: Whether `""` (empty quoted string) as column 4 will be matched by this regex when at end-of-line.
   - Recommendation: Write a unit test with an exported CSV where `external_force_text` is empty, verify the regex parses 4 columns. If not, consider splitting on commas with a proper quote-aware parser for the new column path only.

2. **Mobile vs desktop detection for preview strip**
   - What we know: The app has no explicit breakpoint detection in JS. CSS modules handle responsive layout via media queries.
   - What's unclear: Whether the preview strip should always render (and CSS hides it on desktop) vs. being conditionally rendered via a JS width check.
   - Recommendation: Render the strip always via React, use CSS to show/hide based on `@media (hover: none)` (touch devices) vs `(hover: hover)` (pointer devices). This avoids a JS window.innerWidth dependency and handles foldables correctly.

3. **Tooltip z-index and overflow clipping**
   - What we know: WeekGrid cells are inside a flex container that may have `overflow: hidden` from parent panels.
   - What's unclear: Whether a child `position: absolute` tooltip on a cell will be clipped by an ancestor `overflow: hidden`.
   - Recommendation: Test during implementation. If clipped, consider `position: fixed` tooltip positioned via `getBoundingClientRect()` on `onMouseEnter` event, matching the existing `gotoDate`/`highlightWeek` DOM measurement pattern.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + @testing-library/react + MSW (all installed from Phase 2) |
| Config file | `vitest.config.ts` (root); setupFiles: `src/setupTests.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| IO-01 | doBackup JSON includes `externalForces` field | unit | `npx vitest run tests/importExport.test.ts -t "doBackup"` | ❌ Wave 0 |
| IO-02 | doRestore with old backup (no `externalForces`) succeeds without error | unit | `npx vitest run tests/importExport.test.ts -t "doRestore"` | ❌ Wave 0 |
| IO-03 | exportCSV produces 4-column rows with `external_force_text`; all past weeks included | unit | `npx vitest run tests/importExport.test.ts -t "exportCSV"` | ❌ Wave 0 |
| IO-03 | importFile CSV reads column 3 into externalForces store; backward compat with 3-col CSV | unit | `npx vitest run tests/importExport.test.ts -t "importFile"` | ❌ Wave 0 |
| SEARCH-01 | Search toggle button renders in GridPanel; searchRow appears on click | unit | `npx vitest run tests/gridSearch.test.tsx -t "SEARCH-01"` | ❌ Wave 0 |
| SEARCH-02 | Non-matching cells have opacity 0.15-0.2; matching cells have opacity 1 | unit | `npx vitest run tests/gridSearch.test.tsx -t "SEARCH-02"` | ❌ Wave 0 |
| SEARCH-03 | matchedWeeks Set computed across all notes + externalForces keys | unit | `npx vitest run tests/gridSearch.test.tsx -t "SEARCH-03"` | ❌ Wave 0 |
| SEARCH-04 | Tooltip format: `Week N · note: "..." · signal: "..."` | unit | `npx vitest run tests/gridSearch.test.tsx -t "SEARCH-04"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/importExport.test.ts` — covers IO-01, IO-02, IO-03 (doBackup, doRestore, exportCSV, importFile)
- [ ] `tests/gridSearch.test.tsx` — covers SEARCH-01 through SEARCH-04 (matchedWeeks logic, opacity prop, tooltip format)

*(Note: ImportExport.tsx functions call `dl()` and `pick()` which touch DOM APIs. Tests should mock `URL.createObjectURL`, `document.createElement`, and `FileReader` or extract the pure logic into testable helper functions.)*

## Sources

### Primary (HIGH confidence)
- Direct code read: `src/components/dashboard/ImportExport.tsx` — exact function signatures, insertion points for all IO changes
- Direct code read: `src/components/grid/GridPanel.tsx` — header structure, gotoOpen/gotoRow toggle pattern
- Direct code read: `src/components/grid/WeekGrid.tsx` — cell render loop, existing `style` object, filter transition
- Direct code read: `src/store/useStore.ts` — ExternalForce type, externalForces field, partialize list, existing UI ephemeral state pattern
- Direct code read: `src/components/grid/GridPanel.module.css` — gotoRow/gotoInput/gotoGo/gotoBtnActive styles to replicate
- Direct code read: `src/components/sheet/Sheet.tsx` — AnimatePresence + spring config for preview strip
- Direct code read: `vitest.config.ts` + `src/setupTests.ts` + `tests/mocks/` — full test infrastructure confirmed

### Secondary (MEDIUM confidence)
- Direct code read: `tests/useExternalForces.test.ts` + `tests/ExternalForcesPanel.test.tsx` — Phase 2 test patterns; Phase 3 tests should match structure
- Direct code read: `.planning/codebase/CONCERNS.md` (via STATE.md) — WeekGrid re-render concern and pre-existing dl()/pick() leak confirmed

### Tertiary (LOW confidence)
- None required; all findings are from direct source inspection.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; all existing libraries confirmed in source
- Architecture: HIGH — insertion points verified against actual source code line numbers
- Pitfalls: HIGH — WeekGrid re-render concern documented in STATE.md; CSV regex limitation verified by reading the actual regex

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable codebase; no external API changes needed for this phase)
