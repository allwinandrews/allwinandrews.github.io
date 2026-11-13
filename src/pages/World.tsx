import { Canvas } from '@react-three/fiber'
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Boundary } from '../components/Boundary'
import { ViewSwitch } from '../components/Layout'
import { bySlug, experience, profile } from '../data/projects'
import { hasWebGL, isInteractive } from '../lib/hooks'
import { game, kadhaDesign, loadSave, toKmh, writeSave } from '../world/game'
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

/** Speedometer. Reads the car's speed straight from the game state, outside React, so it costs no re-renders. */
function Speedo() {
  const el = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let raf = 0
    let last = -1
    const tick = () => {
      const v = toKmh(game.speed)
      if (v !== last && el.current) {
        el.current.textContent = String(v)
        last = v
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="speedo" aria-hidden="true">
      <span ref={el}>0</span>
      <small>km/h</small>
    </div>
  )
}

type Pedal = 'left' | 'right' | 'gas' | 'brake'

/** On-screen controls for touch: steer on the left thumb, pedals on the right. Each button tracks its own finger. */
function Pedals() {
  useEffect(
    () => () => {
      game.input.left = game.input.right = game.input.gas = game.input.brake = false
    },
    [],
  )
  const btn = (k: Pedal, label: string, text: string) => (
    <button
      type="button"
      className={`pedal pedal-${k}`}
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault()
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
          /* synthetic or already-ended pointer: the button still works without capture */
        }
        game.input[k] = true
      }}
      onPointerUp={() => (game.input[k] = false)}
      onPointerCancel={() => (game.input[k] = false)}
      onLostPointerCapture={() => (game.input[k] = false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {text}
    </button>
  )
  return (
    <div className="pedals">
      <div className="pedals-steer">
        {btn('left', 'Steer left', '◀')}
        {btn('right', 'Steer right', '▶')}
      </div>
      <div className="pedals-drive">
        {btn('brake', 'Brake and reverse', 'Brake')}
        {btn('gas', 'Accelerate', 'Go')}
      </div>
    </div>
  )
}

function KadhaPicker() {
  const design = useSyncExternalStore(kadhaDesign.subscribe, kadhaDesign.get)
  return (
    <>
      <p className="meta">Pick a design and watch the hoop sew it, front on</p>
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
    game.speed = 0
    game.steer = 0
  })

  const say = useCallback((msg: string) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2600)
  }, [])

  const open = useCallback(
    (id: string) => {
      setOpenId(id)
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
      else if (isInteractive(e.target)) return // Enter or Space on a link or button does what it says
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

  if (!hasWebGL() || failed) return <Navigate to="/" replace />

  const nearStation = stations.find((s) => s.id === near)
  const openStation = stations.find((s) => s.id === openId)
  const touch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

  return (
    <div className={touch ? 'world touch' : 'world'}>
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
          <ViewSwitch />
        </div>
      </header>

      {!started && (
        <div className="world-intro">
          <div className="world-card">
            <p className="eyebrow">{profile.title}</p>
            <h1>{profile.name}</h1>
            <p className="lead">{profile.summary}</p>
            <p className="world-how">
              This portfolio is a small world, and you drive a car through it. Follow the stitched road and see what you find.
              <br />
              {touch
                ? 'Steer with the arrows on the left. Hold Go to drive, Brake to stop and reverse.'
                : 'Drive with W A S D or the arrow keys: W accelerates, S brakes and reverses.'}
            </p>
            <div className="cta">
              <button className="btn btn-primary" onClick={() => setStarted(true)} autoFocus>
                Start the engine
              </button>
              <Link className="btn" to="/">
                Read it as a book instead
              </Link>
            </div>
          </div>
        </div>
      )}

      {started && !openStation && nearStation && (
        <button
          className="world-prompt"
          // open on press, not release: driving can move you out of range (and remove this button) mid-click
          onPointerDown={(e) => {
            e.preventDefault()
            open(nearStation.id)
          }}
          onClick={(e) => e.detail === 0 && open(nearStation.id)}
        >
          {!touch && <kbd>E</kbd>}
          <span>
            {found.has(nearStation.id) ? 'Look again at' : 'Take a look at'} {nearStation.hint}
          </span>
        </button>
      )}

      {started && !openStation && !nearStation && found.size === 0 && (
        <p className="world-help">{touch ? 'Hold Go to drive, steer with the arrows' : 'W accelerates, S brakes, A and D steer'}</p>
      )}

      {started && !openStation && <Speedo />}
      {started && !openStation && touch && <Pedals />}

      {toast && (
        <p className="world-toast" role="status">
          {toast}
        </p>
      )}

      {openStation && (
        <aside className="world-panel" role="dialog" aria-label={openStation.title}>
          <button ref={closeBtn} className="world-close" onClick={() => setOpenId(null)}>
            Keep driving <kbd>Esc</kbd>
          </button>
          <PanelBody s={openStation} />
        </aside>
      )}
    </div>
  )
}
