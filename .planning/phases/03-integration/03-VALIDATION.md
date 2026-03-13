---
phase: 3
slug: integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @testing-library/react + MSW (all installed from Phase 2) |
| **Config file** | `vitest.config.ts` (root); setupFiles: `src/setupTests.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 0 | IO-01, IO-02, IO-03 | unit stubs | `npx vitest run tests/importExport.test.ts` | ❌ Wave 0 | ⬜ pending |
| 3-01-02 | 01 | 0 | SEARCH-01 through SEARCH-04 | unit stubs | `npx vitest run tests/gridSearch.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 3-02-01 | 02 | 1 | IO-01 | unit | `npx vitest run tests/importExport.test.ts -t "doBackup"` | ❌ Wave 0 | ⬜ pending |
| 3-02-02 | 02 | 1 | IO-02 | unit | `npx vitest run tests/importExport.test.ts -t "doRestore"` | ❌ Wave 0 | ⬜ pending |
| 3-02-03 | 02 | 1 | IO-03 | unit | `npx vitest run tests/importExport.test.ts -t "exportCSV"` | ❌ Wave 0 | ⬜ pending |
| 3-02-04 | 02 | 1 | IO-03 | unit | `npx vitest run tests/importExport.test.ts -t "importFile"` | ❌ Wave 0 | ⬜ pending |
| 3-03-01 | 03 | 1 | SEARCH-01 | unit | `npx vitest run tests/gridSearch.test.tsx -t "SEARCH-01"` | ❌ Wave 0 | ⬜ pending |
| 3-03-02 | 03 | 1 | SEARCH-02, SEARCH-03 | unit | `npx vitest run tests/gridSearch.test.tsx -t "SEARCH-02"` | ❌ Wave 0 | ⬜ pending |
| 3-04-01 | 04 | 2 | SEARCH-04 | unit + manual | `npx vitest run tests/gridSearch.test.tsx -t "SEARCH-04"` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/importExport.test.ts` — failing stubs for IO-01, IO-02, IO-03 (doBackup, doRestore, exportCSV, importFile)
- [ ] `tests/gridSearch.test.tsx` — failing stubs for SEARCH-01 through SEARCH-04 (matchedWeeks logic, opacity prop, tooltip format)

*Note: ImportExport.tsx functions call `dl()` and `pick()` which touch DOM APIs. Tests should mock `URL.createObjectURL`, `document.createElement`, and `FileReader`, or extract pure logic into testable helpers.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile preview strip slide-up on cell tap | SEARCH-04 | Touch interaction; cannot simulate tap sequence in Vitest DOM | Enable search, type query, tap a matched cell on mobile/DevTools touch mode, verify strip slides up with note + signal preview |
| Desktop tooltip hover shows full preview | SEARCH-04 | CSS hover state not reliably testable in JSDOM | Enable search, type query, hover a matched cell on desktop, verify tooltip shows `Week N · note: "..." · signal: "..."` |
| CSV round-trip: export → open in spreadsheet → edit → reimport | IO-03 | File download/upload flow; real file system | Export CSV, open in Numbers/Excel, edit a note or add external_force_text, save, reimport — verify changes appear in app |
| Backup restore backward compat | IO-02 | Real file with missing `externalForces` field | Use a backup from Phase 1/2, restore it — verify app loads correctly without errors, externalForces stays empty |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
