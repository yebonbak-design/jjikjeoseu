import { useEffect, useRef } from 'react'
import { loadYoutubeApi } from '../lib/youtube'

type YtPlayer = {
  destroy: () => void
  seekTo: (sec: number, allowSeekAhead: boolean) => void
  playVideo: () => void
  getCurrentTime: () => number
}

type YtNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string
      width?: string
      height?: string
      playerVars?: Record<string, number | string>
      events?: {
        onReady?: () => void
        onStateChange?: (e: { data: number }) => void
      }
    },
  ) => YtPlayer
}

const ENDED = 0
const PLAYING = 1

export function YoutubeClipPlayer({
  videoId,
  startSec,
  endSec,
  loop,
}: {
  videoId: string
  startSec: number
  endSec: number
  loop: boolean
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YtPlayer | null>(null)
  const clipRef = useRef({ startSec, endSec, loop })
  clipRef.current = { startSec, endSec, loop }

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    let cancelled = false
    let poll = 0
    const mount = document.createElement('div')
    box.innerHTML = ''
    box.appendChild(mount)

    void loadYoutubeApi().then(() => {
      if (cancelled) return
      const YT = (window as unknown as { YT: YtNamespace }).YT
      const start = Math.max(0, Math.floor(startSec))
      const end = endSec > start ? Math.floor(endSec) : 0
      const player = new YT.Player(mount, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          start,
          ...(end > start ? { end } : {}),
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onStateChange: (e) => {
            const clip = clipRef.current
            if (!clip.loop) return
            if (e.data === ENDED) {
              player.seekTo(Math.max(0, clip.startSec), true)
              player.playVideo()
            }
            if (e.data === PLAYING) {
              window.clearInterval(poll)
              poll = window.setInterval(() => {
                const now = clipRef.current
                if (!now.loop || now.endSec <= now.startSec) return
                try {
                  if (player.getCurrentTime() >= now.endSec - 0.12) {
                    player.seekTo(Math.max(0, now.startSec), true)
                  }
                } catch {
                  /* player gone */
                }
              }, 180)
            }
          },
        },
      })
      playerRef.current = player
    })

    return () => {
      cancelled = true
      window.clearInterval(poll)
      try {
        playerRef.current?.destroy()
      } catch {
        /* ignore */
      }
      playerRef.current = null
    }
  }, [videoId, startSec, endSec])

  return <div className="yt-player" ref={boxRef} />
}
