import * as THREE from 'three'

export type PropKind =
  | 'hoop'
  | 'basket'
  | 'rings'
  | 'screens'
  | 'cinema'
  | 'skeleton'
  | 'fan'
  | 'monolith'
  | 'flag'
  | 'beacon'

export type Station = {
  id: string
  kind: 'project' | 'experience' | 'contact'
  /** project slug, or index into `experience` */
  slug?: string
  expIndex?: number
  title: string
  hint: string
  prop: PropKind
  x: number
  z: number
}

/** Collision radius and the distance at which a landmark can be opened. */
export const sizes: Record<PropKind, { collide: number; reach: number; labelY: number }> = {
  hoop: { collide: 1.9, reach: 4.4, labelY: 6.1 },
  basket: { collide: 1.5, reach: 3.8, labelY: 3.3 },
  rings: { collide: 1.0, reach: 3.6, labelY: 4.2 },
  screens: { collide: 2.4, reach: 5, labelY: 4.3 },
  cinema: { collide: 1.7, reach: 4.4, labelY: 6.5 },
  skeleton: { collide: 1.6, reach: 4.2, labelY: 5.1 },
  fan: { collide: 2.3, reach: 4.8, labelY: 4.9 },
  monolith: { collide: 0.9, reach: 3.2, labelY: 3.9 },
  flag: { collide: 0.4, reach: 2.6, labelY: 3.5 },
  beacon: { collide: 0.8, reach: 3.4, labelY: 3.4 },
}

/** Every landmark's ring reaches the path, so nobody walks past one without being offered it. */
export const reachOf = (s: Station) => Math.max(sizes[s.prop].reach, Math.abs(s.x) - 0.2)

export const stations: Station[] = [
  { id: 'kadha', kind: 'project', slug: 'kadha', title: 'Kadha', hint: 'an embroidery hoop', prop: 'hoop', x: -6.5, z: -1.5 },
  { id: 'aibb', kind: 'project', slug: 'aibb', title: 'AI Basket Builder', hint: 'a market stall', prop: 'basket', x: 5.5, z: -8 },
  { id: 'auron', kind: 'project', slug: 'auron', title: 'Auron', hint: 'a microphone, listening', prop: 'rings', x: -5.5, z: -13.5 },
  { id: 'alynd', kind: 'project', slug: 'alynd', title: 'Alynd', hint: 'three floating screens', prop: 'screens', x: 6, z: -19 },
  { id: 'aiseries', kind: 'project', slug: 'aiseries', title: 'aiseries', hint: 'an open-air cinema', prop: 'cinema', x: -6, z: -25 },
  { id: 'fitness-ai', kind: 'project', slug: 'fitness-ai', title: 'fitness-ai', hint: 'someone doing squats', prop: 'skeleton', x: 5.5, z: -30.5 },
  { id: 'trading-bot', kind: 'project', slug: 'trading-bot', title: 'Trading bot', hint: 'a fan of possible futures', prop: 'fan', x: -6, z: -36.5 },
  { id: 'matchfound', kind: 'project', slug: 'matchfound', title: 'MatchFound', hint: 'a standing stone', prop: 'monolith', x: 4.5, z: -42 },
  { id: 'leadcapture', kind: 'project', slug: 'leadcapture', title: 'LeadCapture.io', hint: 'a standing stone', prop: 'monolith', x: -4.5, z: -46 },
  { id: 'stylehr', kind: 'project', slug: 'stylehr', title: 'StyleHR', hint: 'a standing stone', prop: 'monolith', x: 4.5, z: -50 },
  { id: 'exp-3', kind: 'experience', expIndex: 3, title: '2018', hint: 'a flag', prop: 'flag', x: -3, z: -55 },
  { id: 'exp-2', kind: 'experience', expIndex: 2, title: '2025', hint: 'a flag', prop: 'flag', x: 3, z: -58 },
  { id: 'exp-1', kind: 'experience', expIndex: 1, title: 'Jan 2026', hint: 'a flag', prop: 'flag', x: -3, z: -61 },
  { id: 'exp-0', kind: 'experience', expIndex: 0, title: 'Now', hint: 'a flag', prop: 'flag', x: 3, z: -64 },
  { id: 'contact', kind: 'contact', title: 'Say hello', hint: 'a lit postbox', prop: 'beacon', x: 0, z: -71 },
]

/** Skills to pick up along the way. */
export const spools: { name: string; x: number; z: number; color: string }[] = [
  { name: 'Python', x: 1.6, z: 2.5, color: '#f7b157' },
  { name: 'Django', x: -1.8, z: -5, color: '#7fd1a8' },
  { name: 'FastAPI', x: 2.6, z: -11.5, color: '#7fb4ff' },
  { name: 'React', x: -2.4, z: -16.5, color: '#8fd9ff' },
  { name: 'TypeScript', x: 2.2, z: -22, color: '#7fb4ff' },
  { name: 'Next.js', x: -2.6, z: -28, color: '#f3ede4' },
  { name: 'PostgreSQL', x: 2.4, z: -33.5, color: '#9db8e8' },
  { name: 'Redis', x: -2.2, z: -39.5, color: '#e2574c' },
  { name: 'Celery', x: 0.2, z: -44, color: '#b5d86b' },
  { name: 'Docker', x: -0.4, z: -52.5, color: '#6fc3f0' },
  { name: 'AWS', x: 0.3, z: -59.5, color: '#f7b157' },
  { name: 'LLMs', x: -0.2, z: -67, color: '#c79bff' },
]

export const bounds = { minX: -13, maxX: 13, minZ: -76, maxZ: 10 }
export const spawn = { x: 0, z: 7 }

/** The stitched path the visitor follows. */
export const pathCurve = new THREE.CatmullRomCurve3(
  [
    [0, 8],
    [0, 2],
    [0.8, -6],
    [-0.8, -13],
    [0.8, -19],
    [-0.8, -25],
    [0.8, -30.5],
    [-0.8, -36.5],
    [0, -42],
    [0, -50],
    [0, -60],
    [0, -70],
  ].map(([x, z]) => new THREE.Vector3(x, 0, z)),
)
