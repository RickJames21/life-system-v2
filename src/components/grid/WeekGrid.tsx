import { useStore } from '../../store/useStore'
import { Stats } from '../../lib/calcStats'
import { getWeekColor } from '../../lib/colorSystem'
import { wk, weekRange, MILESTONES, NOTE_LIMITS } from '../../lib/dateUtils'
import s from './WeekGrid.module.css'

const COLS = 52
const FUTURE = '#2A2E32'

interface Props {
  stats: Stats
  birthDate: string
  matchedWeeks?: Set<number>
  searchQuery?: string
  onCellTap?: (weekIdx: number) => void
}

export function WeekGrid({ stats, birthDate, matchedWeeks, searchQuery, onCellTap }: Props) {
  const notes         = useStore((st) => st.notes)
  const moods         = useStore((st) => st.moods)
  const highlightWeek = useStore((st) => st.highlightWeek)
  const openSheet     = useStore((st) => st.openSheet)
  const externalForces = useStore((st) => st.externalForces)

  const totalYears = Math.ceil(stats.totalWeeks / COLS)
  const rows: JSX.Element[] = []

  for (let year = 0; year < totalYears; year++) {
    const milestone    = MILESTONES.find((m) => m.year === year && year > 0)
    const isCurrentYear = Math.floor(stats.yearsLived) === year

    if (milestone) {
      rows.push(
        <div
          key={`ms-${year}`}
          style={{ height: 1, background: 'rgba(154,161,168,0.1)', margin: '5px 0 4px', position: 'relative' }}
        >
          <span style={{ position: 'absolute', left: 20, top: -8, fontSize: 7, color: 'var(--text-secondary)', opacity: 0.45, letterSpacing: '0.06em' }}>
            {milestone.label}
          </span>
        </div>
      )
    }

    const cells: JSX.Element[] = []
    cells.push(
      <span
        key="label"
        style={{
          fontSize: 7,
          color: isCurrentYear ? 'var(--amber)' : 'var(--text-deep)',
          width: 18,
          flexShrink: 0,
          textAlign: 'right',
          marginRight: 2,
          fontWeight: isCurrentYear ? 500 : 400,
        }}
      >
        {year === 0 ? 'b' : year}
      </span>
    )

    for (let col = 0; col < COLS; col++) {
      const i = year * COLS + col
      if (i >= stats.totalWeeks) break

      const past    = i < stats.weeksLived
      const current = i === stats.weeksLived
      const isHL    = highlightWeek === i
      const hasNote = !!(notes[wk(i)] || moods[wk(i)] !== undefined)

      const bg     = current ? 'var(--amber)' : past ? getWeekColor(birthDate, i) : FUTURE
      const border = current ? '1px solid var(--amber)' : past ? '1px solid transparent' : '1px solid #2d3238'
      const shadow = current ? '0 0 5px rgba(242,197,114,0.5)' : 'none'

      const isMatchedCell = !!(searchQuery && matchedWeeks?.has(i))
      const ef = externalForces[wk(i)]

      cells.push(
        <div
          key={i}
          id={isHL ? 'hl-cell' : undefined}
          className={isHL ? 'highlight-pulse' : undefined}
          onClick={() => {
            if (isMatchedCell && onCellTap) {
              onCellTap(i)
            } else {
              openSheet({
                type: 'week',
                noteKey: wk(i),
                title: `week ${i + 1}`,
                subtitle: weekRange(birthDate, i),
                limit: NOTE_LIMITS.week,
                isPast: past || current,
              })
            }
          }}
          title={isMatchedCell ? undefined : `week ${i + 1}${current ? ' · current' : ''}`}
          style={{
            flex: 1,
            aspectRatio: '1',
            borderRadius: 1,
            background: bg,
            border,
            boxShadow: shadow,
            position: 'relative',
            minWidth: 0,
            cursor: 'pointer',
            userSelect: 'none',
            opacity: searchQuery && matchedWeeks && !matchedWeeks.has(i) ? 0.15 : 1,
            transition: 'filter 0.15s, opacity 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1.3)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.filter = '' }}
        >
          {hasNote && (past || current) && (
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 3, color: 'rgba(255,255,255,0.75)', lineHeight: 1, pointerEvents: 'none' }}>●</span>
          )}
          {isMatchedCell && (
            <div className={s.matchTooltip}>
              <span className={s.tooltipWeek}>Week {i + 1}</span>
              {notes[wk(i)] && (
                <span className={s.tooltipNote}>note: &ldquo;{notes[wk(i)].slice(0, 60)}&rdquo;</span>
              )}
              {ef && (
                <span className={s.tooltipSignal}>signal: &ldquo;{(ef.userText || ef.summary || '').slice(0, 60)}&rdquo;</span>
              )}
            </div>
          )}
        </div>
      )
    }

    rows.push(
      <div key={year} style={{ display: 'flex', gap: '0.5px', alignItems: 'center' }}>
        {cells}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{rows}</div>
      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
        {MILESTONES.map((m) => (
          <span key={m.label} style={{ fontSize: 8, color: 'var(--text-secondary)', opacity: 0.3 }}>
            — {m.label} yr {m.year}
          </span>
        ))}
      </div>
    </div>
  )
}
