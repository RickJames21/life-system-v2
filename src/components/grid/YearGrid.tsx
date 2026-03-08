import { useStore } from '../../store/useStore'
import { Stats } from '../../lib/calcStats'
import { getDecadeColor, getDecadeColorDim } from '../../lib/colorSystem'
import { yk, mk, wk, NOTE_LIMITS } from '../../lib/dateUtils'

const COLS = 10

interface Props {
  stats: Stats
}

export function YearGrid({ stats }: Props) {
  const notes     = useStore((s) => s.notes)
  const openSheet = useStore((s) => s.openSheet)

  const yearsLivedInt = Math.floor(stats.yearsLived)
  const rows: JSX.Element[] = []

  for (let row = 0; row < Math.ceil(stats.lifespan / COLS); row++) {
    const cells: JSX.Element[] = [
      <span key="label" style={{ fontSize: 8, color: 'var(--text-deep)', width: 22, flexShrink: 0, textAlign: 'right', marginRight: 2 }}>
        {row * COLS}
      </span>
    ]

    for (let col = 0; col < COLS; col++) {
      const y = row * COLS + col
      if (y >= stats.lifespan) break
      const past    = y <= yearsLivedInt
      const current = y === yearsLivedInt
      const yKey    = yk(y)

      let hasNote = past && !!notes[yKey]
      if (!hasNote && past) {
        outer: for (let m = 0; m < 12; m++) {
          if (notes[mk(y, m)]) { hasNote = true; break }
          const ws = Math.round((y * 12 + m) * (52.18 / 12))
          const we = Math.round((y * 12 + m + 1) * (52.18 / 12))
          for (let wi = ws; wi < we; wi++) {
            if (notes[wk(wi)]) { hasNote = true; break outer }
          }
        }
      }

      const bg     = current ? 'var(--amber)' : past ? getDecadeColor(y) : getDecadeColorDim(y)
      const border = current ? '1px solid var(--amber)' : past ? '1px solid transparent' : '1px solid #2a2e32'
      const shadow = current ? '0 0 6px rgba(242,197,114,0.44)' : 'none'

      cells.push(
        <div
          key={y}
          onClick={() => openSheet({ type: 'year', noteKey: yKey, title: `year ${y}`, subtitle: `age ${y}`, limit: NOTE_LIMITS.year, isPast: past })}
          style={{ flex: 1, aspectRatio: '1', borderRadius: 3, background: bg, border, boxShadow: shadow, position: 'relative', cursor: 'pointer', userSelect: 'none', transition: 'filter 0.15s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1.3)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.filter = '' }}
        >
          {hasNote && past && (
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 3, color: 'rgba(255,255,255,0.6)', lineHeight: 1, pointerEvents: 'none' }}>●</span>
          )}
        </div>
      )
    }

    rows.push(<div key={row} style={{ display: 'flex', gap: 3, alignItems: 'center' }}>{cells}</div>)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>{rows}</div>
      <p style={{ marginTop: 10, fontSize: 10, color: 'var(--text-dim)' }}>tap a year to view month notes + add a year note</p>
    </div>
  )
}
