// tests/useExternalForces.test.ts
// Plan 02-02: RED → GREEN TDD cycle for useExternalForces

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/server'
import { useExternalForces, _clearCacheForTesting } from '../src/hooks/useExternalForces'

// birthDate: 1970-01-01
// weekIdx 1827 → 1970-01-01 + 1827*7 days ≈ 2005-01-13 (Guardian path, year >= 1999)
// weekIdx 0    → 1970-01-01 + 0 days       = 1970-01-01 (Wikipedia path, year < 1999)
// weekIdx 783  → 1970-01-01 + 783*7 days   ≈ 1985-01-03 (Wikipedia path)
const BIRTH = '1970-01-01'
const GUARDIAN_WEEK_IDX = 1827  // 2005-ish — Guardian path
const WIKI_WEEK_IDX = 783       // 1985-ish — Wikipedia path

// Clear the module-level cache between tests to prevent cross-test pollution
beforeEach(() => {
  _clearCacheForTesting()
})

describe('useExternalForces — API-01: no auto-fetch on mount', () => {
  it('hook status is idle on mount; trigger function is not called automatically', () => {
    const { result } = renderHook(() => useExternalForces(BIRTH, GUARDIAN_WEEK_IDX))
    expect(result.current.status).toBe('idle')
    expect(result.current.events).toEqual([])
    expect(result.current.currentIdx).toBe(0)
    expect(typeof result.current.trigger).toBe('function')
    expect(typeof result.current.next).toBe('function')
  })
})

describe('useExternalForces — Guardian path (weekIdx year >= 1999)', () => {
  beforeEach(() => {
    // Stub env so hook uses Guardian path (key present → doesn't fall through to Wikipedia)
    vi.stubEnv('VITE_GUARDIAN_KEY', 'test-guardian-key')
  })

  it('trigger transitions status: idle → loading → loaded', async () => {
    const { result } = renderHook(() => useExternalForces(BIRTH, GUARDIAN_WEEK_IDX))
    expect(result.current.status).toBe('idle')

    act(() => { result.current.trigger() })
    // loading is transient — by the time we await we expect loaded
    await waitFor(() => expect(result.current.status).toBe('loaded'))
  })

  it('returns events array with { year, text, url? } shape from Guardian response', async () => {
    const { result } = renderHook(() => useExternalForces(BIRTH, GUARDIAN_WEEK_IDX))
    await act(async () => { await result.current.trigger() })

    expect(result.current.events.length).toBeGreaterThan(0)
    const event = result.current.events[0]
    expect(event).toHaveProperty('year')
    expect(event).toHaveProperty('text')
    expect(typeof event.year).toBe('number')
    expect(typeof event.text).toBe('string')
  })

  it('single fetch call to content.guardianapis.com with from-date / to-date params', async () => {
    let callCount = 0
    let capturedUrl: string | null = null

    server.use(
      http.get('https://content.guardianapis.com/search', ({ request }) => {
        callCount++
        capturedUrl = request.url
        return HttpResponse.json({
          response: {
            results: [
              { webPublicationDate: '2005-01-14T00:00:00Z', webTitle: 'Guardian headline.', webUrl: 'https://theguardian.com/1' },
            ],
          },
        })
      })
    )

    const { result } = renderHook(() => useExternalForces(BIRTH, GUARDIAN_WEEK_IDX))
    await act(async () => { await result.current.trigger() })

    expect(callCount).toBe(1)
    expect(capturedUrl).toContain('from-date')
    expect(capturedUrl).toContain('to-date')
  })
})

describe('useExternalForces — Wikipedia path (weekIdx year < 1999)', () => {
  it('trigger transitions status: idle → loading → loaded', async () => {
    const { result } = renderHook(() => useExternalForces(BIRTH, WIKI_WEEK_IDX))
    expect(result.current.status).toBe('idle')
    await act(async () => { await result.current.trigger() })
    expect(result.current.status).toBe('loaded')
  })

  it('fires 7 parallel requests to en.wikipedia.org/api/rest_v1/feed/onthisday/events/MM/DD', async () => {
    let wikiCallCount = 0

    server.use(
      http.get('https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/:mm/:dd', () => {
        wikiCallCount++
        return HttpResponse.json({
          events: [
            { year: 1985, text: 'An event this day.', pages: [] },
          ],
        })
      })
    )

    const { result } = renderHook(() => useExternalForces(BIRTH, WIKI_WEEK_IDX))
    await act(async () => { await result.current.trigger() })

    expect(wikiCallCount).toBe(7)
  })

  it('pools results from all 7 days into a single shuffled events array', async () => {
    // Default handler returns 3 events per day × 7 days = 21 total
    const { result } = renderHook(() => useExternalForces(BIRTH, WIKI_WEEK_IDX))
    await act(async () => { await result.current.trigger() })

    expect(result.current.status).toBe('loaded')
    expect(result.current.events.length).toBe(21)
  })

  it('partial failure: days that return [] are skipped; loaded if at least one day succeeds', async () => {
    let callIndex = 0

    server.use(
      http.get('https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/:mm/:dd', () => {
        callIndex++
        // Only the first call returns events; the rest return empty
        if (callIndex === 1) {
          return HttpResponse.json({
            events: [{ year: 1975, text: 'One surviving event.', pages: [] }],
          })
        }
        return HttpResponse.json({ events: [] })
      })
    )

    const { result } = renderHook(() => useExternalForces(BIRTH, WIKI_WEEK_IDX))
    await act(async () => { await result.current.trigger() })

    expect(result.current.status).toBe('loaded')
    expect(result.current.events.length).toBe(1)
  })
})

describe('useExternalForces — API-02: session cache', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GUARDIAN_KEY', 'test-guardian-key')
  })

  it('second trigger for the same weekIdx uses cached events; no new fetch', async () => {
    const CACHE_TEST_IDX = 1900 // Guardian path, unique enough idx

    let fetchCount = 0
    server.use(
      http.get('https://content.guardianapis.com/search', () => {
        fetchCount++
        return HttpResponse.json({
          response: {
            results: [
              { webPublicationDate: '2006-06-01T00:00:00Z', webTitle: 'Cached event.', webUrl: 'https://theguardian.com/cache' },
            ],
          },
        })
      })
    )

    // First render and trigger
    const { result: r1 } = renderHook(() => useExternalForces(BIRTH, CACHE_TEST_IDX))
    await act(async () => { await r1.current.trigger() })
    expect(fetchCount).toBe(1)

    // Second render (simulates unmount/remount) with same weekIdx
    const { result: r2 } = renderHook(() => useExternalForces(BIRTH, CACHE_TEST_IDX))
    await act(async () => { await r2.current.trigger() })

    // Cache hit — no new network request
    expect(fetchCount).toBe(1)
    expect(r2.current.status).toBe('loaded')
  })

  it('different weekIdx results in a new fetch', async () => {
    const IDX_A = 1901 // Guardian path
    const IDX_B = 1902 // Guardian path, different week

    let fetchCount = 0
    server.use(
      http.get('https://content.guardianapis.com/search', () => {
        fetchCount++
        return HttpResponse.json({
          response: {
            results: [
              { webPublicationDate: '2006-06-01T00:00:00Z', webTitle: 'Event.', webUrl: 'https://theguardian.com/1' },
            ],
          },
        })
      })
    )

    const { result: rA } = renderHook(() => useExternalForces(BIRTH, IDX_A))
    await act(async () => { await rA.current.trigger() })

    const { result: rB } = renderHook(() => useExternalForces(BIRTH, IDX_B))
    await act(async () => { await rB.current.trigger() })

    expect(fetchCount).toBe(2)
  })
})

describe('useExternalForces — API-03: error states', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GUARDIAN_KEY', 'test-guardian-key')
  })

  it('all-failure (every day returns empty / network error): status → error', async () => {
    server.use(
      http.get('https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/:mm/:dd', () =>
        HttpResponse.json({ events: [] })
      )
    )

    const WIKI_ERROR_IDX = 800 // Wikipedia path (pre-1999)
    const { result } = renderHook(() => useExternalForces(BIRTH, WIKI_ERROR_IDX))
    await act(async () => { await result.current.trigger() })

    expect(result.current.status).toBe('error')
    expect(result.current.events).toEqual([])
  })

  it('Guardian fetch failure: status → error, error state renders "No external signal"', async () => {
    server.use(
      http.get('https://content.guardianapis.com/search', () => HttpResponse.error())
    )

    const GUARDIAN_ERROR_IDX = 1850 // Guardian path
    const { result } = renderHook(() => useExternalForces(BIRTH, GUARDIAN_ERROR_IDX))
    await act(async () => { await result.current.trigger() })

    expect(result.current.status).toBe('error')
    expect(result.current.events).toEqual([])
  })
})

describe('useExternalForces — cycling', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GUARDIAN_KEY', 'test-guardian-key')
  })

  it('next() increments currentIdx', async () => {
    const { result } = renderHook(() => useExternalForces(BIRTH, GUARDIAN_WEEK_IDX))
    await act(async () => { await result.current.trigger() })

    expect(result.current.currentIdx).toBe(0)
    act(() => { result.current.next() })
    expect(result.current.currentIdx).toBe(1)
  })

  it('next() wraps silently from last event back to first (modulo)', async () => {
    // Use a handler that returns exactly 2 events so we can easily test wrap
    server.use(
      http.get('https://content.guardianapis.com/search', () =>
        HttpResponse.json({
          response: {
            results: [
              { webPublicationDate: '2005-01-14T00:00:00Z', webTitle: 'Event A.', webUrl: 'https://theguardian.com/a' },
              { webPublicationDate: '2005-01-15T00:00:00Z', webTitle: 'Event B.', webUrl: 'https://theguardian.com/b' },
            ],
          },
        })
      )
    )

    const WRAP_IDX = 1828
    const { result } = renderHook(() => useExternalForces(BIRTH, WRAP_IDX))
    await act(async () => { await result.current.trigger() })

    expect(result.current.events.length).toBe(2)
    expect(result.current.currentIdx).toBe(0)

    act(() => { result.current.next() })
    expect(result.current.currentIdx).toBe(1)

    // Next from last wraps back to 0
    act(() => { result.current.next() })
    expect(result.current.currentIdx).toBe(0)
  })
})
