import { FORAGE_ITEMS } from '../data/catalog'
import type { ForageItem, Rarity } from '../types'

export function remainingWalks(
  walks: { date: string; count: number },
  today: string,
  chores: number,
): number {
  if (walks.date !== today) return chores
  return Math.max(0, chores - walks.count)
}

export function rollForage(wisdom: number, max: number, level: number): ForageItem {
  const pool = FORAGE_ITEMS.filter((item) => item.unlockLevel <= level)
  const usable = pool.length > 0 ? pool : FORAGE_ITEMS.filter((item) => item.unlockLevel <= 1)
  const weights = weightsFor(wisdom, max)
  const bag: ForageItem[] = []
  for (const item of usable) {
    const w = Math.max(1, Math.round(weights[item.rarity]))
    for (let i = 0; i < w; i++) bag.push(item)
  }
  return bag[Math.floor(Math.random() * bag.length)] ?? usable[0] ?? FORAGE_ITEMS[0]
}

function weightsFor(wisdom: number, max: number): Record<Rarity, number> {
  const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, wisdom) / max)
  return {
    common: Math.max(6, 18 - ratio * 10),
    uncommon: 10,
    rare: 3 + ratio * 8,
    legendary: 0.5 + ratio * 4,
  }
}
