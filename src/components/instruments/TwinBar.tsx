import { useEffect } from 'react'
import { useSpring, useTransform, motion } from 'framer-motion'
import { fmt } from '../../lib/dateUtils'

interface Props {
  weeksLived: number
  weeksRemaining: number
  totalWeeks: number
}

const MAX_H = 100   // bar height in SVG units
const BAR_W = 30
const BAR_X_LEFT  = 55
const BAR_X_RIGHT = 115
const BAR_Y_BASE  = 130

export function TwinBar({ weeksLived, weeksRemaining, totalWeeks }: Props) {
  const livedFrac  = totalWeeks > 0 ? weeksLived    / totalWeeks : 0
  const remainFrac = totalWeeks > 0 ? weeksRemaining / totalWeeks : 0

  const livedSpring  = useSpring(0, { stiffness: 50, damping: 20, mass: 1 })
  const remainSpring = useSpring(0, { stiffness: 50, damping: 20, mass: 1 })

  useEffect(() => {
    livedSpring.set(livedFrac)
    remainSpring.set(remainFrac)
  }, [livedFrac, remainFrac, livedSpring, remainSpring])

  // Amber bar height and y position derived from spring
  const livedH = useTransform(livedSpring,  (f) => Math.max(0, f * MAX_H))
  const livedY = useTransform(livedH,       (h) => BAR_Y_BASE - h)

  const remainH = useTransform(remainSpring, (f) => Math.max(0, f * MAX_H))
  const remainY = useTransform(remainH,      (h) => BAR_Y_BASE - h)

  // Scale lines
  const scales = [0.25, 0.50, 0.75]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Weeks</div>
      <svg viewBox="0 0 200 170" width="100%" height="100%">

        {/* Scale lines */}
        {scales.map((f) => {
          const y = BAR_Y_BASE - f * MAX_H
          return (
            <g key={f}>
              <line x1={BAR_X_LEFT - 8} y1={y} x2={BAR_X_RIGHT + BAR_W + 6} y2={y}
                stroke="var(--border-dim)" strokeWidth="0.6" strokeDasharray="2,2" />
              <text x={BAR_X_LEFT - 11} y={y} textAnchor="end" dominantBaseline="middle"
                fontSize="5.5" fill="var(--text-dim)">{Math.round(f * 100)}%</text>
            </g>
          )
        })}

        {/* Left bar — weeks lived */}
        <rect x={BAR_X_LEFT} y={BAR_Y_BASE - MAX_H} width={BAR_W} height={MAX_H}
          fill="var(--border-dim)" rx="2" />
        <motion.rect
          x={BAR_X_LEFT} width={BAR_W} rx="2"
          fill="var(--amber)"
          style={{ y: livedY, height: livedH }}
        />

        {/* Right bar — weeks remaining */}
        <rect x={BAR_X_RIGHT} y={BAR_Y_BASE - MAX_H} width={BAR_W} height={MAX_H}
          fill="var(--border-dim)" rx="2" />
        <motion.rect
          x={BAR_X_RIGHT} width={BAR_W} rx="2"
          fill="#253040"
          style={{ y: remainY, height: remainH }}
        />

        {/* Labels */}
        <text x={BAR_X_LEFT + BAR_W / 2}  y={BAR_Y_BASE + 10} textAnchor="middle"
          fontSize="6" fill="var(--text-secondary)">LIVED</text>
        <text x={BAR_X_RIGHT + BAR_W / 2} y={BAR_Y_BASE + 10} textAnchor="middle"
          fontSize="6" fill="var(--text-secondary)">LEFT</text>

        <text x={BAR_X_LEFT + BAR_W / 2}  y={BAR_Y_BASE + 20} textAnchor="middle"
          fontSize="8" fill="var(--amber)" fontFamily="'JetBrains Mono', monospace">
          {fmt(weeksLived)}
        </text>
        <text x={BAR_X_RIGHT + BAR_W / 2} y={BAR_Y_BASE + 20} textAnchor="middle"
          fontSize="8" fill="var(--text-dim)" fontFamily="'JetBrains Mono', monospace">
          {fmt(weeksRemaining)}
        </text>
      </svg>
    </div>
  )
}
