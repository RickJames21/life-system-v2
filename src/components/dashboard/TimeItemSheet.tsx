import { AnimatePresence, motion } from 'framer-motion'
import { useStore, DEFAULT_TIME_ITEMS } from '../../store/useStore'

export function TimeItemSheet() {
  const timeSheet      = useStore((s) => s.timeSheet)
  const timeItems      = useStore((s) => s.timeItems)
  const setTimeSheet   = useStore((s) => s.setTimeSheet)
  const setTimeItems   = useStore((s) => s.setTimeItems)
  const addTimeItem    = useStore((s) => s.addTimeItem)
  const deleteTimeItem = useStore((s) => s.deleteTimeItem)
  const updateTimeItem = useStore((s) => s.updateTimeItem)
  const saveTimeItems  = useStore((s) => s.saveTimeItems)

  const items = timeItems ?? [...DEFAULT_TIME_ITEMS]

  if (!timeSheet) return null

  return (
    <AnimatePresence>
      <motion.div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 300 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={(e) => { if (e.target === e.currentTarget) setTimeSheet(false) }}
      >
        <motion.div
          style={{ background: 'var(--bg-panel)', borderRadius: '14px 14px 0 0', width: '100%', maxWidth: 540, border: '1px solid var(--border)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ width: 32, height: 3, background: 'var(--border)', borderRadius: 2, margin: '12px auto' }} />

          <div style={{ padding: '0 18px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 300, color: 'var(--text-primary)' }}>edit time items</div>
            <button onClick={() => setTimeSheet(false)} style={{ fontSize: 20, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 6px', lineHeight: 1 }}>×</button>
          </div>

          <div style={{ overflow: 'auto', padding: '14px 18px 36px', flex: 1 }}>
            {items.map((item, i) => (
              <div key={i} style={{ background: 'var(--bg-inset)', borderRadius: 5, padding: 10, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                  <input
                    value={item.l}
                    onChange={(e) => updateTimeItem(i, 'l', e.target.value)}
                    style={{ flex: 1, padding: '6px 8px', fontSize: 12, color: 'var(--text-primary)', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, outline: 'none', fontFamily: 'inherit' }}
                  />
                  <button onClick={() => deleteTimeItem(i)} style={{ background: 'none', border: 'none', color: '#e07070', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>×</button>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <select
                    value={item.type}
                    onChange={(e) => updateTimeItem(i, 'type', e.target.value)}
                    style={{ padding: '5px 7px', fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, outline: 'none', fontFamily: 'inherit' }}
                  >
                    <option value="age">age</option>
                    <option value="date">date</option>
                  </select>
                  {item.type === 'age' ? (
                    <input
                      type="number"
                      value={String(item.target)}
                      onChange={(e) => updateTimeItem(i, 'target', +e.target.value)}
                      style={{ width: 64, padding: '5px 7px', fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, outline: 'none', fontFamily: 'inherit' }}
                    />
                  ) : (
                    <input
                      type="date"
                      value={String(item.target)}
                      onChange={(e) => updateTimeItem(i, 'target', e.target.value)}
                      style={{ flex: 1, padding: '5px 7px', fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, outline: 'none', colorScheme: 'dark', fontFamily: 'inherit' }}
                    />
                  )}
                  <select
                    value={item.unit}
                    onChange={(e) => updateTimeItem(i, 'unit', e.target.value)}
                    style={{ padding: '5px 7px', fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, outline: 'none', fontFamily: 'inherit' }}
                  >
                    <option value="weeks">weeks</option>
                    <option value="days">days</option>
                    <option value="years">years</option>
                  </select>
                </div>
              </div>
            ))}
            <button onClick={addTimeItem} style={{ width: '100%', padding: 8, fontSize: 11, background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 4, cursor: 'pointer', marginTop: 4, fontFamily: 'inherit' }}>+ add item</button>
            <button onClick={saveTimeItems} style={{ width: '100%', marginTop: 8, padding: 10, background: 'var(--amber)', color: 'var(--bg-deep)', border: 'none', borderRadius: 5, fontSize: 13, cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}>save</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
