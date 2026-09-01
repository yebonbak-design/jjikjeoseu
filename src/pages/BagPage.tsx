import { useState } from 'react'
import { ItemBook } from '../components/ItemBook'
import { COLLECTION_COUNT, COMPANION_KIND_LABEL, COMPANIONS, FORAGE_ITEMS, PERK_LABEL } from '../data/catalog'
import { useStore } from '../store'
import type { CompanionKind, ForageItem } from '../types'

const KINDS: CompanionKind[] = ['animal', 'person']

export function BagPage() {
  const { data, sellForage } = useStore()
  const pals = COMPANIONS.filter((c) => data.player.ownedCompanionIds.includes(c.id))
  const [open, setOpen] = useState<ForageItem | null>(null)
  const openCount = open ? (data.player.inventory[open.id] ?? 0) : 0
  const foundCount = FORAGE_ITEMS.filter((item) => (data.player.inventory[item.id] ?? 0) > 0).length

  return (
    <div className="bag">
      <h1>가방</h1>
      <p className="muted">
        목장에서 얻은 것과 함께하는 동물·동료입니다. 수집품은 현재 <strong>{COLLECTION_COUNT}종</strong>
        이며, 발견한 칸을 누르면 도감이 펼쳐집니다.
      </p>

      {KINDS.map((kind) => {
        const list = pals.filter((p) => p.kind === kind)
        return (
          <section key={kind}>
            <h2>{COMPANION_KIND_LABEL[kind]}</h2>
            {list.length === 0 ? (
              <p className="muted">
                {kind === 'animal' ? '아직 들인 동물이 없습니다.' : '아직 들인 동료가 없습니다.'}
              </p>
            ) : (
              <ul className="bag-pals">
                {list.map((p) => (
                  <li key={p.id}>
                    <img src={p.image} alt="" className="catalog-thumb sm round" />
                    <div>
                      <strong>{p.name}</strong>
                      <p>{p.blurb}</p>
                      {p.perk ? <p className="perk">{PERK_LABEL[p.perk]}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}

      <h2>
        수집품 · {foundCount}/{COLLECTION_COUNT}종
      </h2>
      <div className="dex-grid">
        {FORAGE_ITEMS.map((item) => {
          const count = data.player.inventory[item.id] ?? 0
          const locked = item.unlockLevel > data.player.level
          const unseen = !locked && count === 0
          return (
            <button
              type="button"
              key={item.id}
              className={`dex-card${locked || unseen ? ' locked' : ''}`}
              disabled={locked || unseen}
              onClick={() => {
                if (!locked && count > 0) setOpen(item)
              }}
            >
              <img src={item.image} alt="" />
              <strong>{locked || unseen ? '???' : item.name}</strong>
              {locked ? <em>Lv.{item.unlockLevel}</em> : count > 0 ? <em>×{count}</em> : <em>미발견</em>}
            </button>
          )
        })}
      </div>

      {open && openCount > 0 ? (
        <ItemBook
          item={open}
          count={openCount}
          onClose={() => setOpen(null)}
          onSell={(qty) => sellForage(open.id, qty)}
        />
      ) : null}
    </div>
  )
}
