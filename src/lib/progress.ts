import { COINS } from '../data/catalog'
import { todayISO } from './dates'
import type { CellColor, StudyPost } from '../types'

export function rewardKey(postId: string, date: string): string {
  return `${postId}:${date}`
}

export function activeMethods(post: StudyPost) {
  return post.methods.filter((m) => m.text.trim())
}

export function checkedCount(post: StudyPost, date: string): number {
  const allowed = new Set(activeMethods(post).map((m) => m.id))
  return (post.dailyLogs[date] ?? []).filter((id) => allowed.has(id)).length
}

export function ratioFor(post: StudyPost, date: string): number {
  const total = activeMethods(post).length
  if (total <= 0) return 0
  return checkedCount(post, date) / total
}

export function colorFromRatio(ratio: number): CellColor {
  if (ratio >= 1) return 'blue'
  if (ratio >= 0.5) return 'yellow'
  return 'red'
}

export function coinsFor(color: CellColor): number {
  return COINS[color]
}

/** 기간 밖은 null. 미래는 null. 오늘·과거는 미기록도 빨강. */
export function cellColorForDate(post: StudyPost, date: string, today = todayISO()): CellColor | null {
  if (!post.startDate || !post.endDate) return null
  if (date < post.startDate || date > post.endDate) return null
  if (date > today) return null
  if (activeMethods(post).length === 0) {
    return date < today || date in post.dailyLogs ? 'red' : date === today ? null : 'red'
  }
  if (!(date in post.dailyLogs) && date === today) return null
  return colorFromRatio(ratioFor(post, date))
}

export function hasAttendance(posts: StudyPost[], date: string): boolean {
  return posts.some((p) => (p.dailyLogs[date]?.length ?? 0) > 0)
}
