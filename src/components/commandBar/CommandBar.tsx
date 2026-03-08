import { useStore } from '../../store/useStore'
import { Stats } from '../../lib/calcStats'
import { wk, MOOD_LABELS } from '../../lib/dateUtils'
import s from './CommandBar.module.css'

interface Props {
  stats: Stats
}

export function CommandBar({ stats }: Props) {
  const notes         = useStore((st) => st.notes)
  const moods         = useStore((st) => st.moods)
  const mission       = useStore((st) => st.mission)
  const missionStartWeek = useStore((st) => st.missionStartWeek)
  const openLogSheet  = useStore((st) => st.openLogSheet)

  const weekIdx  = stats.weeksLived
  const mood     = moods[wk(weekIdx)]
  const hasLog   = mood !== undefined || !!notes[wk(weekIdx)]
  const moodName = hasLog && mood !== undefined ? MOOD_LABELS[mood] : null
  const preview  = notes[wk(weekIdx)]
  const mwk      = missionStartWeek !== null ? weekIdx - missionStartWeek : 0

  return (
    <div className={s.bar} onClick={() => openLogSheet(weekIdx)}>
      <span className={s.prompt}>&gt;</span>

      <span className={s.text}>
        {hasLog ? (
          <>
            cycle {weekIdx} ·{' '}
            <em className={s.accent}>{moodName ?? 'logged'}</em>
            {preview && (
              <span className={s.preview}> · "{preview.slice(0, 38)}{preview.length > 38 ? '…' : ''}"</span>
            )}
          </>
        ) : (
          <>
            cycle {weekIdx} · <em className={s.dim}>no entry</em>
          </>
        )}
        {mission && (
          <span className={s.missionHint}>
            {' '}· {mission.slice(0, 22)}{mission.length > 22 ? '…' : ''} {mwk}wk
          </span>
        )}
      </span>

      <span className={s.cursor}>_</span>
    </div>
  )
}
