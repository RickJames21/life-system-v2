import { Stats } from '../../lib/calcStats'

interface Props {
  stats: Stats
}

export function TerminalCounters({ stats }: Props) {
  const rows = [
    { id: 'live-hb',  label: 'HEARTBEATS',    value: new Intl.NumberFormat().format(Math.round(stats.heartbeats)),     unit: 'beats' },
    { id: 'live-mw',  label: 'MEM WRITES',    value: new Intl.NumberFormat().format(Math.round(stats.memoryWrites)),   unit: 'est.' },
    { id: 'live-orb', label: 'EARTH ORBITS',  value: stats.yearsLived.toFixed(7),                                      unit: 'au' },
    { id: 'live-net', label: 'CONNECTIONS',   value: new Intl.NumberFormat().format(stats.networkConns),               unit: 'lifetime' },
  ]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 14px 14px' }}>
      <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live Metrics</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {rows.map((row) => (
          <div key={row.id}>
            <div style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 3 }}>
              {row.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span
                id={row.id}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 300,
                  color: 'var(--amber)',
                  letterSpacing: '-0.01em',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {row.value}
              </span>
              <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>{row.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
