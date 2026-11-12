import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Boundary, Legend } from '../components/Boundary'
import { MonteCarloExhibit, PoseExhibit, StitchExhibit } from '../components/Exhibits'
import { Footer, Nav } from '../components/Layout'
import { education, experience, moreWork, profile, projects, stackGroups, type Project } from '../data/projects'
import { asset } from '../lib/hooks'

type View = 'full' | 'plain'

function useView(): [View, (v: View) => void] {
  const [view, setView] = useState<View>(() => {
    if (new URLSearchParams(location.search).get('view') === 'plain') return 'plain'
    try {
      return localStorage.getItem('view') === 'plain' ? 'plain' : 'full'
    } catch {
      return 'full'
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('view', view)
    } catch {
      /* private mode */
    }
  }, [view])
  return [view, setView]
}

function ViewToggle({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <div className="toggle" role="group" aria-label="Page view">
      <button aria-pressed={view === 'full'} onClick={() => setView('full')}>
        3D
      </button>
      <button aria-pressed={view === 'plain'} onClick={() => setView('plain')}>
        Plain
      </button>
    </div>
  )
}

function Meta({ p }: { p: Project }) {
  return (
    <p className="meta">
      {p.role} · {p.context}
    </p>
  )
}

function FeaturedCard({ p }: { p: Project }) {
  return (
    <article className="card">
      <div className="card-body">
        <Meta p={p} />
        <h3>
          <Link to={`/projects/${p.slug}`}>{p.title}</Link>
        </h3>
        <p className="lead">{p.tagline}</p>
        {p.steps && <Boundary steps={p.steps} />}
        <p className="status">{p.status}</p>
        <Link className="more" to={`/projects/${p.slug}`}>
          Read the case study
        </Link>
      </div>
      {p.images && (
        <Link to={`/projects/${p.slug}`} className="card-media">
          <img src={asset(p.images[0].src)} alt={p.images[0].alt} loading="lazy" />
        </Link>
      )}
      {p.video && (
        <div className="card-media card-video">
          <video src={asset(p.video.src)} poster={asset(p.video.poster)} controls preload="none" playsInline />
        </div>
      )}
    </article>
  )
}

function ExhibitSection({ p }: { p: Project }) {
  return (
    <section className="exhibit-section" id={p.slug}>
      <div className="exhibit-text">
        <Meta p={p} />
        <h3>
          <Link to={`/projects/${p.slug}`}>{p.title}</Link>
        </h3>
        <p className="lead">{p.tagline}</p>
        {p.steps && <Boundary steps={p.steps} />}
        <p className="status">{p.status}</p>
        <Link className="more" to={`/projects/${p.slug}`}>
          How it works
        </Link>
      </div>
      {p.exhibit === 'pose' && <PoseExhibit />}
      {p.exhibit === 'montecarlo' && <MonteCarloExhibit />}
    </section>
  )
}

function PlainList() {
  return (
    <section className="section" id="work">
      <h2>Work</h2>
      <div className="table-wrap">
        <table className="plain">
          <thead>
            <tr>
              <th>Project</th>
              <th>My role</th>
              <th>Stack</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.slug}>
                <td>
                  <Link to={`/projects/${p.slug}`}>{p.title}</Link>
                  <span className="sub">{p.context}</span>
                </td>
                <td>{p.role}</td>
                <td>{p.stack.join(', ')}</td>
                <td>{p.status}</td>
              </tr>
            ))}
            {moreWork.map((m) => (
              <tr key={m.title}>
                <td>{m.href ? <a href={m.href}>{m.title}</a> : m.title}</td>
                <td colSpan={2}>{m.text}</td>
                <td>{m.stack}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function Home() {
  const [view, setView] = useView()
  const featured = projects.filter((p) => p.tier === 'featured')
  const exhibits = projects.filter((p) => p.tier === 'exhibit' && p.exhibit !== 'stitch')
  const more = projects.filter((p) => p.tier === 'more')
  const kadha = projects.find((p) => p.slug === 'kadha')!

  return (
    <>
      <Nav right={<ViewToggle view={view} setView={setView} />} />
      <main>
        <section className={`hero ${view === 'plain' ? 'hero-plain' : ''}`}>
          <div className="hero-text">
            <p className="eyebrow">{profile.title}</p>
            <h1>{profile.name}</h1>
            <p className="hero-summary">{profile.summary}</p>
            <p className="hero-sub">{profile.availability}</p>
            <div className="cta">
              <a className="btn btn-primary" href="#work">
                See the work
              </a>
              <a className="btn" href={`mailto:${profile.email}`}>
                Email me
              </a>
              <a className="btn" href={profile.github}>
                GitHub
              </a>
            </div>
          </div>
          {view === 'full' && (
            <div className="hero-art">
              <StitchExhibit />
              <p className="fine">
                A real embroidery file, sewn in machine order. My{' '}
                <Link to="/projects/kadha">Python pipeline</Link> generated every stitch from a piece of artwork.
              </p>
            </div>
          )}
        </section>

        {view === 'plain' ? (
          <PlainList />
        ) : (
          <>
            <section className="section" id="work">
              <h2>How I build with models</h2>
              <p className="section-intro">
                Code makes the decisions that have to be right. The model does the parts only a model can do. Every
                project below is drawn the same way, so you can see where that line sits.
              </p>
              <Legend />
              <div className="cards">
                {featured.map((p) => (
                  <FeaturedCard key={p.slug} p={p} />
                ))}
              </div>
            </section>

            <section className="section">
              <h2>Running in your browser</h2>
              <p className="section-intro">
                These are not illustrations. Each one is drawn from data my own code produced.
              </p>
              {exhibits.map((p) => (
                <ExhibitSection key={p.slug} p={p} />
              ))}
              <section className="exhibit-section" id="kadha">
                <div className="exhibit-text">
                  <Meta p={kadha} />
                  <h3>
                    <Link to="/projects/kadha">{kadha.title}</Link>
                  </h3>
                  <p className="lead">{kadha.tagline}</p>
                  <Boundary steps={kadha.steps!} />
                  <p className="status">{kadha.status}</p>
                  <Link className="more" to="/projects/kadha">
                    How it works
                  </Link>
                </div>
                <div className="gallery">
                  {['adam', 'kali', 'jatayu', 'chaathan', 'yakshi', 'shiva'].map((id) => (
                    <img key={id} src={asset(`media/kadha/${id}.jpg`)} alt="Kadha embroidery design" loading="lazy" />
                  ))}
                </div>
                <Link className="more" to="/projects/kadha">
                  See all 13 designs
                </Link>
              </section>
            </section>

            <section className="section">
              <h2>More work</h2>
              <div className="grid">
                {more.map((p) => (
                  <article key={p.slug} className="tile">
                    <Meta p={p} />
                    <h3>
                      <Link to={`/projects/${p.slug}`}>{p.title}</Link>
                    </h3>
                    <p>{p.tagline}</p>
                    <p className="status">{p.status}</p>
                  </article>
                ))}
                {moreWork.map((m) => (
                  <article key={m.title} className="tile">
                    <p className="meta">{m.stack}</p>
                    <h3>{m.href ? <a href={m.href}>{m.title}</a> : m.title}</h3>
                    <p>{m.text}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        <section className="section" id="experience">
          <h2>Experience</h2>
          <ol className="timeline">
            {experience.map((e) => (
              <li key={e.org}>
                <p className="meta">
                  {e.when} · {e.where}
                </p>
                <h3>
                  {e.role}, {e.org}
                </h3>
                <p>{e.text}</p>
              </li>
            ))}
          </ol>
          <div className="two-col">
            <div>
              <h3 className="small-h">Stack</h3>
              <dl className="stack">
                {stackGroups.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="small-h">Education</h3>
              <ul className="plain-list">
                {education.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section contact" id="contact">
          <h2>Contact</h2>
          <p className="section-intro">{profile.availability}</p>
          <div className="cta">
            <a className="btn btn-primary" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <a className="btn" href={profile.linkedin}>
              LinkedIn
            </a>
            <a className="btn" href={profile.github}>
              GitHub
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
