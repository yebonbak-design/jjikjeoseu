import { COMPANIONS } from './data/catalog'
import { clampLevel, statMaxForLevel } from './lib/level'
import { uid } from './lib/ids'
import type { AppData, Player, StudyPost } from './types'

const KEY = 'jjikjeoseu-v1'

export function emptyPlayer(): Player {
  return {
    silver: 0,
    level: 1,
    stats: { intimacy: 0, vitality: 0, wisdom: 0 },
    ownedCompanionIds: [],
    inventory: {},
    cellRewards: {},
    walks: { date: '', count: 0 },
  }
}

export function emptyPost(): StudyPost {
  return {
    id: uid('post'),
    title: '',
    tag: 'english',
    youtubeUrl: '',
    youtubeStart: 0,
    youtubeEnd: 0,
    youtubeLoop: false,
    scripts: [{ id: uid('line'), en: '', ko: '' }],
    hideMode: 'both',
    bigGoal: '',
    methods: [{ id: uid('m'), text: '' }],
    startDate: '',
    endDate: '',
    dailyLogs: {},
    createdAt: new Date().toISOString(),
  }
}

function migrate(raw: AppData): AppData {
  const level = clampLevel(raw.player?.level ?? 1)
  const max = statMaxForLevel(level)
  const mergedStats = { ...emptyPlayer().stats, ...raw.player?.stats }
  const player: Player = {
    ...emptyPlayer(),
    ...raw.player,
    level,
    stats: {
      intimacy: Math.min(max, Math.max(0, mergedStats.intimacy)),
      vitality: Math.min(max, Math.max(0, mergedStats.vitality)),
      wisdom: Math.min(max, Math.max(0, mergedStats.wisdom)),
    },
    ownedCompanionIds: (raw.player?.ownedCompanionIds ?? []).filter((id) =>
      COMPANIONS.some((c) => c.id === id),
    ),
    inventory: raw.player?.inventory ?? {},
    cellRewards: raw.player?.cellRewards ?? {},
    walks: raw.player?.walks ?? { date: '', count: 0 },
  }
  return {
    posts: (raw.posts ?? []).map((p) => ({
      ...p,
      youtubeStart: p.youtubeStart ?? 0,
      youtubeEnd: p.youtubeEnd ?? 0,
      youtubeLoop: p.youtubeLoop ?? false,
    })),
    player,
  }
}

export function loadData(): AppData {
  try {
    const text = localStorage.getItem(KEY)
    if (!text) return { posts: [], player: emptyPlayer() }
    return migrate(JSON.parse(text) as AppData)
  } catch {
    return { posts: [], player: emptyPlayer() }
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}
