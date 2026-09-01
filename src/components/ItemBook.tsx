import { forageSellPrice, RARITY_LABEL } from '../data/catalog'
import type { ForageItem } from '../types'

export function ItemBook({
  item,
  count,
  onClose,
  onSell,
}: {
  item: ForageItem
  count: number
  onClose: () => void
  onSell: (qty: number) => string | null
}) {
  const price = forageSellPrice(item)

  function sell(qty: number) {
    const err = onSell(qty)
    if (err) {
      window.alert(err)
      return
    }
    if (qty >= count) onClose()
  }

  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div
        className="book-spread"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="book-title"
      >
        <div className="book-leaf left">
          <img src={item.image} alt="" />
        </div>
        <div className="book-leaf right">
          <p className="book-kicker">수집 도감</p>
          <h3 id="book-title">{item.name}</h3>
          <span className={`rarity ${item.rarity}`}>{RARITY_LABEL[item.rarity]}</span>
          <p className="book-blurb">{item.blurb}</p>
          <p className="book-meta">
            보유 <strong>×{count}</strong>
            <br />
            판매가 <strong>{price}은화</strong> / 1개
          </p>
          <div className="book-actions">
            <button type="button" className="primary" disabled={count < 1} onClick={() => sell(1)}>
              1개 팔기
            </button>
            <button type="button" className="ghost" disabled={count < 1} onClick={() => sell(count)}>
              모두 팔기
            </button>
            <button type="button" className="ghost" onClick={onClose}>
              덮기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
