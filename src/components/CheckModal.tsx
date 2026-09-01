import { useState } from 'react'
import { formatKorean } from '../lib/dates'
import { activeMethods, colorFromRatio } from '../lib/progress'
import type { StudyPost } from '../types'

export function CheckModal({
  post,
  date,
  onClose,
  onSave,
}: {
  post: StudyPost
  date: string
  onClose: () => void
  onSave: (methodIds: string[]) => void
}) {
  const initial = post.dailyLogs[date] ?? []
  const [picked, setPicked] = useState<string[]>(initial)
  const methods = activeMethods(post)
  const ratio = methods.length === 0 ? 0 : picked.filter((id) => methods.some((m) => m.id === id)).length / methods.length
  const color = colorFromRatio(ratio)

  function toggle(id: string) {
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  }

  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="check-title">
        <h3 id="check-title">{formatKorean(date)}</h3>
        <p className="muted">{post.title.trim() || '제목 없는 공부'}</p>
        {methods.length === 0 ? (
          <p className="warn">오른쪽에 ‘나는 어떻게 공부할 것인가’ 항목을 먼저 적어 주세요.</p>
        ) : (
          <ul className="check-list">
            {methods.map((m) => (
              <li key={m.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={picked.includes(m.id)}
                    onChange={() => toggle(m.id)}
                  />
                  {m.text}
                </label>
              </li>
            ))}
          </ul>
        )}
        <div className={`color-preview ${color}`}>
          {Math.round(ratio * 100)}% · {color === 'blue' ? '파랑 · 은화 10' : color === 'yellow' ? '노랑 · 은화 5' : '빨강 · 은화 0'}
        </div>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onClose}>
            닫기
          </button>
          <button
            type="button"
            className="primary"
            disabled={methods.length === 0}
            onClick={() => {
              onSave(picked)
              onClose()
            }}
          >
            기록
          </button>
        </div>
      </div>
    </div>
  )
}
