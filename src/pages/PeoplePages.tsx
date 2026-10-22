import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ProgrammeCard, ProgrammeHero, ProgrammeProfileBody } from "../components/ProgrammeEvidence.tsx"
import { getProgrammeRecord, listProgrammeRecords, type EvidenceCoverage } from "../lib/programmes.ts"
import { getPersona, handoff } from "../lib/content.ts"
import { matchPersonas } from "../lib/logic.ts"
import { useDemo } from "../lib/store.ts"

type PillarFilter = "ALL" | "BELONG" | "COMMUNITY"
type CoverageFilter = "all" | EvidenceCoverage

export function PeoplePage() {
  const [pillar, setPillar] = useState<PillarFilter>("ALL")
  const [coverage, setCoverage] = useState<CoverageFilter>("all")
  const [query, setQuery] = useState("")
  const records = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return listProgrammeRecords().filter((record) => {
      if (pillar !== "ALL" && record.person.pillar !== pillar) return false
      if (coverage !== "all" && record.coverage !== coverage) return false
      if (!needle) return true
      return [record.person.programme_name, record.person.partner_name, record.editorial.dek, record.editorial.audience]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    })
  }, [pillar, coverage, query])

  const all = listProgrammeRecords()
  const measured = all.filter((record) => record.coverage === "measured").length
  const narrative = all.filter((record) => record.coverage === "narrative").length

  return (
    <>
      <section className="people-masthead">
        <div>
          <p className="eyebrow">Community evidence library</p>
          <h1>Every programme deserves more than a card and a number.</h1>
          <p>Explore the people, partnerships and reported outcomes behind Make A Mark—with the evidence and its limitations kept together.</p>
        </div>
        <dl>
          <div><dt>Programmes</dt><dd>{all.length}</dd></div>
          <div><dt>Measured profiles</dt><dd>{measured}</dd></div>
          <div><dt>Narrative-only</dt><dd>{narrative}</dd></div>
        </dl>
      </section>

      <section className="library-controls" aria-label="Filter programmes">
        <label className="search-control">
          <span>Search programmes</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Programme, partner or audience" />
        </label>
        <div>
          <span className="control-label">Pillar</span>
          <div className="chips">
            {(["ALL", "BELONG", "COMMUNITY"] as const).map((item) => (
              <button key={item} className={pillar === item ? "chip active" : "chip"} type="button" onClick={() => setPillar(item)}>
                {item === "ALL" ? "All" : item === "BELONG" ? "Belong" : "Community"}
              </button>
            ))}
          </div>
        </div>
        <label>
          <span className="control-label">Evidence coverage</span>
          <select value={coverage} onChange={(event) => setCoverage(event.target.value as CoverageFilter)}>
            <option value="all">All evidence levels</option>
            <option value="measured">Measured outcomes</option>
            <option value="partial">Partial measurement</option>
            <option value="narrative">Narrative evidence</option>
          </select>
        </label>
      </section>

      <div className="library-result-line">
        <p>{records.length} programme{records.length === 1 ? "" : "s"}</p>
        <Link to="/match">Help me find a story →</Link>
      </div>
      <div className="programme-grid">
        {records.map((record) => <ProgrammeCard key={record.person.id} record={record} to={`/people/${record.person.id}`} />)}
      </div>
      {records.length === 0 ? (
        <section className="evidence-empty">
          <span aria-hidden="true">—</span>
          <div><h2>No programmes match</h2><p>Try a broader search or reset the evidence filter.</p></div>
        </section>
      ) : null}
    </>
  )
}

export function PersonaPage() {
  const { personaId } = useParams()
  const record = personaId ? getProgrammeRecord(personaId) : undefined
  const replace = useDemo((store) => store.replace)
  const [note, setNote] = useState<string | null>(null)
  if (!record) {
    return (
      <section className="panel">
        <h1>{handoff.app.errors.unknown_persona}</h1>
        <Link to="/people">Back to the programme library</Link>
      </section>
    )
  }

  const related = listProgrammeRecords()
    .filter((candidate) => candidate.person.id !== record.person.id && candidate.person.pillar === record.person.pillar)
    .slice(0, 3)

  const save = () => {
    replace((current) => ({
      ...current,
      interests: current.interests.includes(record.person.id) ? current.interests : [...current.interests, record.person.id],
    }))
    setNote("Interest saved in this browser. Nothing was submitted.")
  }

  const copy = () => {
    void navigator.clipboard?.writeText(window.location.href)
    setNote("Programme link copied.")
  }

  return (
    <>
      <div className="profile-back"><Link to="/people">← Programme library</Link></div>
      <ProgrammeHero
        record={record}
        actions={(
          <>
            <button className="btn" type="button" onClick={save}>Save programme</button>
            <button className="btn ghost" type="button" onClick={copy}>Copy link</button>
          </>
        )}
      />
      {note ? <p className="action-note" role="status">{note}</p> : null}
      <ProgrammeProfileBody record={record} />
      <section className="related-programmes">
        <div className="section-heading">
          <div><p className="eyebrow">Keep exploring</p><h2>Related programmes</h2></div>
          <Link to="/people">View all</Link>
        </div>
        <div className="programme-grid compact">
          {related.map((candidate) => <ProgrammeCard key={candidate.person.id} record={candidate} to={`/people/${candidate.person.id}`} />)}
        </div>
      </section>
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
    <section className="match-shell">
      <p className="eyebrow">Guided discovery</p>
      <h1>Find a programme story</h1>
      <p>Choose what interests you. The matching rules are fixed, and you can skip any question.</p>
      {!done && current ? (
        <section className="panel match-card">
          <p className="muted">Question {step + 1} of {questions.length}</p>
          <h2>{current.label}</h2>
          <div className="match-options">
            {current.options.map((option) => (
              <button key={option} type="button" onClick={() => choose(option)}>{option}<span>→</span></button>
            ))}
            <button type="button" onClick={() => choose(null)}>Skip this question<span>→</span></button>
          </div>
        </section>
      ) : (
        <section className="panel match-card">
          <p className="eyebrow">Recommended story</p>
          <h2>{person?.programme_name}</h2>
          <p>{result.reason}</p>
          <Link className="btn" to={`/people/${result.primary}`}>Open the programme profile</Link>
          <div className="chips match-alternatives">
            {result.alternatives.map((id) => {
              const alternative = getPersona(id)
              return alternative ? <Link key={id} className="chip" to={`/people/${id}`}>{alternative.programme_name}</Link> : null
            })}
          </div>
          <button className="btn ghost" type="button" onClick={() => { replace((state) => ({ ...state, matchAnswers: {} })); setStep(0); setDone(false) }}>Start again</button>
        </section>
      )}
    </section>
  )
}
