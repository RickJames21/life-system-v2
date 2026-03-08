import { useStore } from '../../store/useStore'
import { Stats } from '../../lib/calcStats'
import { wk } from '../../lib/dateUtils'

interface Props {
  stats: Stats
}

export function SystemStatus({ stats }: Props) {
  const moods = useStore((s) => s.moods)

  const recentLogged = Object.keys(moods).filter((k) => +k.slice(1) >= stats.weeksLived - 4).length
  const mood = moods[wk(stats.weeksLived)] ?? moods[wk(stats.weeksLived - 1)] ?? 2

  let status: string, color: string
  if (mood === 0) {
    status = 'CRITICAL'; color = 'var(--status-critical)'
  } else if (mood === 1 || recentLogged < 1) {
    status = 'DEGRADED'; color = 'var(--status-degraded)'
  } else if (mood === 3 && recentLogged >= 3) {
    status = 'OPTIMAL';  color = 'var(--status-optimal)'
  } else {
    status = 'NOMINAL';  color = 'var(--status-nominal)'
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '7px 11px',
      background: 'var(--bg-lift)',
      border: '1px solid #2a2e32',
      borderRadius: 4,
      marginBottom: 12,
      letterSpacing: '0.08em',
    }}>
      <span style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: color,
        marginRight: 7,
        opacity: 0.9,
        flexShrink: 0,
        animation: status === 'CRITICAL' ? 'blink 1.2s step-end infinite' : 'none',
      }} />
      <span style={{ fontSize: 9, color: 'var(--text-dim)', marginRight: 6 }}>SYSTEM STATUS</span>
      <span style={{ fontSize: 9, color, fontWeight: 500 }}>{status}</span>
      <span style={{ marginLeft: 'auto', fontSize: 8, color: 'var(--text-deep)', letterSpacing: '0.04em' }}>
        {new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC
      </span>
    </div>
  )
}
