import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Boundary, Legend } from '../components/Boundary'
import { EagerStages, KadhaGallery, MonteCarloExhibit, PoseExhibit } from '../components/Exhibits'
import { ViewSwitch } from '../components/Layout'
import { education, experience, moreWork, profile, projects, stackGroups, type Project } from '../data/projects'
import { asset } from '../lib/hooks'

/* ------------------------------------------------------------------ */
/* The book: a real page-turn, one spread at a time on wide screens   */
/* and one page at a time on phones. Pages are built from the same    */
/* content as the rest of the site (src/data/projects.ts).            */
/* ------------------------------------------------------------------ */

type Ctx = {
  active: boolean // this page is on screen and the turn has finished: safe to run 3D or play video
  go: (id: string) => void
  pages: Page[]
}
type Page = {
  id: string
  title: string
  kind: 'paper' | 'cover' | 'back' | 'blank'
  toc?: boolean
  render: (c: Ctx) => ReactNode
}

const FLIP_MS = 900

function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches)
  useEffect(() => {
    const mq = matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    // older Safari only has addListener
    if (mq.addEventListener) mq.addEventListener('change', on)
    else mq.addListener(on)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', on)
      else mq.removeListener(on)
    }
  }, [query])
  return match
}

/* ---------- page content ---------- */

function Poster({ src, alt }: { src: string; alt: string }) {
  return <img className="book-poster" src={asset(src)} alt={alt} loading="lazy" />
}

function ShotViewer({ p }: { p: Project }) {
  const [i, setI] = useState(0)
  const shots = p.images!
  return (
    <figure className="shot-viewer">
      <img src={asset(shots[i].src)} alt={shots[i].alt} />
      <figcaption className="fine">{shots[i].alt}</figcaption>
      <div className="shot-thumbs" role="group" aria-label="Screens">
        {shots.map((s, k) => (
          <button key={s.src} aria-pressed={k === i} onClick={() => setI(k)} aria-label={s.alt}>
            <img src={asset(s.src)} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </figure>
  )
}

function Media({ p, active }: { p: Project; active: boolean }) {
  if (p.exhibit === 'stitch')
    return active ? <KadhaGallery /> : <Poster src="media/kadha/adam.jpg" alt="Kadha embroidery design" />
  if (p.exhibit === 'pose')
    return active ? (
      <PoseExhibit />
    ) : (
      <Poster src="media/fitness-squat.jpg" alt="fitness-ai counting squat reps" />
    )
  if (p.exhibit === 'montecarlo')
    return active ? <MonteCarloExhibit /> : <p className="stage-note">Loading the Monte Carlo chart</p>
  if (p.images) return <ShotViewer p={p} />
  if (p.video)
    return (
      <figure className="page-video">
        {active ? (
          <video src={asset(p.video.src)} poster={asset(p.video.poster)} controls preload="none" playsInline />
        ) : (
          <Poster src={p.video.poster} alt={p.video.caption} />
        )}
        <figcaption className="fine">{p.video.caption}</figcaption>
      </figure>
    )
  return null
}

function ProjectLeft({ p }: { p: Project }) {
  return (
    <>
      <p className="meta">
        {p.role} · {p.context}
      </p>
      <h2>{p.title}</h2>
      <p className="lead">{p.tagline}</p>
      {p.steps && <Boundary steps={p.steps} />}
      <p className="status">{p.status}</p>
      <ul className="chips">
        {p.stack.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </>
  )
}

function ProjectRight({ p, active }: { p: Project; active: boolean }) {
  return (
    <>
      <Media p={p} active={active} />
      <h3 className="small-h">What I did</h3>
      <ul className="points">
        {p.points.map((pt) => (
          <li key={pt}>{pt}</li>
        ))}
      </ul>
      <p className="links">
        {p.links?.map((l) => (
          <a key={l.href} className="btn" href={l.href}>
            {l.label}
          </a>
        ))}
        <Link className="btn btn-primary" to={`/projects/${p.slug}`}>
          Read the full case study
        </Link>
      </p>
    </>
  )
}

function Contents({ c }: { c: Ctx }) {
  return (
    <>
      <p className="eyebrow">Contents</p>
      <h2>What is in this book</h2>
      <ol className="toc">
        {c.pages.map((pg, i) =>
          pg.toc ? (
            <li key={pg.id}>
              <button onClick={() => c.go(pg.id)}>
                <span>{pg.title}</span>
                <i aria-hidden />
                <b>{i}</b>
              </button>
            </li>
          ) : null,
        )}
      </ol>
    </>
  )
}

function Cover({ c }: { c: Ctx }) {
  return (
    <div className="cover-art">
      <p className="eyebrow">{profile.title}</p>
      <h1>{profile.name}</h1>
      <p className="cover-sub">Portfolio, 2026</p>
      <button className="btn btn-primary" onClick={() => c.go('contents')}>
        Open the book
      </button>
      <p className="cover-hint">
        Turn pages with the buttons, the arrow keys or a swipe.
      </p>
    </div>
  )
}

function BackCover({ c }: { c: Ctx }) {
  return (
    <div className="cover-art">
      <p className="eyebrow">The end</p>
      <h2>Thank you for reading</h2>
      <button className="btn" onClick={() => c.go('cover')}>
        Back to the cover
      </button>
    </div>
  )
}

function buildPages(spread: boolean): Page[] {
  const pages: Page[] = [
    { id: 'cover', title: 'Cover', kind: 'cover', render: (c) => <Cover c={c} /> },
    { id: 'contents', title: 'Contents', kind: 'paper', render: (c) => <Contents c={c} /> },
    {
      id: 'hello',
      title: 'How I build with models',
      kind: 'paper',
      toc: true,
      render: () => (
        <>
          <p className="eyebrow">Welcome</p>
          <h2>How I build with models</h2>
          <p className="lead">{profile.summary}</p>
          <p>
            Code makes the decisions that have to be right. The model does the parts only a model can do. Every project
            in this book is drawn the same way, so you can see where that line sits.
          </p>
          <Legend />
          <p className="fine">{profile.availability}</p>
        </>
      ),
    },
  ]
  for (const p of projects) {
    pages.push({ id: p.slug, title: p.title, kind: 'paper', toc: true, render: () => <ProjectLeft p={p} /> })
    pages.push({
      id: `${p.slug}-more`,
      title: `${p.title}: what I did`,
      kind: 'paper',
      render: (c) => <ProjectRight p={p} active={c.active} />,
    })
  }
  pages.push(
    {
      id: 'more-work',
      title: 'More work',
      kind: 'paper',
      toc: true,
      render: () => (
        <>
          <p className="eyebrow">Smaller things</p>
          <h2>More work</h2>
          <ul className="more-list">
            {moreWork.map((m) => (
              <li key={m.title}>
                <h3>{m.href ? <a href={m.href}>{m.title}</a> : m.title}</h3>
                <p>{m.text}</p>
                <p className="meta">{m.stack}</p>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: 'experience',
      title: 'Experience',
      kind: 'paper',
      toc: true,
      render: () => (
        <>
          <p className="eyebrow">Where I have worked</p>
          <h2>Experience</h2>
          <ol className="timeline">
            {experience.map((e) => (
              <li key={e.org}>
                <p className="meta">
                  {e.when} · {e.where}
                </p>
                <h3>
                  {e.role}, {e.org}
                </h3>
                <p>{e.text}</p>
              </li>
            ))}
          </ol>
        </>
      ),
    },
    {
      id: 'stack',
      title: 'Stack and education',
      kind: 'paper',
      toc: true,
      render: () => (
        <>
          <p className="eyebrow">Tools</p>
          <h2>Stack</h2>
          <dl className="stack">
            {stackGroups.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <h3 className="small-h">Education</h3>
          <ul className="plain-list">
            {education.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: 'contact',
      title: 'Contact',
      kind: 'paper',
      toc: true,
      render: () => (
        <>
          <p className="eyebrow">The last page</p>
          <h2>Say hello</h2>
          <p className="lead">{profile.availability}</p>
          <div className="cta">
            <a className="btn btn-primary" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <a className="btn" href={profile.linkedin}>
              LinkedIn
            </a>
            <a className="btn" href={profile.github}>
              GitHub
            </a>
          </div>
          <p className="fine book-alt">
            Prefer another format? <Link to="/world">Walk through it as a 3D game</Link> or{' '}
            <Link to="/work">read the plain version</Link>. Contract work: <Link to="/services">AJA IT Services</Link>.
          </p>
        </>
      ),
    },
  )
  // a two-page spread needs an even count; the back cover is always last
  if (spread && (pages.length + 1) % 2 === 1)
    pages.push({ id: 'blank', title: 'Blank page', kind: 'blank', render: () => null })
  pages.push({ id: 'end', title: 'Back cover', kind: 'back', render: (c) => <BackCover c={c} /> })
  return pages
}

/* ---------- the book itself ---------- */

export default function Book() {
  const [sp, setSp] = useSearchParams()
  const spRef = useRef(setSp)
  spRef.current = setSp

  const spread = useMedia('(min-width: 900px) and (min-height: 540px)')
  const pages = useMemo(() => buildPages(spread), [spread])
  const n = pages.length
  const leaves = spread ? n / 2 : n

  const [curId, setCurId] = useState(() => sp.get('p') ?? 'cover')
  // follow the address bar if it changes from outside (Back, a pasted link)
  const urlId = sp.get('p') ?? 'cover'
  useEffect(() => setCurId(urlId), [urlId])
  const found = pages.findIndex((p) => p.id === curId)
  const curIdx = found < 0 ? 0 : found
  // position = how many leaves have been turned
  const pos = spread ? Math.ceil(curIdx / 2) : curIdx
  const idxOf = (p: number) => (spread ? Math.min(2 * p, n - 1) : p)

  const prevPos = useRef(pos)
  useEffect(() => {
    prevPos.current = pos
  }, [pos])

  // keep pages mounted around the reader, and a little longer after a turn so outgoing pages finish cleanly
  const [recent, setRecent] = useState(curIdx)
  useEffect(() => {
    if (recent === curIdx) return
    const t = setTimeout(() => setRecent(curIdx), FLIP_MS + 500)
    return () => clearTimeout(t)
  }, [curIdx, recent])
  const settled = recent === curIdx

  const go = useCallback((id: string) => {
    setCurId(id)
    spRef.current(id === 'cover' ? {} : { p: id }, { replace: true })
  }, [])
  const goPos = (p: number) => go(pages[idxOf(Math.max(0, Math.min(leaves - (spread ? 0 : 1), p)))].id)
  const next = () => goPos(pos + 1)
  const prev = () => goPos(pos - 1)
  const nextRef = useRef(next)
  const prevRef = useRef(prev)
  nextRef.current = next
  prevRef.current = prev
  const goRef = useRef(go)
  goRef.current = go
  const nRef = useRef(pages)
  nRef.current = pages

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if (e.target instanceof Element && e.target.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') nextRef.current()
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') prevRef.current()
      else if (e.key === 'Home') goRef.current('cover')
      else if (e.key === 'End') goRef.current(nRef.current[nRef.current.length - 1].id)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // swipe to turn (touch and pen only, so mouse text selection still works)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' || (e.target as Element).closest('video, canvas, input, .picker, .shot-thumbs')) return
    swipe.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)()
  }

  // two-finger sideways swipe on a trackpad
  const wheelLock = useRef(0)
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) < 40 || Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.5) return
    const now = Date.now()
    if (now - wheelLock.current < 800) return
    wheelLock.current = now
    ;(e.deltaX > 0 ? next : prev)()
  }

  const visible = (i: number) => (spread ? i === 2 * pos - 1 || i === 2 * pos : i === pos)
  const mounted = (i: number) => Math.abs(i - curIdx) <= 4 || Math.abs(i - recent) <= 4

  // turn order: when jumping several pages the leaves go over in a quick cascade
  const from = prevPos.current
  const dist = Math.abs(pos - from)
  const step = dist > 1 ? Math.min(110, 700 / dist) : 0
  // On phones a jump of several pages cross-fades instead of flipping a long stack
  const jump = !spread && dist > 1
  const fadeIdx = useRef(-1)
  if (!spread && dist > 0) fadeIdx.current = jump ? curIdx : -1

  const shift = spread && pos === 0 ? 'shift-l' : spread && pos === leaves ? 'shift-r' : ''
  const current = pages[curIdx]
  const label = spread && curIdx > 0 && curIdx < n - 1 ? `Pages ${curIdx % 2 ? curIdx : curIdx - 1}–${curIdx % 2 ? curIdx + 1 : curIdx} of ${n - 2}` : current.title

  const face = (i: number, side: 'front' | 'back', leaf: number, flipped: boolean, d: [number, number]) => {
    const pg = pages[i]
    if (!pg) return null
    const vis = visible(i)
    const body = mounted(i) ? pg.render({ active: vis && settled, go, pages }) : null
    const isRight = side === 'front'
    return (
      <div
        className={`face ${side} ${pg.kind === 'back' ? 'back-cover' : pg.kind} ${i === fadeIdx.current ? 'fade-in' : ''}`}
        inert={!vis}
        aria-hidden={!vis}
        style={{ ['--shade-d' as string]: `${d[0]}ms`, ['--shade-d2' as string]: `${d[1]}ms` }}
        data-leaf={leaf}
        data-flipped={flipped}
      >
        <div className="paper" tabIndex={vis && pg.kind === 'paper' ? 0 : undefined} aria-label={vis ? pg.title : undefined}>
          <EagerStages.Provider value={true}>{body}</EagerStages.Provider>
        </div>
        {pg.kind === 'paper' && i > 0 && <span className={`folio ${isRight ? 'folio-r' : 'folio-l'}`}>{i}</span>}
      </div>
    )
  }

  return (
    <div className="book-view">
      <header className="book-top">
        <Link to="/" className="book-name" onClick={() => go('cover')}>
          {profile.name}
        </Link>
        <ViewSwitch />
      </header>

      <div className="book-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)} onWheel={onWheel}>
        <section
          className={`book ${spread ? 'spread' : 'single'} ${shift} ${jump ? 'jump' : ''}`}
          aria-roledescription="book"
          aria-label="Portfolio book"
        >
          {Array.from({ length: leaves }, (_, j) => j)
            // phones: only the pages around the reader exist in the DOM, which keeps memory and layers low
            .filter((j) => spread || Math.abs(j - pos) <= 1 || Math.abs(j - recent) <= 1)
            .map((j) => {
            const flipped = j < pos
            const changed = dist > 0 && flipped !== j < from
            const forward = pos > from
            const rank = forward ? j - from : from - 1 - j
            const delay = changed ? Math.max(0, rank) * step : 0
            const z = flipped ? j + 1 : leaves - j + 1
            // shading: the page darkens as it turns away, and lightens as the other side comes round
            const turningTo = flipped
            const d1 = delay
            const d2 = delay + FLIP_MS / 2
            return (
              <div
                key={j}
                className={`leaf ${flipped ? 'flipped' : ''}`}
                style={{
                  zIndex: z,
                  ...(spread ? { transitionDelay: `${delay}ms, ${delay + FLIP_MS / 2}ms` } : null),
                }}
              >
                {face(spread ? 2 * j : j, 'front', j, flipped, turningTo ? [d1, d2] : [d2, d1])}
                {spread && face(2 * j + 1, 'back', j, flipped, turningTo ? [d2, d1] : [d1, d2])}
              </div>
            )
            })}
        </section>
      </div>

      <nav className="book-controls" aria-label="Turn the page">
        <button className="btn" onClick={prev} disabled={pos === 0} aria-label="Previous page">
          ‹ <span>Previous</span>
        </button>
        <button className="book-count" onClick={() => go('contents')} title="Go to the contents">
          {label}
        </button>
        <button className="btn btn-primary" onClick={next} disabled={pos === leaves - (spread ? 0 : 1)} aria-label="Next page">
          <span>Next</span> ›
        </button>
      </nav>
      <p className="sr-only" aria-live="polite">
        {current.title}
      </p>
    </div>
  )
}
