// tests/gridSearch.test.tsx
// Plan 03-01 Wave 0: Failing stubs for SEARCH-01 through SEARCH-04
// These are it.todo stubs — they appear as pending in vitest output, not failures.
//
// Implementation note for Wave 1:
// - Import GridPanel from src/components/grid/GridPanel.tsx
// - Use store reset pattern: useStore.setState({ ... }) before each test
// - Mock useStore or provide a wrapper with test data for render
// - JSDOM cannot reliably test CSS hover; mobile strip and tooltip tests remain
//   as it.todo — manual verification required per 03-VALIDATION.md

import { describe, it } from 'vitest'

// ─────────────────────────────────────────────────────────────────────────────
describe('SEARCH-01: search toggle', () => {
  it.todo('search button renders in GridPanel header')
  it.todo('clicking search button shows search input row')
  it.todo('search input is focused on open')
  it.todo('Escape key dismisses search input and clears query')
  it.todo('× clear button appears when query is non-empty')
})

// ─────────────────────────────────────────────────────────────────────────────
describe('SEARCH-02: cell dimming', () => {
  it.todo('cells not matching searchQuery have opacity 0.15-0.2')
  it.todo('cells matching searchQuery have opacity 1')
  it.todo('all cells have opacity 1 when searchQuery is empty')
})

// ─────────────────────────────────────────────────────────────────────────────
describe('SEARCH-03: match scope', () => {
  it.todo('matchedWeeks includes weeks matched by personal note')
  it.todo('matchedWeeks includes weeks matched by externalForce userText')
  it.todo('matchedWeeks includes weeks matched by externalForce summary (fallback)')
  it.todo('matchedWeeks covers all weeks, not just current week')
})

// ─────────────────────────────────────────────────────────────────────────────
describe('SEARCH-04: match preview', () => {
  // manual verification required per 03-VALIDATION.md — CSS hover + touch events not reliably testable in JSDOM
  it.todo('desktop: hovering matched cell shows tooltip with Week N label')
  // manual verification required per 03-VALIDATION.md — CSS hover + touch events not reliably testable in JSDOM
  it.todo('desktop: tooltip shows note: excerpt when note matches')
  // manual verification required per 03-VALIDATION.md — CSS hover + touch events not reliably testable in JSDOM
  it.todo('desktop: tooltip shows signal: excerpt when externalForce matches')
  // manual verification required per 03-VALIDATION.md — CSS hover + touch events not reliably testable in JSDOM
  it.todo('mobile: tapping matched cell shows preview strip below grid')
  // manual verification required per 03-VALIDATION.md — CSS hover + touch events not reliably testable in JSDOM
  it.todo('mobile: preview strip shows note and signal sections with labels')
})
