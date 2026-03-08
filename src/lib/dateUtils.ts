export const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

export const MILESTONES = [
  { label: 'school',     year: 5  },
  { label: 'adulthood',  year: 18 },
  { label: 'career',     year: 22 },
  { label: 'midlife',    year: 45 },
  { label: 'retirement', year: 65 },
]

export const MOOD_LABELS = ['critical', 'degraded', 'nominal', 'optimal']

// Note key factories — match V1's key scheme exactly for localStorage compatibility
export const wk = (i: number) => `w${i}`
export const mk = (y: number, m: number) => `m${y}_${m}`
export const yk = (y: number) => `y${y}`
export const dk = (d: number) => `d${d}`

export const NOTE_LIMITS = { week: 140, month: 280, year: 500, decade: 1000 } as const

export function weekRange(birthDate: string, idx: number): string {
  const s = new Date(birthDate)
  s.setDate(s.getDate() + idx * 7)
  const e = new Date(s)
  e.setDate(e.getDate() + 6)
  const o: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  return s.toLocaleDateString('en-US', o) + ' – ' + e.toLocaleDateString('en-US', o)
}

export function dateToWeekIdx(birthDate: string, dateStr: string): number {
  const birth = new Date(birthDate)
  const target = new Date(dateStr)
  return Math.max(0, Math.floor((target.getTime() - birth.getTime()) / 604800000))
}

export function getBirthDoy(birthDate: string): number {
  const b = new Date(birthDate)
  const s = new Date(b.getFullYear(), 0, 1)
  return Math.floor((b.getTime() - s.getTime()) / 86400000)
}

export function fmt(n: number): string {
  return new Intl.NumberFormat().format(Math.round(n))
}

export function fmtDecimal(n: number, digits: number): string {
  return n.toFixed(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
