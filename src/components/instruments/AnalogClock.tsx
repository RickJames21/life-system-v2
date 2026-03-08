import { useEffect } from 'react'
import { useSpring, useTransform, motion } from 'framer-motion'

interface Props {
  clockStr: string  // "HH:MM"
}

const CX = 100, CY = 100, R = 76

function handEnd(cx: number, cy: number, r: number, angleDeg: number) {
  // 0° = 12 o'clock, clockwise
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

// 12 tick positions
const CLOCK_TICKS = Array.from({ length: 60 }, (_, i) => {
  const angle  = (i / 60) * 360
  const major  = i % 5 === 0
  const outer  = handEnd(CX, CY, R, angle)
  const inner  = handEnd(CX, CY, major ? R - 8 : R - 4, angle)
  return { outer, inner, major }
})

export function AnalogClock({ clockStr }: Props) {
  const [h, m] = clockStr.split(':').map(Number)

  // Hour angle: 0-360 per 12 hours
  const hourDeg   = ((h % 12) / 12) * 360 + (m / 60) * 30
  // Minute angle: 0-360 per 60 minutes
  const minuteDeg = (m / 60) * 360

  // Animate hour hand from previous position
  const hourSpring = useSpring(0, { stiffness: 50, damping: 20, mass: 1 })
  const minSpring  = useSpring(0, { stiffness: 50, damping: 20, mass: 1 })

  useEffect(() => {
    hourSpring.set(hourDeg)
    minSpring.set(minuteDeg)
  }, [hourDeg, minuteDeg, hourSpring, minSpring])

  const hourX = useTransform(hourSpring, (a) => handEnd(CX, CY, R * 0.58, a).x)
  const hourY = useTransform(hourSpring, (a) => handEnd(CX, CY, R * 0.58, a).y)
  const minX  = useTransform(minSpring,  (a) => handEnd(CX, CY, R * 0.78, a).x)
  const minY  = useTransform(minSpring,  (a) => handEnd(CX, CY, R * 0.78, a).y)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>System Time</div>
      <svg viewBox="0 0 200 200" width="100%" height="100%">

        {/* Bezel */}
        <circle cx={CX} cy={CY} r={R + 10} fill="var(--bg-inset)" stroke="var(--border)" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={R}      fill="none"            stroke="var(--border-dim)" strokeWidth="0.5" />

        {/* Tick marks */}
        {CLOCK_TICKS.map((t, i) => (
          <line
            key={i}
            x1={t.inner.x.toFixed(2)} y1={t.inner.y.toFixed(2)}
            x2={t.outer.x.toFixed(2)} y2={t.outer.y.toFixed(2)}
            stroke={t.major ? 'var(--text-secondary)' : '#2f3338'}
            strokeWidth={t.major ? 1.5 : 0.7}
          />
        ))}

        {/* 12 / 6 labels */}
        <text x={CX} y={CY - R + 18} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="var(--text-dim)">XII</text>
        <text x={CX} y={CY + R - 18} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="var(--text-dim)">VI</text>

        {/* Minute hand */}
        <motion.line
          x1={CX} y1={CY}
          x2={minX} y2={minY}
          stroke="var(--text-secondary)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Hour hand */}
        <motion.line
          x1={CX} y1={CY}
          x2={hourX} y2={hourY}
          stroke="var(--amber)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle cx={CX} cy={CY} r="4" fill="var(--amber)" />

        {/* Digital readout */}
        <text x={CX} y={CY + 26} textAnchor="middle" fontSize="10" fill="var(--text-dim)" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.05em">
          {clockStr}
        </text>
      </svg>
    </div>
  )
}
