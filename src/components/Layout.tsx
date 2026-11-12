import { useEffect, type ReactNode } from 'react'
import { Link, useLocation, useNavigationType } from 'react-router-dom'
import { profile } from '../data/projects'

/**
 * Scroll like a normal multi-page site: a new page starts at the top, a #hash goes to its
 * section, and Back keeps the browser's own position. Page CSS uses smooth scrolling, which
 * made a new page visibly slide up from the old scroll offset (it looked like it had not loaded),
 * so these jumps are always instant.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const type = useNavigationType()
  useEffect(() => {
    if (type === 'POP' && !hash) return
    const go = () => {
      const el = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' })
      else if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
    go()
    // images and lazy sections can shift the layout just after the route renders
    const id = requestAnimationFrame(go)
    return () => cancelAnimationFrame(id)
  }, [pathname, hash, type])
  return null
}

export function Nav({ right }: { right?: ReactNode }) {
  return (
    <header className="nav">
      <Link to="/" className="nav-name">
        Allwin James Andrews
      </Link>
      <nav className="nav-links">
        <Link to="/">Explore</Link>
        <Link to="/work#work">Work</Link>
        <Link to="/work#experience">Experience</Link>
        <Link to="/work#contact">Contact</Link>
        {right}
      </nav>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <span>
        {profile.name} · {profile.location}
      </span>
      <span className="footer-links">
        <a href={profile.github}>GitHub</a>
        <a href={profile.linkedin}>LinkedIn</a>
        <Link to="/services">Contract work via AJA IT Services</Link>
      </span>
    </footer>
  )
}
