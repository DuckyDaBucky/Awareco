import { useEffect, useState, type ReactNode } from "react"
import { Link, NavLink, useSearchParams } from "react-router-dom"
import { Conversation, Kind, MetricCard, SourceDrawer } from "../components/Chrome.tsx"
import { formatMetric, getMetric, getPersona, handoff, roleForProgramme } from "../lib/content.ts"
import { useDemo } from "../lib/store.ts"
import { ScenarioPanel } from "./Scenario.tsx"

const TABS = [
  ["overview", "/partners", "Overview"],
  ["programmes", "/partners/programmes", "Programmes"],
  ["simulate", "/partners/simulate", "Simulator"],
  ["reports", "/partners/reports", "Reports"],
  ["gaps", "/partners/gaps", "Data gaps"],
  ["inclusion", "/partners/inclusion", "Inclusion"],
  ["business-case", "/partners/business-case", "Business case"],
] as const

export function PartnerFrame({ tab, children }: { tab: string; children: ReactNode }) {
  const [params] = useSearchParams()
  const replace = useDemo((store) => store.replace)
  const roleId = useDemo((store) => store.state.roleId)
  const programmeId = useDemo((store) => store.state.programmeId)
  const role = handoff.partners.demo_roles.find((item) => item.id === roleId) ?? handoff.partners.demo_roles[1]

  useEffect(() => {
    const programme = params.get("programme")
    if (!programme) return
    if (!handoff.people.some((person) => person.id === programme)) return
    replace((current) => ({ ...current, programmeId: programme, roleId: roleForProgramme(programme) }))
  }, [params, replace])

  return (
    <div className="partner-shell">
      <aside>
        <p className="muted">Demonstration view</p>
        <label>
          Role
          <select
            value={roleId}
            onChange={(event) => {
              const next = handoff.partners.demo_roles.find((item) => item.id === event.target.value)!
              replace((current) => ({
                ...current,
                roleId: next.id,
                programmeId: next.programme_ids.includes(current.programmeId) ? current.programmeId : next.programme_ids[0],
              }))
            }}
          >
            {handoff.partners.demo_roles.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <p className="muted">This switch is not authentication.</p>
        <nav className="partner-nav">
          {TABS.filter((item) => role.visible_tabs.includes(item[0])).map((item) => (
            <NavLink key={item[0]} to={item[1]} end={item[0] === "overview"} className={tab === item[0] ? "active" : undefined}>{item[2]}</NavLink>
          ))}
        </nav>
      </aside>
      <div>
        <p className="muted">{role.label} · {programmeId}</p>
        {children}
      </div>
    </div>
  )
}

export function PartnerHome() {
  const programmeId = useDemo((store) => store.state.programmeId)
  const replace = useDemo((store) => store.replace)
  const roleId = useDemo((store) => store.state.roleId)
  const role = handoff.partners.demo_roles.find((item) => item.id === roleId)!
  const person = getPersona(programmeId)
  const categories = handoff.partners.charts[1].metric_ids.map((id) => getMetric(id)).filter(Boolean)
  const max = Math.max(...categories.map((metric) => Number(metric?.value ?? 0)))
  return (
    <PartnerFrame tab="overview">
      <h1>Impact overview</h1>
      <label>
        Programme
        <select value={programmeId} onChange={(event) => replace((current) => ({ ...current, programmeId: event.target.value, roleId: roleForProgramme(event.target.value) }))}>
          {role.programme_ids.map((id) => <option key={id} value={id}>{getPersona(id)?.programme_name}</option>)}
        </select>
      </label>
      <div className="metric-strip panel">
        {(person?.metric_ids.length ? person.metric_ids : handoff.partners.overview_metric_ids).map((id) => <MetricCard key={id} id={id} />)}
      </div>
      <section className="panel" style={{ marginTop: 12 }}>
        <h2>Footprint categories, 2025</h2>
        <div className="bars">
          {categories.map((metric) => metric ? (
            <div className="bar-row" key={metric.id}>
              <span>{metric.label}</span>
              <span className="track"><i style={{ width: `${(Number(metric.value) / max) * 100}%`, background: "#00665e" }} /></span>
              <span>{formatMetric(metric)}</span>
            </div>
          ) : null)}
        </div>
        <p className="muted">{handoff.partners.charts[1].note}</p>
      </section>
      {person ? <p>{person.article.paragraphs[0]}</p> : null}
      <Conversation surface="partner" questionIds={handoff.partners.assistant_question_ids} />
    </PartnerFrame>
  )
}

export function PartnerProgrammes() {
  const roleId = useDemo((store) => store.state.roleId)
  const role = handoff.partners.demo_roles.find((item) => item.id === roleId)!
  return (
    <PartnerFrame tab="programmes">
      <h1>Programme evidence</h1>
      {role.programme_ids.map((id) => {
        const person = getPersona(id)
        if (!person) return null
        return (
          <article key={id} className="panel" style={{ marginBottom: 12 }}>
            <h2>{person.programme_name}</h2>
            <p>{person.partner_name}</p>
            {person.metric_ids.length === 0 ? <p>No numerical measure is loaded.</p> : person.metric_ids.map((metricId) => <MetricCard key={metricId} id={metricId} />)}
            <Link to={`/people/${id}`}>Open the story</Link>
          </article>
        )
      })}
    </PartnerFrame>
  )
}

export function PartnerSimulate() {
  return (
    <PartnerFrame tab="simulate">
      <h1>Initiative simulator</h1>
      <ScenarioPanel />
    </PartnerFrame>
  )
}

export function PartnerReport() {
  const programmeId = useDemo((store) => store.state.programmeId)
  const scenarioId = useDemo((store) => store.state.reportScenarioId)
  const person = getPersona(programmeId)
  const [open, setOpen] = useState<string | null>(null)
  return (
    <PartnerFrame tab="reports">
      <div className="no-print" style={{ marginBottom: 12 }}>
        <button className="btn" type="button" onClick={() => window.print()}>Print or save as PDF</button>
      </div>
      <article className="print-sheet">
        <p>Prototype demonstration report. Not emailed or uploaded.</p>
        <h1>{handoff.partners.report.title}</h1>
        <p>Programme: {person?.programme_name} · 2025</p>
        <h2>Reported measures</h2>
        {person?.metric_ids.map((id) => <MetricCard key={id} id={id} />)}
        <h2>Sources</h2>
        <ul>
          {person?.source_ids.map((id) => {
            const source = handoff.sources.find((item) => item.id === id)
            return <li key={id}>{source?.title}{source?.page ? `, page ${source.page}` : ""} <button type="button" onClick={() => setOpen(id)}>Open</button></li>
          })}
        </ul>
        <h2>Illustrative scenario</h2>
        {scenarioId ? <p>Saved scenario included: {scenarioId}. It is not a reported outcome.</p> : <p>No scenario selected.</p>}
        <h2>Data gaps</h2>
        <ul>{handoff.partners.data_gaps.map((gap) => <li key={gap.id}>{gap.title} — {gap.status}</li>)}</ul>
      </article>
      {open ? <SourceDrawer sourceId={open} onClose={() => setOpen(null)} /> : null}
    </PartnerFrame>
  )
}

export function PartnerGaps() {
  const gapStatus = useDemo((store) => store.state.gapStatus)
  const replace = useDemo((store) => store.replace)
  return (
    <PartnerFrame tab="gaps">
      <h1>Data gaps</h1>
      <p>A status change is local demonstration state. It does not create evidence.</p>
      {handoff.partners.data_gaps.map((gap) => (
        <article key={gap.id} className="panel" style={{ marginBottom: 12 }}>
          <h2>{gap.title}</h2>
          <p>{gap.explanation}</p>
          <p className="muted">{gap.owner_role}</p>
          <label>
            Status
            <select value={gapStatus[gap.id] ?? gap.status} onChange={(event) => replace((current) => ({ ...current, gapStatus: { ...current.gapStatus, [gap.id]: event.target.value } }))}>
              <option value="not_loaded">not loaded</option>
              <option value="illustrative_work_in_progress">illustrative work in progress</option>
              <option value="not_connected">not connected</option>
            </select>
          </label>
        </article>
      ))}
    </PartnerFrame>
  )
}

export function PartnerInclusion() {
  return (
    <PartnerFrame tab="inclusion">
      <h1>Leadership demonstration</h1>
      <p>Published aggregates only. A production system would need real access control. This role switch is not that control.</p>
      <div className="grid-2">
        {handoff.partners.inclusion_metric_ids.map((id) => <div key={id} className="panel"><MetricCard id={id} /></div>)}
      </div>
    </PartnerFrame>
  )
}

export function BusinessPage() {
  const [caseId, setCaseId] = useState("base")
  const selected = handoff.business_case.sensitivities.find((item) => item.id === caseId)!
  return (
    <PartnerFrame tab="business-case">
      <h1>Business case</h1>
      <Kind kind="illustrative" />
      <p>Planning scenario from the supplied proposal. Separate from environmental and programme evidence.</p>
      <div className="chips">
        {handoff.business_case.sensitivities.map((item) => (
          <button key={item.id} className={caseId === item.id ? "chip active" : "chip"} type="button" onClick={() => setCaseId(item.id)}>{item.label}</button>
        ))}
      </div>
      <p className="flare" style={{ fontSize: 42 }}>${selected.three_year_net.toLocaleString("en-US")}</p>
      <p>Three-year modelled net for this case. Not guaranteed profit.</p>
      <ul>
        <li>Pilot ask about ${handoff.business_case.summary.pilot_ask_rounded.toLocaleString("en-US")}</li>
        <li>Year-one cost about ${handoff.business_case.summary.year_one_cost.toLocaleString("en-US")}</li>
        <li>Annual platform run cost before booth operations about ${handoff.business_case.summary.annual_run_cost_before_booth.toLocaleString("en-US")}</li>
        <li>Base return about {handoff.business_case.summary.roi_percent.toFixed(0)}% and payback around month {handoff.business_case.summary.payback_month_approx}</li>
      </ul>
      <ul>{handoff.business_case.categories.map((item) => <li key={item}>{item}</li>)}</ul>
      <ul>{handoff.business_case.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
    </PartnerFrame>
  )
}
