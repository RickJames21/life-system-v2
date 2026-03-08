import { useStore, DEFAULT_TIME_ITEMS, TimeItem } from '../../store/useStore'
import { Stats } from '../../lib/calcStats'
import { fmt } from '../../lib/dateUtils'

interface Props {
  stats: Stats
}

function calcTimeValue(item: TimeItem, stats: Stats): { v: string; sub: string } {
  let ms = 0
  if (item.type === 'age') {
    ms = Math.max(0, (+item.target - stats.yearsLived) * 365.25 * 86400000)
  } else {
    ms = Math.max(0, new Date(item.target as string).getTime() - Date.now())
  }
  const weeks = Math.round(ms / 604800000)
  if (item.unit === 'days')  return { v: String(Math.round(ms / 86400000)),           sub: 'days' }
  if (item.unit === 'years') return { v: (ms / (365.25 * 86400000)).toFixed(1),       sub: 'years' }
  return { v: fmt(weeks), sub: 'weeks' }
}

export function TimeRemaining({ stats }: Props) {
  const timeItems    = useStore((s) => s.timeItems)
  const setTimeSheet = useStore((s) => s.setTimeSheet)

  const items = timeItems ?? DEFAULT_TIME_ITEMS

  return (
    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 6, padding: '13px 14px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          time remaining
        </div>
        <button
          onClick={() => setTimeSheet(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, padding: '0 2px', opacity: 0.6 }}
        >
          ✎
        </button>
      </div>

      {items.map((item, i) => {
        const r = calcTimeValue(item, stats)
        return (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{item.l}</div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 200, color: 'var(--amber)' }}>{r.v}</div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{r.sub}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
