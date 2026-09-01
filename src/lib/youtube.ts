export function extractYoutubeId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const re of patterns) {
    const m = trimmed.match(re)
    if (m?.[1]) return m[1]
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  return null
}

export function extractYoutubeStart(url: string): number {
  const raw = url.match(/[?&#](?:t|start)=([\dhms]+)/i)?.[1]
  if (!raw) return 0
  if (/^\d+$/.test(raw)) return Number(raw)
  const h = Number(raw.match(/(\d+)h/)?.[1] ?? 0)
  const m = Number(raw.match(/(\d+)m/)?.[1] ?? 0)
  const s = Number(raw.match(/(\d+)s/)?.[1] ?? 0)
  return h * 3600 + m * 60 + s
}

export function parseTimestamp(raw: string): number {
  const t = raw.trim()
  if (!t) return 0
  if (/^\d+(\.\d+)?$/.test(t)) return Math.max(0, Number(t))
  const parts = t.split(':').map((p) => Number(p))
  if (parts.some((n) => Number.isNaN(n))) return 0
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return 0
}

export function formatTimestamp(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
  return `${m}:${String(r).padStart(2, '0')}`
}

export function youtubeThumb(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

type YtWindow = Window & {
  YT?: { Player: new (el: HTMLElement, opts: unknown) => unknown }
  onYouTubeIframeAPIReady?: () => void
}

let apiLoading: Promise<void> | null = null

export function loadYoutubeApi(): Promise<void> {
  const w = window as YtWindow
  if (w.YT?.Player) return Promise.resolve()
  if (apiLoading) return apiLoading
  apiLoading = new Promise((resolve) => {
    const prev = w.onYouTubeIframeAPIReady
    w.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(s)
    }
  })
  return apiLoading
}

