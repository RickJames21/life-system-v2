import { useEffect, useRef } from 'react'
import { Stats } from '../lib/calcStats'

// Rates per millisecond
const HB_PER_MS  = 100800 / 86400000   // heartbeats
const ORB_PER_MS = 1 / 31557600000     // earth orbits (years per ms)

export function useLiveTickers(stats: Stats | null) {
  const baseTime = useRef(Date.now())
  const baseStats = useRef(stats)

  useEffect(() => {
    if (!stats) return
    baseTime.current = Date.now()
    baseStats.current = stats

    const tick = () => {
      const elapsed = Date.now() - baseTime.current
      const base = baseStats.current
      if (!base) return

      const hb  = document.getElementById('live-hb')
      const orb = document.getElementById('live-orb')

      if (hb) {
        const current = base.heartbeats + elapsed * HB_PER_MS
        hb.textContent = new Intl.NumberFormat().format(Math.round(current))
      }
      if (orb) {
        const current = base.yearsLived + elapsed * ORB_PER_MS
        orb.textContent = current.toFixed(7)
      }
    }

    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [stats?.daysLived])
}
