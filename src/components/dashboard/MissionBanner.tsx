import { useStore } from '../../store/useStore'
import { Stats } from '../../lib/calcStats'

interface Props {
  stats: Stats
}

export function MissionBanner({ stats }: Props) {
  const mission          = useStore((s) => s.mission)
  const missionStartWeek = useStore((s) => s.missionStartWeek)

  if (!mission) return null

  const mwk = missionStartWeek !== null ? stats.weeksLived - missionStartWeek : 0

  return (
    <div style={{
      marginBottom: 14,
      padding: '10px 13px',
      background: 'var(--bg-panel)',
      borderRadius: 6,
      borderLeft: '2px solid var(--amber)',
    }}>
      <div style={{ fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        current mission
      </div>
      <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.6 }}>
        {mission}
        <span style={{ fontSize: 10, color: 'var(--text-dim)', fontStyle: 'normal', marginLeft: 8 }}>
          {mwk}wk
        </span>
      </div>
    </div>
  )
}
