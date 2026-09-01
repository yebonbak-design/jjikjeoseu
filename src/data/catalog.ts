/**
 * 찍저스 키우기 — 아이템·동료 카탈로그
 *
 * 이름·가격·희귀도·설명을 바꾸거나 항목을 추가하려면 이 파일만 수정하면 됩니다.
 * 이미지를 바꾸려면 public/items 또는 public/companions 에서
 * 같은 파일 이름(예: palm-branch.svg)을 PNG/SVG로 교체하고,
 * 아래 image 경로의 확장자를 맞추면 됩니다.
 * 목장일 로딩 그림은 public/ranch 의 load-1, load-2, load-3 입니다.
 * 초원 대사·목장 브리핑은 src/data/homeFlavor.ts 에서 고칩니다.
 * unlockLevel 은 그 레벨부터 상점·목장·동료에 나타납니다.
 */

import type { CompanionDef, CompanionPerk, ForageItem, ShopConsumable } from '../types'

/** 만렙. 세 스탯이 현재 최댓값에 닿으면 1씩 오릅니다. */
export const MAX_LEVEL = 33

/** 레벨 1일 때 스탯 칸. 레벨이 오를 때마다 STAT_PER_LEVEL만큼 늘어납니다. */
export const STAT_BASE_MAX = 10
export const STAT_PER_LEVEL = 1

/** 스탯 칸을 넘긴 돌봄은 이 비율로 은화가 됩니다. */
export const OVERFLOW_SILVER = 1

/** 사람 동료를 들이기 시작하는 레벨. 이때 자리 1칸. */
export const PEOPLE_UNLOCK_LEVEL = 5

export const RANCH_CHORES_PER_DAY = 3

/** 목장일 연출 길이(ms). */
export const RANCH_REVEAL_MS = 4000

/**
 * 목장일 로딩 그림. public/ranch 에서 같은 이름으로 PNG/SVG를 바꾸면 됩니다.
 * 장 수를 늘리거나 줄이려면 이 배열만 고치면 됩니다.
 */
export const RANCH_LOAD_IMAGES = ['/ranch/load-1.svg', '/ranch/load-2.svg', '/ranch/load-3.svg']

/** 수집품을 팔 때 희귀도별 기본 은화. 아이템에 sell을 적으면 그 값이 이깁니다. */
export const SELL_BY_RARITY: Record<ForageItem['rarity'], number> = {
  common: 2,
  uncommon: 5,
  rare: 10,
  legendary: 18,
}

export function forageSellPrice(item: ForageItem): number {
  return item.sell ?? SELL_BY_RARITY[item.rarity]
}

export const SCRIPT_PAGE_SIZE = 10

export const COINS = {
  blue: 10,
  yellow: 5,
  red: 0,
} as const

export const RARITY_LABEL: Record<ForageItem['rarity'], string> = {
  common: '흔함',
  uncommon: '보통',
  rare: '높음',
  legendary: '매우 높음',
}

export const STAT_LABEL: Record<ShopConsumable['stat'], string> = {
  intimacy: '친밀도',
  vitality: '체력',
  wisdom: '지혜',
}

export const STAT_ORDER: ShopConsumable['stat'][] = ['intimacy', 'vitality', 'wisdom']

export const SHELF_LABEL: Record<ShopConsumable['shelf'], string> = {
  feed: '먹이',
  prop: '소품',
  faith: '신앙',
}

export const COMPANION_KIND_LABEL: Record<CompanionDef['kind'], string> = {
  animal: '동물',
  person: '동료',
}

export const PERK_LABEL: Record<CompanionPerk, string> = {
  chore: '목장일이 하루 한 번 늘어요.',
  sell: '수집품을 팔 때 개당 은화 +1.',
}

const PNG_ITEMS = new Set(['tortilla', 'anointing-oil', 'pray'])
const PNG_PALS = new Set(['lamb', 'dove', 'peter', 'mary', 'simon', 'kyungda', 'gomda'])

function itemImg(id: string, file = id) {
  const ext = PNG_ITEMS.has(file) || PNG_ITEMS.has(id) ? 'png' : 'svg'
  return `/items/${file}.${ext}`
}

function palImg(id: string) {
  return PNG_PALS.has(id) ? `/companions/${id}.png` : `/companions/${id}.svg`
}

/** 상점 소모품 */
export const SHOP_CONSUMABLES: ShopConsumable[] = [
  {
    id: 'tortilla',
    name: '또띠아',
    price: 5,
    stat: 'intimacy',
    amount: 1,
    shelf: 'feed',
    unlockLevel: 1,
    blurb: '따뜻한 밀전병. 찍저스가 두 손으로 받아 먹습니다.',
    image: itemImg('tortilla'),
  },
  {
    id: 'fig',
    name: '무화과',
    price: 9,
    stat: 'intimacy',
    amount: 2,
    shelf: 'feed',
    unlockLevel: 5,
    blurb: '길가의 달콤한 열매. 나눠 먹으면 사이가 가까워집니다.',
    image: itemImg('fig'),
  },
  {
    id: 'wine',
    name: '와인',
    price: 13,
    stat: 'intimacy',
    amount: 3,
    shelf: 'feed',
    unlockLevel: 12,
    blurb: '잔을 기울이면 얼굴이 조금 붉어집니다.',
    image: itemImg('wine'),
  },
  {
    id: 'salad',
    name: '샐러드',
    price: 17,
    stat: 'intimacy',
    amount: 4,
    shelf: 'feed',
    unlockLevel: 20,
    blurb: '푸른 잎을 잔뜩 담은 그릇. 아삭한 소리가 납니다.',
    image: itemImg('salad'),
  },
  {
    id: 'tofu-curry',
    name: '두부카레',
    price: 20,
    stat: 'intimacy',
    amount: 5,
    shelf: 'feed',
    unlockLevel: 30,
    blurb: '노란 국물에 두부가 동동. 한 그릇이면 마음이 든든합니다.',
    image: itemImg('tofu-curry'),
  },
  {
    id: 'palm',
    name: '종려나무',
    price: 5,
    stat: 'vitality',
    amount: 1,
    shelf: 'prop',
    unlockLevel: 1,
    blurb: '호산나, 하며 흔들던 푸른 가지.',
    image: itemImg('palm', 'palm-branch'),
  },
  {
    id: 'staff',
    name: '지팡이',
    price: 9,
    stat: 'vitality',
    amount: 2,
    shelf: 'prop',
    unlockLevel: 5,
    blurb: '양을 이끌 때 짚는 매끈한 나무 막대.',
    image: itemImg('staff'),
  },
  {
    id: 'cardigan',
    name: '가디건',
    price: 13,
    stat: 'vitality',
    amount: 3,
    shelf: 'prop',
    unlockLevel: 12,
    blurb: '초원 저녁에 걸쳐 주는 따뜻한 겉옷.',
    image: itemImg('cardigan'),
  },
  {
    id: 'anointing-oil',
    name: '향유',
    price: 17,
    stat: 'vitality',
    amount: 4,
    shelf: 'prop',
    unlockLevel: 20,
    blurb: '머리와 발에 바르는 귀한 기름. 몸이 한결 가벼워집니다.',
    image: itemImg('anointing-oil'),
  },
  {
    id: 'violin',
    name: '바이올린',
    price: 20,
    stat: 'vitality',
    amount: 5,
    shelf: 'prop',
    unlockLevel: 30,
    blurb: '낮은 음이 목장 끝까지 퍼집니다.',
    image: itemImg('violin'),
  },
  {
    id: 'pray',
    name: '기도',
    price: 5,
    stat: 'wisdom',
    amount: 1,
    shelf: 'faith',
    unlockLevel: 1,
    blurb: '무릎을 꿇으면 머리가 맑아집니다.',
    image: itemImg('pray'),
  },
  {
    id: 'sermon',
    name: '설교',
    price: 9,
    stat: 'wisdom',
    amount: 2,
    shelf: 'faith',
    unlockLevel: 5,
    blurb: '말씀을 듣고 나면 눈이 조금 밝아집니다.',
    image: itemImg('sermon'),
  },
  {
    id: 'temple',
    name: '성전엎기',
    price: 13,
    stat: 'wisdom',
    amount: 3,
    shelf: 'faith',
    unlockLevel: 12,
    blurb: '뒤집힌 상. 무엇이 중요한지 다시 묻습니다.',
    image: itemImg('temple'),
  },
  {
    id: 'betrayal',
    name: '배신종용',
    price: 17,
    stat: 'wisdom',
    amount: 4,
    shelf: 'faith',
    unlockLevel: 20,
    blurb: '귓가의 속삭임. 피하고 나면 오히려 단단해집니다.',
    image: itemImg('betrayal'),
  },
  {
    id: 'cross',
    name: '십자가',
    price: 20,
    stat: 'wisdom',
    amount: 5,
    shelf: 'faith',
    unlockLevel: 30,
    blurb: '가장 무거운 나무. 지고 나면 시선이 깊어집니다.',
    image: itemImg('cross'),
  },
]

/** 동물·동료. 새 객체를 배열에 넣으면 상점에 바로 등장합니다. */
export const COMPANIONS: CompanionDef[] = [
  {
    id: 'lamb',
    name: '어린 양',
    price: 10,
    kind: 'animal',
    unlockLevel: 1,
    glyph: '양',
    blurb: '흰 털을 부스럭거리며 찍저스 뒤를 따라옵니다.',
    image: palImg('lamb'),
  },
  {
    id: 'black-lamb',
    name: '까만 양',
    price: 10,
    kind: 'animal',
    unlockLevel: 1,
    glyph: '흑',
    blurb: '흰 양 사이에서 유난히 잘 보입니다.',
    image: palImg('black-lamb'),
  },
  {
    id: 'goat',
    name: '염소',
    price: 15,
    kind: 'animal',
    unlockLevel: 1,
    glyph: '염',
    blurb: '울타리를 넘어 보고 싶어 합니다.',
    image: palImg('goat'),
  },
  {
    id: 'wolf',
    name: '늑대',
    price: 30,
    kind: 'animal',
    unlockLevel: 6,
    glyph: '늑',
    blurb: '이 목장에서는 양을 지키기로 했습니다.',
    image: palImg('wolf'),
  },
  {
    id: 'bordercollie',
    name: '보더콜리',
    price: 40,
    kind: 'animal',
    unlockLevel: 16,
    perk: 'chore',
    glyph: '콜',
    blurb: '초원을 낮게 달려 흩어진 양을 모아 옵니다.',
    image: palImg('bordercollie'),
  },
  {
    id: 'puppy',
    name: '똥강아지',
    price: 40,
    kind: 'animal',
    unlockLevel: 18,
    glyph: '똥',
    blurb: '발바닥이 아직 크고, 이름보다 귀엽습니다.',
    image: palImg('puppy'),
  },
  {
    id: 'dove',
    name: '비둘기',
    price: 20,
    kind: 'animal',
    unlockLevel: 1,
    glyph: '비',
    blurb: '감람나무 가지를 문 비둘기. 뭔가 감시당하는 기분…?',
    image: palImg('dove'),
  },
  {
    id: 'hamster',
    name: '햄스터',
    price: 30,
    kind: 'animal',
    unlockLevel: 8,
    glyph: '햄',
    blurb: '볼에 겨자씨를 숨깁니다.',
    image: palImg('hamster'),
  },
  {
    id: 'rat',
    name: '쥐',
    price: 30,
    kind: 'animal',
    unlockLevel: 10,
    glyph: '쥐',
    blurb: '작은 발소리로 곳간을 순찰합니다.',
    image: palImg('rat'),
  },
  {
    id: 'rabbit',
    name: '토끼',
    price: 50,
    kind: 'animal',
    unlockLevel: 24,
    glyph: '토',
    blurb: '풀숲에서 귀만 내밉니다.',
    image: palImg('rabbit'),
  },
  {
    id: 'bear',
    name: '곰',
    price: 50,
    kind: 'animal',
    unlockLevel: 30,
    glyph: '곰',
    blurb: '덩치는 커도 걸음은 느긋합니다.',
    image: palImg('bear'),
  },
  {
    id: 'cat',
    name: '고양이',
    price: 30,
    kind: 'animal',
    unlockLevel: 12,
    glyph: '고',
    blurb: '찍저스 발치에 앉아 그르렁거립니다.',
    image: palImg('cat'),
  },
  {
    id: 'fox',
    name: '여우',
    price: 30,
    kind: 'animal',
    unlockLevel: 14,
    glyph: '여',
    blurb: '눈빛이 영리해서, 양 세는 일을 돕습니다.',
    image: palImg('fox'),
  },
  {
    id: 'peter',
    name: '베드로',
    price: 80,
    kind: 'person',
    unlockLevel: 5,
    glyph: '베',
    blurb: '자타공인 일등제자. 실수는 많지만 늘 다시 일어납니다.',
    image: palImg('peter'),
  },
  {
    id: 'mary',
    name: '마리아',
    price: 80,
    kind: 'person',
    unlockLevel: 6,
    glyph: '마',
    blurb: '조용히 곁을 지키는 사람. 향유 냄새를 닮았습니다.',
    image: palImg('mary'),
  },
  {
    id: 'simon',
    name: '시몬',
    price: 80,
    kind: 'person',
    unlockLevel: 8,
    perk: 'sell',
    glyph: '시',
    blurb: '열혈당원. 조금 위험하지만 좋은 친구.',
    image: palImg('simon'),
  },
  {
    id: 'kyungda',
    name: '켱다',
    price: 80,
    kind: 'person',
    unlockLevel: 10,
    glyph: '켱',
    blurb: '항상 초조해보이는 친구. 까맣다',
    image: palImg('kyungda'),
  },
  {
    id: 'gomda',
    name: '곰다',
    price: 80,
    kind: 'person',
    unlockLevel: 12,
    glyph: '곰',
    blurb: '켱다와 닮은 또 한 명의 든든한 친구.',
    image: palImg('gomda'),
  },
  {
    id: 'pilate',
    name: '빌라도',
    price: 80,
    kind: 'person',
    unlockLevel: 15,
    glyph: '빌',
    blurb: '손을 씻던 사람. 그래도 목장에는 머뭅니다.',
    image: palImg('pilate'),
  },
  {
    id: 'annas',
    name: '안나스',
    price: 80,
    kind: 'person',
    unlockLevel: 18,
    glyph: '안',
    blurb: '옛 제사장. 말이 적고 눈이 깊습니다.',
    image: palImg('annas'),
  },
  {
    id: 'caiaphas',
    name: '가야바',
    price: 80,
    kind: 'person',
    unlockLevel: 22,
    glyph: '가',
    blurb: '옷을 찢던 사람. 지금은 양을 셉니다.',
    image: palImg('caiaphas'),
  },
  {
    id: 'herod',
    name: '헤롯',
    price: 80,
    kind: 'person',
    unlockLevel: 26,
    glyph: '헤',
    blurb: '잔치를 좋아하지만, 초원에서는 조용합니다.',
    image: palImg('herod'),
  },
  {
    id: 'roman',
    name: '로마군',
    price: 80,
    kind: 'person',
    unlockLevel: 30,
    glyph: '로',
    blurb: '창을 내려놓고 울타리 곁에 섭니다.',
    image: palImg('roman'),
  },
]

/**
 * 목장에서 얻는 수집품.
 * rarity: common 흔함 / uncommon 보통 / rare 높음 / legendary 매우 높음
 * 새 줄을 넣으면 다음 목장일부터 등장합니다.
 */
export const FORAGE_ITEMS: ForageItem[] = [
  {
    id: 'palm-branch',
    name: '종려나뭇가지',
    rarity: 'common',
    unlockLevel: 1,
    blurb: '호산나, 하며 흔들던 푸른 가지.',
    image: '/items/palm-branch.svg',
  },
  {
    id: 'glitter',
    name: '반짝이',
    rarity: 'common',
    unlockLevel: 1,
    blurb: '무대 조명 아래 흩날리던 가루. 슈퍼스타의 잔상.',
    image: '/items/glitter.svg',
  },
  {
    id: 'mustard-seed',
    name: '겨자씨',
    rarity: 'common',
    unlockLevel: 1,
    blurb: '아주 작지만, 심으면 새가 깃들 나무가 됩니다.',
    image: '/items/mustard-seed.svg',
  },
  {
    id: 'loaves-fish',
    name: '떡과 물고기',
    rarity: 'common',
    unlockLevel: 1,
    blurb: '오천 명을 먹이던 도시락. 나눠도 줄어들지 않는 온기.',
    image: '/items/loaves-fish.svg',
  },
  {
    id: 'fig',
    name: '무화과',
    rarity: 'common',
    unlockLevel: 2,
    blurb: '길가의 달콤한 열매. 잎만 무성했던 나무는 아닙니다.',
    image: '/items/fig.svg',
  },
  {
    id: 'olive-leaf',
    name: '감람나무 잎',
    rarity: 'common',
    unlockLevel: 3,
    blurb: '겟세마네 밤바람을 머금은 은빛 잎사귀.',
    image: '/items/olive-leaf.svg',
  },
  {
    id: 'wool',
    name: '양털',
    rarity: 'common',
    unlockLevel: 4,
    blurb: '목장에서 빗질해 모은 부드러운 뭉치.',
    image: '/items/wool.svg',
  },
  {
    id: 'wine',
    name: '와인',
    rarity: 'uncommon',
    unlockLevel: 5,
    blurb: '물이 변해 담긴 잔. 혼인 잔치의 마지막이 가장 좋습니다.',
    image: '/items/wine.svg',
  },
  {
    id: 'whip',
    name: '채찍',
    rarity: 'uncommon',
    unlockLevel: 6,
    blurb: '성전 뜰을 맑게 하던 끈. 지금은 목장 울타리를 다듬습니다.',
    image: '/items/whip.svg',
  },
  {
    id: 'net',
    name: '갈릴리 그물',
    rarity: 'uncommon',
    unlockLevel: 8,
    blurb: '사람을 낚던 그물. 물기가 아직 남아 있습니다.',
    image: '/items/net.svg',
  },
  {
    id: 'towel',
    name: '발 씻기는 수건',
    rarity: 'uncommon',
    unlockLevel: 10,
    blurb: '허리에 두르고 무릎을 꿇던 흰 수건.',
    image: '/items/towel.svg',
  },
  {
    id: 'manna',
    name: '만나',
    rarity: 'uncommon',
    unlockLevel: 12,
    blurb: '이슬이 걷힌 자리에 남은 하얀 조각.',
    image: '/items/manna.svg',
  },
  {
    id: 'mite',
    name: '과부의 렙돈',
    rarity: 'uncommon',
    unlockLevel: 14,
    blurb: '전부였던 작은 동전 두 닢.',
    image: '/items/mite.svg',
  },
  {
    id: 'donkey',
    name: '나귀 발굽 방울',
    rarity: 'uncommon',
    unlockLevel: 16,
    blurb: '종려 길을 걸어가던 작은 발걸음 소리.',
    image: '/items/donkey.svg',
  },
  {
    id: 'staff',
    name: '목자 지팡이',
    rarity: 'uncommon',
    unlockLevel: 18,
    blurb: '양을 이끌 때 짚는 매끈한 나무 막대.',
    image: '/items/staff.svg',
  },
  {
    id: 'raptor',
    name: '랩터',
    rarity: 'rare',
    unlockLevel: 20,
    blurb: '슈퍼스타 무대의 거친 함성이 깃든 작은 공룡.',
    image: '/items/raptor.svg',
  },
  {
    id: 'thorn-crown',
    name: '가시면류관',
    rarity: 'rare',
    unlockLevel: 22,
    blurb: '가시가 아직 푸른 고리. 무겁지 않게, 다만 기억으로.',
    image: '/items/thorn-crown.svg',
  },
  {
    id: 'alabaster',
    name: '향유옥합',
    rarity: 'rare',
    unlockLevel: 24,
    blurb: '깨진 옥합. 집 안 가득 향기가 남았습니다.',
    image: '/items/alabaster.png',
  },
  {
    id: 'lost-bell',
    name: '잃어버린 양 방울',
    rarity: 'rare',
    unlockLevel: 26,
    blurb: '아흔아홉을 두고 찾아 나선 그 하나의 방울.',
    image: '/items/lost-bell.svg',
  },
  {
    id: 'star',
    name: '베들레헴 별',
    rarity: 'legendary',
    unlockLevel: 30,
    blurb: '동쪽에서 멈춰 선 빛. 가방 안에서도 희미하게 돕니다.',
    image: '/items/star.svg',
  },
  {
    id: 'pearl',
    name: '밭에 숨긴 진주',
    rarity: 'legendary',
    unlockLevel: 33,
    blurb: '모든 것을 팔아 산 하나의 진주.',
    image: '/items/pearl.svg',
  },
]

export const COLLECTION_COUNT = FORAGE_ITEMS.length

export const TAGS = [{ id: 'english' as const, label: '영어' }]
