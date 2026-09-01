import { asset } from './asset'
import { addDays, todayISO } from './dates'
import { cellColorForDate } from './progress'
import type { CellColor, Mood, StudyPost } from '../types'

const SPRITES: Record<Mood, string> = {
  happy: `${asset('sprites/jjik-happy.png')}?v=4`,
  neutral: `${asset('sprites/jjik-neutral.png')}?v=4`,
  sad: `${asset('sprites/jjik-sad.png')}?v=4`,
  angry: `${asset('sprites/jjik-angry.png')}?v=4`,
}

export function spriteFor(mood: Mood): string {
  return SPRITES[mood]
}

export function moodFromPosts(posts: StudyPost[], today = todayISO()): Mood {
  const recent: CellColor[] = []
  for (let i = 6; i >= 0; i--) {
    const date = addDays(today, -i)
    const colors = posts
      .map((p) => cellColorForDate(p, date, today))
      .filter((c): c is CellColor => c !== null)
    if (colors.length === 0) continue
    if (colors.every((c) => c === 'blue')) recent.push('blue')
    else if (colors.every((c) => c === 'red')) recent.push('red')
    else recent.push('yellow')
  }

  if (recent.length === 0) return 'neutral'
  const last3 = recent.slice(-3)
  const redStreak = countTail(recent, 'blue')
  if (redStreak >= 3) return 'angry'
  if (last3.length >= 2 && last3.every((c) => c === 'blue')) return 'happy'
  if (last3[last3.length - 1] === 'red') return 'sad'
  if (recent[recent.length - 1] === 'blue') return 'happy'
  return 'neutral'
}

function countTail(list: CellColor[], stop: CellColor): number {
  let n = 0
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i] === stop) break
    if (list[i] === 'red') n += 1
    else break
  }
  return n
}

export const MOOD_LABEL: Record<Mood, string> = {
  happy: '기쁨',
  neutral: '평온',
  sad: '서운함',
  angry: '속상함',
}
