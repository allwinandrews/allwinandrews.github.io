import { Canvas } from '@react-three/fiber'
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Boundary } from '../components/Boundary'
import { bySlug, experience, profile } from '../data/projects'
import { hasWebGL } from '../lib/hooks'
import { game, kadhaDesign, loadSave, writeSave } from '../world/game'
import { DesignPicker } from '../components/Exhibits'
import Scene from '../world/Scene'
import { spools, stations, type Station } from '../world/stations'

/** If the 3D scene throws on some device, fall back to the plain site instead of a blank page. */
class Safe extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function KadhaPicker() {
  const design = useSyncExternalStore(kadhaDesign.subscribe, kadhaDesign.get)
  return (
    <>
      <p className="meta">Pick a design to see it in the hoop</p>
      <DesignPicker value={design} onChange={kadhaDesign.set} />
    </>
  )
}

function PanelBody({ s }: { s: Station }) {
  if (s.kind === 'contact')
    return (
      <>
        <p className="meta">You reached the end of the thread</p>
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
      </>
    )
  if (s.kind === 'experience') {
    const e = experience[s.expIndex!]
    return (
      <>
        <p className="meta">
          {e.when} · {e.where}
        </p>
        <h2>
          {e.role}, {e.org}
        </h2>
        <p className="lead">{e.text}</p>
        <Link className="more" to="/work#experience">
          Full experience
        </Link>
      </>
    )
  }
  const p = bySlug(s.slug!)!
  return (
    <>
      <p className="meta">
        {p.role} · {p.context}
      </p>
      <h2>{p.title}</h2>
      <p className="lead">{p.tagline}</p>
      {p.steps && <Boundary steps={p.steps} />}
      <ul className="points">
        {p.points.slice(0, 3).map((pt) => (
          <li key={pt}>{pt}</li>
        ))}
      </ul>
      {p.slug === 'kadha' && <KadhaPicker />}
      <p className="status">{p.status}</p>
      <Link className="btn btn-primary" to={`/projects/${p.slug}`}>
        Read the full case study
      </Link>
    </>
  )
}

export default function World() {
  const [save] = useState(loadSave)
  const [started, setStarted] = useState(save.started)
  const [near, setNear] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [found, setFound] = useState(() => new Set(save.found))
  const [collected, setCollected] = useState(() => new Set(save.spools))
  const [toast, setToast] = useState('')
  const [failed, setFailed] = useState(false)
  const toastTimer = useRef(0)
  const lostTimer = useRef(0)
  const closeBtn = useRef<HTMLButtonElement>(null)

  // restore where the visitor was standing (e.g. after reading a case study)
  useState(() => {
    game.pos.set(save.x, 0, save.z)
    game.target = null
  })

  const say = useCallback((msg: string) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2600)
  }, [])

  const open = useCallback(
    (id: string) => {
      setOpenId(id)
      game.target = null
      setFound((f) => {
        if (f.has(id)) return f
        const n = new Set(f).add(id)
        if (n.size === stations.length) say('You found everything. Thank you for exploring.')
        return n
      })
    },
    [say],
  )

  const onCollect = useCallback(
    (i: number) => {
      setCollected((c) => {
        if (c.has(i)) return c
        const n = new Set(c).add(i)
        say(`Picked up ${spools[i].name} (${n.size}/${spools.length})`)
        return n
      })
    },
    [say],
  )

  useEffect(() => {
    writeSave(found, collected, started)
  }, [found, collected, started, openId])
  useEffect(() => {
    const save = () => writeSave(found, collected, started)
    window.addEventListener('pagehide', save)
    return () => {
      save()
      window.removeEventListener('pagehide', save)
    }
  }, [found, collected, started])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openId) setOpenId(null)
      else if (!started && e.key === 'Enter') setStarted(true)
      else if (started && !openId && near && (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        open(near)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [near, openId, started, open])

  useEffect(() => {
    if (openId) closeBtn.current?.focus()
  }, [openId])

  useEffect(() => {
    document.documentElement.classList.add('world-open')
    return () => {
      document.documentElement.classList.remove('world-open')
      clearTimeout(lostTimer.current)
      clearTimeout(toastTimer.current)
    }
  }, [])

  if (!hasWebGL() || failed) return <Navigate to="/work" replace />

  const nearStation = stations.find((s) => s.id === near)
  const openStation = stations.find((s) => s.id === openId)
  const touch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

  return (
    <div className="world">
      <Safe onFail={() => setFailed(true)}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ fov: 45, near: 0.1, far: 120, position: [0, 8.5, 17.5] }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            // Browsers can drop the 3D context (low memory, backgrounded tab). Give it a
            // moment to come back; if it does not, send the visitor to the plain site.
            const el = gl.domElement
            el.addEventListener('webglcontextlost', (e) => {
              e.preventDefault()
              lostTimer.current = window.setTimeout(() => {
                if (el.isConnected && gl.getContext().isContextLost()) setFailed(true)
              }, 2500)
            })
            el.addEventListener('webglcontextrestored', () => clearTimeout(lostTimer.current))
          }}
        >
          <Scene
            paused={!started || !!openId}
            found={found}
            collected={collected}
            onNear={setNear}
            onCollect={onCollect}
          />
        </Canvas>
      </Safe>

      <header className="world-top">
        <div>
          <strong>{profile.name}</strong>
          <span className="world-sub">{profile.title}</span>
        </div>
        <div className="world-right">
          {started && (
            <span className="world-score" aria-live="polite">
              {found.size}/{stations.length} found · {collected.size}/{spools.length} skills
            </span>
          )}
          <Link className="btn world-skip" to="/work">
            Plain site
          </Link>
        </div>
      </header>

      {!started && (
        <div className="world-intro">
          <div className="world-card">
            <p className="eyebrow">{profile.title}</p>
            <h1>{profile.name}</h1>
            <p className="lead">{profile.summary}</p>
            <p className="world-how">
              This portfolio is a small world. Walk along the stitched path and see what you find.
              <br />
              {touch ? 'Tap or drag on the ground to walk.' : 'Walk with WASD or the arrow keys, or click the ground.'}
            </p>
            <div className="cta">
              <button className="btn btn-primary" onClick={() => setStarted(true)} autoFocus>
                Start exploring
              </button>
              <Link className="btn" to="/work">
                Just show me the work
              </Link>
            </div>
          </div>
        </div>
      )}

      {started && !openStation && nearStation && (
        <button className="world-prompt" onClick={() => open(nearStation.id)}>
          {!touch && <kbd>E</kbd>}
          <span>
            {found.has(nearStation.id) ? 'Look again at' : 'Take a look at'} {nearStation.hint}
          </span>
        </button>
      )}

      {started && !openStation && !nearStation && found.size === 0 && (
        <p className="world-help">{touch ? 'Tap or drag on the ground to walk' : 'WASD or arrow keys to walk'}</p>
      )}

      {toast && (
        <p className="world-toast" role="status">
          {toast}
        </p>
      )}

      {openStation && (
        <aside className="world-panel" role="dialog" aria-label={openStation.title}>
          <button ref={closeBtn} className="world-close" onClick={() => setOpenId(null)}>
            Keep walking <kbd>Esc</kbd>
          </button>
          <PanelBody s={openStation} />
        </aside>
      )}
    </div>
  )
}
