import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Boundary, Legend } from '../components/Boundary'
import { MonteCarloExhibit, PoseExhibit, StitchExhibit } from '../components/Exhibits'
import { Footer, Nav } from '../components/Layout'
import { bySlug, projects } from '../data/projects'
import { asset } from '../lib/hooks'
import NotFound from './NotFound'

export default function ProjectPage() {
  const { slug } = useParams()
  const p = slug ? bySlug(slug) : undefined

  useEffect(() => {
    if (p) document.title = `${p.title} | Allwin James Andrews`
    return () => {
      document.title = 'Allwin James Andrews | AI and Full-Stack Engineer'
    }
  }, [p])

  if (!p) return <NotFound />
  const i = projects.indexOf(p)
  const next = projects[(i + 1) % projects.length]

  return (
    <>
      <Nav />
      <main className="page">
        <p className="crumb">
          <Link to="/#work">Work</Link> / {p.title}
        </p>
        <h1>{p.title}</h1>
        <p className="lead big">{p.tagline}</p>

        <dl className="facts">
          <div>
            <dt>My role</dt>
            <dd>{p.role}</dd>
          </div>
          <div>
            <dt>Where and when</dt>
            <dd>{p.context}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{p.status}</dd>
          </div>
        </dl>

        {p.exhibit === 'stitch' && (
          <div className="page-exhibit page-exhibit-stitch">
            <StitchExhibit />
          </div>
        )}
        {p.exhibit === 'pose' && (
          <div className="page-exhibit">
            <PoseExhibit />
          </div>
        )}
        {p.exhibit === 'montecarlo' && (
          <div className="page-exhibit">
            <MonteCarloExhibit />
          </div>
        )}

        {p.steps && (
          <section>
            <h2>How it works</h2>
            <Boundary steps={p.steps} />
            <Legend />
          </section>
        )}

        <section>
          <h2>What I did</h2>
          <ul className="points">
            {p.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </section>

        {p.video && !p.exhibit && (
          <section>
            <h2>Output</h2>
            <figure className="page-video">
              <video src={asset(p.video.src)} poster={asset(p.video.poster)} controls preload="none" playsInline />
              <figcaption className="fine">{p.video.caption}</figcaption>
            </figure>
          </section>
        )}

        {p.images && (
          <section>
            <h2>{p.slug === 'kadha' ? 'Designs' : 'Screens'}</h2>
            <div className={`shots ${p.slug === 'kadha' ? 'shots-tall' : ''}`}>
              {p.images.map((im) => (
                <figure key={im.src}>
                  <img src={asset(im.src)} alt={im.alt} loading="lazy" />
                  <figcaption className="fine">{im.alt}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2>Stack</h2>
          <ul className="chips">
            {p.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          {p.links && (
            <p className="links">
              {p.links.map((l) => (
                <a key={l.href} className="btn" href={l.href}>
                  {l.label}
                </a>
              ))}
            </p>
          )}
        </section>

        <p className="next">
          Next: <Link to={`/projects/${next.slug}`}>{next.title}</Link>
        </p>
      </main>
      <Footer />
    </>
  )
}
