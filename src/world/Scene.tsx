import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { isInteractive } from '../lib/hooks'
import { game } from './game'
import { Prop } from './props'
import { bounds, pathCurve, reachOf, sizes, spools, stations, type Station } from './stations'

const SPEED = 6.2
const tmp = new THREE.Vector3()

/* ---------- text labels (canvas sprites, so no font files to ship) ---------- */

function useFontsReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let alive = true
    const done = () => alive && setReady(true)
    document.fonts.load('600 64px "Space Grotesk"').then(done, done)
    return () => {
      alive = false
    }
  }, [])
  return ready
}

export function Label({
  text,
  position,
  height = 0.62,
  color = '#f3ede4',
}: {
  text: string
  position: [number, number, number]
  height?: number
  color?: string
}) {
  const ready = useFontsReady()
  const { tex, aspect } = useMemo(() => {
    const c = document.createElement('canvas')
    const ctx = c.getContext('2d')!
    const font = '600 64px "Space Grotesk", system-ui, sans-serif'
    ctx.font = font
    const w = Math.ceil(ctx.measureText(text).width) + 48
    c.width = w
    c.height = 96
    ctx.font = font
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillStyle = color
    ctx.fillText(text, w / 2, 50)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return { tex, aspect: w / 96 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, color, ready])
  useEffect(() => () => tex.dispose(), [tex])
  return (
    <sprite position={position} scale={[height * aspect, height, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} fog={false} />
    </sprite>
  )
}

/* ---------- ground and path ---------- */

function Ground() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#1b1713'
    ctx.fillRect(0, 0, 64, 64)
    ctx.strokeStyle = '#241f1a'
    ctx.lineWidth = 2
    for (let i = 0; i <= 64; i += 8) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 64)
      ctx.moveTo(0, i)
      ctx.lineTo(64, i)
      ctx.stroke()
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(70, 120)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  const marker = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const m = marker.current
    if (!m) return
    m.visible = !!game.target
    if (game.target) {
      m.position.set(game.target.x, 0.03, game.target.z)
      const s = 1 + Math.sin(clock.elapsedTime * 6) * 0.12
      m.scale.set(s, s, s)
    }
  })

  // click or tap to walk there; keep the finger or button down and drag to steer
  const walkTo = (e: ThreeEvent<PointerEvent>) => {
    if (e.type === 'pointermove' && e.buttons === 0) return
    e.stopPropagation()
    game.target = new THREE.Vector3(e.point.x, 0, e.point.z)
  }

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -33]} onPointerDown={walkTo} onPointerMove={walkTo}>
        <planeGeometry args={[70, 120]} />
        <meshStandardMaterial map={tex} roughness={1} />
      </mesh>
      <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.28, 0.36, 32]} />
        <meshBasicMaterial color="#f7b157" transparent opacity={0.9} />
      </mesh>
    </>
  )
}

/** A running stitch along the path: one small gold dash per stitch. */
function StitchedPath() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const count = Math.floor(pathCurve.getLength() / 0.95)
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const o = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const u = i / (count - 1)
      const p = pathCurve.getPointAt(u)
      const t = pathCurve.getTangentAt(u)
      o.position.set(p.x, 0.025, p.z)
      o.rotation.set(0, Math.atan2(t.x, t.z), 0)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }, [count])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.11, 0.03, 0.55]} />
      <meshBasicMaterial color="#f7b157" />
    </instancedMesh>
  )
}

/* ---------- decoration: sewing pins and buttons ---------- */

function Decor() {
  const pins = useMemo(() => {
    const out: { x: number; z: number; tilt: number; color: string }[] = []
    const colors = ['#e2574c', '#7fb4ff', '#f7b157', '#7fd1a8', '#f3ede4']
    for (let i = 0; i < 26; i++) {
      const u = (i + 0.5) / 26
      const p = pathCurve.getPointAt(u)
      const side = i % 2 ? 1 : -1
      out.push({ x: p.x + side * (9.5 + ((i * 37) % 30) / 10), z: p.z, tilt: side * 0.25, color: colors[i % 5] })
    }
    return out
  }, [])
  const buttons = useMemo(() => {
    const out: { x: number; z: number; r: number; color: string }[] = []
    const colors = ['#2b2520', '#33291f', '#27303a', '#3a2622']
    for (let i = 0; i < 34; i++) {
      const z = 8 - ((i * 53) % 820) / 10
      const x = (((i * 97) % 200) / 10 - 10) * 1.15
      if (Math.abs(x) < 2.2) continue
      out.push({ x, z, r: 0.35 + ((i * 13) % 5) / 10, color: colors[i % 4] })
    }
    return out
  }, [])
  return (
    <>
      {pins.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} rotation={[0, 0, p.tilt]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.03, 0.01, 3.2, 6]} />
            <meshStandardMaterial color="#8d8780" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 3.3, 0]}>
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
      {buttons.map((b, i) => (
        <mesh key={i} position={[b.x, 0.04, b.z]}>
          <cylinderGeometry args={[b.r, b.r, 0.08, 20]} />
          <meshStandardMaterial color={b.color} roughness={0.7} />
        </mesh>
      ))}
    </>
  )
}

/* ---------- collectible thread spools ---------- */

function Spools({ collected }: { collected: Set<number> }) {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = clock.elapsedTime
    g.children.forEach((c, i) => {
      c.rotation.y = t * 1.2 + i
      c.position.y = 0.75 + Math.sin(t * 2 + i) * 0.12
    })
  })
  return (
    <group ref={group}>
      {spools.map((s, i) => (
        <group key={s.name} position={[s.x, 0.75, s.z]} visible={!collected.has(i)} rotation={[0, 0, 0.25]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.2, 0.42, 16]} />
            <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.35} />
          </mesh>
          {[-0.24, 0.24].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.06, 16]} />
              <meshStandardMaterial color="#d9cdbb" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ---------- player ---------- */

function Player() {
  const root = useRef<THREE.Group>(null)
  const legL = useRef<THREE.Group>(null)
  const legR = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const phase = useRef(0)

  useFrame((_, dt) => {
    const g = root.current
    if (!g) return
    g.position.x = game.pos.x
    g.position.z = game.pos.z
    // turn the short way round towards the heading
    let d = game.heading - g.rotation.y
    d = Math.atan2(Math.sin(d), Math.cos(d))
    g.rotation.y += d * Math.min(1, dt * 12)

    phase.current += dt * (game.moving ? 11 : 0)
    const swing = game.moving ? Math.sin(phase.current) * 0.75 : 0
    const ease = Math.min(1, dt * 14)
    for (const [ref, sign] of [
      [legL, 1],
      [legR, -1],
      [armL, -1],
      [armR, 1],
    ] as const) {
      const r = ref.current
      if (r) r.rotation.x += (swing * sign - r.rotation.x) * ease
    }
    g.position.y = game.moving ? Math.abs(Math.sin(phase.current)) * 0.07 : 0
  })

  const skin = '#f3ede4'
  return (
    <group ref={root}>
      <mesh position={[0, 1.02, 0]}>
        <capsuleGeometry args={[0.27, 0.42, 6, 14]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.25, 20, 16]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      {/* scarf, so it is clear which way the figure is facing */}
      <mesh position={[0, 1.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.07, 8, 20]} />
        <meshStandardMaterial color="#f7b157" emissive="#f7b157" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.09, 1.76, 0.22]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#15120f" />
      </mesh>
      <mesh position={[-0.09, 1.76, 0.22]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#15120f" />
      </mesh>
      {(
        [
          [legL, 0.13, 0.68, 0.62, 0.1],
          [legR, -0.13, 0.68, 0.62, 0.1],
          [armL, 0.36, 1.3, 0.5, 0.075],
          [armR, -0.36, 1.3, 0.5, 0.075],
        ] as const
      ).map(([ref, x, y, len, r], i) => (
        <group key={i} ref={ref} position={[x, y, 0]}>
          <mesh position={[0, -len / 2, 0]}>
            <capsuleGeometry args={[r, len - r * 2, 4, 8]} />
            <meshStandardMaterial color={i < 2 ? '#3a332c' : skin} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ---------- input, movement, camera, proximity ---------- */

function Controller({
  paused,
  collected,
  onNear,
  onCollect,
}: {
  paused: boolean
  collected: Set<number>
  onNear: (id: string | null) => void
  onCollect: (i: number) => void
}) {
  const keys = useRef(new Set<string>())
  const near = useRef<string | null>(null)
  const { camera, size } = useThree()
  const first = useRef(true)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isInteractive(e.target)) return // keep Enter, Space and arrows working on links, buttons and panel scrolling
      const k = e.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault()
      keys.current.add(k)
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase())
    const clear = () => keys.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const k = keys.current
    const p = game.pos
    let dx = 0
    let dz = 0
    if (!paused) {
      if (k.has('w') || k.has('arrowup')) dz -= 1
      if (k.has('s') || k.has('arrowdown')) dz += 1
      if (k.has('a') || k.has('arrowleft')) dx -= 1
      if (k.has('d') || k.has('arrowright')) dx += 1
      if (dx || dz) game.target = null
      else if (game.target) {
        tmp.subVectors(game.target, p)
        if (tmp.length() < 0.18) game.target = null
        else {
          dx = tmp.x
          dz = tmp.z
        }
      }
    }
    const len = Math.hypot(dx, dz)
    game.moving = len > 0
    if (len > 0) {
      dx /= len
      dz /= len
      game.heading = Math.atan2(dx, dz)
      p.x += dx * SPEED * dt
      p.z += dz * SPEED * dt
    }

    // landmarks are solid: push the player back out of them
    let best: Station | null = null
    let bestD = Infinity
    for (const s of stations) {
      const sz = sizes[s.prop]
      const ox = p.x - s.x
      const oz = p.z - s.z
      const d = Math.hypot(ox, oz)
      if (d < sz.collide && d > 0.0001) {
        p.x = s.x + (ox / d) * sz.collide
        p.z = s.z + (oz / d) * sz.collide
        game.target = null
      }
      if (d < reachOf(s) && d < bestD) {
        best = s
        bestD = d
      }
    }
    p.x = THREE.MathUtils.clamp(p.x, bounds.minX, bounds.maxX)
    p.z = THREE.MathUtils.clamp(p.z, bounds.minZ, bounds.maxZ)

    const id = best ? best.id : null
    if (id !== near.current) {
      near.current = id
      onNear(id)
    }

    if (!paused)
      spools.forEach((s, i) => {
        if (!collected.has(i) && Math.hypot(p.x - s.x, p.z - s.z) < 0.9) onCollect(i)
      })

    // follow camera: higher and further back on tall, narrow screens
    const portrait = size.width / size.height < 0.9
    const back = portrait ? 15 : 10.5
    const up = portrait ? 13 : 8.5
    tmp.set(p.x * 0.85, up, p.z + back)
    if (first.current) {
      camera.position.copy(tmp)
      first.current = false
    } else camera.position.lerp(tmp, 1 - Math.exp(-4 * dt))
    camera.lookAt(camera.position.x, 1.2, camera.position.z - back - 2.5)
  })
  return null
}

/* ---------- landmarks ---------- */

function Landmark({ s, found }: { s: Station; found: boolean }) {
  const sz = sizes[s.prop]
  return (
    <group position={[s.x, 0, s.z]}>
      <Prop kind={s.prop} station={s} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[reachOf(s) - 0.07, reachOf(s), 72]} />
        <meshBasicMaterial color={found ? '#7fd1a8' : '#f7b157'} transparent opacity={found ? 0.28 : 0.5} />
      </mesh>
      <Label text={found ? `${s.title} ✓` : s.title} position={[0, sz.labelY, 0]} color={found ? '#7fd1a8' : '#f3ede4'} />
    </group>
  )
}

export default function Scene({
  paused,
  found,
  collected,
  onNear,
  onCollect,
}: {
  paused: boolean
  found: Set<string>
  collected: Set<number>
  onNear: (id: string | null) => void
  onCollect: (i: number) => void
}) {
  return (
    <>
      <color attach="background" args={['#0d0c0b']} />
      <fog attach="fog" args={['#0d0c0b', 22, 62]} />
      <ambientLight intensity={0.75} />
      <hemisphereLight args={['#fff1dc', '#1a1512', 0.7]} />
      <directionalLight position={[6, 12, 8]} intensity={1.5} />
      <Ground />
      <StitchedPath />
      <Decor />
      <Spools collected={collected} />
      {stations.map((s) => (
        <Landmark key={s.id} s={s} found={found.has(s.id)} />
      ))}
      <Label text="Follow the stitches" position={[0, 0.9, 3.2]} height={0.42} color="#a39a90" />
      <Player />
      <Controller paused={paused} collected={collected} onNear={onNear} onCollect={onCollect} />
    </>
  )
}
