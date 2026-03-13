---
status: complete
phase: 02-external-forces-experience
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-implementation
started: 2026-03-13T07:05:00Z
updated: 2026-03-13T08:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. External Forces section appears in log flow
expected: Open the log sheet → complete mood + mission → reach note step. A divider + "> external forces" label appears below the textarea with a "scan signal" button. No events load automatically.
result: pass

### 2. scan signal fetches and displays an event
expected: Press "scan signal". A pulsing "scanning..." text appears briefly, then one event in "{year} — {text}" italic format appears in a fixed-height box.
result: pass

### 3. Show Next cycles events without saving
expected: Press "Show Next" several times. Events cycle through. The note textarea text and character count are unaffected. Nothing is saved yet.
result: pass

### 4. Add to Record saves the signal
expected: Press "Add to Record". A "Signal" block appears below with the event text in an editable textarea. The note textarea is unchanged.
result: pass

### 5. Signal block persists after save + reopen
expected: After adding to record, edit the Signal block text. Wait 1 second (debounce). Press "save entry" to close. Re-open the same week's note step. The edited Signal text is still there without re-fetching.
result: pass

### 6. Signal reset restores original text
expected: With a Signal block showing edited text, press "reset". The textarea reverts to the original event text (the summary from the API).
result: pass
note: reset button removed; × made prominent — sufficient for reset/clear flow

### 7. Signal clear removes the block
expected: Press "×" in the Signal block. The block disappears and you return to the cycling state (idle or loaded).
result: pass

### 8. Error state shows retry link
expected: If signal fetch fails (e.g., no API key and Wikipedia unreachable), the panel shows "No external signal" text and a "retry" link. Pressing retry attempts the fetch again.
result: pass

### 9. External Forces shows on direct grid click
expected: Click any past week square directly in the grid (not through the log flow button). The sheet that opens shows the note editor AND an External Forces section below — same "scan signal" panel as the log flow.
result: pass

### 10. Signals roll up into month view
expected: Open a month square. If any weeks in that month have a saved Signal, the Signal appears nested below that week's note row — labeled "Signal" with "{year} — {userText}" in muted italic.
result: pass

### 11. Save button says "save entry"
expected: In the note step of LogSheet (and in the direct-click week sheet), the save button reads "save entry" not just "save".
result: pass

### 12. Version shows v2.1
expected: The footer at the bottom of the dashboard shows "v2.1". The login/setup page footer also shows "v2.1".
result: pass

## Summary

total: 12
passed: 12
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
