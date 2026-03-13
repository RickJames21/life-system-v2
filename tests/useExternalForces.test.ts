// tests/useExternalForces.test.ts
// Stubs: RED phase. Source file does not exist yet.
// Plan 02-02 will implement against these.

import { describe, it } from 'vitest'

describe('useExternalForces — API-01: no auto-fetch on mount', () => {
  it.todo('hook status is idle on mount; trigger function is not called automatically')
})

describe('useExternalForces — Guardian path (weekIdx year >= 1999)', () => {
  it.todo('trigger transitions status: idle → loading → loaded')
  it.todo('returns events array with { year, text, url? } shape from Guardian response')
  it.todo('single fetch call to content.guardianapis.com with from-date / to-date params')
})

describe('useExternalForces — Wikipedia path (weekIdx year < 1999)', () => {
  it.todo('trigger transitions status: idle → loading → loaded')
  it.todo('fires 7 parallel requests to en.wikipedia.org/api/rest_v1/feed/onthisday/events/MM/DD')
  it.todo('pools results from all 7 days into a single shuffled events array')
  it.todo('partial failure: days that return [] are skipped; loaded if at least one day succeeds')
})

describe('useExternalForces — API-02: session cache', () => {
  it.todo('second trigger for the same weekIdx uses cached events; no new fetch')
  it.todo('different weekIdx results in a new fetch')
})

describe('useExternalForces — API-03: error states', () => {
  it.todo('all-failure (every day returns empty / network error): status → error')
  it.todo('Guardian fetch failure: status → error, error state renders "No external signal"')
})

describe('useExternalForces — cycling', () => {
  it.todo('next() increments currentIdx')
  it.todo('next() wraps silently from last event back to first (modulo)')
})
