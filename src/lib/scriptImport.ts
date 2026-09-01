import { uid } from './ids'
import type { ScriptPair } from '../types'

function hasHangul(s: string): boolean {
  return /[\uac00-\ud7a3]/.test(s)
}

function pairOf(a: string, b: string): { en: string; ko: string } {
  if (hasHangul(a) && !hasHangul(b)) return { en: b, ko: a }
  return { en: a, ko: b }
}

function splitInline(line: string): [string, string] | null {
  const body = line.replace(/^\d+[.)]\s*/, '')
  for (const sep of ['\t', ' | ', ' // ', ' / ']) {
    if (body.includes(sep)) {
      const [l, r] = body.split(sep).map((s) => s.trim())
      if (l && r) return [l, r]
    }
  }
  return null
}

/** 한영 텍스트: 한 줄에 영/한, 또는 영어 다음 줄에 한글. */
export function parseBilingualScript(text: string): ScriptPair[] {
  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))

  const inline = lines.map(splitInline)
  if (inline.length > 0 && inline.every(Boolean)) {
    return inline.map((p) => {
      const [a, b] = p as [string, string]
      const { en, ko } = pairOf(a, b)
      return { id: uid('line'), en, ko }
    })
  }

  const pairs: ScriptPair[] = []
  for (let i = 0; i < lines.length; ) {
    const a = lines[i]
    const b = lines[i + 1]
    if (!b) {
      const { en, ko } = hasHangul(a) ? { en: '', ko: a } : { en: a, ko: '' }
      pairs.push({ id: uid('line'), en, ko })
      break
    }
    const { en, ko } = pairOf(a, b)
    pairs.push({ id: uid('line'), en, ko })
    i += 2
  }
  return pairs
}
