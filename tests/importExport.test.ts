// tests/importExport.test.ts
// Plan 03-01 Wave 0: Failing stubs for IO-01, IO-02, IO-03
// These are it.todo stubs — they appear as pending in vitest output, not failures.

import { describe, it } from 'vitest'

// Mock setup notes (for Wave 1 implementation tests):
// - URL.createObjectURL / URL.revokeObjectURL must be vi.stubGlobal'd
// - document.createElement must be vi.spyOn'd for input element creation used by pick()
// - FileReader must be mocked (vi.stubGlobal or class replacement) for pick()
// - showToast import must be vi.mock'd so toast calls don't throw in test env
//
// These mocks are declared here as documentation; Wave 1 will activate them
// when replacing todo stubs with real assertions.

// ─────────────────────────────────────────────────────────────────────────────
describe('ImportExport', () => {

  describe('doBackup', () => {
    it.todo('includes externalForces field at top level alongside notes and moods')
    it.todo('externalForces value matches store state at time of export')
  })

  describe('doRestore', () => {
    it.todo('restores notes, moods, config from valid backup')
    it.todo('backup without externalForces field restores successfully — externalForces stays empty')
    it.todo('backup with externalForces field restores external forces')
  })

  describe('exportCSV', () => {
    it.todo('produces header row: date,title,note,external_force_text')
    it.todo('includes all past weeks 0..weeksLived even if both note and externalForce are empty')
    it.todo('external_force_text column uses userText when set, falls back to summary')
    it.todo('weeks with no force have empty external_force_text column, not missing column')
  })

  describe('importFile CSV', () => {
    it.todo('imports notes from column 2 as before')
    it.todo('imports external_force_text from column 3 into externalForces store')
    it.todo('3-column CSV (no external_force_text) imports notes-only without error')
    it.todo('empty external_force_text column does not write spurious entry to externalForces')
  })

})
