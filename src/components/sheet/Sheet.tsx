import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { Stats } from '../../lib/calcStats'
import { wk, mk, yk, MONTH_NAMES, NOTE_LIMITS, MOOD_LABELS } from '../../lib/dateUtils'
import s from './Sheet.module.css'

interface Props {
  stats: Stats
  birthDate: string
}

export function Sheet({ stats, birthDate }: Props) {
  const sheet       = useStore((st) => st.sheet)
  const sheetText   = useStore((st) => st.sheetText)
  const notes       = useStore((st) => st.notes)
  const moods       = useStore((st) => st.moods)
  const closeSheet  = useStore((st) => st.closeSheet)
  const setSheetText = useStore((st) => st.setSheetText)
  const saveSheetNote = useStore((st) => st.saveSheetNote)
  const deleteSheetNote = useStore((st) => st.deleteSheetNote)
  const setSheetMood = useStore((st) => st.setSheetMood)
  const navigateSheet = useStore((st) => st.navigateSheet)
  const openLogSheet  = useStore((st) => st.openLogSheet)

  const touchStart = useRef(0)

  if (!sheet) return null

  const hasSaved    = !!notes[sheet.noteKey]
  const remaining   = sheet.limit - (sheetText || '').length

  const isCurrentWeek  = sheet.type === 'week' && sheet.noteKey === wk(stats.weeksLived)
  const alreadyLogged  = isCurrentWeek && (moods[sheet.noteKey] !== undefined || hasSaved)

  // Build children (nested notes for month/year/decade)
  const children = buildChildren(sheet.type, sheet.noteKey, notes, stats, birthDate)

  return (
    <AnimatePresence>
      <motion.div
        className={s.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => { if ((e.target as HTMLElement).classList.contains(s.overlay)) closeSheet() }}
      >
        <motion.div
          className={s.sheet}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => { touchStart.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchStart.current
            if (Math.abs(dx) > 50) navigateSheet(dx < 0 ? 1 : -1)
          }}
        >
          <div className={s.handle} />

          {/* Header */}
          <div className={s.header}>
            <div className={s.headerNav}>
              <button className={s.navBtn} onClick={() => navigateSheet(-1)}>‹</button>
              <div>
                <div className={s.title}>{sheet.title}</div>
                {sheet.subtitle && <div className={s.subtitle}>{sheet.subtitle}</div>}
              </div>
              <button className={s.navBtn} onClick={() => navigateSheet(1)}>›</button>
            </div>
            <button className={s.closeBtn} onClick={closeSheet}>×</button>
          </div>

          {/* Body */}
          <div className={s.body}>
            {/* Nested children */}
            {children.length > 0 && (
              <div className={s.childrenBlock}>
                {children}
              </div>
            )}

            {sheet.isPast ? (
              <>
                {/* Re-log banner for current week */}
                {alreadyLogged && (
                  <div className={s.relogBanner}>
                    <span className={s.relogText}>cycle already logged</span>
                    <button className={s.relogBtn} onClick={() => { closeSheet(); openLogSheet(stats.weeksLived) }}>
                      relog cycle
                    </button>
                  </div>
                )}

                {/* Mood selector (week only) */}
                {sheet.type === 'week' && (
                  <div className={s.moodSection}>
                    <div className={s.fieldLabel}>cycle rating</div>
                    <div className={s.moodRow}>
                      {[0, 1, 2, 3].map((i) => {
                        const sel = moods[sheet.noteKey] === i
                        return (
                          <button
                            key={i}
                            onClick={() => setSheetMood(i)}
                            className={s.moodBtn}
                            style={{
                              borderColor: sel ? (i <= 1 ? '#6A5A7A' : 'var(--amber)') : 'var(--border)',
                              background: sel ? (i === 0 ? '#4A3A5A' : i === 1 ? '#3d3550' : 'var(--amber-glow)') : 'var(--bg-inset)',
                              color: sel ? (i <= 1 ? 'var(--text-primary)' : 'var(--amber)') : 'var(--text-secondary)',
                            }}
                          >
                            {MOOD_LABELS[i]}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Note editor */}
                <div className={s.fieldLabel}>
                  {hasSaved ? 'edit note' : 'add note'} — {sheet.limit} char max
                </div>
                <textarea
                  className={s.textarea}
                  rows={4}
                  maxLength={sheet.limit}
                  placeholder="log entry…"
                  value={sheetText}
                  onChange={(e) => setSheetText(e.target.value)}
                />
                <div className={s.editorFooter}>
                  <span className={s.charCount} style={{ color: remaining < 20 ? '#e07070' : 'var(--text-dim)' }}>
                    {remaining} left
                  </span>
                  <div className={s.editorBtns}>
                    {hasSaved && (
                      <button className={s.deleteBtn} onClick={deleteSheetNote}>clear</button>
                    )}
                    <button className={s.cancelBtn} onClick={closeSheet}>cancel</button>
                    <button className={s.saveBtn} onClick={saveSheetNote}>save</button>
                  </div>
                </div>
              </>
            ) : (
              <div className={s.futureMsg}>
                <div className={s.futureMsgText}>this period hasn't happened yet.</div>
                <div className={s.futureMsgSub}>notes can only be added to past or current periods.</div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Build nested children ─────────────────────────────────────────────────────

function buildChildren(
  type: string,
  noteKey: string,
  notes: Record<string, string>,
  stats: Stats,
  birthDate: string,
): JSX.Element[] {
  if (type === 'week') return []

  const maxWeek = stats.weeksLived

  function noteRow(label: string, text: string, key: string) {
    return (
      <div key={key} className='__noterow' style={{ padding: '8px 10px', background: 'var(--bg-inset)', borderRadius: 5, marginBottom: 6, borderLeft: '2px solid var(--border)' }}>
        <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{text}</div>
      </div>
    )
  }

  function weekNotesForMonth(y: number, m: number): JSX.Element[] {
    const ws = Math.round((y * 12 + m) * (52.18 / 12))
    const we = Math.round((y * 12 + m + 1) * (52.18 / 12))
    const rows: JSX.Element[] = []
    for (let wi = ws; wi < Math.min(we, maxWeek + 1); wi++) {
      const t = notes[wk(wi)]
      if (t) rows.push(noteRow(`wk ${wi + 1}`, t, `wk-${wi}`))
    }
    return rows
  }

  if (type === 'month') {
    const [, rest] = noteKey.split('m')
    const [year, month] = rest.split('_').map(Number)
    const rows = weekNotesForMonth(year, month)
    if (!rows.length) return [<p key="empty" style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: 4 }}>no week entries this month.</p>]
    return rows
  }

  if (type === 'year') {
    const y = +noteKey.replace('y', '')
    const out: JSX.Element[] = []
    for (let m = 0; m < 12; m++) {
      const mt    = notes[mk(y, m)]
      const wrows = weekNotesForMonth(y, m)
      if (mt || wrows.length) {
        out.push(<div key={`mh-${m}`} style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.07em', textTransform: 'uppercase', padding: '6px 0 3px', borderTop: out.length ? '1px solid #2a2e32' : 'none', marginTop: out.length ? 4 : 0 }}>{MONTH_NAMES[m]}</div>)
        if (mt) out.push(noteRow('month note', mt, `mn-${m}`))
        out.push(...wrows)
      }
    }
    if (!out.length) return [<p key="empty" style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: 4 }}>no entries this year.</p>]
    return out
  }

  if (type === 'decade') {
    const d = +noteKey.replace('d', '')
    const out: JSX.Element[] = []
    for (let yi = 0; yi < 10; yi++) {
      const y = d * 10 + yi
      if (y > Math.floor(stats.yearsLived)) break
      const yt = notes[yk(y)]
      const yearRows: JSX.Element[] = []
      for (let m = 0; m < 12; m++) {
        const mt    = notes[mk(y, m)]
        const wrows = weekNotesForMonth(y, m)
        if (mt || wrows.length) {
          yearRows.push(<div key={`mh-${y}-${m}`} style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 0 2px', marginLeft: 8 }}>{MONTH_NAMES[m]}</div>)
          if (mt) yearRows.push(<div key={`mn-${y}-${m}`} style={{ marginLeft: 8 }}>{noteRow('month', mt, `dc-mn-${y}-${m}`)}</div>)
          wrows.forEach((r, ri) => yearRows.push(<div key={`wk-${y}-${m}-${ri}`} style={{ marginLeft: 8 }}>{r}</div>))
        }
      }
      if (yt || yearRows.length) {
        out.push(<div key={`yh-${y}`} style={{ fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 0 4px', borderTop: out.length ? '1px solid #2a2e32' : 'none', marginTop: out.length ? 4 : 0 }}>year {y}</div>)
        if (yt) out.push(noteRow('year note', yt, `yn-${y}`))
        out.push(...yearRows)
      }
    }
    if (!out.length) return [<p key="empty" style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: 4 }}>no entries this decade.</p>]
    return out
  }

  return []
}
