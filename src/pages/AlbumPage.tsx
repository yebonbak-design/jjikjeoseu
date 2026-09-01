import { extractYoutubeId, youtubeThumb } from '../lib/youtube'
import { useStore } from '../store'

export function AlbumPage() {
  const { data, go, createPost } = useStore()

  function write() {
    const id = createPost()
    go({ page: 'editor', postId: id })
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
