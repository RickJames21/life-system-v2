import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { calcStats, Stats } from '../lib/calcStats'

export function useStats(): Stats | null {
  const birthDate = useStore((s) => s.birthDate)
  const lifespan  = useStore((s) => s.lifespan)
  return useMemo(() => {
    if (!birthDate) return null
    return calcStats(birthDate, lifespan)
  }, [birthDate, lifespan])
}
