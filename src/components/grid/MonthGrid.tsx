import { useStore } from '../../store/useStore'
import { Stats } from '../../lib/calcStats'
import { getWeekColor, getDecadeColorDim } from '../../lib/colorSystem'
import { mk, wk, MONTH_NAMES, MILESTONES, NOTE_LIMITS } from '../../lib/dateUtils'

const COLS = 12

interface Props {
  stats: Stats
  birthDate: string
}

export function MonthGrid({ stats, birthDate }: Props) {
  const notes     = useStore((s) => s.notes)
  const openSheet = useStore((s) => s.openSheet)

  const totalMonths  = Math.round(stats.lifespan * 12)
  const monthsLived  = Math.floor(stats.yearsLived * 12)
  const totalRows    = Math.ceil(totalMonths / COLS)
  const rows: JSX.Element[] = []

  for (let row = 0; row < totalRows; row++) {
    const year         = row
    const milestone    = MILESTONES.find((m) => m.year === year && year > 0)
    const isCurrentYear = Math.floor(stats.yearsLived) === year

    if (milestone) {
      rows.push(
        <div key={`ms-${year}`} style={{ height: 1, background: 'rgba(154,161,168,0.1)', margin: '2px 0', position: 'relative' }}>
          <span style={{ position: 'absolute', right: 0, top: -7, fontSize: 8, color: 'var(--text-secondary)', opacity: 0.4 }}>{milestone.label}</span>
        </div>
      )
    }

    const cells: JSX.Element[] = [
      <span key="label" style={{ fontSize: 8, color: isCurrentYear ? 'var(--amber)' : 'var(--text-deep)', width: 22, flexShrink: 0, textAlign: 'right', marginRight: 2, fontWeight: isCurrentYear ? 500 : 400 }}>
        {year === 0 ? 'b' : year}
      </span>
    ]

    for (let col = 0; col < COLS; col++) {
      const i    = row * COLS + col
      if (i >= totalMonths) break
      const past    = i <= monthsLived
      const current = i === monthsLived
      const mKey    = mk(year, col)

      // Check for note in this month or its weeks
      const wStart = Math.round(i * (52.18 / 12))
      const wEnd   = Math.round((i + 1) * (52.18 / 12))
      let hasNote  = !!notes[mKey]
      if (!hasNote) {
        for (let wi = wStart; wi < wEnd; wi++) {
          if (notes[wk(wi)]) { hasNote = true; break }
        }
      }

      const midWeek = Math.round(i * (52.18 / 12) + (52.18 / 24))
      const bg      = current ? 'var(--amber)' : past ? getWeekColor(birthDate, midWeek) : getDecadeColorDim(year)
      const border  = current ? '1px solid var(--amber)' : past ? '1px solid transparent' : '1px solid #2a2e32'
      const shadow  = current ? '0 0 6px rgba(242,197,114,0.44)' : 'none'

      cells.push(
        <div
          key={i}
          onClick={() => openSheet({ type: 'month', noteKey: mKey, title: `${MONTH_NAMES[col]} yr ${year}`, subtitle: `age ${year}, month ${col + 1}`, limit: NOTE_LIMITS.month, isPast: past })}
          style={{ flex: 1, aspectRatio: '1', borderRadius: 2, background: bg, border, boxShadow: shadow, position: 'relative', cursor: 'pointer', userSelect: 'none', transition: 'filter 0.15s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1.3)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.filter = '' }}
        >
          {hasNote && past && (
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 3, color: 'rgba(255,255,255,0.75)', lineHeight: 1, pointerEvents: 'none' }}>●</span>
          )}
        </div>
      )
    }

    rows.push(<div key={year} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>{cells}</div>)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{rows}</div>
      <p style={{ marginTop: 10, fontSize: 10, color: 'var(--text-dim)' }}>tap a month to view week notes + add a month note</p>
    </div>
  )
}
