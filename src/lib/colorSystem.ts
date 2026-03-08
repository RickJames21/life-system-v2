import { getBirthDoy } from './dateUtils'

const SC = {
  winter: 0x7FA7C9,
  spring: 0x8FBF9A,
  summer: 0xE3B663,
  autumn: 0xC47A4A,
}

const SPEAKS = [
  { d: -50,  c: SC.winter },
  { d: 15,   c: SC.winter },
  { d: 105,  c: SC.spring },
  { d: 196,  c: SC.summer },
  { d: 288,  c: SC.autumn },
  { d: 380,  c: SC.winter },
  { d: 470,  c: SC.spring },
]

function lerpColor(a: number, b: number, t: number): string {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff
  const rr = ar + t * (br - ar)
  const rg = ag + t * (bg - ag)
  const rb = ab + t * (bb - ab)
  return '#' + (((1 << 24) + (Math.round(rr) << 16) + (Math.round(rg) << 8) + Math.round(rb)) | 0).toString(16).slice(1)
}

function smoothStep(t: number): number {
  return t * t * (3 - 2 * t)
}

function seasonColor(birthDoy: number, weekIdx: number): string {
  const d = ((birthDoy + weekIdx * 7) % 365 + 365) % 365
  let p0 = SPEAKS[1], p1 = SPEAKS[2]
  for (let i = 1; i < SPEAKS.length - 1; i++) {
    if (d < SPEAKS[1].d) { p0 = SPEAKS[0]; p1 = SPEAKS[1]; break }
    if (d >= SPEAKS[i].d && d < SPEAKS[i + 1].d) { p0 = SPEAKS[i]; p1 = SPEAKS[i + 1]; break }
  }
  const span = p1.d - p0.d
  if (span <= 0) return lerpColor(p0.c, p1.c, 0)
  return lerpColor(p0.c, p1.c, smoothStep(Math.max(0, Math.min(1, (d - p0.d) / span))))
}

export function getWeekColor(birthDate: string, weekIdx: number): string {
  return seasonColor(getBirthDoy(birthDate), weekIdx)
}

const DECADE_COLS = [
  0x6A8FA8, // 0-9:   slate blue
  0xA89068, // 10-19: warm sand
  0x6A9478, // 20-29: muted sage
  0xA0704A, // 30-39: terracotta
  0x7A8A7A, // 40-49: cool grey-green
  0x8A7A9A, // 50-59: dusty mauve
  0x6A8878, // 60-69: teal grey
  0x9A8860, // 70-79: aged brass
  0x7A6A8A, // 80-89: twilight
]

function decadeHex(year: number): number {
  const dec = Math.floor(year / 10)
  return DECADE_COLS[dec % DECADE_COLS.length]
}

export function getDecadeColor(year: number): string {
  const c = decadeHex(year)
  const r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff
  return `rgb(${r},${g},${b})`
}

export function getDecadeColorDim(year: number): string {
  const c = decadeHex(year)
  const r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff
  return `rgb(${Math.round(r * 0.22)},${Math.round(g * 0.22)},${Math.round(b * 0.22)})`
}
