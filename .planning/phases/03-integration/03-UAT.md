---
status: complete
phase: 03-integration
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md, always-on-preview-session
started: 2026-03-14T00:00:00Z
updated: 2026-03-14T01:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. JSON backup includes externalForces
expected: Open Import/Export panel → click "backup". Open the downloaded JSON file. It contains an "externalForces" key at the top level alongside "notes" and "moods".
result: pass

### 2. Restore old backup without externalForces succeeds silently
expected: Create a backup JSON, manually delete the "externalForces" key from it, then restore it via Import/Export. The app accepts the file and restores without any error or crash. Existing externalForces data is untouched.
result: pass

### 3. CSV export has external_force_text column
expected: Click "export CSV" in Import/Export. Open the file. The header row has 4 columns: date, title, note, external_force_text. Weeks with a saved signal have text in the 4th column.
result: pass

### 4. Search toggle appears and opens input
expected: In the weeks grid, the GridPanel header shows a "⌕ search" button alongside "⌖ date". Clicking it reveals a text input row below the header. Clicking it again hides the input.
result: pass

### 5. Typing a query dims non-matching cells
expected: With the search input open, type a word that appears in one of your saved notes. All week cells that don't match dim to roughly 15% opacity. The matching cell(s) stay at full brightness.
result: pass

### 6. Escape closes search and restores all cells
expected: With a query typed and cells dimmed, press Escape in the search input. The input closes, the query clears, and all cells return to full opacity.
result: pass

### 7. Desktop tooltip on search-matched cell hover
expected: With a search query active (cells dimmed), hover the mouse over a matched (bright) week cell. A tooltip appears above the cell showing "WEEK N · [date range]", then "note: '...'" and/or "signal: '...'" excerpts. Non-matched cells show no tooltip.
result: pass

### 8. Mobile preview strip on first tap of matched cell
expected: On a touch device (or DevTools touch mode), with search active, tap a matched week cell once. A strip slides up from the bottom (above the command bar) showing the week label, note and/or signal text, and "tap to open full entry →". A second tap on the strip opens the full sheet.
result: pass

### 9. Always-on tooltip: content cell without search active
expected: Close/clear search so no query is active. Hover the mouse over any week cell that has a note or saved signal (marked with a ● dot). A tooltip appears above the cell showing "WEEK N · [date range]", note excerpt, and/or signal excerpt. Cells with no content show no tooltip.
result: pass

### 10. Always-on strip: content cell on mobile without search
expected: On a touch device (or DevTools touch mode), with no search query active, tap any past week cell that has a note or signal. The preview strip slides up showing the content. A second tap opens the full sheet.
result: skipped
reason: touch device not available

### 11. Strip dismisses when switching tabs
expected: While the mobile preview strip is visible (after tapping a content cell), tap a different tab (months, years, or decades). The strip dismisses immediately and does not reappear when switching back to the weeks tab.
result: skipped
reason: mobile tests deferred

### 12. Strip reads as elevated overlay
expected: When the preview strip appears, it looks visually distinct from the grid panel — darker background, with a visible upward shadow. It does not blend in with the panel below it.
result: skipped
reason: mobile tests deferred

### 13. Tooltip date range renders in normal case
expected: In the tooltip header, the "WEEK N" label is uppercase, but the date range (e.g., "Jan 3 – Jan 9") renders in normal mixed case, not uppercase.
result: pass

### 14. Mood-only cells do not show tooltip
expected: If a week has a logged mood but no note text and no saved signal, hovering that cell does NOT show a tooltip (the tooltip would be empty). The ● dot indicator may or may not appear, but no empty tooltip pops up.
result: pass

## Summary

total: 14
passed: 11
issues: 0
pending: 0
skipped: 3
skipped: 0

## Gaps

[none yet]
