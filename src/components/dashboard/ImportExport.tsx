import { useStore, ExternalForce } from '../../store/useStore'
import { wk, dateToWeekIdx } from '../../lib/dateUtils'
import { calcStats } from '../../lib/calcStats'
import { showToast } from '../common/Toast'

export function ImportExport() {
  const aiOpen   = useStore((s) => s.aiOpen)
  const setAiOpen = useStore((s) => s.setAiOpen)
  const birthDate = useStore((s) => s.birthDate)
  const notes    = useStore((s) => s.notes)
  const moods    = useStore((s) => s.moods)
  const lifespan = useStore((s) => s.lifespan)
  const mission  = useStore((s) => s.mission)
  const externalForces = useStore((s) => s.externalForces)

  function exportCSV() {
    const stats = calcStats(birthDate, lifespan)
    const rows = [['date', 'title', 'note', 'external_force_text']]
    for (let idx = 0; idx <= stats.weeksLived; idx++) {
      const s = new Date(birthDate)
      s.setDate(s.getDate() + idx * 7)
      const dateStr = s.toISOString().split('T')[0]
      const note = notes[wk(idx)] || ''
      const ef = externalForces[wk(idx)]
      const efText = ef ? (ef.userText || ef.summary || '') : ''
      rows.push([dateStr, `week ${idx + 1}`, note, efText])
    }
    const csv = rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n')
    dl(new Blob([csv], { type: 'text/csv' }), 'life-system-timeline.csv')
    showToast('csv exported')
  }

  function exportJSON() {
    const out: Record<string, unknown> = {}
    Object.keys(notes).forEach((key) => {
      if (!key.startsWith('w')) return
      const idx = +key.slice(1)
      const s = new Date(birthDate)
      s.setDate(s.getDate() + idx * 7)
      out[s.toISOString().split('T')[0]] = { weekIndex: idx, note: notes[key] }
    })
    dl(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }), 'life-system-timeline.json')
    showToast('json exported')
  }

  function doBackup() {
    const data = JSON.stringify({ notes, moods, externalForces, config: { birthDate, lifespan, mission } }, null, 2)
    dl(new Blob([data], { type: 'application/json' }), 'life-system-backup.json')
    showToast('backup downloaded')
  }

  function doRestore() {
    pick('.json', (text) => {
      try {
        const d = JSON.parse(text)
        if (d.notes) useStore.setState({ notes: d.notes })
        if (d.moods) useStore.setState({ moods: d.moods })
        if (d.externalForces) useStore.setState({ externalForces: d.externalForces })
        if (d.config?.birthDate) {
          useStore.setState({ birthDate: d.config.birthDate, lifespan: d.config.lifespan || 90, mission: d.config.mission || '' })
        }
        showToast('restore complete')
      } catch { showToast('invalid backup file') }
    })
  }

  function importFile() {
    pick('.csv,.json', (text, name) => {
      try {
        let imported = 0
        if (name.endsWith('.json')) {
          const d = JSON.parse(text)
          if (d.notes) { useStore.setState((s) => ({ notes: { ...s.notes, ...d.notes } })); imported = Object.keys(d.notes).length }
          else {
            const updates: Record<string, string> = {}
            Object.keys(d).forEach((ds) => {
              const idx = dateToWeekIdx(birthDate, ds)
              if (idx >= 0) { updates[wk(idx)] = d[ds].note || ''; imported++ }
            })
            useStore.setState((s) => ({ notes: { ...s.notes, ...updates } }))
          }
        } else {
          const updates: Record<string, string> = {}
          const efUpdates: Record<string, ExternalForce> = {}
          text.trim().split('\n').slice(1).forEach((line) => {
            const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || []
            const clean = (c: string) => c.replace(/^"|"$/g, '').replace(/""/g, '"')
            const ds = clean(cols[0] || ''), note = clean(cols[2] || cols[1] || '')
            if (!ds) return
            const idx = dateToWeekIdx(birthDate, ds)
            if (idx >= 0) {
              updates[wk(idx)] = note.slice(0, 140)
              imported++
              const efText = cols[3] ? clean(cols[3]) : ''
              if (efText) {
                efUpdates[wk(idx)] = { userText: efText, summary: efText, year: 0, url: undefined }
              }
            }
          })
          useStore.setState((s) => ({ notes: { ...s.notes, ...updates } }))
          if (Object.keys(efUpdates).length > 0) {
            useStore.setState((s) => ({ externalForces: { ...s.externalForces, ...efUpdates } }))
          }
        }
        showToast(`imported ${imported} entries`)
      } catch { showToast('import failed — check file format') }
    })
  }

  const AI_PROMPT = `Help me create a life timeline file for import into my Life System app.\n\nOutput in CSV format with these columns:\ndate,title,note\n\nRules:\n- Use real or approximate dates when exact dates are unknown\n- Keep titles short (under 40 chars)\n- Keep notes under 100 characters\n- Focus on meaningful milestones\n- Cover my life from childhood to today\n- Include recurring milestones: birthdays (every year), New Year's (Jan 1 each year), and any personal holidays or traditions\n- If exact dates are unknown, estimate reasonably\n\nI will paste my life history below:\n[PASTE YOUR LIFE HISTORY HERE]`

  function copyPrompt() {
    navigator.clipboard.writeText(AI_PROMPT)
      .then(() => showToast('prompt copied'))
      .catch(() => showToast('copy failed'))
  }

  const btnStyle: React.CSSProperties = {
    background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)',
    borderRadius: 4, cursor: 'pointer', fontSize: 11, padding: '7px 14px', fontFamily: 'inherit',
    transition: 'background 0.15s',
  }

  return (
    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 6, padding: '13px 14px', marginBottom: 14 }}>
      <div style={{ fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        timeline import / export
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 12 }}>
        export your notes as CSV or JSON. import a timeline file to map events to week squares.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <button style={btnStyle} onClick={exportCSV}>↓ export csv</button>
        <button style={btnStyle} onClick={exportJSON}>↓ export json</button>
        <button style={btnStyle} onClick={importFile}>↑ import csv / json</button>
        <button style={btnStyle} onClick={doBackup}>↓ backup</button>
        <button style={btnStyle} onClick={doRestore}>↑ restore</button>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        <button
          onClick={() => setAiOpen(!aiOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: 0, fontFamily: 'inherit' }}
        >
          <span style={{ fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', flex: 1, textAlign: 'left' }}>ai timeline generator</span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', opacity: 0.5 }}>{aiOpen ? '▲' : '▼'}</span>
        </button>
        {aiOpen && (
          <div style={{ marginTop: 10 }}>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>paste this prompt into any AI assistant to generate a timeline you can import.</p>
            <div style={{ background: 'var(--bg-inset)', border: '1px solid var(--border)', borderRadius: 5, padding: '10px 12px', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 10 }}>{AI_PROMPT}</div>
            <button style={btnStyle} onClick={copyPrompt}>copy prompt</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function dl(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

function pick(accept: string, cb: (text: string, name: string) => void) {
  const inp = document.createElement('input')
  inp.type = 'file'
  inp.accept = accept
  inp.onchange = (ev) => {
    const f = (ev.target as HTMLInputElement).files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = (re) => cb(re.target!.result as string, f.name)
    r.readAsText(f)
  }
  inp.click()
}
