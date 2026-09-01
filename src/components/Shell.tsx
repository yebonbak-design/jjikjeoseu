import type { ReactNode } from 'react'
import { PEOPLE_UNLOCK_LEVEL } from '../data/catalog'
import { ownedPeople, personSlotsForLevel } from '../lib/level'
import { useStore } from '../store'

export function Shell({ children }: { children: ReactNode }) {
  const { data, route, go } = useStore()
  const { player } = data
  const slots = personSlotsForLevel(player.level)
  const people = ownedPeople(player.ownedCompanionIds).length

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => go({ page: 'home' })}>
          <span className="brand-mark">찍</span>
          찍저스 키우기
        </button>
        <nav className="nav">
          <NavBtn active={route.page === 'home'} onClick={() => go({ page: 'home' })}>
            초원
          </NavBtn>
          <NavBtn active={route.page === 'album' || route.page === 'editor'} onClick={() => go({ page: 'album' })}>
            공부
          </NavBtn>
          <NavBtn active={route.page === 'shop'} onClick={() => go({ page: 'shop' })}>
            상점
          </NavBtn>
          <NavBtn active={route.page === 'bag'} onClick={() => go({ page: 'bag' })}>
            가방
          </NavBtn>
        </nav>
        <div className="hud">
          <span className="stat-chip" title="레벨">
            Lv.{player.level}
          </span>
          <span className="coin" title="은화">
            <i /> {player.silver}
          </span>
          <span
            className="stat-chip faint"
            title={player.level < PEOPLE_UNLOCK_LEVEL ? `레벨 ${PEOPLE_UNLOCK_LEVEL}부터 동료` : '사람 동료 자리'}
          >
            동료 {people}/{slots}
          </span>
        </div>
      </header>
      <main className="stage">{children}</main>
    </div>
  )
}

function NavBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button className={active ? 'nav-btn on' : 'nav-btn'} onClick={onClick}>
      {children}
    </button>
  )
}
