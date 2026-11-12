import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles.css'
import { lazy, Suspense } from 'react'
import Home from './pages/Home'
import ProjectPage from './pages/ProjectPage'
import Services from './pages/Services'
import NotFound from './pages/NotFound'
import { ScrollToTop } from './components/Layout'

const World = lazy(() => import('./pages/World'))

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
