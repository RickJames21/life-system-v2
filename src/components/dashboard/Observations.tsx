import { useStore } from '../../store/useStore'
import { Stats } from '../../lib/calcStats'
import { wk, fmt } from '../../lib/dateUtils'

interface Props {
  stats: Stats
  onLogNow: () => void
}

export function Observations({ stats, onLogNow }: Props) {
  const moods = useStore((s) => s.moods)
  const notes = useStore((s) => s.notes)

  const noEntry = moods[wk(stats.weeksLived)] === undefined && !notes[wk(stats.weeksLived)]

  const observations = [
    `completed ${stats.pct.toFixed(1)}% of expected runtime.`,
    `if life were a 24-hour cycle, current time is ${stats.clockStr}.`,
    `~${fmt(stats.heartbeats)} heartbeats executed.`,
    `~${fmt(stats.memoryWrites)} memory writes since boot.`,
    `${fmt(stats.weeksRemaining)} cycles remain.`,
  ]

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: '13px 14px',
      marginBottom: 14,
    }}>
      <div style={{ fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        system observations
      </div>

      {noEntry && (
        <div
          style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 7, cursor: 'pointer' }}
          onClick={onLogNow}
        >
          <span style={{ color: '#9A8AAA', fontSize: 10, marginTop: 2, flexShrink: 0 }}>⚠</span>
          <span style={{ fontSize: 12, color: '#9A8AAA', lineHeight: 1.6 }}>
            no entry logged this cycle.{' '}
            <span style={{ textDecoration: 'underline', opacity: 0.7 }}>log now</span>
          </span>
        </div>
      )}

      {observations.map((obs, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 7 }}>
          <span style={{ color: 'var(--amber)', fontSize: 10, marginTop: 2, flexShrink: 0, opacity: 0.7 }}>→</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{obs}</span>
        </div>
      ))}
    </div>
  )
}
