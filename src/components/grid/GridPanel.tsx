import { useRef, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore, GridTab, ExternalForce } from '../../store/useStore'
import { Stats } from '../../lib/calcStats'
import { wk, weekRange, NOTE_LIMITS } from '../../lib/dateUtils'
import { WeekGrid }   from './WeekGrid'
import { MonthGrid }  from './MonthGrid'
import { YearGrid }   from './YearGrid'
import { DecadeGrid } from './DecadeGrid'
import s from './GridPanel.module.css'

interface Props {
  stats: Stats
  birthDate: string
}

const TABS: GridTab[] = ['weeks', 'months', 'years', 'decades']

export function GridPanel({ stats, birthDate }: Props) {
  const tab            = useStore((st) => st.tab)
  const setTab         = useStore((st) => st.setTab)
  const legendOpen     = useStore((st) => st.legendOpen)
  const setLegend      = useStore((st) => st.setLegendOpen)
  const gotoOpen       = useStore((st) => st.gotoOpen)
  const setGoto        = useStore((st) => st.setGotoOpen)
  const gotoDate       = useStore((st) => st.gotoDate)
  const searchOpen     = useStore((st) => st.searchOpen)
  const setSearchOpen  = useStore((st) => st.setSearchOpen)
  const searchQuery    = useStore((st) => st.searchQuery)
  const setSearchQuery = useStore((st) => st.setSearchQuery)
  const notes          = useStore((st) => st.notes)
  const externalForces = useStore((st) => st.externalForces)
  const openSheet      = useStore((st) => st.openSheet)

  const [tappedWeek, setTappedWeek] = useState<number | null>(null)

  const gotoRef   = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const matchedWeeks = useMemo<Set<number>>(() => {
    if (!searchQuery.trim()) return new Set<number>()
    const q = searchQuery.toLowerCase()
    const matched = new Set<number>()
    Object.entries(notes).forEach(([key, text]) => {
      if (key.startsWith('w') && typeof text === 'string' && text.toLowerCase().includes(q)) {
        matched.add(+key.slice(1))
      }
    })
    Object.entries(externalForces).forEach(([key, ef]: [string, ExternalForce]) => {
      const searchText = (ef.userText || ef.summary || '').toLowerCase()
      if (searchText.includes(q)) matched.add(+key.slice(1))
    })
    return matched
  }, [searchQuery, notes, externalForces])

  function handleGoto() {
    const val = gotoRef.current?.value
    if (val) gotoDate(val)
  }

  function handleCellTap(weekIdx: number) {
    if (tappedWeek === weekIdx) {
      openSheet({
        type: 'week',
        noteKey: wk(weekIdx),
        title: `week ${weekIdx + 1}`,
        subtitle: weekRange(birthDate, weekIdx),
        limit: NOTE_LIMITS.week,
        isPast: true,
      })
      setTappedWeek(null)
    } else {
      setTappedWeek(weekIdx)
    }
  }

  return (
    <div className={s.panel}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <span className={s.sectionLabel}>lifecycle — {tab}</span>
          <button className={s.legendToggle} onClick={() => setLegend(!legendOpen)}>
            legend {legendOpen ? '▲' : '▼'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={`${s.gotoBtn} ${gotoOpen ? s.gotoBtnActive : ''}`}
            onClick={() => { setGoto(!gotoOpen); setTimeout(() => gotoRef.current?.focus(), 60) }}
          >
            ⌖ date
          </button>
          <button
            className={`${s.gotoBtn} ${searchOpen ? s.gotoBtnActive : ''}`}
            onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchRef.current?.focus(), 60) }}
          >
            ⌕ search
          </button>
        </div>
      </div>

      {/* Legend */}
      {legendOpen && (
        <div className={s.legend}>
          {[
            { bg: '#7FA7C9', name: 'WINTER', desc: 'cooling'    },
            { bg: '#8FBF9A', name: 'SPRING', desc: 'warming'    },
            { bg: '#E3B663', name: 'SUMMER', desc: 'peak'       },
            { bg: '#C47A4A', name: 'AUTUMN', desc: 'falling'    },
          ].map((item) => (
            <div key={item.name} className={s.legendRow}>
              <div className={s.legendSwatch} style={{ background: item.bg }} />
              <span className={s.legendName}>{item.name}</span>
              <span className={s.legendDot}>·</span>
              <span className={s.legendDesc}>{item.desc}</span>
            </div>
          ))}
          <div className={s.legendDivider} />
          <div className={s.legendRow}>
            <div className={s.legendSwatch} style={{ background: 'var(--amber)' }} />
            <span className={s.legendName}>CURRENT</span>
            <span className={s.legendDot}>·</span>
            <span className={s.legendDesc}>active cycle</span>
          </div>
          <div className={s.legendRow}>
            <div className={s.legendSwatch} style={{ background: '#2A2E32', border: '1px solid #3a3f44' }} />
            <span className={s.legendName}>FUTURE</span>
            <span className={s.legendDot}>·</span>
            <span className={s.legendDesc}>unallocated</span>
          </div>
          <div className={s.legendRow}>
            <span style={{ fontSize: 9, color: 'var(--text-deep)', width: 10, textAlign: 'center' }}>●</span>
            <span className={s.legendName} style={{ color: 'var(--text-deep)' }}>NOTE</span>
            <span className={s.legendDot}>·</span>
            <span className={s.legendDesc}>entry written</span>
          </div>
        </div>
      )}

      {/* Goto date */}
      {gotoOpen && (
        <div className={s.gotoRow}>
          <input
            ref={gotoRef}
            type="date"
            className={s.gotoInput}
            onKeyDown={(e) => e.key === 'Enter' && handleGoto()}
          />
          <button className={s.gotoGo} onClick={handleGoto}>go →</button>
        </div>
      )}

      {/* Search */}
      {searchOpen && tab === 'weeks' && (
        <div className={s.searchRow}>
          <input
            ref={searchRef}
            type="text"
            className={s.searchInput}
            placeholder="search notes + signals…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setSearchQuery(''); setSearchOpen(false); setTappedWeek(null) }
            }}
          />
          {searchQuery && (
            <button className={s.searchClear} onClick={() => { setSearchQuery(''); setTappedWeek(null) }}>×</button>
          )}
        </div>
      )}

      <p className={s.hint}>tap any cell to add a note to that moment in your life.</p>

      {/* Tab bar */}
      <div className={s.tabBar}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${s.tabBtn} ${tab === t ? s.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      {tab === 'weeks'   && <WeekGrid   stats={stats} birthDate={birthDate} matchedWeeks={matchedWeeks} searchQuery={searchQuery} onCellTap={handleCellTap} />}
      {tab === 'months'  && <MonthGrid  stats={stats} birthDate={birthDate} />}
      {tab === 'years'   && <YearGrid   stats={stats} />}
      {tab === 'decades' && <DecadeGrid stats={stats} />}

      {/* Mobile preview strip — slides up on first tap of a matched cell */}
      <AnimatePresence>
        {tappedWeek !== null && searchQuery && (
          <motion.div
            key="preview-strip"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className={s.previewStrip}
            onClick={() => {
              openSheet({
                type: 'week',
                noteKey: wk(tappedWeek),
                title: `week ${tappedWeek + 1}`,
                subtitle: weekRange(birthDate, tappedWeek),
                limit: NOTE_LIMITS.week,
                isPast: true,
              })
              setTappedWeek(null)
            }}
          >
            <span className={s.previewWeekLabel}>
              Week {tappedWeek + 1} · {weekRange(birthDate, tappedWeek)}
            </span>
            {notes[wk(tappedWeek)] && (
              <span className={s.previewNote}>note: &ldquo;{notes[wk(tappedWeek)]}&rdquo;</span>
            )}
            {externalForces[wk(tappedWeek)] && (
              <span className={s.previewSignal}>
                signal: &ldquo;{externalForces[wk(tappedWeek)].userText || externalForces[wk(tappedWeek)].summary || ''}&rdquo;
              </span>
            )}
            <span className={s.previewHint}>tap to open full entry →</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
