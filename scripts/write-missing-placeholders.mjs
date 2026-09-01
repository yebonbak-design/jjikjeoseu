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

function writeIfMissing(dir, id, label, fill) {
  const dest = path.join(dir, `${id}.svg`)
  if (fs.existsSync(path.join(dir, `${id}.png`)) || fs.existsSync(dest)) return false
  fs.writeFileSync(dest, svg(label, fill))
  return true
}

const items = [
  ['salad', '샐러드', '#c5ddb0'],
  ['tofu-curry', '두부카레', '#e8d48a'],
  ['cardigan', '가디건', '#ead9e4'],
  ['violin', '바이올린', '#d7c7a5'],
  ['sermon', '설교', '#d9c4a0'],
  ['temple', '성전엎기', '#c4a574'],
  ['betrayal', '배신종용', '#c9a0b0'],
  ['cross', '십자가', '#b08968'],
]

const pals = [
  ['black-lamb', '까만 양', '#5a534c'],
  ['goat', '염소', '#d7c7a5'],
  ['wolf', '늑대', '#c9b89a'],
  ['puppy', '똥강아지', '#e2d48a'],
  ['hamster', '햄스터', '#f0d9b5'],
  ['rat', '쥐', '#c9b89a'],
  ['rabbit', '토끼', '#f4efe4'],
  ['bear', '곰', '#c4a574'],
  ['cat', '고양이', '#e8eef4'],
  ['fox', '여우', '#e0b84a'],
  ['gomda', '곰다', '#dce8f4'],
  ['pilate', '빌라도', '#d9c4a0'],
  ['annas', '안나스', '#e7f0d8'],
  ['caiaphas', '가야바', '#ead9e4'],
  ['herod', '헤롯', '#f0d9b5'],
  ['roman', '로마군', '#c9b89a'],
]

let n = 0
for (const [id, label, fill] of items) {
  if (writeIfMissing('public/items', id, label, fill)) n++
}
for (const [id, label, fill] of pals) {
  if (writeIfMissing('public/companions', id, label, fill)) n++
}
console.log('wrote', n, 'placeholders')
