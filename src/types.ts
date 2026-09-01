export type TagId = 'english'

export type HideMode = 'both' | 'en' | 'ko'

export type CellColor = 'red' | 'yellow' | 'blue'

export type Mood = 'happy' | 'neutral' | 'sad' | 'angry'

export type StatId = 'intimacy' | 'vitality' | 'wisdom'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'

export type PageId = 'home' | 'album' | 'editor' | 'shop' | 'bag'

export interface ScriptPair {
  id: string
  en: string
  ko: string
}

export interface StudyMethod {
  id: string
  text: string
}

export interface StudyPost {
  id: string
  title: string
  tag: TagId | null
  youtubeUrl: string
  youtubeStart: number
  youtubeEnd: number
  youtubeLoop: boolean
  scripts: ScriptPair[]
  hideMode: HideMode
  bigGoal: string
  methods: StudyMethod[]
  startDate: string
  endDate: string
  dailyLogs: Record<string, string[]>
  createdAt: string
}

export interface Player {
  silver: number
  /** 1부터 만렙까지. 세 스탯이 현재 최댓값에 닿으면 오릅니다. */
  level: number
  stats: Record<StatId, number>
  ownedCompanionIds: string[]
  inventory: Record<string, number>
  cellRewards: Record<string, CellColor>
  walks: { date: string; count: number }
}

export interface AppData {
  posts: StudyPost[]
  player: Player
}

export interface Route {
  page: PageId
  postId?: string
  openDate?: string
}

export type ShopShelf = 'feed' | 'prop' | 'faith'

export type CompanionKind = 'animal' | 'person'

export type CompanionPerk = 'chore' | 'sell'

export interface ShopConsumable {
  id: string
  name: string
  price: number
  stat: StatId
  amount: number
  shelf: ShopShelf
  blurb: string
  image: string
  /** 이 레벨부터 상점에서 살 수 있습니다. */
  unlockLevel: number
}

export interface CompanionDef {
  id: string
  name: string
  price: number
  kind: CompanionKind
  blurb: string
  glyph: string
  image: string
  unlockLevel: number
  perk?: CompanionPerk
}

export interface ForageItem {
  id: string
  name: string
  rarity: Rarity
  blurb: string
  image: string
  /** 이 레벨부터 목장일에 등장합니다. */
  unlockLevel: number
  /** 은화 판매가. 비우면 희귀도 기본값을 씁니다. */
  sell?: number
}
