import { Stats } from '../../lib/calcStats'
import { ArcDial }          from './ArcDial'
import { AnalogClock }      from './AnalogClock'
import { TwinBar }          from './TwinBar'
import { TerminalCounters } from './TerminalCounters'
import s from './InstrumentPanel.module.css'

interface Props {
  stats: Stats
}

export function InstrumentPanel({ stats }: Props) {
  return (
    <section className={s.panel}>
      <div className={s.sectionLabel}>instrument cluster</div>
      <div className={s.grid}>

        <div className={s.instrument}>
          <ArcDial pct={stats.pct} />
        </div>

        <div className={s.instrument}>
          <AnalogClock clockStr={stats.clockStr} />
        </div>

        <div className={s.instrument}>
          <TwinBar
            weeksLived={stats.weeksLived}
            weeksRemaining={stats.weeksRemaining}
            totalWeeks={stats.totalWeeks}
          />
        </div>

        <div className={s.instrument}>
          <TerminalCounters stats={stats} />
        </div>

      </div>
    </section>
  )
}
