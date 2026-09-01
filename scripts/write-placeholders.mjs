import fs from 'node:fs'
import path from 'node:path'

function svg(label, fill) {
  const t = String(label).replaceAll('&', '&amp;')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="18" fill="${fill}"/>
  <text x="64" y="70" text-anchor="middle" font-size="13" fill="#3a322b" font-family="Noto Sans KR, sans-serif">${t}</text>
  <text x="64" y="118" text-anchor="middle" font-size="8" fill="#6a5e53">임시</text>
</svg>`
}

const items = [
  ['tortilla', '또띠아', '#f0d9b5'],
  ['anointing-oil', '향유', '#e8d48a'],
  ['torah', '토라', '#d9c4a0'],
  ['palm-branch', '종려', '#c5ddb0'],
  ['glitter', '반짝이', '#f3e6a8'],
  ['mustard-seed', '겨자씨', '#e2d48a'],
  ['loaves-fish', '떡·물고기', '#f0dcc8'],
  ['fig', '무화과', '#c9b07a'],
  ['olive-leaf', '감람잎', '#b7c98a'],
  ['wool', '양털', '#f4efe4'],
  ['wine', '와인', '#c9a0b0'],
  ['whip', '채찍', '#c4a574'],
  ['net', '그물', '#b9d4df'],
  ['towel', '수건', '#efe8d8'],
  ['manna', '만나', '#f7f1e4'],
  ['mite', '렙돈', '#d7c7a5'],
  ['donkey', '나귀', '#c9b89a'],
  ['staff', '지팡이', '#b08968'],
  ['raptor', '랩터', '#9bbf9a'],
  ['thorn-crown', '가시', '#8aa86a'],
  ['alabaster', '옥합', '#e8d5c4'],
  ['lost-bell', '양 방울', '#e0b84a'],
  ['star', '별', '#c9d6f0'],
  ['pearl', '진주', '#efe6f4'],
]

const pals = [
  ['lamb', '어린 양', '#f4efe4'],
  ['dove', '비둘기', '#e8eef4'],
  ['peter', '베드로', '#d5e4c4'],
  ['mary', '마리아', '#ead9e4'],
  ['angel', '전령', '#f7f1e4'],
  ['kyungda', '켱다', '#dce8f4'],
  ['simon', '시몬', '#e7f0d8'],
  ['bordercollie', '보더콜리', '#d7c7a5'],
]

for (const [id, label, fill] of items) {
  fs.writeFileSync(path.join('public', 'items', `${id}.svg`), svg(label, fill))
}
for (const [id, label, fill] of pals) {
  fs.writeFileSync(path.join('public', 'companions', `${id}.svg`), svg(label, fill))
}

console.log('wrote', items.length, 'items', pals.length, 'companions')
