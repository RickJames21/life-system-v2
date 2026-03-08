import { useState } from 'react'
import { useStore } from '../../store/useStore'
import s from './Setup.module.css'

export function Setup() {
  const setConfig = useStore((st) => st.setConfig)
  const [birthDate, setBirthDate] = useState('')
  const [lifespan,  setLifespan]  = useState(90)
  const [mission,   setMission]   = useState('')

  function handleStart() {
    if (!birthDate) return
    setConfig({ birthDate, lifespan, mission })
  }

  return (
    <div className={s.container}>
      <div className={s.inner}>
        <div className={s.header}>
          <h1 className={s.title}>life system</h1>
          <p className={s.subtitle}>a visualization of your time as a running system.</p>
        </div>

        <div className={s.form}>
          <div className={s.field}>
            <label className={s.label}>birth date</label>
            <input
              type="date"
              className={s.input}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div className={s.field}>
            <label className={s.label}>expected lifespan</label>
            <select
              className={s.input}
              value={lifespan}
              onChange={(e) => setLifespan(+e.target.value)}
            >
              <option value={80}>80 years</option>
              <option value={90}>90 years (default)</option>
              <option value={100}>100 years</option>
              <option value={120}>120 years (optimistic)</option>
            </select>
          </div>

          <div className={s.field}>
            <label className={s.label}>
              current mission <span className={s.optional}>(optional)</span>
            </label>
            <input
              type="text"
              className={s.input}
              placeholder="what are you building?"
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            />
          </div>

          <button className={s.startBtn} onClick={handleStart} disabled={!birthDate}>
            initialize system
          </button>
        </div>

        <p className={s.footer}>systems run one cycle at a time.</p>
      </div>
    </div>
  )
}
