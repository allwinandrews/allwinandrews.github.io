import { lazy, Suspense, useRef, useState, type ReactNode } from 'react'
import { asset, hasWebGL, useInView, useJson } from '../lib/hooks'
import { designById, designs } from '../data/designs'
import type { MonteCarloData } from '../scenes/MonteCarloScene'

const StitchScene = lazy(() => import('../scenes/StitchScene'))
const PoseScene = lazy(() => import('../scenes/PoseScene'))
const MonteCarloScene = lazy(() => import('../scenes/MonteCarloScene'))

/** Mounts a 3D scene only once it scrolls near the viewport, and pauses it when it leaves. */
function Stage({
  className,
  fallback,
  children,
}: {
  className: string
  fallback: ReactNode
  children: (active: boolean) => ReactNode
}) {
  const { ref, inView, seen } = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className={`stage ${className}`}>
      {!hasWebGL() ? fallback : seen && <Suspense fallback={null}>{children(inView)}</Suspense>}
    </div>
  )
}

export function StitchExhibit({ design = 'adam' }: { design?: string }) {
  const hud = useRef<HTMLDivElement>(null)
  const [runId, setRunId] = useState(0)
  return (
    <figure className="exhibit exhibit-stitch">
      <Stage
        className="stage-stitch"
        fallback={<img src={asset(`media/kadha/${design}.jpg`)} alt="Kadha embroidery design" />}
      >
        {(active) => <StitchScene active={active} hud={hud} runId={runId} design={design} />}
      </Stage>
      <figcaption>
        <div className="hud" ref={hud}>
          loading stitch file
        </div>
        <button className="link-btn" onClick={() => setRunId((n) => n + 1)}>
          Sew it again
        </button>
      </figcaption>
    </figure>
  )
}

export function PoseExhibit() {
  const video = useRef<HTMLVideoElement>(null)
  const hud = useRef<HTMLDivElement>(null)
  return (
    <div className="exhibit exhibit-pose">
      <video
        ref={video}
        className="phone"
        src={asset('media/fitness-squat.mp4')}
        poster={asset('media/fitness-squat.jpg')}
        muted
        loop
        autoPlay
        playsInline
        aria-label="fitness-ai counting squat reps"
      />
      <figure>
        <Stage className="stage-pose" fallback={<div className="stage-note">3D view needs WebGL</div>}>
          {(active) => <PoseScene active={active} video={video} hud={hud} />}
        </Stage>
        <figcaption>
          <div className="hud" ref={hud}>
            loading pose data
          </div>
        </figcaption>
      </figure>
    </div>
  )
}

export function MonteCarloExhibit() {
  const data = useJson<MonteCarloData>('data/montecarlo.json')
  const s = data?.summary
  return (
    <figure className="exhibit exhibit-mc">
      <Stage className="stage-mc" fallback={<div className="stage-note">3D view needs WebGL</div>}>
        {(active) => <MonteCarloScene active={active} />}
      </Stage>
      <figcaption>
        {s && (
          <dl className="stats">
            <div>
              <dt>Simulated years</dt>
              <dd>{s.simulations.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Chance of a losing year</dt>
              <dd>{s.prob_loss_pct}%</dd>
            </div>
            <div>
              <dt>1-in-20 drawdown</dt>
              <dd>{s.max_dd_p95_pct}%</dd>
            </div>
            <div>
              <dt>Worst drawdown seen</dt>
              <dd>{s.max_dd_worst_pct}%</dd>
            </div>
          </dl>
        )}
        <p className="fine">
          160 of the simulated one-year paths, drawn from a backtest of {data?.tickers ?? 24} US stocks. Red paths end
          the year down. Paper trading only: this is a risk test, not a performance claim.
        </p>
      </figcaption>
    </figure>
  )
}

/** Pick any Kadha design and watch it sewn from its real stitch file. */
export function DesignPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="picker" role="group" aria-label="Choose a design">
      {designs.map((d) => (
        <button key={d.id} className="pick" aria-pressed={d.id === value} onClick={() => onChange(d.id)} title={d.name}>
          <img src={asset(`media/kadha/${d.id}.jpg`)} alt="" loading="lazy" />
          <span>{d.name}</span>
        </button>
      ))}
    </div>
  )
}

export function KadhaGallery() {
  const [id, setId] = useState('adam')
  const d = designById(id)
  return (
    <div className="kadha-gallery">
      <StitchExhibit design={id} />
      <p className="design-name">
        {d.name} <span className="meta">{d.theme}</span>
      </p>
      <DesignPicker value={id} onChange={setId} />
    </div>
  )
}
