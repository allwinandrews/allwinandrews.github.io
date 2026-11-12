import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { profile } from '../data/projects'

export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) return el.scrollIntoView()
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
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
