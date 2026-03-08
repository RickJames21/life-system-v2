export interface Stats {
  weeksLived: number
  totalWeeks: number
  weeksRemaining: number
  daysLived: number
  pct: number          // 0-100
  heartbeats: number
  memoryWrites: number
  networkConns: number
  storageUsed: string
  errorRate: number
  clockStr: string     // "HH:MM" life expressed as time of day
  yearsLived: number
  lifespan: number
  orbits: string       // yearsLived.toFixed(1)
}

export function calcStats(birthDate: string, lifespan: number): Stats {
  const now = new Date()
  const birth = new Date(birthDate)
  const elapsed = now.getTime() - birth.getTime()

  const weeksLived   = Math.max(0, Math.floor(elapsed / 604800000))
  const totalWeeks   = Math.round(lifespan * 52.18)
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived)
  const daysLived    = Math.max(0, Math.floor(elapsed / 86400000))
  const pct          = Math.min(100, (weeksLived / totalWeeks) * 100)
  const yearsLived   = daysLived / 365.25

  const heartbeats   = daysLived * 100800
  const memoryWrites = Math.round(daysLived * 1.5)
  const networkConns = Math.round(Math.min((yearsLived / lifespan) * 80000, 80000))
  const storageUsed  = ((daysLived * 150 * 1000) / 2.5e15 * 100).toFixed(8)
  const errorRate    = Math.round(daysLived * 0.5)

  // Life expressed as a 24-hour clock
  const clockMin = (pct / 100) * 1440
  const ch = Math.floor(clockMin / 60) % 24
  const cm = Math.floor(clockMin % 60)
  const clockStr = String(ch).padStart(2, '0') + ':' + String(cm).padStart(2, '0')

  return {
    weeksLived, totalWeeks, weeksRemaining, daysLived, pct,
    heartbeats, memoryWrites, networkConns, storageUsed, errorRate,
    clockStr, yearsLived, lifespan, orbits: yearsLived.toFixed(1),
  }
}
