import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './styles.css'
import { lazy, Suspense } from 'react'
import Home from './pages/Home'
import ProjectPage from './pages/ProjectPage'
import Services from './pages/Services'
import NotFound from './pages/NotFound'
import { ScrollToTop } from './components/Layout'

/** A deploy can replace chunk files while a tab is open. Reload once to pick up the new ones. */
function reloadOnce() {
  try {
    if (sessionStorage.getItem('chunk-reload')) return false
    sessionStorage.setItem('chunk-reload', '1')
  } catch {
    return false
  }
  location.reload()
  return true
}
window.addEventListener('load', () =>
  setTimeout(() => {
    try {
      sessionStorage.removeItem('chunk-reload')
    } catch {
      /* ignore */
    }
  }, 5000),
)
window.addEventListener('vite:preloadError', (e) => {
  if (reloadOnce()) e.preventDefault()
})
const World = lazy(() => import('./pages/World').catch(() => {
  // chunk failed to load (offline or stale deploy): use the plain site rather than a stuck loader
  if (reloadOnce()) return new Promise<never>(() => {})
  return { default: () => <Navigate to="/work" replace /> }
}))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<div className="world-loading">Loading the world</div>}>
              <World />
            </Suspense>
          }
        />
        <Route path="/work" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
