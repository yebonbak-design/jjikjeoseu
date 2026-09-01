import { useState } from 'react'
import {
  COMPANION_KIND_LABEL,
  COMPANIONS,
  PEOPLE_UNLOCK_LEVEL,
  PERK_LABEL,
  SHELF_LABEL,
  SHOP_CONSUMABLES,
  STAT_LABEL,
} from '../data/catalog'
import { levelUpBlurb, ownedPeople, personSlotsForLevel } from '../lib/level'
import { useStore } from '../store'
import type { CompanionKind, ShopShelf } from '../types'

const SHELVES: { id: ShopShelf; hint: string }[] = [
  { id: 'feed', hint: '친밀도가 오릅니다. 큰 창을 만져도 수치는 안 변합니다.' },
  { id: 'prop', hint: '체력이 오릅니다. 반 이상이면 목장일이 늘어납니다.' },
  { id: 'faith', hint: '지혜가 오릅니다. 높을수록 귀한 수집품이 잘 나옵니다.' },
]

const KINDS: CompanionKind[] = ['animal', 'person']

export function ShopPage() {
  const { data, buyConsumable, buyCompanion } = useStore()
  const [msg, setMsg] = useState<string | null>(null)
  const owned = new Set(data.player.ownedCompanionIds)
  const level = data.player.level
  const personSlots = personSlotsForLevel(level)
  const personHave = ownedPeople(data.player.ownedCompanionIds).length

  function buyItem(id: string) {
    const item = SHOP_CONSUMABLES.find((s) => s.id === id)
    const res = buyConsumable(id)
    if (res.error) {
      setMsg(res.error)
      return
    }
    if (res.leveledTo) {
      setMsg(levelUpBlurb(res.leveledTo, res.overflow ?? 0))
      return
    }
    if (res.overflow) {
      setMsg(`찍저스가 잘 받았습니다. 넘치는 ${res.overflow}는 은화로 남았습니다.`)
      return
    }
    setMsg(
      item?.shelf === 'feed'
        ? '찍저스가 잘 먹었습니다.'
        : item?.shelf === 'faith'
          ? '찍저스가 마음에 담았습니다.'
          : '찍저스가 잘 받았습니다.',
    )
  }

  function buyPal(id: string) {
    const pal = COMPANIONS.find((c) => c.id === id)
    const err = buyCompanion(id)
    if (err) {
      setMsg(err)
      return
    }
    setMsg(pal?.kind === 'animal' ? '목장에 동물이 생겼습니다.' : '목장에 새 동료가 생겼습니다.')
  }

  return (
    <div className="shop">
      <header className="shop-head">
        <h1>상점</h1>
        <p className="muted">
          지금 레벨 {level}. 해금된 것만 살 수 있고, 세 칸이 가득 차면 자랍니다. 목록은{' '}
          <code>src/data/catalog.ts</code>에서 고칠 수 있습니다.
        </p>
        {msg ? <p className="walk-msg">{msg}</p> : null}
      </header>

      {SHELVES.map((shelf) => (
        <section key={shelf.id} className="shop-section">
          <h2>{SHELF_LABEL[shelf.id]}</h2>
          <p className="muted shelf-hint">{shelf.hint}</p>
          <div className="shop-grid">
            {SHOP_CONSUMABLES.filter((item) => item.shelf === shelf.id).map((item) => {
              const locked = item.unlockLevel > level
              return (
                <article key={item.id} className={`shop-card${locked ? ' locked' : ''}`}>
                  <img src={item.image} alt="" className="catalog-thumb" />
                  <h3>{item.name}</h3>
                  <p>{item.blurb}</p>
                  <p className="price">
                    {item.price}은화 · {STAT_LABEL[item.stat]} +{item.amount}
                  </p>
                  <button
                    type="button"
                    className="primary"
                    disabled={locked}
                    onClick={() => buyItem(item.id)}
                  >
                    {locked ? `Lv.${item.unlockLevel}` : '사기'}
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      ))}

      {KINDS.map((kind) => (
        <section key={kind} className="shop-section">
          <h2>
            {COMPANION_KIND_LABEL[kind]}
            {kind === 'person'
              ? level < PEOPLE_UNLOCK_LEVEL
                ? ` · 레벨 ${PEOPLE_UNLOCK_LEVEL}부터`
                : ` · 자리 ${personHave}/${personSlots}`
              : ' · 자리는 없습니다'}
          </h2>
          <div className="shop-grid">
            {COMPANIONS.filter((c) => c.kind === kind).map((c) => {
              const have = owned.has(c.id)
              const locked = c.unlockLevel > level
              const full = kind === 'person' && personHave >= personSlots && !have
              return (
                <article key={c.id} className={`shop-card pal-card${locked ? ' locked' : ''}`}>
                  <img src={c.image} alt="" className="catalog-thumb round" />
                  <h3>{c.name}</h3>
                  <p>{c.blurb}</p>
                  {c.perk ? <p className="perk">{PERK_LABEL[c.perk]}</p> : null}
                  <p className="price">{c.price}은화</p>
                  <button
                    type="button"
                    className="primary"
                    disabled={have || locked || full}
                    onClick={() => buyPal(c.id)}
                  >
                    {have ? '함께하는 중' : locked ? `Lv.${c.unlockLevel}` : full ? '자리 없음' : '들이기'}
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
