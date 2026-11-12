import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { prefersReducedMotion, useJson } from '../lib/hooks'

export type MonteCarloData = {
  tickers: number
  start: string
  end: string
  horizonDays: number
  blockDays: number
  summary: Record<string, number>
  paths: number[][]
}

const W = 6.4
const DEPTH = 3.2
const YSCALE = 5.5
const REVEAL = 7 // seconds

export function Fan({ data }: { data: MonteCarloData }) {
  const group = useRef<THREE.Group>(null)
  const p = useRef(0)
  const { geo, pairs, axis } = useMemo(() => {
    const paths = data.paths
    const steps = paths[0].length
    const n = paths.length
    const pos: number[] = []
    const col: number[] = []
    const up = new THREE.Color('#f7b157')
    const down = new THREE.Color('#e2574c')
    // Ordered by time step so the draw range reveals every path moving forward together.
    for (let t = 0; t < steps - 1; t++) {
      for (let i = 0; i < n; i++) {
        const z = (i / (n - 1) - 0.5) * DEPTH
        const c = paths[i][steps - 1] >= 1 ? up : down
        for (const tt of [t, t + 1]) {
          pos.push((tt / (steps - 1) - 0.5) * W, (paths[i][tt] - 1) * YSCALE, z)
          col.push(c.r, c.g, c.b)
        }
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
    const axis = new THREE.BufferGeometry()
    const x0 = -W / 2
    const x1 = W / 2
    const z0 = -DEPTH / 2
    const z1 = DEPTH / 2
    axis.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(
        [x0, 0, z0, x1, 0, z0, x0, 0, z1, x1, 0, z1, x0, 0, z0, x0, 0, z1, x1, 0, z0, x1, 0, z1],
        3,
      ),
    )
    return { geo, pairs: pos.length / 6, axis }
  }, [data])

  useFrame(({ clock }, delta) => {
    p.current = prefersReducedMotion() ? pairs : Math.min(pairs, p.current + (Math.min(delta, 0.5) * pairs) / REVEAL)
    geo.setDrawRange(0, Math.floor(p.current) * 2)
    if (group.current) group.current.rotation.y = -0.45 + Math.sin(clock.elapsedTime * 0.3) * 0.35
  })

  return (
    <group ref={group} rotation={[0.12, 0, 0]}>
      <lineSegments geometry={geo}>
        <lineBasicMaterial vertexColors transparent opacity={0.55} fog={false} />
      </lineSegments>
      <lineSegments geometry={axis}>
        <lineBasicMaterial color="#f3ede4" transparent opacity={0.5} />
      </lineSegments>
    </group>
  )
}

export default function MonteCarloScene({ active }: { active: boolean }) {
  const data = useJson<MonteCarloData>('data/montecarlo.json')
  return (
    <Canvas dpr={[1, 1.75]} frameloop={active ? 'always' : 'never'} camera={{ position: [0, 0.9, 8.6], fov: 40 }}>
      {data && <Fan data={data} />}
    </Canvas>
  )
}
