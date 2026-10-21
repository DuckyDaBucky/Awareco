import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Conversation, Portrait, SourceDrawer } from "../components/Chrome.tsx"
import { getPersona, getSource, listPersonas } from "../lib/content.ts"
import { matchPersonas } from "../lib/logic.ts"
import { handoff } from "../lib/content.ts"
import { useDemo } from "../lib/store.ts"
import { MetricCard } from "../components/Chrome.tsx"

export function PeoplePage() {
  const [filter, setFilter] = useState<"ALL" | "BELONG" | "COMMUNITY">("ALL")
  const people = listPersonas().filter((person) => filter === "ALL" || person.pillar === filter)
  return (
    <>
      <p className="muted">The people</p>
      <h1>Meet the minds behind the machine.</h1>
      <p>These are fictional guides to real programmes. They are not employees, and a partner has not approved their dialogue.</p>
      <div className="chips" style={{ marginBottom: 16 }}>
        {(["ALL", "BELONG", "COMMUNITY"] as const).map((item) => (
          <button key={item} className={filter === item ? "chip active" : "chip"} type="button" onClick={() => setFilter(item)}>
            {item === "ALL" ? "All" : item === "BELONG" ? "Belong" : "Community"}
          </button>
        ))}
      </div>
      <div className="people-grid">
        {people.map((person) => (
          <Link key={person.id} className="panel person-card" to={`/people/${person.id}`}>
            <Portrait name={person.name} id={person.id} />
            <h2>{person.name}</h2>
            <p className="muted">Demonstration composite</p>
            <p>{person.role}</p>
            <p>{person.programme_name}</p>
          </Link>
        ))}
      </div>
      {people.length === 0 ? <p>No stories match that filter.</p> : null}
    </>
  )
}

export function PersonaPage() {
  const { personaId } = useParams()
  const person = personaId ? getPersona(personaId) : undefined
  const replace = useDemo((store) => store.replace)
  const [sourceId, setSourceId] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  if (!person) {
    return (
      <section className="panel">
        <h1>{handoff.app.errors.unknown_persona}</h1>
        <Link to="/people">Back to the stories</Link>
      </section>
    )
  }
  const source = getSource(person.article.source_id)
  return (
    <>
      <p className="muted">{person.programme_name}</p>
      <h1>Talk to the people making their mark</h1>
      <div className="persona-layout">
        <section className="panel">
          <Portrait name={person.name} id={person.id} />
          <h2>{person.name}</h2>
          <p>{person.role}</p>
          <p className="lime">Demonstration composite · not partner-approved</p>
          <Conversation surface={`person:${person.id}`} questionIds={person.question_ids} intro={person.intro} />
        </section>
        <section className="panel">
          <h2>Reported outcomes</h2>
          {person.metric_ids.length === 0 ? <p>No numerical outcome is loaded for this programme. The story still has a source.</p> : person.metric_ids.map((id) => <MetricCard key={id} id={id} />)}
        </section>
        <section className="panel">
          <p className="muted">Authored summary, not a verbatim article</p>
          <h2>{person.article.title}</h2>
          {person.article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <button className="btn" type="button" onClick={() => setSourceId(person.article.source_id)}>Read the official source</button>
          <div className="chips" style={{ marginTop: 12 }}>
            <button className="chip" type="button" onClick={() => {
              replace((current) => ({ ...current, interests: current.interests.includes(person.id) ? current.interests : [...current.interests, person.id] }))
              setNote("Interest saved in this demo. Nothing was submitted.")
            }}>Save interest in this demo</button>
            <button className="chip" type="button" onClick={() => { void navigator.clipboard?.writeText(window.location.href); setNote("Link copied. Nothing was posted.") }}>Copy link</button>
          </div>
          {note ? <p>{note}</p> : null}
          {source ? <p className="muted">{source.title}</p> : null}
        </section>
      </div>
      {sourceId ? <SourceDrawer sourceId={sourceId} onClose={() => setSourceId(null)} /> : null}
    </>
  )
}

export function MatchPage() {
  const questions = handoff.matching.questions
  const replace = useDemo((store) => store.replace)
  const answers = useDemo((store) => store.state.matchAnswers)
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const result = useMemo(() => matchPersonas(answers), [answers])
  const current = questions[step]
  const choose = (value: string | null) => {
    const next = { ...answers, [current.id]: value }
    replace((state) => ({ ...state, matchAnswers: next }))
    if (step === questions.length - 1) setDone(true)
    else setStep(step + 1)
  }
  const person = getPersona(result.primary)
  return (
    <>
      <h1>Find a story</h1>
      <p>Fixed matching rules. You can skip a question. Nothing here asks about identity, health, or belief.</p>
      {!done && current ? (
        <section className="panel">
          <h2>{current.label}</h2>
          <div className="chips">
            {current.options.map((option) => (
              <button key={option} className="chip" type="button" onClick={() => choose(option)}>{option}</button>
            ))}
            <button className="chip" type="button" onClick={() => choose(null)}>Skip</button>
          </div>
        </section>
      ) : (
        <section className="panel">
          <h2>{person?.name}</h2>
          <p>{result.reason}</p>
          <p>{person?.programme_name}</p>
          <Link className="btn" to={`/people/${result.primary}`}>Open the story</Link>
          <div className="chips" style={{ marginTop: 12 }}>
            {result.alternatives.map((id) => {
              const alt = getPersona(id)
              return alt ? <Link key={id} className="chip" to={`/people/${id}`}>{alt.name} · {alt.programme_name}</Link> : null
            })}
          </div>
          <button className="btn ghost" type="button" style={{ marginTop: 12 }} onClick={() => { replace((state) => ({ ...state, matchAnswers: {} })); setStep(0); setDone(false) }}>Restart</button>
        </section>
      )}
    </>
  )
}
