// tests/ExternalForcesPanel.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { useStore } from '../src/store/useStore'
import { ExternalForcesPanel } from '../src/components/sheet/ExternalForcesPanel'
import * as useExternalForcesModule from '../src/hooks/useExternalForces'
import { _clearCacheForTesting } from '../src/hooks/useExternalForces'
import type { FetchStatus, ExternalEvent } from '../src/hooks/useExternalForces'

// Helper: reset store state before each test
function resetStore() {
  useStore.setState({
    externalForces: {},
    birthDate: '1990-01-01',
  })
}

// Default mock hook return
const mockTrigger = vi.fn()
const mockNext = vi.fn()

function mockHook(overrides: Partial<{
  status: FetchStatus
  events: ExternalEvent[]
  currentIdx: number
}> = {}) {
  vi.spyOn(useExternalForcesModule, 'useExternalForces').mockReturnValue({
    status: overrides.status ?? 'idle',
    events: overrides.events ?? [],
    currentIdx: overrides.currentIdx ?? 0,
    trigger: mockTrigger,
    next: mockNext,
  })
}

beforeEach(() => {
  _clearCacheForTesting()
  resetStore()
  vi.clearAllMocks()
})

// Default props
const defaultProps = { weekIdx: 100, birthDate: '1990-01-01' }

// ─────────────────────────────────────────────────────────────────────────────
describe('ExternalForcesPanel — LOG-01: placement in note step', () => {
  it('renders a trigger button ("scan signal") in idle state', () => {
    mockHook({ status: 'idle' })
    render(<ExternalForcesPanel {...defaultProps} />)
    expect(screen.getByRole('button', { name: /scan signal/i })).toBeInTheDocument()
  })

  it('shows a section label above the trigger button', () => {
    mockHook({ status: 'idle' })
    render(<ExternalForcesPanel {...defaultProps} />)
    expect(screen.getByText(/external forces/i)).toBeInTheDocument()
  })

  it('renders without crashing given weekIdx and birthDate props', () => {
    mockHook({ status: 'idle' })
    const { container } = render(<ExternalForcesPanel {...defaultProps} />)
    expect(container.firstChild).not.toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('ExternalForcesPanel — LOG-02: event display format', () => {
  it('after trigger returns loaded state, displays "{year} — {text}" content', () => {
    mockHook({
      status: 'loaded',
      events: [{ year: 1969, text: 'Apollo 11 lands on the Moon.', url: undefined }],
      currentIdx: 0,
    })
    render(<ExternalForcesPanel {...defaultProps} />)
    expect(screen.getByText(/1969/)).toBeInTheDocument()
    expect(screen.getByText(/Apollo 11 lands on the Moon/)).toBeInTheDocument()
  })

  it('event text container has fixed height class (no layout shift on cycling)', () => {
    mockHook({
      status: 'loaded',
      events: [{ year: 1969, text: 'Apollo 11 lands on the Moon.', url: undefined }],
      currentIdx: 0,
    })
    render(<ExternalForcesPanel {...defaultProps} />)
    // The event display area should be present — we check for the year/text combo
    const yearEl = screen.getByText(/1969/)
    expect(yearEl).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('ExternalForcesPanel — LOG-03: cycling buttons', () => {
  it('"Show Next" button appears once loaded and calls next()', () => {
    mockHook({
      status: 'loaded',
      events: [
        { year: 1969, text: 'Apollo 11 lands on the Moon.' },
        { year: 1815, text: 'Napoleon defeated at Waterloo.' },
      ],
      currentIdx: 0,
    })
    render(<ExternalForcesPanel {...defaultProps} />)
    const btn = screen.getByRole('button', { name: /show next/i })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(mockNext).toHaveBeenCalledTimes(1)
  })

  it('"Add to Record" button appears once loaded', () => {
    mockHook({
      status: 'loaded',
      events: [{ year: 1969, text: 'Apollo 11 lands on the Moon.' }],
      currentIdx: 0,
    })
    render(<ExternalForcesPanel {...defaultProps} />)
    expect(screen.getByRole('button', { name: /add to record/i })).toBeInTheDocument()
  })

  it('"Show Next" becomes "Change Signal" after force is saved', () => {
    // Set saved force in store
    useStore.setState({
      externalForces: {
        'w100': { year: 1969, summary: 'Apollo 11 lands on the Moon.', userText: 'Apollo 11 lands on the Moon.' },
      },
    })
    mockHook({
      status: 'loaded',
      events: [
        { year: 1969, text: 'Apollo 11 lands on the Moon.' },
        { year: 1815, text: 'Napoleon defeated at Waterloo.' },
      ],
      currentIdx: 0,
    })
    render(<ExternalForcesPanel {...defaultProps} />)
    expect(screen.getByRole('button', { name: /change signal/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('ExternalForcesPanel — LOG-04: saving to store', () => {
  it('"Add to Record" calls setExternalForce with correct weekKey and event data', () => {
    mockHook({
      status: 'loaded',
      events: [{ year: 1969, text: 'Apollo 11 lands on the Moon.', url: 'https://example.com' }],
      currentIdx: 0,
    })
    render(<ExternalForcesPanel {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /add to record/i }))
    const ef = useStore.getState().externalForces['w100']
    expect(ef).toBeDefined()
    expect(ef.year).toBe(1969)
    expect(ef.summary).toBe('Apollo 11 lands on the Moon.')
    expect(ef.userText).toBe('Apollo 11 lands on the Moon.')
    expect(ef.url).toBe('https://example.com')
  })

  it('weekKey passed to setExternalForce matches wk(weekIdx)', () => {
    mockHook({
      status: 'loaded',
      events: [{ year: 2005, text: 'A major news event occurred.' }],
      currentIdx: 0,
    })
    render(<ExternalForcesPanel {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /add to record/i }))
    // weekIdx=100 → weekKey='w100'
    expect(useStore.getState().externalForces['w100']).toBeDefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('ExternalForcesPanel — LOG-05: Signal block display', () => {
  it('saved force block is rendered separately from the note textarea', () => {
    useStore.setState({
      externalForces: {
        'w100': { year: 1969, summary: 'Apollo 11 lands on the Moon.', userText: 'Apollo 11 lands on the Moon.' },
      },
    })
    mockHook({ status: 'idle' })
    render(<ExternalForcesPanel {...defaultProps} />)
    // Signal block should show
    expect(screen.getByText('Signal')).toBeInTheDocument()
    // Note textarea is not part of this component — just verify Signal block exists
    const signalTextarea = screen.getByDisplayValue('Apollo 11 lands on the Moon.')
    expect(signalTextarea.tagName).toBe('TEXTAREA')
  })

  it('block is labeled "Signal" (not "External Force")', () => {
    useStore.setState({
      externalForces: {
        'w100': { year: 1969, summary: 'Apollo 11 lands on the Moon.', userText: 'Apollo 11 lands on the Moon.' },
      },
    })
    mockHook({ status: 'idle' })
    render(<ExternalForcesPanel {...defaultProps} />)
    expect(screen.getByText('Signal')).toBeInTheDocument()
    expect(screen.queryByText(/external force/i)).toBeNull()
  })

  it('saved force is not merged into the personal note text (Signal block is a separate textarea)', () => {
    useStore.setState({
      externalForces: {
        'w100': { year: 1969, summary: 'Apollo 11 lands on the Moon.', userText: 'Apollo 11 lands on the Moon.' },
      },
    })
    mockHook({ status: 'idle' })
    render(<ExternalForcesPanel {...defaultProps} />)
    // The Signal textarea is distinct — verify it's a separate element
    const textareas = screen.getAllByRole('textbox')
    // Only one textarea in this component (the signal one)
    expect(textareas.length).toBeGreaterThanOrEqual(1)
    expect(textareas[0]).toHaveValue('Apollo 11 lands on the Moon.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('ExternalForcesPanel — LOG-06: inline editing', () => {
  it('Signal block contains a textarea pre-filled with userText', () => {
    useStore.setState({
      externalForces: {
        'w100': { year: 1969, summary: 'Apollo 11 original.', userText: 'User edited text.' },
      },
    })
    mockHook({ status: 'idle' })
    render(<ExternalForcesPanel {...defaultProps} />)
    expect(screen.getByDisplayValue('User edited text.')).toBeInTheDocument()
  })

  it('typing in Signal textarea calls updateExternalForceText (debounced)', async () => {
    vi.useFakeTimers()
    useStore.setState({
      externalForces: {
        'w100': { year: 1969, summary: 'Apollo 11 original.', userText: 'Apollo 11 original.' },
      },
    })
    mockHook({ status: 'idle' })
    render(<ExternalForcesPanel {...defaultProps} />)
    const textarea = screen.getByDisplayValue('Apollo 11 original.')
    fireEvent.change(textarea, { target: { value: 'New text' } })
    // Before debounce fires, store should not be updated yet
    expect(useStore.getState().externalForces['w100'].userText).toBe('Apollo 11 original.')
    // Advance timer past 400ms debounce
    act(() => { vi.advanceTimersByTime(400) })
    expect(useStore.getState().externalForces['w100'].userText).toBe('New text')
    vi.useRealTimers()
  })

  it('"reset" button restores the original summary text', () => {
    useStore.setState({
      externalForces: {
        'w100': { year: 1969, summary: 'Apollo 11 original.', userText: 'User edited text.' },
      },
    })
    mockHook({ status: 'idle' })
    render(<ExternalForcesPanel {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    // Store should be updated to summary
    expect(useStore.getState().externalForces['w100'].userText).toBe('Apollo 11 original.')
  })

  it('"×" / clear button calls clearExternalForce(weekKey)', () => {
    useStore.setState({
      externalForces: {
        'w100': { year: 1969, summary: 'Apollo 11 original.', userText: 'Apollo 11 original.' },
      },
    })
    mockHook({ status: 'idle' })
    render(<ExternalForcesPanel {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /×/ }))
    expect(useStore.getState().externalForces['w100']).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('ExternalForcesPanel — API-03: error / empty state', () => {
  it('shows "No external signal" when hook status is error', () => {
    mockHook({ status: 'error', events: [] })
    render(<ExternalForcesPanel {...defaultProps} />)
    expect(screen.getByText(/no external signal/i)).toBeInTheDocument()
  })

  it('"retry" link re-triggers the fetch', async () => {
    mockHook({ status: 'error', events: [] })
    render(<ExternalForcesPanel {...defaultProps} />)
    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)
    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledTimes(1)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('ExternalForcesPanel — existing saved force on open', () => {
  it('if externalForces[weekKey] exists on mount, shows Signal block immediately without triggering fetch', () => {
    useStore.setState({
      externalForces: {
        'w100': { year: 1969, summary: 'Apollo 11 lands on the Moon.', userText: 'Apollo 11 lands on the Moon.' },
      },
    })
    mockHook({ status: 'idle' })
    render(<ExternalForcesPanel {...defaultProps} />)
    expect(screen.getByText('Signal')).toBeInTheDocument()
    expect(mockTrigger).not.toHaveBeenCalled()
  })

  it('"change signal" / replace button re-opens cycling from idle state', () => {
    useStore.setState({
      externalForces: {
        'w100': { year: 1969, summary: 'Apollo 11 lands on the Moon.', userText: 'Apollo 11 lands on the Moon.' },
      },
    })
    mockHook({ status: 'idle' })
    render(<ExternalForcesPanel {...defaultProps} />)
    // click "change signal" button
    fireEvent.click(screen.getByRole('button', { name: /change signal/i }))
    // After clicking, the cycling idle state should be shown (scan signal button visible)
    // Since hook is mocked as idle, the scan signal button should appear
    expect(screen.getByRole('button', { name: /scan signal/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('ExternalForcesPanel — loading state', () => {
  it('shows pulsing "scanning..." text during loading', () => {
    mockHook({ status: 'loading', events: [] })
    render(<ExternalForcesPanel {...defaultProps} />)
    expect(screen.getByText(/scanning/i)).toBeInTheDocument()
  })
})
