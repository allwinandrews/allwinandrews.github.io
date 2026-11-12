import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { profile } from '../data/projects'

const services = [
  {
    title: 'AI automation',
    text: 'Workflows that take a repetitive job off your team: content pipelines, CRM-triggered agents, document handling, chat and voice assistants.',
    tools: 'OpenAI, Claude, Gemini, n8n',
  },
  {
    title: 'Web platforms',
    text: 'Web applications and internal tools, from a first version to something your customers rely on every day.',
    tools: 'React, Next.js, Django, FastAPI, PostgreSQL',
  },
  {
    title: 'Integrations',
    text: 'Getting the systems you already pay for to talk to each other: CRMs, payment providers, booking tools, marketplaces.',
    tools: 'REST APIs, webhooks, Celery, Redis',
  },
]

const steps = [
  ['Understand', 'A free 30-minute call about the problem, your constraints and what success looks like.'],
  ['Scope', 'A short written proposal with scope and price before any work starts.'],
  ['Build', 'Delivered in small pieces so you see progress and can change direction early.'],
  ['Hand over', 'Deployed, documented, and supported after launch if you want it.'],
]

/**
 * The freelance pitch. Deliberately separate from the employer-facing site:
 * its own header, and no link to it from the main navigation.
 */
export default function Services() {
  useEffect(() => {
    document.title = 'AJA IT Services | AI automation and web development'
    return () => {
      document.title = 'Allwin James Andrews | AI and Full-Stack Engineer'
    }
  }, [])

  return (
    <div className="services">
      <header className="nav">
        <span className="nav-name">AJA IT Services</span>
        <nav className="nav-links">
          <a href="#what">Services</a>
          <a href="#how">Process</a>
          <a href="#talk">Contact</a>
        </nav>
      </header>
      <main className="page">
        <p className="eyebrow">AI automation and web development for UK businesses</p>
        <h1>Software that takes work off your plate</h1>
        <p className="lead big">
          I am Allwin, an engineer with six years of production experience. Through AJA IT Services Limited I take on
          contract and project work for businesses that need something built properly.
        </p>
        <div className="cta">
          <a className="btn btn-primary" href={`mailto:${profile.email}?subject=Project%20enquiry`}>
            Book a free 30-minute call
          </a>
          <a className="btn" href={profile.whatsapp}>
            WhatsApp
          </a>
        </div>

        <section id="what">
          <h2>What I build</h2>
          <div className="grid">
            {services.map((s) => (
              <article key={s.title} className="tile">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <p className="meta">{s.tools}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how">
          <h2>How it works</h2>
          <ol className="process">
            {steps.map(([t, d]) => (
              <li key={t}>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2>Recent work</h2>
          <p>
            Case studies, including a retail AI agent, a real-time meeting assistant and a lead form platform with over
            2,000 customers, are on <Link to="/#work">my portfolio</Link>.
          </p>
        </section>

        <section id="talk" className="contact">
          <h2>Tell me about your project</h2>
          <p>A short description is enough. I will reply with questions or a time for a call.</p>
          <div className="cta">
            <a className="btn btn-primary" href={`mailto:${profile.email}?subject=Project%20enquiry`}>
              {profile.email}
            </a>
            <a className="btn" href={profile.whatsapp}>
              WhatsApp
            </a>
          </div>
        </section>
      </main>
      <footer className="footer">
        <span>AJA IT Services Limited · {profile.location}</span>
        <span className="footer-links">
          <Link to="/">Allwin James Andrews</Link>
        </span>
      </footer>
    </div>
  )
}
