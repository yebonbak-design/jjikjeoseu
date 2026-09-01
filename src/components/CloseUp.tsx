import { useState } from 'react'
import { pickTap } from '../data/homeFlavor'
import { asset } from '../lib/asset'
import { intimacyBand } from '../lib/level'

const TOUCH_SPRITE = asset('sprites/jjik-touch.png')

export function CloseUp({ ratio }: { ratio: number }) {
  const band = intimacyBand(ratio)
  const [line, setLine] = useState<string | null>(null)
  const [squish, setSquish] = useState(false)

  function tap() {
    setLine(pickTap(band))
    setSquish(false)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setSquish(true))
    })
  }

  return (
    <button type="button" className={`close-up band-${band}`} onClick={tap}>
      <img
        src={TOUCH_SPRITE}
        alt="찍저스"
        className={`close-up-jjik${squish ? ' squish' : ''}`}
        onAnimationEnd={() => setSquish(false)}
      />
      <span className="close-up-copy">
        <span className="close-up-hint">만져 보세요 · 횟수 제한 없음 · 친밀도는 먹이로만</span>
        <span className="close-up-line">{line ?? '가까이 오면 말을 걸어 줍니다.'}</span>
      </span>
    </button>
  )
}
