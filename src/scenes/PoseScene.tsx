import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useJson } from '../lib/hooks'

export type PoseData = { fps: number; connections: [number, number][]; frames: (number[] | null)[] }

const SCALE = 2.3
const v = (f: number[], i: number) => new THREE.Vector3(f[i * 3], f[i * 3 + 1], f[i * 3 + 2])

/** Interior angle at joint b, in degrees. Same joint-angle maths the rule engine uses. */
function angle(f: number[], a: number, b: number, c: number) {
  const ba = v(f, a).sub(v(f, b))
  const bc = v(f, c).sub(v(f, b))
  return THREE.MathUtils.radToDeg(ba.angleTo(bc))
}

export function Skeleton({
  data,
  video,
  hud,
  grid = true,
}: {
  data: PoseData
  video: RefObject<HTMLVideoElement | null>
  hud: RefObject<HTMLDivElement | null>
  grid?: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const { bones, joints, frame } = useMemo(() => {
    const bones = new THREE.BufferGeometry()
    bones.setAttribute('position', new THREE.BufferAttribute(new Float32Array(data.connections.length * 6), 3))
    const joints = new THREE.BufferGeometry()
    joints.setAttribute('position', new THREE.BufferAttribute(new Float32Array(33 * 3), 3))
    return { bones, joints, frame: new Array<number>(99).fill(0) }
  }, [data])
  const last = useRef(-1)

  useFrame(({ clock }) => {
    const frames = data.frames
    const dur = frames.length / data.fps
    const el = video.current
    const t = el && !el.paused && el.currentTime > 0 ? el.currentTime : clock.elapsedTime % dur
    const fpos = (t * data.fps) % frames.length
    const i0 = Math.floor(fpos)
    const a = frames[i0]
    const b = frames[(i0 + 1) % frames.length] ?? a
    if (!a || !b) return
    const k = fpos - i0
    for (let i = 0; i < 99; i++) frame[i] = a[i] + (b[i] - a[i]) * k

    const jp = joints.attributes.position.array as Float32Array
    for (let i = 0; i < 99; i++) jp[i] = frame[i] * SCALE
    joints.attributes.position.needsUpdate = true

    const bp = bones.attributes.position.array as Float32Array
    data.connections.forEach(([s, e], ci) => {
      for (let d = 0; d < 3; d++) {
        bp[ci * 6 + d] = jp[s * 3 + d]
        bp[ci * 6 + 3 + d] = jp[e * 3 + d]
      }
    })
    bones.attributes.position.needsUpdate = true

    if (group.current) group.current.rotation.y = 0.5 + Math.sin(clock.elapsedTime * 0.35) * 0.7

    if (hud.current && i0 !== last.current) {
      last.current = i0
      const knee = Math.round((angle(frame, 23, 25, 27) + angle(frame, 24, 26, 28)) / 2)
      const phase = knee > 160 ? 'standing' : knee < 100 ? 'at depth' : 'moving'
      hud.current.textContent = `knee angle ${knee}° · ${phase}`
    }
  })

  return (
    <group ref={group} position={[0, 0.15, 0]}>
      <lineSegments geometry={bones}>
        <lineBasicMaterial color="#f7b157" fog={false} />
      </lineSegments>
      <points geometry={joints}>
        <pointsMaterial color="#fff4e0" size={0.09} sizeAttenuation />
      </points>
      {grid && <gridHelper args={[6, 12, '#3a332c', '#231f1b']} position={[0, -0.85 * SCALE, 0]} />}
    </group>
  )
}

export default function PoseScene({
  active,
  video,
  hud,
}: {
  active: boolean
  video: RefObject<HTMLVideoElement | null>
  hud: RefObject<HTMLDivElement | null>
}) {
  const data = useJson<PoseData>('data/pose.json')
  return (
    <Canvas dpr={[1, 1.75]} frameloop={active ? 'always' : 'never'} camera={{ position: [0, 0.2, 7.4], fov: 42 }}>
      {data && <Skeleton data={data} video={video} hud={hud} />}
    </Canvas>
  )
}
