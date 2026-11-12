import type { Step } from '../data/projects'

const names = { code: 'Deterministic code', model: 'Model call', human: 'Human decision' }

/** The pipeline of a project, coloured by who makes each decision. */
export function Boundary({ steps }: { steps: Step[] }) {
  return (
    <ol className="boundary" aria-label="How it works">
      {steps.map((s, i) => (
        <li key={i} className={`step step-${s.kind}`} title={names[s.kind]}>
          <span className="sr-only">{names[s.kind]}: </span>
          {s.label}
        </li>
      ))}
    </ol>
  )
}

export function Legend() {
  return (
    <ul className="legend">
      <li className="step-code">Deterministic code</li>
      <li className="step-model">Model call (LLM or ML)</li>
      <li className="step-human">Human decision</li>
    </ul>
  )
}
