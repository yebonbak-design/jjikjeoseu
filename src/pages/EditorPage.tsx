import { useEffect, useMemo, useState } from 'react'
import { CheckModal } from '../components/CheckModal'
import { YoutubeClipPlayer } from '../components/YoutubeClipPlayer'
import { SCRIPT_PAGE_SIZE, TAGS } from '../data/catalog'
import { daysInRange } from '../lib/dates'
import { uid } from '../lib/ids'
import { cellColorForDate } from '../lib/progress'
import { blankScriptLine, parseBilingualScript } from '../lib/scriptImport'
import { extractYoutubeId, extractYoutubeStart, formatTimestamp, parseTimestamp } from '../lib/youtube'
import { useStore } from '../store'
import type { HideMode, ScriptPair, StudyPost } from '../types'

function lineHasText(line: ScriptPair, hideMode: HideMode) {
  const en = (line.en ?? '').trim()
  const ko = (line.ko ?? '').trim()
  if (hideMode === 'en') return en.length > 0
  if (hideMode === 'ko') return ko.length > 0
  return en.length > 0 || ko.length > 0
}

function patchLine(scripts: ScriptPair[], id: string, partial: Partial<ScriptPair>) {
  return scripts.map((s) => (s.id === id ? { ...s, ...partial } : s))
}

export function EditorPage() {
  const { data, route, go, savePost, deletePost, setChecks } = useStore()
  const found = data.posts.find((p) => p.id === route.postId)
  const [post, setPost] = useState<StudyPost | null>(found ?? null)
  const [savedFlash, setSavedFlash] = useState(false)
  const [openDate, setOpenDate] = useState<string | null>(route.openDate ?? null)
  const [scriptPage, setScriptPage] = useState(0)
  const [pageDraft, setPageDraft] = useState('1')
  const [editingLineId, setEditingLineId] = useState<string | null>(null)
  const [importNote, setImportNote] = useState<string | null>(null)
  const [startDraft, setStartDraft] = useState(() => formatTimestamp(found?.youtubeStart ?? 0))
  const [endDraft, setEndDraft] = useState(() => formatTimestamp(found?.youtubeEnd ?? 0))

  const squares = useMemo(
    () => (post ? daysInRange(post.startDate, post.endDate) : []),
    [post],
  )
  const videoId = post ? extractYoutubeId(post.youtubeUrl) : null
  const pageCount = Math.max(1, Math.ceil((post?.scripts.length ?? 1) / SCRIPT_PAGE_SIZE))
  const page = Math.min(scriptPage, pageCount - 1)
  const scriptSlice = post
    ? post.scripts.slice(page * SCRIPT_PAGE_SIZE, (page + 1) * SCRIPT_PAGE_SIZE)
    : []

  useEffect(() => {
    setPageDraft(String(page + 1))
  }, [page])

  useEffect(() => {
    if (!post) {
      go({ page: 'album' })
    }
  }, [post, go])

  useEffect(() => {
    if (!post) return
    const t = window.setTimeout(() => {
      savePost(post)
      setSavedFlash(true)
      window.setTimeout(() => setSavedFlash(false), 800)
    }, 400)
    return () => window.clearTimeout(t)
  }, [post, savePost])

  if (!post) return null

  const current = post
  const englishOn = current.tag === 'english'

  function patch(partial: Partial<StudyPost>) {
    setPost((p) => (p ? { ...p, ...partial } : p))
  }

  function goToScriptPage(raw: string) {
    const n = Number.parseInt(raw, 10)
    if (!Number.isFinite(n) || n < 1) {
      setPageDraft(String(page + 1))
      return
    }
    const next = Math.min(pageCount, n) - 1
    setScriptPage(next)
    setPageDraft(String(next + 1))
    setEditingLineId(null)
  }

  function addLine() {
    const line = blankScriptLine()
    patch({ scripts: [...current.scripts, line] })
    setScriptPage(Math.floor(current.scripts.length / SCRIPT_PAGE_SIZE))
    setEditingLineId(line.id)
  }

  function addMethod() {
    patch({ methods: [...current.methods, { id: uid('m'), text: '' }] })
  }

  function onImportFile(file: File | undefined, mode: 'append' | 'replace') {
    if (!file) return
    void file.text().then((text) => {
      const parsed = parseBilingualScript(text)
      if (parsed.length === 0) {
        setImportNote(
          '문장을 찾지 못했습니다. 01. [이름] 다음에 영어·한글·발음, 있으면 표현 | 줄을 적어 주세요.',
        )
        return
      }
      if (mode === 'replace') {
        patch({ scripts: parsed })
      } else {
        const keep = current.scripts.filter(
          (s) => (s.en ?? '').trim() || (s.ko ?? '').trim() || (s.pron ?? '').trim() || (s.note ?? '').trim(),
        )
        patch({ scripts: keep.length === 0 ? parsed : [...keep, ...parsed] })
      }
      setScriptPage(0)
      setEditingLineId(null)
      setImportNote(
        mode === 'replace'
          ? `기존 스크립트를 지우고 ${parsed.length}문장으로 바꿨습니다.`
          : `${parsed.length}문장을 이어 붙였습니다.`,
      )
    })
  }

  function clearScripts() {
    if (!window.confirm('스크립트를 모두 지울까요? 다시 가져오거나 직접 적을 수 있습니다.')) return
    patch({ scripts: [blankScriptLine()] })
    setScriptPage(0)
    setEditingLineId(null)
    setImportNote('스크립트를 비웠습니다.')
  }

  return (
    <div className="editor">
      <div className="editor-bar">
        <button type="button" className="ghost" onClick={() => go({ page: 'album' })}>
          ← 앨범
        </button>
        <span className={savedFlash ? 'saved on' : 'saved'}>저장됨</span>
        <button
          type="button"
          className="ghost danger"
          onClick={() => {
            if (window.confirm('이 공부를 지울까요? 받은 은화도 함께 돌아갑니다.')) {
              deletePost(post.id)
              go({ page: 'album' })
            }
          }}
        >
          삭제
        </button>
      </div>

      <div className="editor-grid">
        <section className="editor-main">
          <label className="field">
            <span>타이틀</span>
            <input
              value={post.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="예: 슈퍼스타 넘버 받아쓰기"
            />
          </label>

          <div className="field">
            <span>태그</span>
            <div className="tag-row">
              {TAGS.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className={post.tag === t.id ? 'tag on' : 'tag'}
                  onClick={() => patch({ tag: post.tag === t.id ? null : t.id })}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="hint">영어 태그를 켜면 아래 공부 칸이 열립니다. 태그는 나중에 더 넣을 수 있습니다.</p>
          </div>

          {englishOn ? (
            <>
              <label className="field">
                <span>외울 유튜브 링크</span>
                <input
                  value={post.youtubeUrl}
                  onChange={(e) => {
                    const youtubeUrl = e.target.value
                    const fromLink = extractYoutubeStart(youtubeUrl)
                    patch({
                      youtubeUrl,
                      ...(fromLink > 0 && !post.youtubeStart ? { youtubeStart: fromLink } : {}),
                    })
                    if (fromLink > 0 && !post.youtubeStart) setStartDraft(formatTimestamp(fromLink))
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>
              {videoId ? (
                <div className="yt">
                  <YoutubeClipPlayer
                    videoId={videoId}
                    startSec={post.youtubeStart}
                    endSec={post.youtubeEnd}
                    loop={post.youtubeLoop}
                  />
                  <div className="loop-row">
                    <label>
                      시작
                      <input
                        value={startDraft}
                        onChange={(e) => setStartDraft(e.target.value)}
                        onBlur={() => patch({ youtubeStart: parseTimestamp(startDraft) })}
                        placeholder="0:12"
                      />
                    </label>
                    <label>
                      끝
                      <input
                        value={endDraft}
                        onChange={(e) => setEndDraft(e.target.value)}
                        onBlur={() => patch({ youtubeEnd: parseTimestamp(endDraft) })}
                        placeholder="0:48"
                      />
                    </label>
                    <label className="loop-toggle">
                      <input
                        type="checkbox"
                        checked={post.youtubeLoop}
                        onChange={(e) => patch({ youtubeLoop: e.target.checked })}
                      />
                      이 구간 반복
                    </label>
                  </div>
                  <p className="hint">
                    예: 시작 0:12, 끝 0:48. 반복을 켜면 끝 지점에서 시작으로 돌아갑니다. 링크에{' '}
                    <code>?t=72</code>가 있으면 시작 시각으로 읽습니다.
                  </p>
                </div>
              ) : null}

              <div className="field">
                <div className="row-between">
                  <span>스크립트</span>
                  <div className="hide-btns">
                    {(['both', 'en', 'ko'] as HideMode[]).map((m) => (
                      <button
                        type="button"
                        key={m}
                        className={post.hideMode === m ? 'tiny on' : 'tiny'}
                        onClick={() => patch({ hideMode: m })}
                      >
                        {m === 'both' ? '둘 다' : m === 'en' ? '영어만' : '한국어만'}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={post.showPron !== false ? 'tiny on' : 'tiny'}
                      onClick={() => patch({ showPron: post.showPron === false })}
                    >
                      발음
                    </button>
                  </div>
                </div>
                <p className="hint">
                  한 페이지에 {SCRIPT_PAGE_SIZE}문장. 입력이 끝나면 대본처럼 보이고, 문장을 누르면 다시 고칠 수 있습니다.
                  팟캐스트 파일은 <code>01. [Sam]</code> 다음에 영어, 한글, 발음, 그리고 있으면{' '}
                  <code>표현 |</code> 줄을 적으면 됩니다. 표현이 없거나 여러 개여도 됩니다. 화자 줄은 저장하지 않습니다.
                </p>
                <div className="file-row">
                  <label className="file-btn">
                    이어 붙이기
                    <input
                      type="file"
                      accept=".txt,.tsv,.csv"
                      hidden
                      onChange={(e) => {
                        onImportFile(e.target.files?.[0], 'append')
                        e.target.value = ''
                      }}
                    />
                  </label>
                  <label className="file-btn">
                    새로 가져오기
                    <input
                      type="file"
                      accept=".txt,.tsv,.csv"
                      hidden
                      onChange={(e) => {
                        onImportFile(e.target.files?.[0], 'replace')
                        e.target.value = ''
                      }}
                    />
                  </label>
                  <button type="button" className="tiny" onClick={clearScripts}>
                    스크립트 비우기
                  </button>
                </div>
                {importNote ? <p className="hint">{importNote}</p> : null}
                <div className="scripts script-book">
                  {scriptSlice.map((line, idx) => {
                    const n = page * SCRIPT_PAGE_SIZE + idx + 1
                    const editing = editingLineId === line.id || !lineHasText(line, post.hideMode)
                    const showEn = post.hideMode !== 'ko'
                    const showKo = post.hideMode !== 'en'
                    const showPron = post.showPron !== false
                    if (!editing) {
                      return (
                        <button
                          type="button"
                          key={line.id}
                          className="pair read"
                          onClick={() => setEditingLineId(line.id)}
                        >
                          <span className="pair-n">{n}</span>
                          <span className="pair-text">
                            {showEn ? (
                              <span className={(line.en ?? '').trim() ? 'pair-en' : 'pair-en empty'}>
                                {(line.en ?? '').trim() || '영어'}
                              </span>
                            ) : null}
                            {showKo ? (
                              <span className={(line.ko ?? '').trim() ? 'pair-ko' : 'pair-ko empty'}>
                                {(line.ko ?? '').trim() || '한글'}
                              </span>
                            ) : null}
                            {showPron && (line.pron ?? '').trim() ? (
                              <span className="pair-pron">{line.pron.trim()}</span>
                            ) : null}
                            {showKo && (line.note ?? '').trim() ? (
                              <span className="pair-note">{line.note.trim()}</span>
                            ) : null}
                          </span>
                        </button>
                      )
                    }
                    return (
                      <div
                        key={line.id}
                        className="pair edit"
                        onBlur={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                            setEditingLineId((cur) => (cur === line.id ? null : cur))
                          }
                        }}
                      >
                        <span className="pair-n">{n}</span>
                        <div className="pair-lines">
                          {showEn ? (
                            <textarea
                              autoFocus={editingLineId === line.id}
                              value={line.en ?? ''}
                              placeholder="English sentence"
                              onChange={(e) =>
                                patch({ scripts: patchLine(post.scripts, line.id, { en: e.target.value }) })
                              }
                            />
                          ) : null}
                          {showKo ? (
                            <textarea
                              autoFocus={editingLineId === line.id && post.hideMode === 'ko' && !showEn}
                              value={line.ko ?? ''}
                              placeholder="한글 문장"
                              onChange={(e) =>
                                patch({ scripts: patchLine(post.scripts, line.id, { ko: e.target.value }) })
                              }
                            />
                          ) : null}
                          {showPron ? (
                            <textarea
                              className="pair-sub"
                              value={line.pron ?? ''}
                              placeholder="발음"
                              onChange={(e) =>
                                patch({ scripts: patchLine(post.scripts, line.id, { pron: e.target.value }) })
                              }
                            />
                          ) : null}
                          {showKo ? (
                            <textarea
                              className="pair-sub"
                              value={line.note ?? ''}
                              placeholder="부연설명 (없으면 비워 두세요)"
                              onChange={(e) =>
                                patch({ scripts: patchLine(post.scripts, line.id, { note: e.target.value }) })
                              }
                            />
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="tiny"
                          onClick={() => {
                            patch({ scripts: post.scripts.filter((s) => s.id !== line.id) })
                            setEditingLineId((cur) => (cur === line.id ? null : cur))
                          }}
                        >
                          지움
                        </button>
                      </div>
                    )
                  })}
                </div>
                <div className="pager">
                  <button
                    type="button"
                    className="tiny"
                    disabled={page <= 0}
                    onClick={() => {
                      setScriptPage(page - 1)
                      setEditingLineId(null)
                    }}
                  >
                    이전
                  </button>
                  <label className="page-jump">
                    <span className="sr-only">페이지</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={pageDraft}
                      onChange={(e) => setPageDraft(e.target.value.replace(/\D/g, ''))}
                      onBlur={() => goToScriptPage(pageDraft)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          goToScriptPage(pageDraft)
                          ;(e.target as HTMLInputElement).blur()
                        }
                      }}
                      aria-label="페이지 번호"
                    />
                    <span>/ {pageCount}</span>
                    <span className="page-total">· 전체 {post.scripts.length}문장</span>
                  </label>
                  <button
                    type="button"
                    className="tiny"
                    disabled={page >= pageCount - 1}
                    onClick={() => {
                      setScriptPage(page + 1)
                      setEditingLineId(null)
                    }}
                  >
                    다음
                  </button>
                </div>
                <button type="button" className="ghost" onClick={addLine}>
                  + 문장 쌍 추가
                </button>
              </div>
            </>
          ) : (
            <p className="muted box">태그를 선택하면 공부 항목이 생깁니다.</p>
          )}
        </section>

        <aside className="progress-pane">
          <h2>공부 진행</h2>
          <label className="field">
            <span>큰 목표</span>
            <textarea
              rows={3}
              value={post.bigGoal}
              onChange={(e) => patch({ bigGoal: e.target.value })}
              placeholder="이 공부로 이루고 싶은 것"
            />
          </label>
          <div className="field">
            <span>나는 어떻게 공부할 것인가</span>
            {post.methods.map((m, i) => (
              <div key={m.id} className="method-row">
                <input
                  value={m.text}
                  placeholder={`${i + 1}. 예: 하루 10문장 따라 읽기`}
                  onChange={(e) =>
                    patch({
                      methods: post.methods.map((x) =>
                        x.id === m.id ? { ...x, text: e.target.value } : x,
                      ),
                    })
                  }
                />
                <button
                  type="button"
                  className="tiny"
                  onClick={() => patch({ methods: post.methods.filter((x) => x.id !== m.id) })}
                >
                  지움
                </button>
              </div>
            ))}
            <button type="button" className="ghost" onClick={addMethod}>
              + 항목 추가
            </button>
          </div>
          <div className="date-row">
            <label className="field">
              <span>시작일</span>
              <input
                type="date"
                value={post.startDate}
                onChange={(e) => patch({ startDate: e.target.value })}
              />
            </label>
            <label className="field">
              <span>마스터하고 싶은 날</span>
              <input
                type="date"
                value={post.endDate}
                onChange={(e) => patch({ endDate: e.target.value })}
              />
            </label>
          </div>
          {squares.length > 0 ? (
            <div className="day-squares">
              {squares.map((d) => {
                const color = cellColorForDate(post, d)
                return (
                  <button
                    type="button"
                    key={d}
                    title={d}
                    className={`sq ${color ?? 'future'}`}
                    onClick={() => setOpenDate(d)}
                  />
                )
              })}
            </div>
          ) : (
            <p className="hint">시작일과 종료일을 적으면 날짜 칸이 생기고, 메인 캘린더에도 표시됩니다.</p>
          )}
        </aside>
      </div>

      {openDate ? (
        <CheckModal
          post={post}
          date={openDate}
          onClose={() => setOpenDate(null)}
          onSave={(ids) => {
            const dailyLogs = { ...post.dailyLogs, [openDate]: ids }
            setPost({ ...post, dailyLogs })
            setChecks(post.id, openDate, ids)
          }}
        />
      ) : null}
    </div>
  )
}
