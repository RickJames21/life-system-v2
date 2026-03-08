import { useEffect } from 'react'
import { useStore } from './store/useStore'
import { useStats } from './hooks/useStats'
import { useLiveTickers } from './hooks/useLiveTickers'

import { Setup }            from './components/Setup/Setup'
import { SkyDisplay }       from './components/SkyDisplay/SkyDisplay'
import { InstrumentPanel }  from './components/instruments/InstrumentPanel'
import { SystemStatus }     from './components/dashboard/SystemStatus'
import { MissionBanner }    from './components/dashboard/MissionBanner'
import { Observations }     from './components/dashboard/Observations'
import { TimeRemaining }    from './components/dashboard/TimeRemaining'
import { TimeItemSheet }    from './components/dashboard/TimeItemSheet'
import { ImportExport }     from './components/dashboard/ImportExport'
import { GridPanel }        from './components/grid/GridPanel'
import { Sheet }            from './components/sheet/Sheet'
import { LogSheet }         from './components/sheet/LogSheet'
import { CommandBar }       from './components/commandBar/CommandBar'
import { ToastProvider }    from './components/common/Toast'

export default function App() {
  const birthDate  = useStore((s) => s.birthDate)
  const lifespan   = useStore((s) => s.lifespan)
  const sheet      = useStore((s) => s.sheet)
  const openLogSheet = useStore((s) => s.openLogSheet)

  const stats = useStats()

  // Live tickers (write directly to DOM, no re-render)
  useLiveTickers(stats)

  // Keyboard navigation for sheet
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const sh = useStore.getState().sheet
      if (!sh) return
      if (e.key === 'ArrowRight') useStore.getState().navigateSheet(1)
      if (e.key === 'ArrowLeft')  useStore.getState().navigateSheet(-1)
      if (e.key === 'Escape')     useStore.getState().closeSheet()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Not configured yet
  if (!birthDate) {
    return (
      <>
        <Setup />
        <ToastProvider />
      </>
    )
  }

  if (!stats) return null

  return (
    <>
      {/* Sky + system time display */}
      <SkyDisplay clockStr={stats.clockStr} pct={stats.pct} />

      {/* Main scrollable content */}
      <div style={{ padding: '0 14px 90px', maxWidth: 600, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '12px 0 16px', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>life system</h1>
            <p style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3, letterSpacing: '0.04em' }}>
              runtime — {Math.floor(stats.weeksLived / 52)} yr {stats.weeksLived % 52} wk
            </p>
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <button
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 4, cursor: 'pointer', fontSize: 10, padding: '5px 9px', fontFamily: 'inherit' }}
              onClick={() => useStore.getState().goConfig()}
            >
              ⚙ config
            </button>
          </div>
        </div>

        {/* System status row */}
        <SystemStatus stats={stats} />

        {/* Mission banner */}
        <MissionBanner stats={stats} />

        {/* Instrument panel — V2 flagship upgrade */}
        <InstrumentPanel stats={stats} />

        {/* System observations */}
        <Observations stats={stats} onLogNow={() => openLogSheet(stats.weeksLived)} />

        {/* Time remaining */}
        <TimeRemaining stats={stats} />

        {/* Lifecycle grids */}
        <GridPanel stats={stats} birthDate={birthDate} />

        {/* Import / export */}
        <ImportExport />

        <p style={{ fontSize: 10, color: 'var(--text-deep)', letterSpacing: '0.05em', textAlign: 'center', marginTop: 8 }}>
          systems run one cycle at a time.{' '}
          <span style={{ opacity: 0.5 }}>v2.0</span>
        </p>
      </div>

      {/* Fixed bottom command bar */}
      <CommandBar stats={stats} />

      {/* Overlays */}
      {sheet && <Sheet stats={stats} birthDate={birthDate} />}
      <LogSheet stats={stats} birthDate={birthDate} />
      <TimeItemSheet />

      {/* Toast notifications */}
      <ToastProvider />
    </>
  )
}
