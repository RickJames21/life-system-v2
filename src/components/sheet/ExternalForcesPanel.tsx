import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DOMPurify from 'dompurify'
import { useStore } from '../../store/useStore'
import { useExternalForces } from '../../hooks/useExternalForces'
import { wk } from '../../lib/dateUtils'
import s from './ExternalForcesPanel.module.css'

interface Props {
  weekIdx: number
  birthDate: string
}

export function ExternalForcesPanel({ weekIdx, birthDate }: Props) {
  const weekKey = wk(weekIdx)

  const { savedForce, setExternalForce, updateExternalForceText, clearExternalForce } = useStore((st) => ({
    savedForce: st.externalForces[weekKey],
    setExternalForce: st.setExternalForce,
    updateExternalForceText: st.updateExternalForceText,
    clearExternalForce: st.clearExternalForce,
  }))

  const { status, events, currentIdx, trigger, next } = useExternalForces(birthDate, weekIdx)

  // Local state: whether to show cycling panel even when savedForce exists
  // (user clicked "change signal" or "scan signal" from idle with existing force)
  const [showCycling, setShowCycling] = useState(false)

  // Signal block local textarea value (mirrors store, updated on change)
  const [signalText, setSignalText] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentSignalText = signalText !== null ? signalText : (savedForce?.userText ?? '')

  function handleSignalChange(val: string) {
    setSignalText(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateExternalForceText(weekKey, val)
    }, 400)
  }

  function handleReset() {
    if (!savedForce) return
    setSignalText(savedForce.summary)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    updateExternalForceText(weekKey, savedForce.summary)
  }

  function handleClear() {
    setSignalText(null)
    clearExternalForce(weekKey)
  }

  function handleAddToRecord() {
    if (events.length === 0) return
    const ev = events[currentIdx]
    setExternalForce(weekKey, {
      year: ev.year,
      summary: DOMPurify.sanitize(ev.text),
      userText: DOMPurify.sanitize(ev.text),
      url: ev.url,
    })
    setSignalText(null)
    setShowCycling(false)
  }

  function handleChangeSignal() {
    setShowCycling(true)
  }

  function handleScanSignal() {
    setShowCycling(false)
    trigger()
  }

  // Determine which branch to render
  // If savedForce exists and not in cycling mode: show Signal block + change option
  const hasForce = !!savedForce && !showCycling

  return (
    <div className={s.panel}>
      {/* Section divider + label — both shown together, or neither */}
      {!hasForce && (
        <>
          <div className={s.divider} />
          <div className={s.sectionLabel}>&gt; external forces</div>
        </>
      )}

      {/* BRANCH A + saved force visible: show "change signal" option above signal block */}
      {hasForce && (
        <div className={s.changeRow}>
          <button
            className={s.changeBtn}
            onClick={handleChangeSignal}
            aria-label="change signal"
          >
            change signal
          </button>
        </div>
      )}

      {/* BRANCH B: idle, no force (or cycling mode) */}
      {!hasForce && status === 'idle' && (
        <button
          className={s.triggerBtn}
          onClick={handleScanSignal}
          aria-label="scan signal"
        >
          scan signal
        </button>
      )}

      {/* BRANCH C: loading */}
      {!hasForce && status === 'loading' && (
        <div className={s.scanning}>scanning...</div>
      )}

      {/* BRANCH D: loaded — cycling panel */}
      {!hasForce && status === 'loaded' && events.length > 0 && (
        <AnimatePresence>
          <motion.div
            key="cycling"
            className={s.cyclingPanel}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          >
            <div className={s.eventBox}>
              <span className={s.eventYear}>{events[currentIdx].year}</span>
              <span className={s.eventSep}> — </span>
              <span className={s.eventText}>
                {DOMPurify.sanitize(events[currentIdx].text)}
              </span>
            </div>
            <div className={s.cyclingBtns}>
              <button
                className={s.nextBtn}
                onClick={next}
                aria-label={savedForce ? 'change signal' : 'show next'}
              >
                {savedForce ? 'Change Signal' : 'Show Next'}
              </button>
              <button
                className={s.addBtn}
                onClick={handleAddToRecord}
                aria-label="add to record"
              >
                Add to Record
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* BRANCH E: error or loaded-but-empty (defensive) */}
      {!hasForce && (status === 'error' || (status === 'loaded' && events.length === 0)) && (
        <div className={s.errorRow}>
          <span className={s.errorText}>No external signal</span>
          <button
            className={s.retryBtn}
            onClick={() => trigger()}
            aria-label="retry"
          >
            retry
          </button>
        </div>
      )}

      {/* Signal block — shown when force is saved (in any mode) */}
      <AnimatePresence>
        {savedForce && (
          <motion.div
            key="signal-block"
            className={s.signalBlock}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          >
            <div className={s.signalHeader}>
              <span className={s.signalLabel}>Signal</span>
              <button
                className={s.clearBtn}
                onClick={handleClear}
                aria-label="clear signal"
              >
                ×
              </button>
            </div>
            <textarea
              className={s.signalTextarea}
              value={currentSignalText}
              onChange={(e) => handleSignalChange(e.target.value)}
              rows={3}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
