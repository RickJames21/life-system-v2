import s from './SkyDisplay.module.css'

interface Props {
  clockStr: string
  pct: number  // 0-100
}

export function SkyDisplay({ clockStr, pct }: Props) {
  const [h, m] = clockStr.split(':').map(Number)
  const t = (h * 60 + m) / 1440

  const arcPct = Math.max(0, Math.min(1, (t - 0.25) / 0.5))
  const aRad = ((180 - arcPct * 180) * Math.PI) / 180

  const W = 600, H = 130, cx = W / 2, cy = H + 20, r = H * 0.9

  const sx = cx + r * Math.cos(aRad)
  const sy = cy - r * Math.sin(aRad)

  const isNight = t < 0.25 || t > 0.75
  const sunVis  = !isNight && sy < H

  const mRad = ((180 - arcPct * 180) - 180) * Math.PI / 180
  const mx = cx + r * Math.cos(mRad)
  const my = cy - r * Math.sin(mRad)
  const moonVis = isNight && my < H

  let sky: [string, string]
  if      (t < 0.20) sky = ['#0a0c10', '#0d1117']
  else if (t < 0.25) sky = ['#1a1220', '#2d1b35']
  else if (t < 0.30) sky = ['#2d1f3d', '#c2714f']
  else if (t < 0.38) sky = ['#1a2a4a', '#e8956d']
  else if (t < 0.62) sky = ['#1a2d4a', '#243a52']
  else if (t < 0.70) sky = ['#1a2a3a', '#2a3a4a']
  else if (t < 0.75) sky = ['#2a1f3a', '#c2714f']
  else if (t < 0.80) sky = ['#1a1225', '#3d1f2d']
  else                sky = ['#0a0c10', '#0d1117']

  const sunColor = isNight ? null
    : (t < 0.30 || t > 0.70) ? '#e8956d'
    : (t < 0.38 || t > 0.62) ? '#f5c842'
    : '#F2C572'

  const stars: [number, number][] = [
    [80,20],[150,45],[230,15],[310,35],[420,18],[500,40],[560,22],
    [100,60],[260,55],[380,65],[470,50],[540,70],[60,80],[330,80],
  ]

  return (
    <div className={s.container}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={sky[0]} />
            <stop offset="100%" stopColor={sky[1]} />
          </linearGradient>
          {sunColor && (
            <radialGradient id="sunG" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={sunColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={sunColor} stopOpacity="0" />
            </radialGradient>
          )}
          <radialGradient id="moonG" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#aab4c8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#aab4c8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fadeG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="40%"  stopColor="#1F2124" stopOpacity="0" />
            <stop offset="100%" stopColor="#1F2124" stopOpacity="1" />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill="url(#skyG)" />

        {isNight && stars.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.9" fill="#e6e8ea" opacity={0.4 + (i % 3) * 0.15} />
        ))}

        {sunVis && sunColor && (
          <>
            <ellipse cx={sx} cy={sy} rx="52" ry="52" fill="url(#sunG)" />
            <circle  cx={sx} cy={sy} r="14"  fill={sunColor} opacity="0.92" />
          </>
        )}

        {moonVis && (
          <>
            <ellipse cx={mx} cy={my} rx="38" ry="38" fill="url(#moonG)" />
            <circle  cx={mx} cy={my} r="9"   fill="#d0d8e8" opacity="0.85" />
          </>
        )}

        <line x1="0" y1={H - 1} x2={W} y2={H - 1} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <rect width={W} height={H} fill="url(#fadeG)" />
      </svg>

      <div className={s.clockDisplay}>
        <div className={s.clockTime}>{clockStr}</div>
        <div className={s.clockLabel}>system time · life elapsed</div>
      </div>
    </div>
  )
}
