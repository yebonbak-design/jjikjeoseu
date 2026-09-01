import { useEffect, useState } from 'react'
import { RANCH_LOAD_IMAGES, RANCH_REVEAL_MS } from '../data/catalog'
import type { ForageItem } from '../types'

export function RanchReveal({
  item,
  onClose,
}: {
  item: ForageItem
  onClose: () => void
}) {
  const [frame, setFrame] = useState(0)
  const [done, setDone] = useState(false)
  const frames = RANCH_LOAD_IMAGES.length

  useEffect(() => {
    const step = RANCH_REVEAL_MS / Math.max(1, frames)
    const ticks: number[] = []
    for (let i = 1; i < frames; i++) {
      ticks.push(window.setTimeout(() => setFrame(i), step * i))
    }
    const end = window.setTimeout(() => setDone(true), RANCH_REVEAL_MS)
    return () => {
      ticks.forEach((t) => window.clearTimeout(t))
      window.clearTimeout(end)
    }
  }, [frames])

  return (
    <div
      className="ranch-reveal"
      onClick={done ? onClose : undefined}
      role="presentation"
    >
      <div className="ranch-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-live="polite">
        {done ? (
          <>
            <img src={item.image} alt="" className="ranch-found-img" />
            <p className="ranch-found-title">{item.name} 등장~!</p>
            <p className="muted">{item.blurb}</p>
            <button type="button" className="primary" onClick={onClose}>
              가방에 넣기
            </button>
          </>
        ) : (
          <>
            <img src={RANCH_LOAD_IMAGES[frame]} alt="" className="ranch-load-img" />
            <p className="ranch-load-caption">목장일을 하는 중…</p>
            <div
              className="ranch-bar-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="목장일 진행"
            >
              <i className="ranch-bar-fill" style={{ animationDuration: `${RANCH_REVEAL_MS}ms` }} />
            </div>
            <p className="ranch-bar-hint">{frame + 1} / {frames}</p>
          </>
        )}
      </div>
    </div>
  )
}
