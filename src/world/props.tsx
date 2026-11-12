import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import * as THREE from 'three'
import { asset, useJson } from '../lib/hooks'
import { Fan, type MonteCarloData } from '../scenes/MonteCarloScene'
import { Skeleton, type PoseData } from '../scenes/PoseScene'
import { build, type StitchData } from '../scenes/StitchScene'
import { game, kadhaDesign } from './game'
import type { PropKind, Station } from './stations'

const GOLD = '#f7b157'
const BLUE = '#7fb4ff'
const WOOD = '#3a2f26'

const distTo = (s: Station) => Math.hypot(game.pos.x - s.x, game.pos.z - s.z)

/** Kadha: a giant embroidery hoop that sews the real stitch file as you walk up. */
function Hoop({ station }: { station: Station }) {
  const design = useSyncExternalStore(kadhaDesign.subscribe, kadhaDesign.get)
  const data = useJson<StitchData>(`data/stitches/${design}.json`)
  const built = useMemo(() => (data ? build(data) : null), [data])
  const p = useRef(0)
  useEffect(() => {
    p.current = 0 // a newly chosen design is sewn from the start
  }, [built])
  useFrame((_, dt) => {
    if (!built) return
    if (distTo(station) < 19 || p.current > 0) p.current = Math.min(built.pairs, p.current + (Math.min(dt, 0.1) * built.pairs) / 18)
    built.geo.setDrawRange(0, Math.floor(p.current) * 2)
  })
  return (
    <group position={[0, 3.05, 0]} rotation={[0, 0.35, 0]} scale={0.72}>
      <mesh scale={[1, 1.43, 1]}>
        <torusGeometry args={[2.35, 0.13, 10, 64]} />
        <meshStandardMaterial color="#b98a55" roughness={0.6} />
      </mesh>
      <mesh scale={[1, 1.43, 1]} position={[0, 0, -0.06]}>
        <circleGeometry args={[2.3, 64]} />
        <meshStandardMaterial color="#1c1814" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {built && (
        <group position={[0, 0, 0.02]}>
          <lineSegments geometry={built.ghost}>
            <lineBasicMaterial vertexColors transparent opacity={0.12} depthWrite={false} fog={false} />
          </lineSegments>
          <lineSegments geometry={built.geo}>
            <lineBasicMaterial vertexColors fog={false} />
          </lineSegments>
        </group>
      )}
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, -3.6, -0.1]}>
          <cylinderGeometry args={[0.09, 0.12, 1.4, 8]} />
          <meshStandardMaterial color={WOOD} />
        </mesh>
      ))}
    </group>
  )
}

/** AI Basket Builder: gold products (chosen by code) and one blue speech bubble (the LLM). */
function Basket() {
  const items = useRef<THREE.Group>(null)
  const bubble = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    items.current?.children.forEach((c, i) => {
      c.position.y = 1.55 + Math.sin(t * 1.6 + i * 1.7) * 0.14
      c.rotation.y = t * 0.6 + i
    })
    if (bubble.current) bubble.current.position.y = 2.75 + Math.sin(t * 1.2) * 0.1
  })
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.6, 1, 1.3]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[2.8, 0.08, 1.5]} />
        <meshStandardMaterial color="#5a4735" />
      </mesh>
      <mesh position={[0.55, 1.4, 0.1]}>
        <cylinderGeometry args={[0.55, 0.4, 0.6, 14, 1, true]} />
        <meshStandardMaterial color={GOLD} wireframe />
      </mesh>
      <group ref={items}>
        {[-0.85, -0.3, 0.55].map((x, i) => (
          <mesh key={i} position={[x, 1.55, 0.1]}>
            {i === 1 ? <sphereGeometry args={[0.2, 14, 12]} /> : <boxGeometry args={[0.3, 0.3, 0.3]} />}
            <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>
      <mesh ref={bubble} position={[-0.9, 2.75, 0]} scale={[1.3, 0.85, 0.6]}>
        <sphereGeometry args={[0.42, 20, 14]} />
        <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}

/** Auron: a microphone with sound rings travelling outwards. */
function Rings() {
  const rings = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    rings.current?.children.forEach((c, i) => {
      const u = (clock.elapsedTime * 0.45 + i / 4) % 1
      const s = 0.4 + u * 2.4
      c.scale.set(s, s, s)
      ;((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - u) * 0.85
    })
  })
  return (
    <group>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.12, 20]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2.3, 8]} />
        <meshStandardMaterial color="#8d8780" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.55, 0]}>
        <capsuleGeometry args={[0.24, 0.3, 6, 14]} />
        <meshStandardMaterial color="#d9cdbb" metalness={0.4} roughness={0.4} />
      </mesh>
      <group ref={rings} position={[0, 2.55, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i}>
            <torusGeometry args={[0.6, 0.022, 6, 48]} />
            <meshBasicMaterial color={BLUE} transparent />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function useTexture(path: string) {
  const tex = useMemo(() => {
    const t = new THREE.TextureLoader().load(asset(path))
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [path])
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

function Screen({ path, x, ry }: { path: string; x: number; ry: number }) {
  const tex = useTexture(path)
  return (
    <group position={[x, 2.35, Math.abs(x) * 0.28]} rotation={[0, ry, 0]}>
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[2.36, 1.8, 0.06]} />
        <meshStandardMaterial color="#26211c" />
      </mesh>
      <mesh>
        <planeGeometry args={[2.24, 1.68]} />
        <meshBasicMaterial map={tex} toneMapped={false} fog={false} />
      </mesh>
      <mesh position={[0, -1.6, -0.04]}>
        <cylinderGeometry args={[0.04, 0.04, 1.5, 6]} />
        <meshStandardMaterial color="#8d8780" />
      </mesh>
    </group>
  )
}

/** Alynd: three real product screens. */
function Screens() {
  return (
    <group>
      <Screen path="media/alynd-1.jpg" x={-2.45} ry={0.3} />
      <Screen path="media/alynd-2.jpg" x={0} ry={0} />
      <Screen path="media/alynd-3.jpg" x={2.45} ry={-0.3} />
    </group>
  )
}

/** aiseries: an open-air cinema that plays the reel when you are close. */
function Cinema({ station }: { station: Station }) {
  const poster = useTexture('media/aiseries-reel.jpg')
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const video = useMemo(() => {
    const v = document.createElement('video')
    v.src = asset('media/aiseries-reel.mp4')
    v.muted = true
    v.loop = true
    v.playsInline = true
    v.preload = 'none'
    v.crossOrigin = 'anonymous'
    return v
  }, [])
  const vtex = useMemo(() => {
    const t = new THREE.VideoTexture(video)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [video])
  useEffect(
    () => () => {
      video.pause()
      video.removeAttribute('src')
      vtex.dispose()
    },
    [video, vtex],
  )
  const playing = useRef(false)
  useFrame(() => {
    const close = distTo(station) < 11
    if (close && !playing.current) {
      playing.current = true
      video.play().catch(() => {
        playing.current = false // autoplay refused: the poster stays up
      })
    } else if (!close && playing.current) {
      playing.current = false
      video.pause()
    }
    const m = mat.current
    if (m) {
      const want = playing.current && video.readyState >= 2 ? vtex : poster
      if (m.map !== want) {
        m.map = want
        m.needsUpdate = true
      }
    }
  })
  return (
    <group rotation={[0, 0.3, 0]}>
      <mesh position={[0, 3.25, -0.08]}>
        <boxGeometry args={[3.1, 5.3, 0.12]} />
        <meshStandardMaterial color="#26211c" />
      </mesh>
      <mesh position={[0, 3.25, 0]}>
        <planeGeometry args={[2.85, 5.07]} />
        <meshBasicMaterial ref={mat} map={poster} toneMapped={false} fog={false} />
      </mesh>
      {[-1.3, 1.3].map((x) => (
        <mesh key={x} position={[x, 0.3, -0.1]}>
          <cylinderGeometry args={[0.07, 0.1, 0.6, 8]} />
          <meshStandardMaterial color={WOOD} />
        </mesh>
      ))}
    </group>
  )
}

/** fitness-ai: the MediaPipe skeleton from the demo clip, doing its squats. */
function SkeletonProp() {
  const data = useJson<PoseData>('data/pose.json')
  const none = useRef(null)
  return (
    <group>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[1.5, 1.6, 0.12, 32]} />
        <meshStandardMaterial color="#26211c" />
      </mesh>
      <group position={[0, 2.05, 0]} scale={0.92}>
        {data && <Skeleton data={data} video={none} hud={none} grid={false} />}
      </group>
    </group>
  )
}

/** Trading bot: the Monte Carlo fan from the real backtester. */
function FanProp() {
  const data = useJson<MonteCarloData>('data/montecarlo.json')
  return (
    <group>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[4.4, 0.4, 2.4]} />
        <meshStandardMaterial color="#26211c" />
      </mesh>
      <group position={[0, 2.2, 0]} scale={0.62}>
        {data && <Fan data={data} />}
      </group>
    </group>
  )
}

function Monolith() {
  return (
    <group>
      <mesh position={[0, 1.5, 0]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[1.3, 3, 0.45]} />
        <meshStandardMaterial color="#2a2520" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.5, 0.02]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[1.02, 2.7, 0.46]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.25} wireframe />
      </mesh>
    </group>
  )
}

function Flag() {
  const cloth = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (cloth.current) cloth.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.25
  })
  return (
    <group>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 2.8, 8]} />
        <meshStandardMaterial color="#8d8780" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh ref={cloth} position={[0, 2.4, 0]}>
        <boxGeometry args={[1.1, 0.6, 0.03]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/** Contact: a postbox under a column of light, visible from a long way off. */
function Beacon() {
  return (
    <group>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 1.2, 8]} />
        <meshStandardMaterial color="#8d8780" />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[1.1, 0.75, 0.7]} />
        <meshStandardMaterial color="#c2463c" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.6, 0.36]}>
        <boxGeometry args={[0.7, 0.07, 0.02]} />
        <meshBasicMaterial color="#15120f" />
      </mesh>
      <mesh position={[0, 12, 0]}>
        <cylinderGeometry args={[0.5, 0.9, 20, 20, 1, true]} />
        <meshBasicMaterial
          color={GOLD}
          transparent
          opacity={0.13}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </mesh>
    </group>
  )
}

export function Prop({ kind, station }: { kind: PropKind; station: Station }) {
  switch (kind) {
    case 'hoop':
      return <Hoop station={station} />
    case 'basket':
      return <Basket />
    case 'rings':
      return <Rings />
    case 'screens':
      return <Screens />
    case 'cinema':
      return <Cinema station={station} />
    case 'skeleton':
      return <SkeletonProp />
    case 'fan':
      return <FanProp />
    case 'monolith':
      return <Monolith />
    case 'flag':
      return <Flag />
    case 'beacon':
      return <Beacon />
  }
}
