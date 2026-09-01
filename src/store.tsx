import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { COMPANIONS, FORAGE_ITEMS, MAX_LEVEL, OVERFLOW_SILVER, PEOPLE_UNLOCK_LEVEL, SHOP_CONSUMABLES, forageSellPrice } from './data/catalog'
import { remainingWalks, rollForage } from './lib/forage'
import { todayISO } from './lib/dates'
import {
  clampLevel,
  gaugesFull,
  ownedPeople,
  personSlotsForLevel,
  ranchChoresFor,
  sellBonusFor,
  statMaxForLevel,
} from './lib/level'
import { cellColorForDate, coinsFor, rewardKey } from './lib/progress'
import { emptyPost, loadData, saveData } from './storage'
import type { AppData, CellColor, ForageItem, Route, StudyPost } from './types'

export interface ConsumableBuyResult {
  error: string | null
  leveledTo?: number
  overflow?: number
}

interface Store {
  data: AppData
  route: Route
  go: (route: Route) => void
  savePost: (post: StudyPost) => void
  createPost: () => string
  deletePost: (id: string) => void
  setChecks: (postId: string, date: string, methodIds: string[]) => void
  buyConsumable: (id: string) => ConsumableBuyResult
  buyCompanion: (id: string) => string | null
  sellForage: (id: string, qty?: number) => string | null
  walkForest: () => { ok: false; message: string } | { ok: true; item: ForageItem }
}

const Ctx = createContext<Store | null>(null)

function applyConsumable(prev: AppData, id: string): { next: AppData; result: ConsumableBuyResult } {
  const item = SHOP_CONSUMABLES.find((s) => s.id === id)
  if (!item) return { next: prev, result: { error: '없는 물건입니다.' } }
  if (item.unlockLevel > prev.player.level) {
    return { next: prev, result: { error: `레벨 ${item.unlockLevel}에 해금됩니다.` } }
  }
  if (prev.player.silver < item.price) {
    return { next: prev, result: { error: '은화가 부족합니다.' } }
  }
  const max = statMaxForLevel(prev.player.level)
  const raw = prev.player.stats[item.stat] + item.amount
  const overflow = Math.max(0, raw - max)
  const stats: AppData['player']['stats'] = {
    ...prev.player.stats,
    [item.stat]: Math.min(max, raw),
  }
  const silver = prev.player.silver - item.price + overflow * OVERFLOW_SILVER
  let level = prev.player.level
  let leveledTo: number | undefined
  if (level < MAX_LEVEL && gaugesFull(stats, max)) {
    level = clampLevel(level + 1)
    stats.intimacy = 0
    stats.vitality = 0
    stats.wisdom = 0
    leveledTo = level
  }
  return {
    next: { ...prev, player: { ...prev.player, silver, stats, level } },
    result: { error: null, leveledTo, overflow: overflow > 0 ? overflow : undefined },
  }
}

function applyCompanion(prev: AppData, id: string): { next: AppData; error: string | null } {
  const def = COMPANIONS.find((c) => c.id === id)
  if (!def) return { next: prev, error: '없는 대상입니다.' }
  if (prev.player.ownedCompanionIds.includes(id)) {
    return { next: prev, error: '이미 함께하는 중입니다.' }
  }
  if (def.unlockLevel > prev.player.level) {
    return { next: prev, error: `레벨 ${def.unlockLevel}에 해금됩니다.` }
  }
  if (def.kind === 'person') {
    if (prev.player.level < PEOPLE_UNLOCK_LEVEL) {
      return { next: prev, error: `레벨 ${PEOPLE_UNLOCK_LEVEL}부터 동료를 들일 수 있습니다.` }
    }
    const slots = personSlotsForLevel(prev.player.level)
    if (ownedPeople(prev.player.ownedCompanionIds).length >= slots) {
      return { next: prev, error: '동료 자리가 없습니다. 레벨이 오르면 한 칸씩 늘어납니다.' }
    }
  }
  if (prev.player.silver < def.price) {
    return { next: prev, error: '은화가 부족합니다.' }
  }
  return {
    next: {
      ...prev,
      player: {
        ...prev.player,
        silver: prev.player.silver - def.price,
        ownedCompanionIds: [...prev.player.ownedCompanionIds, id],
      },
    },
    error: null,
  }
}

function applySell(prev: AppData, id: string, qty: number): { next: AppData; error: string | null } {
  const item = FORAGE_ITEMS.find((x) => x.id === id)
  if (!item) return { next: prev, error: '없는 물건입니다.' }
  const n = Math.max(1, Math.floor(qty))
  const have = prev.player.inventory[id] ?? 0
  if (have < n) return { next: prev, error: '가지고 있지 않습니다.' }
  const left = have - n
  const inventory = { ...prev.player.inventory }
  if (left <= 0) delete inventory[id]
  else inventory[id] = left
  return {
    next: {
      ...prev,
      player: {
        ...prev.player,
        inventory,
        silver: prev.player.silver + (forageSellPrice(item) + sellBonusFor(prev.player.ownedCompanionIds)) * n,
      },
    },
    error: null,
  }
}

function applyWalk(
  prev: AppData,
  today: string,
): { next: AppData; result: { ok: false; message: string } | { ok: true; item: ForageItem } } {
  const max = statMaxForLevel(prev.player.level)
  const chores = ranchChoresFor(prev.player.stats.vitality, max, prev.player.ownedCompanionIds)
  const left = remainingWalks(prev.player.walks, today, chores)
  if (left <= 0) {
    return { next: prev, result: { ok: false, message: '오늘은 목장일을 모두 마쳤습니다.' } }
  }
  const found = rollForage(prev.player.stats.wisdom, max, prev.player.level)
  const walks =
    prev.player.walks.date === today
      ? { date: today, count: prev.player.walks.count + 1 }
      : { date: today, count: 1 }
  const inventory = { ...prev.player.inventory }
  inventory[found.id] = (inventory[found.id] ?? 0) + 1
  return {
    next: { ...prev, player: { ...prev.player, walks, inventory } },
    result: { ok: true, item: found },
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())
  const [route, setRoute] = useState<Route>({ page: 'home' })
  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => {
    saveData(data)
  }, [data])

  const patch = useCallback((updater: (prev: AppData) => AppData) => {
    setData(updater)
  }, [])

  const go = useCallback((next: Route) => setRoute(next), [])

  const savePost = useCallback(
    (post: StudyPost) => {
      patch((prev) => {
        const exists = prev.posts.some((p) => p.id === post.id)
        const posts = exists
          ? prev.posts.map((p) => (p.id === post.id ? post : p))
          : [post, ...prev.posts]
        return { ...prev, posts }
      })
    },
    [patch],
  )

  const createPost = useCallback(() => {
    const post = emptyPost()
    patch((prev) => ({ ...prev, posts: [post, ...prev.posts] }))
    return post.id
  }, [patch])

  const deletePost = useCallback(
    (id: string) => {
      patch((prev) => {
        const posts = prev.posts.filter((p) => p.id !== id)
        const cellRewards = { ...prev.player.cellRewards }
        let silver = prev.player.silver
        for (const key of Object.keys(cellRewards)) {
          if (!key.startsWith(`${id}:`)) continue
          const color = cellRewards[key]
          if (color) silver -= coinsFor(color)
          delete cellRewards[key]
        }
        return {
          posts,
          player: { ...prev.player, silver: Math.max(0, silver), cellRewards },
        }
      })
    },
    [patch],
  )

  const setChecks = useCallback(
    (postId: string, date: string, methodIds: string[]) => {
      patch((prev) => {
        const post = prev.posts.find((p) => p.id === postId)
        if (!post) return prev
        const dailyLogs = { ...post.dailyLogs, [date]: methodIds }
        const nextPost = { ...post, dailyLogs }
        const color = cellColorForDate(nextPost, date) ?? ('red' as CellColor)
        const key = rewardKey(postId, date)
        const prevColor = prev.player.cellRewards[key]
        const delta = coinsFor(color) - (prevColor ? coinsFor(prevColor) : 0)
        return {
          posts: prev.posts.map((p) => (p.id === postId ? nextPost : p)),
          player: {
            ...prev.player,
            silver: Math.max(0, prev.player.silver + delta),
            cellRewards: { ...prev.player.cellRewards, [key]: color },
          },
        }
      })
    },
    [patch],
  )

  const buyConsumable = useCallback((id: string) => {
    const { next, result } = applyConsumable(dataRef.current, id)
    if (next !== dataRef.current) setData(next)
    return result
  }, [])

  const buyCompanion = useCallback((id: string) => {
    const { next, error } = applyCompanion(dataRef.current, id)
    if (next !== dataRef.current) setData(next)
    return error
  }, [])

  const sellForage = useCallback((id: string, qty = 1) => {
    const { next, error } = applySell(dataRef.current, id, qty)
    if (next !== dataRef.current) setData(next)
    return error
  }, [])

  const walkForest = useCallback(() => {
    const { next, result } = applyWalk(dataRef.current, todayISO())
    if (next !== dataRef.current) setData(next)
    return result
  }, [])

  const value = useMemo<Store>(
    () => ({
      data,
      route,
      go,
      savePost,
      createPost,
      deletePost,
      setChecks,
      buyConsumable,
      buyCompanion,
      sellForage,
      walkForest,
    }),
    [
      data,
      route,
      go,
      savePost,
      createPost,
      deletePost,
      setChecks,
      buyConsumable,
      buyCompanion,
      sellForage,
      walkForest,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('Store missing')
  return ctx
}
