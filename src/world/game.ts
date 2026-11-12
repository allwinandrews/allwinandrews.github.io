import * as THREE from 'three'
import { spawn } from './stations'

/**
 * Per-frame game state. Kept outside React on purpose: it changes 60 times
 * a second and nothing should re-render because of it.
 */
export const game = {
  pos: new THREE.Vector3(spawn.x, 0, spawn.z),
  target: null as THREE.Vector3 | null,
  heading: Math.PI,
  moving: false,
}

const KEY = 'world-v1'

export type Saved = { x: number; z: number; found: string[]; spools: number[]; started: boolean }

export function loadSave(): Saved {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) || 'null') as Saved | null
    if (s && typeof s.x === 'number') return s
  } catch {
    /* ignore */
  }
  return { x: spawn.x, z: spawn.z, found: [], spools: [], started: false }
}

export function writeSave(found: Set<string>, spools: Set<number>, started: boolean) {
  try {
    const s: Saved = { x: game.pos.x, z: game.pos.z, found: [...found], spools: [...spools], started }
    sessionStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* private mode */
  }
}

/** The design the Kadha hoop is sewing. A tiny store so the DOM panel and the 3D hoop stay in step. */
const listeners = new Set<() => void>()
let design = 'adam'
export const kadhaDesign = {
  get: () => design,
  set(id: string) {
    design = id
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}
