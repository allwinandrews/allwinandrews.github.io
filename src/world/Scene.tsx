import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { isInteractive } from '../lib/hooks'
import { game, MAX_SPEED } from './game'
import { Prop } from './props'
import { bounds, pathCurve, reachOf, sizes, spools, stations, type Station } from './stations'

const REVERSE_MAX = 5
const ACCEL = 10
const BRAKE = 20
const DRAG = 3
const TURN = 1.9
const CAR_R = 0.9
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

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -33]}>
      <planeGeometry args={[70, 120]} />
      <meshStandardMaterial map={tex} roughness={1} />
    </mesh>
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

/* ---------- the car ---------- */

const WHEELS: [number, number, boolean][] = [
  [-0.95, 1.15, true],
  [0.95, 1.15, true],
  [-0.95, -1.1, false],
  [0.95, -1.1, false],
]

function Car() {
  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const steerers = useRef<(THREE.Group | null)[]>([])
  const spinners = useRef<(THREE.Group | null)[]>([])
  const tail = useRef<THREE.MeshStandardMaterial>(null)
  const roll = useRef(0)
  const lastSpeed = useRef(0)

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const g = root.current
    if (!g) return
    g.position.set(game.pos.x, 0, game.pos.z)
    g.rotation.y = game.heading

    roll.current += (game.speed * dt) / 0.38
    steerers.current.forEach((s) => s && (s.rotation.y = game.steer * 0.45))
    spinners.current.forEach((s) => s && (s.rotation.x = roll.current))

    // the body leans into corners and dips when braking
    const b = body.current
    if (b) {
      const accel = (game.speed - lastSpeed.current) / Math.max(dt, 0.001)
      b.rotation.z += (-game.steer * (Math.abs(game.speed) / MAX_SPEED) * 0.07 - b.rotation.z) * Math.min(1, dt * 8)
      b.rotation.x += (THREE.MathUtils.clamp(-accel * 0.004, -0.05, 0.05) - b.rotation.x) * Math.min(1, dt * 8)
    }
    lastSpeed.current = game.speed
    if (tail.current) tail.current.emissiveIntensity = game.braking ? 3.2 : 0.8
  })

  return (
    <group ref={root}>
      <pointLight position={[0, 1.1, 4.2]} intensity={14} distance={13} decay={2} color="#fff1dc" />
      <group ref={body}>
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[1.75, 0.55, 3.5]} />
          <meshStandardMaterial color="#f7b157" roughness={0.35} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.12, -0.25]}>
          <boxGeometry args={[1.45, 0.5, 1.75]} />
          <meshStandardMaterial color="#1b2430" roughness={0.15} metalness={0.5} />
        </mesh>
        {[-0.62, 0.62].map((x) => (
          <mesh key={x} position={[x, 0.7, 1.76]}>
            <boxGeometry args={[0.38, 0.16, 0.06]} />
            <meshStandardMaterial color="#fff8e8" emissive="#fff8e8" emissiveIntensity={2.5} />
          </mesh>
        ))}
        {[-0.62, 0.62].map((x) => (
          <mesh key={x} position={[x, 0.72, -1.76]}>
            <boxGeometry args={[0.4, 0.14, 0.06]} />
            <meshStandardMaterial ref={x < 0 ? tail : undefined} color="#e2574c" emissive="#e2574c" emissiveIntensity={0.8} />
          </mesh>
        ))}
        {/* a stripe of white thread down the roof, like a seam */}
        <mesh position={[0, 1.375, -0.25]}>
          <boxGeometry args={[0.16, 0.02, 1.7]} />
          <meshStandardMaterial color="#f3ede4" />
        </mesh>
      </group>
      {WHEELS.map(([x, z, front], i) => (
        <group key={i} position={[x, 0.38, z]}>
          <group ref={(el) => void (front && (steerers.current[i] = el))}>
            <group ref={(el) => void (spinners.current[i] = el)}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.38, 0.38, 0.3, 20]} />
                <meshStandardMaterial color="#14110e" roughness={0.9} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.2, 0.2, 0.32, 12]} />
                <meshStandardMaterial color="#8d8780" metalness={0.8} roughness={0.3} />
              </mesh>
              {/* one spoke, so the spin is visible */}
              <mesh position={[Math.sign(x) * 0.17, 0.14, 0]}>
                <boxGeometry args={[0.03, 0.2, 0.06]} />
                <meshStandardMaterial color="#f3ede4" />
              </mesh>
            </group>
          </group>
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
  const camH = useRef(game.heading)

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
    const inp = game.input
    const gas = !paused && (k.has('w') || k.has('arrowup') || inp.gas)
    const brake = !paused && (k.has('s') || k.has('arrowdown') || inp.brake)
    const left = k.has('a') || k.has('arrowleft') || inp.left
    const right = k.has('d') || k.has('arrowright') || inp.right
    const steerIn = paused ? 0 : (left ? 1 : 0) - (right ? 1 : 0)

    // throttle, brake, reverse, and rolling resistance
    let v = game.speed
    if (gas) v += ACCEL * dt * (v < 0 ? 2.2 : 1 - 0.6 * (v / MAX_SPEED))
    else if (brake) v -= (v > 0 ? BRAKE : ACCEL * 0.7) * dt
    else v -= Math.sign(v) * Math.min(Math.abs(v), (paused ? BRAKE : DRAG) * dt)
    game.braking = (brake || paused) && v > 0.5
    v = THREE.MathUtils.clamp(v, -REVERSE_MAX, MAX_SPEED)

    // a car only turns while it moves, and a little less sharply when fast
    game.steer += (steerIn - game.steer) * Math.min(1, dt * 7)
    const grip = Math.min(1, Math.abs(v) / 3.5) * (1 - 0.35 * (Math.abs(v) / MAX_SPEED))
    game.heading += game.steer * TURN * grip * Math.sign(v) * dt
    p.x += Math.sin(game.heading) * v * dt
    p.z += Math.cos(game.heading) * v * dt
    game.speed = v

    // landmarks are solid: push the player back out of them
    let best: Station | null = null
    let bestD = Infinity
    for (const s of stations) {
      const sz = sizes[s.prop]
      const ox = p.x - s.x
      const oz = p.z - s.z
      const d = Math.hypot(ox, oz)
      const hit = sz.collide + CAR_R
      if (d < hit && d > 0.0001) {
        p.x = s.x + (ox / d) * hit
        p.z = s.z + (oz / d) * hit
        game.speed *= -0.25 // bump and bounce back
      }
      if (d < reachOf(s) && d < bestD) {
        best = s
        bestD = d
      }
    }
    const cx = THREE.MathUtils.clamp(p.x, bounds.minX, bounds.maxX)
    const cz = THREE.MathUtils.clamp(p.z, bounds.minZ, bounds.maxZ)
    if (cx !== p.x || cz !== p.z) game.speed *= 0.6 // scrape along the edge of the cloth
    p.x = cx
    p.z = cz

    const id = best ? best.id : null
    if (id !== near.current) {
      near.current = id
      onNear(id)
    }

    if (!paused)
      spools.forEach((s, i) => {
        if (!collected.has(i) && Math.hypot(p.x - s.x, p.z - s.z) < 1.7) onCollect(i)
      })

    // chase camera: sits behind the car and swings round smoothly as it turns
    const portrait = size.width / size.height < 0.9
    const back = (portrait ? 13 : 10) + Math.max(0, game.speed) * 0.25
    const up = portrait ? 10.5 : 5.8
    let dh = game.heading - camH.current
    dh = Math.atan2(Math.sin(dh), Math.cos(dh))
    camH.current += dh * (first.current ? 1 : 1 - Math.exp(-3.2 * dt))
    const fx = Math.sin(camH.current)
    const fz = Math.cos(camH.current)
    tmp.set(p.x - fx * back, up, p.z - fz * back)
    if (first.current) {
      camera.position.copy(tmp)
      first.current = false
    } else camera.position.lerp(tmp, 1 - Math.exp(-7 * dt))
    const ahead = portrait ? 5 : 7
    camera.lookAt(p.x + fx * ahead, 0.4, p.z + fz * ahead)
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
      <Car />
      <Controller paused={paused} collected={collected} onNear={onNear} onCollect={onCollect} />
    </>
  )
}
