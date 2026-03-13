import { useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { Stats } from '../../lib/calcStats'
import { wk, weekRange, MOOD_LABELS } from '../../lib/dateUtils'
import { ExternalForcesPanel } from './ExternalForcesPanel'
import s from './LogSheet.module.css'

interface Props {
  stats: Stats
  birthDate: string
}

export function LogSheet({ stats, birthDate }: Props) {
  const logSheet   = useStore((st) => st.logSheet)
  const menuSheet  = useStore((st) => st.menuSheet)
  const logStep    = useStore((st) => st.logStep)
  const logMood    = useStore((st) => st.logMood)
  const logNote    = useStore((st) => st.logNote)
  const moods      = useStore((st) => st.moods)
  const mission    = useStore((st) => st.mission)
  const missionStartWeek = useStore((st) => st.missionStartWeek)

  const closeLogSheet      = useStore((st) => st.closeLogSheet)
  const logSetMood         = useStore((st) => st.logSetMood)
  const setLogNote         = useStore((st) => st.setLogNote)
  const logMissionAnswer   = useStore((st) => st.logMissionAnswer)
  const logSaveNewMission  = useStore((st) => st.logSaveNewMission)
  const logSkipMission     = useStore((st) => st.logSkipMission)
  const logSkipToNewMission = useStore((st) => st.logSkipToNewMission)
  const logSave            = useStore((st) => st.logSave)
  const setMenuSheet       = useStore((st) => st.setMenuSheet)

  const noteRef    = useRef<HTMLTextAreaElement>(null)
  const missionRef = useRef<HTMLInputElement>(null)

  const weekIdx = stats.weeksLived
  const mwk     = missionStartWeek !== null ? weekIdx - missionStartWeek : 0

  useEffect(() => {
    if (logStep === 'note' && noteRef.current)    noteRef.current.focus()
    if (logStep === 'newmission' && missionRef.current) missionRef.current.focus()
  }, [logStep])

  function MiniKey({ label, hotkey, onClick, selected }: { label: string; hotkey: string; onClick: () => void; selected?: boolean }) {
    return (
      <button
        onClick={onClick}
        className={`${s.key} ${selected ? s.keySelected : ''}`}
      >
        <span className={s.keyChar}>{hotkey}</span>
        <span className={s.keyLabel}>{label}</span>
      </button>
    )
  }

  function MiniKeypad({ keys }: { keys: Array<{ label: string; hotkey: string; onClick: () => void; selected?: boolean }> }) {
    const rows: JSX.Element[] = []
    for (let i = 0; i < keys.length; i += 2) {
      const pair = keys.slice(i, i + 2)
      rows.push(
        <div key={i} className={s.keyRow}>
          {pair.map((k) => <MiniKey key={k.hotkey} {...k} />)}
        </div>
      )
    }
    return <div className={s.keypad}>{rows}</div>
  }

  let body: JSX.Element | null = null

  if (logStep === 'rate') {
    body = (
      <>
        <div className={s.stepLabel}>&gt; rate cycle {weekIdx}</div>
        <MiniKeypad keys={[
          { hotkey: '0', label: MOOD_LABELS[0], onClick: () => logSetMood(0, weekIdx), selected: logMood === 0 },
          { hotkey: '1', label: MOOD_LABELS[1], onClick: () => logSetMood(1, weekIdx), selected: logMood === 1 },
          { hotkey: '2', label: MOOD_LABELS[2], onClick: () => logSetMood(2, weekIdx), selected: logMood === 2 },
          { hotkey: '3', label: MOOD_LABELS[3], onClick: () => logSetMood(3, weekIdx), selected: logMood === 3 },
        ]} />
      </>
    )
  }

  if (logStep === 'mission') {
    if (mission) {
      body = (
        <>
          <div className={s.stepLabel}>&gt; mission accomplished?</div>
          <div className={s.missionPreview}>"{mission.slice(0, 40)}" · {mwk}wk</div>
          <MiniKeypad keys={[
            { hotkey: 'Y', label: 'accomplished', onClick: () => logMissionAnswer(true, weekIdx) },
            { hotkey: 'N', label: 'still working', onClick: () => logMissionAnswer(false, weekIdx) },
          ]} />
        </>
      )
    } else {
      body = (
        <>
          <div className={s.stepLabel}>&gt; no active mission</div>
          <MiniKeypad keys={[
            { hotkey: 'Y', label: 'set one', onClick: logSkipToNewMission },
            { hotkey: 'N', label: 'skip',    onClick: logSkipMission },
          ]} />
        </>
      )
    }
  }

  if (logStep === 'newmission') {
    body = (
      <>
        <div className={s.stepLabel}>&gt; set new mission</div>
        <input
          ref={missionRef}
          type="text"
          maxLength={80}
          placeholder="what are you building?_"
          className={s.missionInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value.trim()
              if (val) logSaveNewMission(val, weekIdx)
              else logSkipMission()
            }
          }}
        />
        <div className={s.missionBtns}>
          <button
            className={s.missionSet}
            onClick={() => {
              const val = missionRef.current?.value.trim() || ''
              if (val) logSaveNewMission(val, weekIdx)
              else logSkipMission()
            }}
          >
            set mission
          </button>
          <button className={s.missionSkip} onClick={logSkipMission}>skip</button>
        </div>
      </>
    )
  }

  if (logStep === 'note') {
    const rem = 500 - logNote.length
    body = (
      <>
        <div className={s.stepLabel}>&gt; log entry <span style={{ opacity: 0.5 }}>optional</span></div>
        <textarea
          ref={noteRef}
          rows={6}
          maxLength={500}
          placeholder={'what happened this cycle…\n\nwrite freely, paragraphs welcome.'}
          className={s.noteTextarea}
          value={logNote}
          onChange={(e) => setLogNote(e.target.value)}
        />
        <ExternalForcesPanel weekIdx={weekIdx} birthDate={birthDate} />

        <div className={s.noteFooter}>
          <span className={s.charCount}>{rem} left</span>
          <div className={s.noteBtns}>
            <button className={s.cancelBtn} onClick={closeLogSheet}>cancel</button>
            <button className={s.saveBtn} onClick={() => logSave(weekIdx)}>save entry</button>
          </div>
        </div>
      </>
    )
  }

  // Menu sheet (already logged)
  const moodVal  = moods[wk(weekIdx)]
  const moodName = moodVal !== undefined ? MOOD_LABELS[moodVal] : null

  return (
    <>
      {/* Log flow sheet */}
      <AnimatePresence>
        {logSheet && (
          <motion.div
            className={s.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if ((e.target as HTMLElement).classList.contains(s.overlay)) closeLogSheet() }}
          >
            <motion.div
              className={s.sheet}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={s.handle} />
              <div className={s.header}>
                <div>
                  <div className={s.title}>cycle {weekIdx}</div>
                  <div className={s.subtitle}>{weekRange(birthDate, weekIdx)}</div>
                </div>
                <button className={s.closeBtn} onClick={closeLogSheet}>×</button>
              </div>
              <div className={s.body}>
                {body}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already-logged menu */}
      <AnimatePresence>
        {menuSheet && (
          <motion.div
            className={s.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if ((e.target as HTMLElement).classList.contains(s.overlay)) setMenuSheet(false) }}
          >
            <motion.div
              className={s.menuSheet}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={s.handle} />
              <div className={s.menuHeader}>
                <div className={s.title}>cycle {weekIdx}</div>
                <div className={s.subtitle}>{moodName ? `logged · ${moodName}` : 'logged'}</div>
              </div>
              <div className={s.menuBody}>
                <button
                  className={s.relogRow}
                  onClick={() => {
                    setMenuSheet(false)
                    // re-open log with existing values
                    useStore.getState().openLogSheet(-1)  // force open
                    useStore.setState({ logSheet: true, logStep: 'rate', logMood: moodVal ?? null, logNote: useStore.getState().notes[wk(weekIdx)] || '' })
                  }}
                >
                  <span className={s.relogIcon}>↺</span>
                  <span>relog cycle</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
