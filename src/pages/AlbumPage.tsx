import { extractYoutubeId, youtubeThumb } from '../lib/youtube'
import { parseBackup } from '../storage'
import { useStore } from '../store'

export function AlbumPage() {
  const { data, go, createPost, replaceData } = useStore()

  function write() {
    const id = createPost()
    go({ page: 'editor', postId: id })
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '찍저스-기록.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function importBackup(file: File | undefined) {
    if (!file) return
    void file.text().then((text) => {
      const next = parseBackup(text)
      if (!next) {
        window.alert('기록 파일을 읽지 못했습니다.')
        return
      }
      if (
        !window.confirm(
          `공부 ${next.posts.length}개를 이 브라우저에 넣을까요? 지금 이 주소에 있는 기록은 바뀝니다.`,
        )
      ) {
        return
      }
      replaceData(next)
    })
  }

  return (
    <div className="album">
      <div className="album-bar">
        <div>
          <h1>공부 앨범</h1>
          <p className="muted">어떤 공부를, 얼마나 할지 여기서 정합니다.</p>
        </div>
        <button type="button" className="primary" onClick={write}>
          글쓰기
        </button>
      </div>
      <p className="hint">
        공부는 주소마다 이 브라우저에만 남습니다. 로컬에서 하던 공부를 배포 주소로 옮기려면, 먼저 거기서{' '}
        <strong>기록 저장</strong>을 누른 다음 여기서 <strong>기록 불러오기</strong>를 하면 됩니다.
      </p>
      <div className="file-row">
        <button type="button" className="file-btn" onClick={exportBackup}>
          기록 저장
        </button>
        <label className="file-btn">
          기록 불러오기
          <input
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              importBackup(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </label>
      </div>
      {data.posts.length === 0 ? (
        <div className="empty-album">아직 게시물이 없습니다. 글쓰기로 첫 공부를 만들어 보세요.</div>
      ) : (
        <div className="album-grid">
          {data.posts.map((p) => {
            const vid = extractYoutubeId(p.youtubeUrl)
            return (
              <button
                type="button"
                key={p.id}
                className="album-card"
                onClick={() => go({ page: 'editor', postId: p.id })}
              >
                <div className="thumb">
                  {vid ? (
                    <img src={youtubeThumb(vid)} alt="" />
                  ) : (
                    <span className="thumb-fallback">영어</span>
                  )}
                </div>
                <div className="album-meta">
                  <strong>{p.title.trim() || '제목 없는 공부'}</strong>
                  <span className="tag-pill">{p.tag === 'english' ? '영어' : '태그 없음'}</span>
                  <span className="dates">
                    {p.startDate && p.endDate ? `${p.startDate} – ${p.endDate}` : '기간 미정'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
