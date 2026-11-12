import { useEffect, useRef, useState } from 'react'

const cache = new Map<string, Promise<unknown>>()

/** Fetch a JSON file from /public once and share it between components. */
export function useJson<T>(path: string): T | null {
  const [data, setData] = useState<T | null>(null)
  useEffect(() => {
    const url = import.meta.env.BASE_URL + path
    if (!cache.has(url)) cache.set(url, fetch(url).then((r) => r.json()))
    let alive = true
    setData(null)
    cache.get(url)!.then((d) => alive && setData(d as T))
    return () => {
      alive = false
    }
  }, [path])
  return data
}

/** True while the element is on (or near) screen. Used to pause 3D scenes that are out of view. */
export function useInView<T extends HTMLElement>(margin = '150px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting)
        if (e.isIntersecting) setSeen(true)
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return { ref, inView, seen }
}

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

let webgl: boolean | null = null
export function hasWebGL() {
  if (webgl === null) {
    try {
      const c = document.createElement('canvas')
      webgl = !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      webgl = false
    }
  }
  return webgl
}

export const asset = (p: string) => import.meta.env.BASE_URL + p

/** True when a key press is aimed at something that has its own keyboard behaviour. */
export function isInteractive(target: EventTarget | null) {
  return target instanceof Element && !!target.closest('a, button, input, select, textarea, [contenteditable], [role="dialog"]')
}
