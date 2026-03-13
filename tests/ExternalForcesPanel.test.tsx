// tests/ExternalForcesPanel.test.tsx
// Stubs: RED phase. Source file does not exist yet.
// Plan 02-03 will implement against these.

import { describe, it } from 'vitest'

describe('ExternalForcesPanel — LOG-01: placement in note step', () => {
  it.todo('renders in logStep === note; not rendered in rate, mission, or newmission steps')
  it.todo('shows a trigger button ("scan signal" or equivalent) in idle state')
  it.todo('renders below the note textarea and above the noteFooter')
})

describe('ExternalForcesPanel — LOG-02: event display format', () => {
  it.todo('after trigger, displays "{year} — {text}" in muted italic')
  it.todo('event text container has fixed height (no layout shift on cycling)')
})

describe('ExternalForcesPanel — LOG-03: cycling buttons', () => {
  it.todo('"Show Next" button appears once loaded; calls next()')
  it.todo('"Add to Record" button appears once loaded')
  it.todo('"Show Next" becomes "Change Signal" after force is saved')
})

describe('ExternalForcesPanel — LOG-04: saving to store', () => {
  it.todo('"Add to Record" calls setExternalForce(weekKey, { year, summary, userText, url? })')
  it.todo('weekKey passed to setExternalForce matches wk(weekIdx)')
})

describe('ExternalForcesPanel — LOG-05: Signal block display', () => {
  it.todo('saved force block is rendered separately from the note textarea')
  it.todo('block is labeled "Signal" (not "External Force")')
  it.todo('saved force is not merged into the personal note text')
})

describe('ExternalForcesPanel — LOG-06: inline editing', () => {
  it.todo('Signal block contains a textarea pre-filled with userText')
  it.todo('typing in Signal textarea calls updateExternalForceText (debounced)')
  it.todo('"reset" button restores the original summary text')
  it.todo('"×" / clear button calls clearExternalForce(weekKey)')
})

describe('ExternalForcesPanel — API-03: error / empty state', () => {
  it.todo('shows "No external signal" when hook status is error')
  it.todo('"retry" link re-triggers the fetch')
})

describe('ExternalForcesPanel — existing saved force on open', () => {
  it.todo('if externalForces[weekKey] exists on mount, shows Signal block immediately without triggering fetch')
  it.todo('"change signal" / replace button re-opens cycling from idle')
})
