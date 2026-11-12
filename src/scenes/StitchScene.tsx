import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { prefersReducedMotion, useJson } from '../lib/hooks'

export type StitchData = {
  colors: string[]
  count: number
  w: number
  h: number
  pts: number[]
  colorRuns: number[]
  breaks: number[]
}

const DURATION = 14 // seconds to sew the whole design
const HEIGHT = 4.4 // world units

export function build(data: StitchData) {
  const n = data.count
  const s = HEIGHT / data.h
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const thread = new Uint8Array(n)
  let k = 0
  for (let r = 0; r < data.colorRuns.length; r += 2)
    for (let j = 0; j < data.colorRuns[r + 1]; j++) thread[k++] = data.colorRuns[r]
  const palette = data.colors.map((h) => new THREE.Color(h))
  for (let i = 0; i < n; i++) {
    pos[i * 3] = data.pts[i * 2] * s
    pos[i * 3 + 1] = -data.pts[i * 2 + 1] * s
    pos[i * 3 + 2] = thread[i] * 0.07 // later threads sit on top, like the real patch
    const c = palette[thread[i]]
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  }
  const isBreak = new Uint8Array(n + 1)
  for (const b of data.breaks) isBreak[b] = 1
  const index: number[] = []
  for (let i = 0; i < n - 1; i++) if (!isBreak[i + 1]) index.push(i, i + 1)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  geo.setIndex(new THREE.BufferAttribute(new Uint32Array(index), 1))
  // Faint outline of the finished design, so the shape reads before the thread arrives.
  const ghost = new THREE.BufferGeometry()
  ghost.setAttribute('position', geo.attributes.position)
  ghost.setAttribute('color', geo.attributes.color)
  ghost.setIndex(geo.index)
  return { geo, ghost, pos, thread, index, pairs: index.length / 2 }
}

function Stitches({
  data,
  hud,
  runId,
}: {
  data: StitchData
  hud: RefObject<HTMLDivElement | null>
  runId: number
}) {
  const built = useMemo(() => build(data), [data])
  const group = useRef<THREE.Group>(null)
  const needle = useRef<THREE.Mesh>(null)
  const state = useRef({ p: 0, run: -1, lastHud: -1 })

  useFrame((_, delta) => {
    const st = state.current
    if (st.run !== runId) {
      st.run = runId
      st.p = prefersReducedMotion() ? built.pairs : 0
    }
    st.p = Math.min(built.pairs, st.p + (Math.min(delta, 0.5) * built.pairs) / DURATION)
    const done = Math.floor(st.p)
    built.geo.setDrawRange(0, done * 2)

    const si = built.index[Math.max(0, done * 2 - 1)] ?? 0
    if (needle.current) {
      needle.current.position.set(built.pos[si * 3], built.pos[si * 3 + 1], 0.16)
      needle.current.visible = done < built.pairs
    }
    if (hud.current && done !== st.lastHud) {
      st.lastHud = done
      const finished = done >= built.pairs
      hud.current.textContent = finished
        ? `${data.count.toLocaleString()} stitches · ${data.colors.length} threads · done`
        : `stitch ${(si + 1).toLocaleString()} / ${data.count.toLocaleString()} · thread ${built.thread[si] + 1} of ${data.colors.length}`
    }
  })

  return (
    <group ref={group}>
      <lineSegments geometry={built.ghost} position={[0, 0, -0.05]}>
        <lineBasicMaterial vertexColors transparent opacity={0.1} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={built.geo}>
        <lineBasicMaterial vertexColors />
      </lineSegments>
      <mesh ref={needle}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

export default function StitchScene({
  active,
  hud,
  runId,
  design = 'adam',
}: {
  active: boolean
  hud: RefObject<HTMLDivElement | null>
  runId: number
  design?: string
}) {
  const data = useJson<StitchData>(`data/stitches/${design}.json`)
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 7.4], fov: 38 }} /* fixed, straight-on front view */
      gl={{ antialias: true, alpha: true }}
    >
      {data && <Stitches key={design} data={data} hud={hud} runId={runId} />}
    </Canvas>
  )
}
