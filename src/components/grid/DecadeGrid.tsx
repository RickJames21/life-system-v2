import { useStore } from '../../store/useStore'
import { Stats } from '../../lib/calcStats'
import { getDecadeColor, getDecadeColorDim } from '../../lib/colorSystem'
import { dk, yk, mk, wk, NOTE_LIMITS } from '../../lib/dateUtils'

interface Props {
  stats: Stats
}

export function DecadeGrid({ stats }: Props) {
  const notes     = useStore((s) => s.notes)
  const openSheet = useStore((s) => s.openSheet)

  const currDec  = Math.floor(stats.yearsLived / 10)
  const totalDec = Math.ceil(stats.lifespan / 10)

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {Array.from({ length: totalDec }, (_, d) => {
          const past    = d <= currDec
          const current = d === currDec
          const dKey    = dk(d)

          let hasNote = past && !!notes[dKey]
          if (!hasNote && past) {
            outer: for (let yi = 0; yi < 10; yi++) {
              const y = d * 10 + yi
              if (notes[yk(y)]) { hasNote = true; break }
              for (let m = 0; m < 12; m++) {
                if (notes[mk(y, m)]) { hasNote = true; break outer }
                const ws = Math.round((y * 12 + m) * (52.18 / 12))
                const we = Math.round((y * 12 + m + 1) * (52.18 / 12))
                for (let wi = ws; wi < we; wi++) {
                  if (notes[wk(wi)]) { hasNote = true; break outer }
                }
              }
            }
          }

          const bg          = current ? 'var(--amber)' : past ? getDecadeColor(d * 10) : getDecadeColorDim(d * 10)
          const border      = current ? '1px solid var(--amber)' : past ? '1px solid transparent' : '1px solid #2a2e32'
          const shadow      = current ? '0 0 8px rgba(242,197,114,0.44)' : 'none'
          const labelColor  = current ? 'var(--bg-deep)' : 'var(--text-primary)'
          const decLabel    = `${d * 10}–${Math.min((d + 1) * 10 - 1, stats.lifespan - 1)}`

          return (
            <div
              key={d}
              onClick={() => openSheet({ type: 'decade', noteKey: dKey, title: `decade ${d + 1}`, subtitle: `age ${d * 10}–${(d + 1) * 10 - 1}`, limit: NOTE_LIMITS.decade, isPast: past })}
              style={{
                width: 'calc(25% - 5px)',
                aspectRatio: '1',
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                background: bg,
                border,
                boxShadow: shadow,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'filter 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1.2)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.filter = '' }}
            >
              <span style={{ fontSize: 11, fontWeight: 300, color: labelColor, textAlign: 'center', padding: '0 4px' }}>{decLabel}</span>
              {hasNote && (
                <span style={{ fontSize: 7, color: labelColor, opacity: 0.6 }}>●</span>
              )}
            </div>
          )
        })}
      </div>
      <p style={{ marginTop: 12, fontSize: 10, color: 'var(--text-dim)' }}>tap a decade to view year notes + add a decade audit</p>
    </div>
  )
}
