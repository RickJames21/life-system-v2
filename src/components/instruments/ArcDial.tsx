import { useEffect } from 'react'
import { useSpring, useTransform, motion } from 'framer-motion'

interface Props {
  pct: number  // 0-100
}

// Coordinate system: 0° = 12 o'clock, increases clockwise
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const s = polarToCartesian(cx, cy, r, startAngle)
  const e = polarToCartesian(cx, cy, r, endAngle)
  // Going clockwise; sweep 270° so largeArc = 1
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`
}

const CX = 100, CY = 108
const R  = 72
const START_ANGLE = 225   // 7 o'clock
const TOTAL_SWEEP = 270   // degrees

// Full arc path for pathLength stroke trick
const FULL_ARC = describeArc(CX, CY, R, START_ANGLE, START_ANGLE + TOTAL_SWEEP)

// Tick positions: 11 marks = 0%, 10%, ..., 100%
const TICKS = Array.from({ length: 11 }, (_, i) => {
  const angle  = START_ANGLE + (i / 10) * TOTAL_SWEEP
  const major  = i % 5 === 0
  const outer  = polarToCartesian(CX, CY, R + (major ? 7 : 5), angle)
  const inner  = polarToCartesian(CX, CY, R + 1, angle)
  return { outer, inner, major }
})

const LABEL_0   = polarToCartesian(CX, CY, R + 16, START_ANGLE)
const LABEL_50  = polarToCartesian(CX, CY, R + 16, START_ANGLE + TOTAL_SWEEP / 2)
const LABEL_100 = polarToCartesian(CX, CY, R + 16, START_ANGLE + TOTAL_SWEEP)

export function ArcDial({ pct }: Props) {
  const springPct = useSpring(0, { stiffness: 50, damping: 20, mass: 1 })

  useEffect(() => {
    springPct.set(pct / 100)
  }, [pct, springPct])

  // Needle tip computed from spring value
  const needleAngle = useTransform(springPct, [0, 1], [START_ANGLE, START_ANGLE + TOTAL_SWEEP])
  const needleX = useTransform(needleAngle, (a) => polarToCartesian(CX, CY, R - 6, a).x)
  const needleY = useTransform(needleAngle, (a) => polarToCartesian(CX, CY, R - 6, a).y)
  const tailX   = useTransform(needleAngle, (a) => polarToCartesian(CX, CY, -12, a).x)
  const tailY   = useTransform(needleAngle, (a) => polarToCartesian(CX, CY, -12, a).y)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Life Elapsed</div>
      <svg viewBox="0 0 200 200" width="100%" height="100%">

        {/* Outer bezel ring */}
        <circle cx={CX} cy={CY} r={R + 18} fill="var(--bg-inset)" stroke="var(--border)" strokeWidth="1" />

        {/* Track — full grey arc */}
        <path
          d={FULL_ARC}
          fill="none"
          stroke="#252a2f"
          strokeWidth="9"
          strokeLinecap="butt"
        />

        {/* Elapsed amber arc — pathLength drives visible portion */}
        <motion.path
          d={FULL_ARC}
          fill="none"
          stroke="var(--amber)"
          strokeWidth="9"
          strokeLinecap="butt"
          style={{ pathLength: springPct }}
        />

        {/* Tick marks */}
        {TICKS.map((t, i) => (
          <line
            key={i}
            x1={t.inner.x.toFixed(2)} y1={t.inner.y.toFixed(2)}
            x2={t.outer.x.toFixed(2)} y2={t.outer.y.toFixed(2)}
            stroke={t.major ? 'var(--text-secondary)' : '#3d4248'}
            strokeWidth={t.major ? 1.5 : 0.8}
          />
        ))}

        {/* Range labels */}
        <text x={LABEL_0.x.toFixed(1)}   y={LABEL_0.y.toFixed(1)}   textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill="var(--text-dim)">0</text>
        <text x={LABEL_50.x.toFixed(1)}  y={LABEL_50.y.toFixed(1)}  textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill="var(--text-dim)">50</text>
        <text x={LABEL_100.x.toFixed(1)} y={LABEL_100.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill="var(--text-dim)">100</text>

        {/* Needle tail */}
        <motion.line
          x1={CX} y1={CY}
          x2={tailX} y2={tailY}
          stroke="var(--text-dim)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Needle */}
        <motion.line
          x1={CX} y1={CY}
          x2={needleX} y2={needleY}
          stroke="var(--amber)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Center hub */}
        <circle cx={CX} cy={CY} r="5" fill="var(--bg-panel)" stroke="var(--amber)" strokeWidth="1.5" />

        {/* Value readout below center */}
        <text x={CX} y={CY + 26} textAnchor="middle" fontSize="13" fontWeight="300" fill="var(--text-primary)" fontFamily="'Inter', sans-serif">
          {pct.toFixed(1)}%
        </text>
      </svg>
    </div>
  )
}
