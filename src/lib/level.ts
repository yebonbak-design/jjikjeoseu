import {
  COMPANIONS,
  MAX_LEVEL,
  PEOPLE_UNLOCK_LEVEL,
  RANCH_CHORES_PER_DAY,
  STAT_BASE_MAX,
  STAT_ORDER,
  STAT_PER_LEVEL,
} from '../data/catalog'
import type { Player, StatId } from '../types'

export function clampLevel(n: number): number {
  const v = Math.floor(Number(n))
  if (!Number.isFinite(v) || v < 1) return 1
  return Math.min(MAX_LEVEL, v)
}

export function statMaxForLevel(level: number): number {
  return STAT_BASE_MAX + (clampLevel(level) - 1) * STAT_PER_LEVEL
}

export function personRosterSize(): number {
  return COMPANIONS.filter((c) => c.kind === 'person').length
}

/** 레벨 5에 1칸, 이후 레벨마다 1칸. 사람 목록 수를 넘지 않습니다. */
export function personSlotsForLevel(level: number): number {
  if (level < PEOPLE_UNLOCK_LEVEL) return 0
  return Math.min(personRosterSize(), level - PEOPLE_UNLOCK_LEVEL + 1)
}

export function ownedPeople(ownedIds: string[]): string[] {
  const people = new Set(COMPANIONS.filter((c) => c.kind === 'person').map((c) => c.id))
  return ownedIds.filter((id) => people.has(id))
}

export function ranchChoresFor(vitality: number, max: number, ownedIds: string[]): number {
  let n = RANCH_CHORES_PER_DAY
  const ratio = max <= 0 ? 0 : vitality / max
  if (ratio >= 0.5) n += 1
  if (ratio >= 1) n += 1
  if (ownedIds.includes('bordercollie')) n += 1
  return n
}

export function sellBonusFor(ownedIds: string[]): number {
  return ownedIds.includes('simon') ? 1 : 0
}

export function gaugesFull(stats: Record<StatId, number>, max: number): boolean {
  return STAT_ORDER.every((id) => stats[id] >= max)
}

export function intimacyRatio(player: Player): number {
  const max = statMaxForLevel(player.level)
  if (max <= 0) return 0
  return Math.min(1, player.stats.intimacy / max)
}

export type IntimacyBand = 'cold' | 'polite' | 'warm' | 'close'

export function intimacyBand(ratio: number): IntimacyBand {
  if (ratio >= 0.8) return 'close'
  if (ratio >= 0.5) return 'warm'
  if (ratio >= 0.25) return 'polite'
  return 'cold'
}

export function levelUpBlurb(level: number, overflow = 0): string {
  const extra = overflow > 0 ? ` 넘치는 ${overflow}는 은화로 남았습니다.` : ''
  if (level === PEOPLE_UNLOCK_LEVEL) return `레벨 ${level}! 동료를 들일 자리가 생겼습니다.${extra}`
  if (level >= MAX_LEVEL) return `레벨 ${level}! 만렙입니다. 넘치는 돌봄은 은화로 남습니다.${extra}`
  return `레벨 ${level}! 세 칸이 가득 차 한 뼘 자랐습니다.${extra}`
}
