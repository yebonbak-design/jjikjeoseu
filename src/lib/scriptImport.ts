import { uid } from './ids'
import type { ScriptPair } from '../types'

const SPEAKER_HEADER = /^\d+\.\s*\[[^\]]+\]\s*$/
const EXPR_LINE = /^표현\s*\|/

function hasHangul(s: string): boolean {
  return /[\uac00-\ud7a3]/.test(s)
}

function looksEnglish(s: string): boolean {
  return /[A-Za-z]/.test(s) && !hasHangul(s)
}

function isSpeakerHeader(s: string): boolean {
  return SPEAKER_HEADER.test(s)
}

function isExprLine(s: string): boolean {
  return EXPR_LINE.test(s)
}

function pairOf(a: string, b: string): { en: string; ko: string } {
  if (hasHangul(a) && !hasHangul(b)) return { en: b, ko: a }
  return { en: a, ko: b }
}

function splitInline(line: string): string[] | null {
  const body = line.replace(/^\d+[.)]\s*/, '')
  for (const sep of ['\t', ' // ', ' / ']) {
    if (body.includes(sep)) {
      const parts = body.split(sep).map((s) => s.trim())
      if (parts.length >= 2 && parts[0] && parts[1]) return parts
    }
  }
  return null
}

function lineOf(parts: string[], index: number): string {
  return (parts[index] ?? '').trim()
}

function toPair(en: string, ko: string, pron = '', note = ''): ScriptPair {
  return { id: uid('line'), en, ko, pron, note }
}

function cleanLines(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))
}

/** 예전 파일: 영어·한글이 두 줄씩만 반복될 때. */
function isLegacyTwoLine(lines: string[]): boolean {
  if (lines.length < 2 || lines.length % 2 !== 0) return false
  if (lines.some(isSpeakerHeader) || lines.some(isExprLine)) return false
  for (let i = 0; i < lines.length; i += 2) {
    const a = lines[i] ?? ''
    const b = lines[i + 1] ?? ''
    if (hasHangul(a) || !hasHangul(b)) return false
    if (!/[A-Za-z]/.test(a)) return false
  }
  return true
}

function parseLegacyTwoLine(lines: string[]): ScriptPair[] {
  const pairs: ScriptPair[] = []
  for (let i = 0; i < lines.length; i += 2) {
    const a = lines[i] ?? ''
    const b = lines[i + 1] ?? ''
    const { en, ko } = pairOf(a, b)
    pairs.push(toPair(en, ko))
  }
  return pairs
}

function takeCoreAndNotes(body: string[]): { en: string; ko: string; pron: string; note: string } {
  const core: string[] = []
  const notes: string[] = []
  for (const line of body) {
    if (isExprLine(line)) notes.push(line)
    else core.push(line)
  }
  return {
    en: core[0] ?? '',
    ko: core[1] ?? '',
    pron: core[2] ?? '',
    note: [...notes, ...core.slice(3)].join('\n'),
  }
}

/**
 * 01. [Sam] 같은 헤더로 문장을 나누고,
 * 영어·한글·발음 다음에 오는 표현 | 줄은 개수와 상관없이 부연설명으로 모읍니다.
 */
function parsePodcastBlocks(lines: string[]): ScriptPair[] {
  const pairs: ScriptPair[] = []
  let i = 0
  while (i < lines.length) {
    if (isSpeakerHeader(lines[i] ?? '')) i += 1
    const body: string[] = []
    while (i < lines.length && !isSpeakerHeader(lines[i] ?? '')) {
      body.push(lines[i] ?? '')
      i += 1
    }
    if (body.length === 0) continue
    const { en, ko, pron, note } = takeCoreAndNotes(body)
    if (!en && !ko && !pron && !note) continue
    pairs.push(toPair(en, ko, pron, note))
  }
  return pairs
}

/**
 * 헤더 없는 파일: 영어 → 한글 → 발음 → 부연설명(여러 줄 가능).
 * 다음 영어 문장이 나오면 부연설명을 끝냅니다.
 */
function parseFourField(lines: string[]): ScriptPair[] {
  const pairs: ScriptPair[] = []
  let i = 0
  while (i < lines.length) {
    const en = lines[i] ?? ''
    i += 1
    const ko = i < lines.length ? (lines[i] ?? '') : ''
    if (i < lines.length) i += 1
    const pron = i < lines.length ? (lines[i] ?? '') : ''
    if (i < lines.length) i += 1
    const notes: string[] = []
    while (i < lines.length) {
      const next = lines[i] ?? ''
      if (!next) {
        i += 1
        continue
      }
      if (looksEnglish(next) && !isExprLine(next)) break
      notes.push(next)
      i += 1
    }
    pairs.push(toPair(en, ko, pron, notes.join('\n')))
  }
  return pairs
}

/** 팟캐스트 스크립트: 헤더·영어·한글·발음·표현(0개 이상). */
export function parseBilingualScript(text: string): ScriptPair[] {
  const lines = cleanLines(text)
  if (lines.length === 0) return []

  if (lines.some(isSpeakerHeader)) return parsePodcastBlocks(lines)

  const inline = lines.map(splitInline)
  if (inline.length > 0 && inline.every((p) => p && p.length >= 2)) {
    return inline.map((p) => {
      const parts = p as string[]
      const { en, ko } = pairOf(lineOf(parts, 0), lineOf(parts, 1))
      return toPair(en, ko, lineOf(parts, 2), lineOf(parts, 3))
    })
  }

  if (isLegacyTwoLine(lines)) return parseLegacyTwoLine(lines)
  return parseFourField(lines)
}

export function blankScriptLine(): ScriptPair {
  return toPair('', '', '', '')
}
