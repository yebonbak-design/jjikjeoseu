import { useState } from 'react'
import { CloseUp } from '../components/CloseUp'
import { MeadowScene } from '../components/MeadowScene'
import { MonthCalendar } from '../components/MonthCalendar'
import { CheckModal } from '../components/CheckModal'
import { RanchReveal } from '../components/RanchReveal'
import { COMPANIONS, MAX_LEVEL, PEOPLE_UNLOCK_LEVEL, STAT_LABEL, STAT_ORDER } from '../data/catalog'
import { pickNews, pickTalk } from '../data/homeFlavor'
import { formatKorean, todayISO } from '../lib/dates'
import { remainingWalks } from '../lib/forage'
import { intimacyRatio, ranchChoresFor, statMaxForLevel } from '../lib/level'
import { moodFromPosts } from '../lib/mood'
import { cellColorForDate } from '../lib/progress'
import { useStore } from '../store'
import type { ForageItem, StudyPost } from '../types'

export function HomePage() {
  const { data, go, setChecks, walkForest } = useStore()
  const today = todayISO()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [picked, setPicked] = useState<string | null>(today)
  const [walkMsg, setWalkMsg] = useState<string | null>(null)
  const [found, setFound] = useState<ForageItem | null>(null)
  const [check, setCheck] = useState<{ post: StudyPost; date: string } | null>(null)
  const [speech] = useState(() => pickTalk())
  const [news] = useState(() => pickNews())

  const { player } = data
  const mood = moodFromPosts(data.posts)
  const max = statMaxForLevel(player.level)
  const chores = ranchChoresFor(player.stats.vitality, max, player.ownedCompanionIds)
  const left = remainingWalks(player.walks, today, chores)
  const pals = COMPANIONS.filter((c) => player.ownedCompanionIds.includes(c.id))
  const dayPosts = picked
    ? data.posts.filter((p) => p.startDate && p.endDate && picked >= p.startDate && picked <= p.endDate)
    : []
  const vitRatio = max <= 0 ? 0 : player.stats.vitality / max
  const wisRatio = max <= 0 ? 0 : player.stats.wisdom / max
  const choreHint =
    vitRatio >= 1 ? '체력이 가득이라 오늘 두 번 더 돌볼 수 있어요.' : vitRatio >= 0.5 ? '체력이 반을 넘어 오늘 한 번 더 돌볼 수 있어요.' : '체력이 오르면 목장일이 늘어납니다.'
  const luckHint =
    wisRatio >= 0.8 ? '지혜가 높아 귀한 것이 잘 보여요.' : wisRatio >= 0.4 ? '지혜가 조금 있어 눈이 밝아졌어요.' : '지혜가 오르면 귀한 것이 잘 보입니다.'

  function shift(delta: number) {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  function walk() {
    if (found) return
    const res = walkForest()
    if (!res.ok) {
      setWalkMsg(res.message)
      return
    }
    setWalkMsg(null)
    setFound(res.item)
  }

  return (
    <div className="home">
      <div className="ranch-news">
        <span className="ranch-news-kicker">목장 브리핑</span>
        <p>{news}</p>
      </div>
      <div className="home-main">
        <MeadowScene mood={mood} companions={pals} speech={speech.text} />
        <CloseUp ratio={intimacyRatio(player)} />
        <div className="stat-dock">
          <p className="level-row">
            레벨 {player.level}
            {player.level >= MAX_LEVEL
              ? ' · 만렙 · 넘치는 돌봄은 은화로 남습니다'
              : ' · 세 칸이 가득 차면 자랍니다'}
            {player.level < PEOPLE_UNLOCK_LEVEL ? ` · 동료는 레벨 ${PEOPLE_UNLOCK_LEVEL}부터` : null}
          </p>
          {STAT_ORDER.map((id) => {
            const value = player.stats[id]
            const pct = Math.min(100, (value / max) * 100)
            return (
              <div className="gauge" key={id}>
                <span>{STAT_LABEL[id]}</span>
                <div className="gauge-track">
                  <i style={{ width: `${pct}%` }} />
                </div>
                <em>
                  {value}/{max}
                </em>
              </div>
            )
          })}
        </div>
      </div>
      <aside className="home-side">
        <MonthCalendar
          year={year}
          month={month}
          posts={data.posts}
          selected={picked}
          onSelect={setPicked}
          onPrev={() => shift(-1)}
          onNext={() => shift(1)}
        />
        <div className="panel">
          <h3>목장일</h3>
          <p className="muted">
            오늘 {left}/{chores}번 남음. {choreHint} {luckHint}
          </p>
          <button type="button" className="primary" onClick={walk} disabled={left <= 0 || Boolean(found)}>
            양 돌보기
          </button>
          {walkMsg ? <p className="walk-msg">{walkMsg}</p> : null}
        </div>
        {picked ? (
          <div className="panel">
            <h3>{formatKorean(picked)}</h3>
            {dayPosts.length === 0 ? (
              <p className="muted">이 날에 겹치는 공부가 없습니다.</p>
            ) : (
              <ul className="day-posts">
                {dayPosts.map((p) => {
                  const color = cellColorForDate(p, picked)
                  return (
                    <li key={p.id}>
                      <span className={`mini ${color ?? 'none'}`} />
                      <span className="grow">{p.title.trim() || '제목 없는 공부'}</span>
                      <button
                        type="button"
                        className="tiny"
                        onClick={() => setCheck({ post: p, date: picked })}
                      >
                        기록
                      </button>
                      <button
                        type="button"
                        className="tiny"
                        onClick={() => go({ page: 'editor', postId: p.id, openDate: picked })}
                      >
                        열기
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ) : null}
      </aside>
      {check ? (
        <CheckModal
          post={data.posts.find((p) => p.id === check.post.id) ?? check.post}
          date={check.date}
          onClose={() => setCheck(null)}
          onSave={(ids) => setChecks(check.post.id, check.date, ids)}
        />
      ) : null}
      {found ? <RanchReveal item={found} onClose={() => setFound(null)} /> : null}
    </div>
  )
}
