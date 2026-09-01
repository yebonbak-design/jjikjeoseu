import { monthGrid } from '../lib/dates'
import { cellColorForDate, hasAttendance } from '../lib/progress'
import type { CellColor, StudyPost } from '../types'

const WEEK = ['일', '월', '화', '수', '목', '금', '토']

export function MonthCalendar({
  year,
  month,
  posts,
  selected,
  onSelect,
  onPrev,
  onNext,
}: {
  year: number
  month: number
  posts: StudyPost[]
  selected: string | null
  onSelect: (iso: string) => void
  onPrev: () => void
  onNext: () => void
}) {
  const cells = monthGrid(year, month)

  return (
    <section className="cal-card">
      <div className="cal-head">
        <button type="button" className="ghost" onClick={onPrev} aria-label="이전 달">
          ‹
        </button>
        <h2>
          {year}년 {month + 1}월
        </h2>
        <button type="button" className="ghost" onClick={onNext} aria-label="다음 달">
          ›
        </button>
      </div>
      <div className="cal-week">
        {WEEK.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((iso, i) => {
          if (!iso) return <div key={`e-${i}`} className="cal-cell empty" />
          const day = Number(iso.slice(-2))
          const colors = posts
            .map((p) => cellColorForDate(p, iso))
            .filter((c): c is CellColor => c !== null)
          const attended = hasAttendance(posts, iso)
          return (
            <button
              type="button"
              key={iso}
              className={`cal-cell ${selected === iso ? 'picked' : ''} ${attended ? 'attended' : ''}`}
              onClick={() => onSelect(iso)}
            >
              <span className="num">{day}</span>
              <span className="dots">
                {colors.slice(0, 6).map((c, di) => (
                  <i key={`${iso}-${di}`} className={`dot ${c}`} />
                ))}
              </span>
            </button>
          )
        })}
      </div>
      <p className="cal-hint">점 하나 = 공부 게시물 하나. 파랑 10은화 · 노랑 5은화 · 빨강 0은화</p>
    </section>
  )
}
