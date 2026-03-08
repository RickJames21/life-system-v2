import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { wk, mk, yk, dk, weekRange, MONTH_NAMES, NOTE_LIMITS } from '../lib/dateUtils'
import { calcStats } from '../lib/calcStats'
import { dateToWeekIdx } from '../lib/dateUtils'

export type GridTab = 'weeks' | 'months' | 'years' | 'decades'
export type LogStep = 'rate' | 'mission' | 'newmission' | 'note'
export type SheetType = 'week' | 'month' | 'year' | 'decade'

export interface MissionEntry {
  week: number
  mission: string
  status: 'complete' | 'aborted'
  weeks: number
}

export interface TimeItem {
  l: string
  type: 'age' | 'date'
  target: number | string
  unit: 'weeks' | 'days' | 'years'
}

export interface SheetData {
  type: SheetType
  noteKey: string
  title: string
  subtitle: string
  limit: number
  isPast: boolean
}

export const DEFAULT_TIME_ITEMS: TimeItem[] = [
  { l: 'weeks until retirement', type: 'age',  target: 65,           unit: 'weeks' },
  { l: 'weeks until 2040',       type: 'date', target: '2040-01-01', unit: 'weeks' },
]

interface State {
  // Persisted config
  birthDate: string
  lifespan: number
  mission: string
  missionStartWeek: number | null
  missionLog: MissionEntry[]
  timeItems: TimeItem[] | null

  // Persisted data
  notes: Record<string, string>
  moods: Record<string, number>

  // UI (ephemeral — not persisted)
  tab: GridTab
  sheet: SheetData | null
  sheetText: string
  highlightWeek: number | null
  legendOpen: boolean
  gotoOpen: boolean
  aiOpen: boolean

  // Log flow
  logSheet: boolean
  logStep: LogStep
  logMood: number | null
  logNote: string
  menuSheet: boolean

  // Other sheets
  timeSheet: boolean
  menuOpen: boolean  // config / backup menu
}

interface Actions {
  // Config
  setConfig: (cfg: { birthDate: string; lifespan: number; mission: string }) => void
  goConfig: () => void

  // Data
  setNote: (key: string, text: string) => void
  deleteNote: (key: string) => void
  setMood: (key: string, mood: number) => void

  // Tab
  setTab: (tab: GridTab) => void

  // Time items
  setTimeItems: (items: TimeItem[]) => void
  addTimeItem: () => void
  deleteTimeItem: (index: number) => void
  updateTimeItem: (index: number, key: string, value: unknown) => void
  saveTimeItems: () => void

  // Sheet
  openSheet: (data: SheetData) => void
  closeSheet: () => void
  setSheetText: (text: string) => void
  saveSheetNote: () => void
  deleteSheetNote: () => void
  setSheetMood: (mood: number) => void
  navigateSheet: (dir: -1 | 1) => void

  // Log flow
  openLogSheet: (weeksLived: number) => void
  closeLogSheet: () => void
  logSetMood: (mood: number, weekIdx: number) => void
  setLogNote: (note: string) => void
  logMissionAnswer: (done: boolean, weekIdx: number) => void
  logSaveNewMission: (mission: string, weekIdx: number) => void
  logSkipMission: () => void
  logSkipToNewMission: () => void
  logSave: (weekIdx: number) => void

  // Menus / UI toggles
  setMenuSheet: (open: boolean) => void
  setTimeSheet: (open: boolean) => void
  setLegendOpen: (open: boolean) => void
  setGotoOpen: (open: boolean) => void
  setAiOpen: (open: boolean) => void
  setHighlightWeek: (week: number | null) => void
  setMenuOpen: (open: boolean) => void

  // Goto date
  gotoDate: (dateStr: string) => void
}

type Store = State & Actions

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial persisted state
      birthDate: '',
      lifespan: 90,
      mission: '',
      missionStartWeek: null,
      missionLog: [],
      timeItems: null,
      notes: {},
      moods: {},

      // Initial UI state
      tab: 'weeks',
      sheet: null,
      sheetText: '',
      highlightWeek: null,
      legendOpen: false,
      gotoOpen: false,
      aiOpen: false,
      logSheet: false,
      logStep: 'rate',
      logMood: null,
      logNote: '',
      menuSheet: false,
      timeSheet: false,
      menuOpen: false,

      // ── Config ───────────────────────────────────────────────────────
      setConfig: (cfg) => set({ ...cfg }),
      goConfig: () => set({ birthDate: '', lifespan: 90, mission: '' }),

      // ── Data ─────────────────────────────────────────────────────────
      setNote: (key, text) => set((s) => ({ notes: { ...s.notes, [key]: text } })),
      deleteNote: (key) => set((s) => {
        const notes = { ...s.notes }
        delete notes[key]
        return { notes }
      }),
      setMood: (key, mood) => set((s) => ({ moods: { ...s.moods, [key]: mood } })),

      // ── Tab ──────────────────────────────────────────────────────────
      setTab: (tab) => set({ tab }),

      // ── Time Items ───────────────────────────────────────────────────
      setTimeItems: (items) => set({ timeItems: items }),
      addTimeItem: () => {
        const items = get().timeItems ?? [...DEFAULT_TIME_ITEMS]
        set({ timeItems: [...items, { l: 'new item', type: 'age', target: 70, unit: 'weeks' }] })
      },
      deleteTimeItem: (index) => {
        const items = [...(get().timeItems ?? DEFAULT_TIME_ITEMS)]
        items.splice(index, 1)
        set({ timeItems: items })
      },
      updateTimeItem: (index, key, value) => {
        const items = [...(get().timeItems ?? DEFAULT_TIME_ITEMS)]
        items[index] = { ...items[index], [key]: value }
        set({ timeItems: items })
      },
      saveTimeItems: () => set({ timeSheet: false }),

      // ── Sheet ────────────────────────────────────────────────────────
      openSheet: (data) => set({ sheet: data, sheetText: get().notes[data.noteKey] || '' }),
      closeSheet: () => set({ sheet: null, sheetText: '' }),
      setSheetText: (text) => set({ sheetText: text }),
      saveSheetNote: () => {
        const { sheet, sheetText } = get()
        if (!sheet) return
        const text = sheetText.trim()
        if (text) {
          set((s) => ({ notes: { ...s.notes, [sheet.noteKey]: text }, sheet: null, sheetText: '' }))
        } else {
          set((s) => {
            const notes = { ...s.notes }
            delete notes[sheet.noteKey]
            return { notes, sheet: null, sheetText: '' }
          })
        }
      },
      deleteSheetNote: () => {
        const { sheet } = get()
        if (!sheet) return
        set((s) => {
          const notes = { ...s.notes }
          delete notes[sheet.noteKey]
          return { notes, sheet: null, sheetText: '' }
        })
      },
      setSheetMood: (mood) => {
        const { sheet } = get()
        if (!sheet) return
        set((s) => ({ moods: { ...s.moods, [sheet.noteKey]: mood } }))
      },
      navigateSheet: (dir) => {
        const { sheet, notes, birthDate, lifespan, sheetText } = get()
        if (!sheet) return
        // Auto-save current text before navigating
        const existing = notes[sheet.noteKey] || ''
        if (sheetText && sheetText !== existing) {
          set((s) => ({ notes: { ...s.notes, [sheet.noteKey]: sheetText } }))
        }
        const stats = calcStats(birthDate, lifespan)
        const { type } = sheet

        if (type === 'week') {
          const cur = +sheet.noteKey.slice(1)
          const next = cur + dir
          if (next < 0 || next >= stats.totalWeeks) return
          const noteKey = wk(next)
          set({ sheet: { type: 'week', noteKey, title: `week ${next + 1}`, subtitle: weekRange(birthDate, next), limit: NOTE_LIMITS.week, isPast: next <= stats.weeksLived }, sheetText: get().notes[noteKey] || '' })

        } else if (type === 'month') {
          const [, rest] = sheet.noteKey.split('m')
          const [y, m] = rest.split('_').map(Number)
          const totalMonths = Math.round(lifespan * 12)
          const cur = y * 12 + m
          const next = cur + dir
          if (next < 0 || next >= totalMonths) return
          const ny = Math.floor(next / 12), nm = next % 12
          const noteKey = mk(ny, nm)
          const monthsLived = Math.floor(stats.yearsLived * 12)
          set({ sheet: { type: 'month', noteKey, title: `${MONTH_NAMES[nm]} yr ${ny}`, subtitle: `age ${ny}, month ${nm + 1}`, limit: NOTE_LIMITS.month, isPast: next <= monthsLived }, sheetText: get().notes[noteKey] || '' })

        } else if (type === 'year') {
          const cur = +sheet.noteKey.replace('y', '')
          const next = cur + dir
          if (next < 0 || next >= lifespan) return
          const noteKey = yk(next)
          set({ sheet: { type: 'year', noteKey, title: `year ${next}`, subtitle: `age ${next}`, limit: NOTE_LIMITS.year, isPast: next <= Math.floor(stats.yearsLived) }, sheetText: get().notes[noteKey] || '' })

        } else if (type === 'decade') {
          const cur = +sheet.noteKey.replace('d', '')
          const next = cur + dir
          const totalDec = Math.ceil(lifespan / 10)
          if (next < 0 || next >= totalDec) return
          const noteKey = dk(next)
          set({ sheet: { type: 'decade', noteKey, title: `decade ${next + 1}`, subtitle: `age ${next * 10}–${(next + 1) * 10 - 1}`, limit: NOTE_LIMITS.decade, isPast: next <= Math.floor(stats.yearsLived / 10) }, sheetText: get().notes[noteKey] || '' })
        }
      },

      // ── Log Flow ─────────────────────────────────────────────────────
      openLogSheet: (weeksLived) => {
        const { moods, notes } = get()
        const alreadyLogged = moods[wk(weeksLived)] !== undefined || !!notes[wk(weeksLived)]
        if (alreadyLogged) {
          set({ menuSheet: true })
          return
        }
        set({ logSheet: true, logStep: 'rate', logMood: null, logNote: '' })
      },
      closeLogSheet: () => set({ logSheet: false }),
      logSetMood: (mood, weekIdx) => {
        set((s) => ({ logMood: mood, moods: { ...s.moods, [wk(weekIdx)]: mood }, logStep: 'mission' }))
      },
      setLogNote: (note) => set({ logNote: note }),
      logMissionAnswer: (done, weekIdx) => {
        if (done) {
          const { mission, missionStartWeek, missionLog } = get()
          const weeks = missionStartWeek !== null ? weekIdx - missionStartWeek : 0
          set({ missionLog: [...missionLog, { week: weekIdx, mission, status: 'complete', weeks }], mission: '', missionStartWeek: null, logStep: 'newmission' })
        } else {
          set({ logStep: 'note' })
        }
      },
      logSaveNewMission: (mission, weekIdx) => {
        set({ mission, missionStartWeek: weekIdx, logStep: 'note' })
      },
      logSkipMission: () => set({ logStep: 'note' }),
      logSkipToNewMission: () => set({ logStep: 'newmission' }),
      logSave: (weekIdx) => {
        const { logNote } = get()
        const note = logNote.trim()
        if (note) {
          set((s) => ({ notes: { ...s.notes, [wk(weekIdx)]: note }, logSheet: false, logNote: '' }))
        } else {
          set({ logSheet: false, logNote: '' })
        }
      },

      // ── UI Toggles ───────────────────────────────────────────────────
      setMenuSheet: (open) => set({ menuSheet: open }),
      setTimeSheet: (open) => set({ timeSheet: open }),
      setLegendOpen: (open) => set({ legendOpen: open }),
      setGotoOpen: (open) => set({ gotoOpen: open }),
      setAiOpen: (open) => set({ aiOpen: open }),
      setHighlightWeek: (week) => set({ highlightWeek: week }),
      setMenuOpen: (open) => set({ menuOpen: open }),

      // ── Goto Date ────────────────────────────────────────────────────
      gotoDate: (dateStr) => {
        const { birthDate, tab } = get()
        if (!birthDate || !dateStr) return
        const weekIdx = dateToWeekIdx(birthDate, dateStr)
        set({ tab, highlightWeek: weekIdx, gotoOpen: false })
        setTimeout(() => {
          const el = document.getElementById('hl-cell')
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      },
    }),
    {
      name: 'ls_v3',
      partialize: (state) => ({
        birthDate:        state.birthDate,
        lifespan:         state.lifespan,
        mission:          state.mission,
        missionStartWeek: state.missionStartWeek,
        missionLog:       state.missionLog,
        timeItems:        state.timeItems,
        notes:            state.notes,
        moods:            state.moods,
      }),
    }
  )
)
