// src/hooks/useExternalForces.ts
// Hybrid Guardian (1999+) / Wikipedia (pre-1999) fetch hook with session-level cache.
// Security: external API data is returned raw — callers must sanitize before rendering (use DOMPurify).

import { useState, useCallback } from 'react'

// --- Types ---

export interface ExternalEvent {
  year: number
  text: string
  url?: string
}

export type FetchStatus = 'idle' | 'loading' | 'loaded' | 'error'

// --- Module-level session cache (outside React, survives unmount/remount) ---
const cache = new Map<number, ExternalEvent[]>()

/** For testing only — clears the module-level cache between tests */
export function _clearCacheForTesting(): void {
  cache.clear()
}

// --- Fisher-Yates shuffle ---
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// --- Fetch helpers ---

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function fetchGuardian(
  weekStart: Date,
  weekEnd: Date
): Promise<ExternalEvent[]> {
  const apiKey = import.meta.env.VITE_GUARDIAN_KEY as string | undefined
  if (!apiKey) return []

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)

  try {
    const from = toIso(weekStart)
    const to = toIso(weekEnd)
    const url =
      `https://content.guardianapis.com/search` +
      `?from-date=${from}&to-date=${to}&order-by=relevance&page-size=10&api-key=${apiKey}`

    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return []

    const data = await res.json()
    const results = data?.response?.results ?? []

    return results.map(
      (r: { webPublicationDate: string; webTitle: string; webUrl: string }) => ({
        year: parseInt(r.webPublicationDate.slice(0, 4), 10),
        text: r.webTitle,
        url: r.webUrl,
      })
    )
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

async function fetchWikipediaDay(mm: string, dd: string): Promise<ExternalEvent[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return []

    const data = await res.json()
    const events = data?.events ?? []

    return events.map(
      (e: { year: number; text: string; pages?: Array<{ content_urls?: { desktop?: { page?: string } } }> }) => ({
        year: e.year,
        text: e.text,
        url: e.pages?.[0]?.content_urls?.desktop?.page,
      })
    )
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

async function fetchWikipedia(weekStart: Date): Promise<ExternalEvent[]> {
  const fetches: Promise<ExternalEvent[]>[] = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    fetches.push(fetchWikipediaDay(mm, dd))
  }

  const results = await Promise.all(fetches)
  const pool = results.flat()
  return pool
}

// --- Hook ---

export function useExternalForces(
  birthDate: string,
  weekIdx: number
): {
  status: FetchStatus
  events: ExternalEvent[]
  currentIdx: number
  trigger: () => Promise<void>
  next: () => void
} {
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [events, setEvents] = useState<ExternalEvent[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)

  const trigger = useCallback(async () => {
    // Cache hit — skip fetch
    if (cache.has(weekIdx)) {
      const cached = cache.get(weekIdx)!
      setEvents(cached)
      setCurrentIdx(0)
      setStatus('loaded')
      return
    }

    setStatus('loading')

    // Compute week start date from birthDate + weekIdx
    const weekStart = new Date(birthDate)
    weekStart.setDate(weekStart.getDate() + weekIdx * 7)

    const year = weekStart.getFullYear()

    let pool: ExternalEvent[]

    if (year >= 1999) {
      // Guardian path
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      pool = await fetchGuardian(weekStart, weekEnd)

      if (pool.length === 0) {
        setStatus('error')
        setEvents([])
        return
      }
    } else {
      // Wikipedia path
      pool = await fetchWikipedia(weekStart)

      if (pool.length === 0) {
        setStatus('error')
        setEvents([])
        return
      }
    }

    const shuffled = shuffle(pool)
    cache.set(weekIdx, shuffled)
    setEvents(shuffled)
    setCurrentIdx(0)
    setStatus('loaded')
  }, [birthDate, weekIdx])

  const next = useCallback(() => {
    setCurrentIdx(prev => {
      if (events.length === 0) return 0
      return (prev + 1) % events.length
    })
  }, [events.length])

  return { status, events, currentIdx, trigger, next }
}
