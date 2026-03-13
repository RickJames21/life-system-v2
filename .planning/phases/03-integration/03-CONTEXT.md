# Phase 3: Integration - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Make external forces portable and searchable: include `externalForces` in JSON backup/restore and CSV export/import (with full round-trip support), and add a text search input to the week grid that dims non-matching cells and shows match previews.

This phase does NOT include multiple forces per week, day-level filtering, or new standalone views for external forces.

</domain>

<decisions>
## Implementation Decisions

### Search Input Placement
- Search input lives in the **GridPanel header row** — same area as the existing "legend" and "⌖ date" toggles
- **Toggled** — hidden until activated by a search button/icon; consistent with legend and goto-date pattern
- Dismissed via **Escape key or an × clear button** — same UX as the goto-date input
- Search works on the **weeks tab only** — months/years/decades are unaffected; requirements scope to week cells

### Search Dimming
- Non-matching cells dim to **opacity 0.15–0.2** — aggressive contrast so matching cells pop
- Matching cells get **no extra highlight** — not being dimmed is sufficient
- Search matches against **userText first, then summary as fallback** — searches what the user actually sees

### Search Match Preview (SEARCH-04)
- **Desktop:** Hovering a matched cell shows a tooltip with full preview — format: `Week {N} · note: "{excerpt}" · signal: "{excerpt}"`
- **Mobile:** First tap on a matched cell shows a **preview strip below the grid** (above CommandBar) with week label + full note excerpt + full signal excerpt; second tap (or tapping the strip) opens the full LogSheet
- The preview strip / tooltip distinguishes match source naturally by section label ("note:" vs "signal:")
- **No separate dot color or border** for match source — tooltip/strip is the indicator

### JSON Backup (IO-01, IO-02)
- `doBackup` exports `{ notes, moods, externalForces, config }` — `externalForces` at **top level** alongside notes and moods, mirroring the Zustand store shape
- `doRestore` adds `if (d.externalForces) useStore.setState({ externalForces: d.externalForces })` — graceful backward compat: old backups without the field are silently handled (missing = empty)

### CSV Export (IO-03)
- New column: **`external_force_text`** — contains `userText` if set, otherwise falls back to `summary`
- Existing columns unchanged: `date, title, note` + new `external_force_text` column appended
- **All past weeks up to current** are included in the export, even if both note and external_force_text are empty — the primary use case is round-trip editing (export → edit in spreadsheet → reimport)

### CSV Import (round-trip)
- `importFile` reads the `external_force_text` column when present — writes to `externalForces` store as `{ userText: value, summary: value, year: '', url: undefined }`
- Backward compatible — CSVs without the column import notes-only as before
- Imported external_force_text values are treated as `userText` (user-owned text, not raw API data)

### Claude's Discretion
- Search button icon/label in the GridPanel header (pick from existing vocabulary — consistent with "⌖ date" style)
- Exact mobile preview strip layout and animation (use existing sheet spring config)
- Debounce duration for search input filtering (keep it snappy, ~150ms)
- How to handle the preview strip dismissal (tapping outside, Escape, or automatic on search clear)

</decisions>

<specifics>
## Specific Ideas

- The CSV round-trip is the primary export use case — "export, make bulk changes or additions, reimport." Every past week row should be present even if empty, so users can fill in notes for any week in a spreadsheet.
- The preview strip on mobile should feel like the existing bottom-sheet aesthetic — dark panel, amber accents, not a jarring modal.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ImportExport.tsx:41-58` — `doBackup` and `doRestore` are the exact insertion points for `externalForces`. Both use `useStore.setState` directly.
- `ImportExport.tsx:14-26` — `exportCSV()` builds rows from `notes` keys; extend to join `externalForces[wk(idx)]` for the new column.
- `ImportExport.tsx:61-91` — `importFile` parses CSV columns by index; add `external_force_text` column handling here.
- `GridPanel.tsx:36-48` — Header row with `headerLeft` (legend toggle) and `gotoBtn` (goto-date toggle) — search toggle goes here.
- `GridPanel.tsx:89-100` — `gotoRow` pattern (conditional input row below header) — search input row follows the same pattern.
- `WeekGrid.tsx` — 4,680 cell render loop; search filtering must happen via a Zustand selector or derived value, not inline per-cell logic (per STATE.md concern about re-renders).
- `GridPanel.module.css` — `gotoInput`, `gotoGo`, `gotoRow` styles — reference for search input styling consistency.

### Established Patterns
- CSS Modules + `--var` design tokens — all new styles must use tokens
- Zustand selector pattern — `const { externalForces } = useStore(s => ({ externalForces: s.externalForces }))` — search filter derived via selector
- Raw `fetch` not needed here — search is purely client-side computation
- STATE.md concern: WeekGrid re-renders 4,680 cells — keep search query in a store selector, compute matched set outside the render loop

### Integration Points
- **`GridPanel.tsx`** — Add search toggle button to header, conditional search input row, pass active query down to `WeekGrid`
- **`WeekGrid.tsx`** — Accept `searchQuery` prop or read from store; apply dim opacity to non-matching cells
- **`ImportExport.tsx`** — Three changes: `doBackup` + `doRestore` + `exportCSV` + `importFile`
- **`useStore.ts`** — May need `searchQuery: string` + `setSearchQuery` action if search state is global (needed for preview strip to know which cell is tapped on mobile)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-integration*
*Context gathered: 2026-03-13*
