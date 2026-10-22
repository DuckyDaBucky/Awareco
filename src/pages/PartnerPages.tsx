import { useEffect, useState, type ReactNode } from "react"
import { Link, NavLink, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Conversation, Kind, SourceDrawer } from "../components/Chrome.tsx"
import {
  CoverageBadge,
  EvidenceBadge,
  MetricEvidenceGrid,
  ProgrammeCard,
  ProgrammeHero,
  ProgrammeProfileBody,
  SourceLibrary,
} from "../components/ProgrammeEvidence.tsx"
import { formatMetric, getMetric, handoff, roleForProgramme, type Metric } from "../lib/content.ts"
import { scenarioOutcome } from "../lib/logic.ts"
import { getProgrammeRecord, programmeReadiness, type ProgrammeRecord } from "../lib/programmes.ts"
import { useDemo, type ProgrammeReviewStatus } from "../lib/store.ts"
import { SavedScenarioList, ScenarioPanel } from "./Scenario.tsx"

type PartnerTab = "overview" | "programmes" | "compare" | "scenarios" | "reports" | "data-quality" | "inclusion" | "business-case"

const TABS: { id: PartnerTab; path: string; label: string; legacyPermission: string }[] = [
  { id: "overview", path: "/partners", label: "Portfolio", legacyPermission: "overview" },
  { id: "programmes", path: "/partners/programmes", label: "Programmes", legacyPermission: "programmes" },
  { id: "compare", path: "/partners/compare", label: "Compare", legacyPermission: "programmes" },
  { id: "scenarios", path: "/partners/scenarios", label: "Scenarios", legacyPermission: "simulate" },
  { id: "reports", path: "/partners/reports", label: "Reports", legacyPermission: "reports" },
  { id: "data-quality", path: "/partners/data-quality", label: "Data quality", legacyPermission: "gaps" },
  { id: "inclusion", path: "/partners/inclusion", label: "Inclusion", legacyPermission: "inclusion" },
  { id: "business-case", path: "/partners/business-case", label: "Business case", legacyPermission: "business-case" },
]

function tabVisible(role: (typeof handoff.partners.demo_roles)[number], tab: PartnerTab) {
  const permission = TABS.find((item) => item.id === tab)?.legacyPermission
  return permission ? role.visible_tabs.includes(permission as never) : false
}

function recordsForRole(roleId: string) {
  const role = handoff.partners.demo_roles.find((item) => item.id === roleId) ?? handoff.partners.demo_roles[1]
  return role.programme_ids.map((id) => getProgrammeRecord(id)).filter((record): record is ProgrammeRecord => Boolean(record))
}

export function PartnerFrame({ tab, children }: { tab: PartnerTab; children: ReactNode }) {
  const [params] = useSearchParams()
  const replace = useDemo((store) => store.replace)
  const roleId = useDemo((store) => store.state.roleId)
  const programmeId = useDemo((store) => store.state.programmeId)
  const role = handoff.partners.demo_roles.find((item) => item.id === roleId) ?? handoff.partners.demo_roles[1]
  const allowed = tabVisible(role, tab)

  useEffect(() => {
    const requested = params.get("programme")
    if (!requested || !handoff.people.some((person) => person.id === requested)) return
    replace((current) => {
      if (current.programmeId === requested && role.programme_ids.includes(requested as never)) return current
      const nextRole = handoff.partners.demo_roles.find((item) => item.id === current.roleId && item.programme_ids.includes(requested as never))
      return { ...current, programmeId: requested, roleId: nextRole?.id ?? roleForProgramme(requested) }
    })
  }, [params, replace, role.programme_ids])

  const changeRole = (nextRoleId: string) => {
    const next = handoff.partners.demo_roles.find((item) => item.id === nextRoleId)
    if (!next) return
    replace((current) => ({
      ...current,
      roleId: next.id,
      programmeId: next.programme_ids.includes(current.programmeId as never) ? current.programmeId : next.programme_ids[0],
    }))
  }

  return (
    <div className="partner-workspace">
      <aside className="partner-sidebar">
        <div className="partner-brand">
          <span>Make A Mark</span>
          <strong>Partner workspace</strong>
        </div>
        <label className="partner-role-control">
          <span>Demonstration role</span>
          <select value={role.id} onChange={(event) => changeRole(event.target.value)}>
            {handoff.partners.demo_roles.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <p className="partner-demo-note">The selector demonstrates role-specific views. It is not production authentication.</p>
        <nav className="partner-nav" aria-label="Partner workspace">
          {TABS.filter((item) => tabVisible(role, item.id)).map((item) => (
            <NavLink key={item.id} to={item.path} end={item.id === "overview"} className={tab === item.id ? "active" : undefined}>
              <span>{item.label}</span><span aria-hidden="true">→</span>
            </NavLink>
          ))}
        </nav>
        <div className="partner-sidebar-foot">
          <span>Current context</span>
          <strong>{role.label}</strong>
          <small>{programmeId}</small>
        </div>
      </aside>
      <main className="partner-main">
        {allowed ? children : (
          <section className="partner-access panel">
            <p className="eyebrow">Protected workspace</p>
            <h1>This view is not available to the selected role.</h1>
            <p>The route is guarded as well as hidden from navigation. Switch to the AMF1 leadership demonstration role to inspect this area.</p>
            <button className="btn" type="button" onClick={() => changeRole("leadership")}>Switch to leadership demo</button>
          </section>
        )}
      </main>
    </div>
  )
}

function ProgrammeSelector({ label = "Programme", onProgrammeChange }: { label?: string; onProgrammeChange?: (id: string) => void }) {
  const roleId = useDemo((store) => store.state.roleId)
  const programmeId = useDemo((store) => store.state.programmeId)
  const replace = useDemo((store) => store.replace)
  const role = handoff.partners.demo_roles.find((item) => item.id === roleId) ?? handoff.partners.demo_roles[1]
  return (
    <label className="workspace-select">
      <span>{label}</span>
      <select value={programmeId} onChange={(event) => {
        const nextId = event.target.value
        replace((current) => ({ ...current, programmeId: nextId }))
        onProgrammeChange?.(nextId)
      }}>
        {role.programme_ids.map((id) => <option key={id} value={id}>{getProgrammeRecord(id)?.person.programme_name ?? id}</option>)}
      </select>
    </label>
  )
}

function WorkspaceHeading({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: ReactNode }) {
  return (
    <header className="workspace-heading">
      <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div>
      {action ? <div>{action}</div> : null}
    </header>
  )
}

export function PartnerHome() {
  const roleId = useDemo((store) => store.state.roleId)
  const gapStatus = useDemo((store) => store.state.gapStatus)
  const records = recordsForRole(roleId)
  const role = handoff.partners.demo_roles.find((item) => item.id === roleId) ?? handoff.partners.demo_roles[1]
  const metricCount = records.reduce((sum, record) => sum + record.metrics.length, 0)
  const ready = records.filter((record) => programmeReadiness(record).score >= 85).length
  const openGaps = handoff.partners.data_gaps.filter((gap) => (gapStatus[gap.id] ?? gap.status) !== "resolved").length

  return (
    <PartnerFrame tab="overview">
      <WorkspaceHeading
        eyebrow={`${role.label} · 2025 portfolio`}
        title="Evidence you can use, not just numbers you can view."
        copy="Review programme performance, understand evidence quality, and move directly into planning or reporting."
        action={<Link className="btn" to="/partners/reports">Build report</Link>}
      />
      <div className="portfolio-kpis">
        <article><span>Authorized programmes</span><strong>{records.length}</strong><small>For this demonstration role</small></article>
        <article><span>Published measures</span><strong>{metricCount}</strong><small>Reported, derived or target values</small></article>
        <article><span>Evidence-ready records</span><strong>{ready}/{records.length}</strong><small>Verified source and at least one measure</small></article>
        <article><span>Open data gaps</span><strong>{openGaps}</strong><small>Require evidence or connection</small></article>
      </div>

      <section className="portfolio-section">
        <div className="section-heading">
          <div><p className="eyebrow">Portfolio health</p><h2>Evidence coverage by programme</h2></div>
          <Link to="/partners/compare">Compare programmes</Link>
        </div>
        <PortfolioEvidenceChart records={records} />
      </section>

      {role.id === "leadership" ? <LeadershipEnvironmentalContext /> : null}

      <section className="portfolio-section">
        <div className="section-heading">
          <div><p className="eyebrow">Programme workspaces</p><h2>Move from overview to evidence</h2></div>
          <span>{records.length} programmes</span>
        </div>
        <div className="programme-grid partner-programme-grid">
          {records.map((record) => <ProgrammeCard key={record.person.id} record={record} to={`/partners/programmes/${record.person.id}`} />)}
        </div>
      </section>

      <section className="partner-assistant panel">
        <div>
          <p className="eyebrow">Evidence assistant</p>
          <h2>Ask the portfolio</h2>
          <p>Concise stored answers, grounded in the same cited handoff data.</p>
        </div>
        <Conversation surface="partner" questionIds={handoff.partners.assistant_question_ids} />
      </section>
    </PartnerFrame>
  )
}

function PortfolioEvidenceChart({ records }: { records: ProgrammeRecord[] }) {
  const maxMetrics = Math.max(1, ...records.map((record) => record.metrics.length))
  return (
    <div className="portfolio-evidence-chart">
      {records.map((record) => {
        const readiness = programmeReadiness(record)
        return (
          <Link to={`/partners/programmes/${record.person.id}`} key={record.person.id} className="portfolio-evidence-row">
            <div><strong>{record.person.programme_name}</strong><span>{record.person.partner_name}</span></div>
            <div className="portfolio-bar" role="img" aria-label={`${record.metrics.length} reported measures`}><i style={{ width: `${record.metrics.length / maxMetrics * 100}%` }} /></div>
            <span>{record.metrics.length} measure{record.metrics.length === 1 ? "" : "s"}</span>
            <span className={`readiness-dot ${readiness.score >= 85 ? "ready" : readiness.score >= 50 ? "partial" : "limited"}`}>{readiness.score}% ready</span>
          </Link>
        )
      })}
    </div>
  )
}

function LeadershipEnvironmentalContext() {
  const trend = handoff.partners.charts[0].metric_ids.map((id) => getMetric(id)).filter((metric): metric is Metric => Boolean(metric))
  const categories = handoff.partners.charts[1].metric_ids.map((id) => getMetric(id)).filter((metric): metric is Metric => Boolean(metric))
  const maxCategory = Math.max(...categories.map((metric) => Number(metric.value ?? 0)))
  const values = trend.map((metric) => Number(metric.value ?? 0))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const points = trend.map((metric, index) => {
    const x = 70 + index * 250
    const y = 170 - ((Number(metric.value ?? 0) - min) / Math.max(1, max - min)) * 105
    return { metric, x, y }
  })
  return (
    <section className="portfolio-section leadership-context">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Team-wide environmental context</p>
          <h2>Clearly separated from programme outcomes</h2>
        </div>
        <Link to="/impact">Open full impact view</Link>
      </div>
      <div className="leadership-chart-grid">
        <article className="panel footprint-trend-card">
          <h3>Market-based footprint before SAF certificates</h3>
          <svg viewBox="0 0 640 220" role="img" aria-label={trend.map((metric) => `${metric.period}: ${formatMetric(metric)}`).join(", ")}>
            <line x1="70" y1="180" x2="570" y2="180" />
            <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
            {points.map(({ metric, x, y }) => (
              <g key={metric.id}><circle cx={x} cy={y} r="6" /><text x={x} y="205" textAnchor="middle">{metric.period}</text><text x={x} y={y - 14} textAnchor="middle">{Math.round(Number(metric.value) / 1000)}k</text></g>
            ))}
          </svg>
          <p>Restated annual series · tCO₂e · team scope</p>
        </article>
        <article className="panel footprint-category-card">
          <h3>2025 footprint categories</h3>
          {categories.map((metric) => (
            <div className="category-row" key={metric.id}>
              <span>{metric.label}</span><div><i style={{ width: `${Number(metric.value) / maxCategory * 100}%` }} /></div><strong>{Math.round(Number(metric.value)).toLocaleString("en-GB")}</strong>
            </div>
          ))}
          <p>Published category values; rounding difference is disclosed in the source.</p>
        </article>
      </div>
    </section>
  )
}

export function PartnerProgrammes() {
  const roleId = useDemo((store) => store.state.roleId)
  const records = recordsForRole(roleId)
  return (
    <PartnerFrame tab="programmes">
      <WorkspaceHeading eyebrow="Programme library" title="One record from story to report." copy="Each workspace reuses the same community profile, then adds partner review, planning and reporting context." />
      <div className="programme-grid partner-programme-grid">
        {records.map((record) => <ProgrammeCard key={record.person.id} record={record} to={`/partners/programmes/${record.person.id}`} />)}
      </div>
    </PartnerFrame>
  )
}

export function PartnerProgrammeWorkspace() {
  const { programmeId } = useParams()
  const navigate = useNavigate()
  const roleId = useDemo((store) => store.state.roleId)
  const replace = useDemo((store) => store.replace)
  const reviewStatus = useDemo((store) => store.state.programmeReview[programmeId ?? store.state.programmeId] ?? "draft")
  const role = handoff.partners.demo_roles.find((item) => item.id === roleId) ?? handoff.partners.demo_roles[1]
  const requested = programmeId ?? useDemo.getState().state.programmeId
  const allowed = role.programme_ids.includes(requested as never)
  const record = allowed ? getProgrammeRecord(requested) : undefined

  useEffect(() => {
    if (record) replace((current) => current.programmeId === record.person.id ? current : { ...current, programmeId: record.person.id })
  }, [record, replace])

  if (!record) {
    return (
      <PartnerFrame tab="programmes">
        <section className="partner-access panel">
          <p className="eyebrow">Programme access</p>
          <h1>This programme is not in the selected role's portfolio.</h1>
          <p>Choose an authorized programme from the library or switch demonstration role.</p>
          <Link className="btn" to="/partners/programmes">Programme library</Link>
        </section>
      </PartnerFrame>
    )
  }

  const readiness = programmeReadiness(record)
  return (
    <PartnerFrame tab="programmes">
      <div className="workspace-context-bar">
        <Link to="/partners/programmes">← Programme library</Link>
        <ProgrammeSelector label="Switch programme" onProgrammeChange={(id) => navigate(`/partners/programmes/${id}`)} />
      </div>
      <ProgrammeHero
        record={record}
        eyebrow="Partner programme workspace"
        actions={(
          <>
            <Link className="btn" to="/partners/reports">Add to report</Link>
            <Link className="btn ghost" to="/partners/scenarios">Plan scenario</Link>
          </>
        )}
      />
      <div className="workspace-status-ribbon">
        <div><span>Report readiness</span><strong>{readiness.score}%</strong></div>
        <div><span>Evidence coverage</span><CoverageBadge coverage={record.coverage} /></div>
        <div><span>Primary review</span><EvidenceBadge state={record.evidenceState} /></div>
        <label className="review-status-control"><span>Local review status</span><select value={reviewStatus} onChange={(event) => replace((current) => ({ ...current, programmeReview: { ...current.programmeReview, [record.person.id]: event.target.value as ProgrammeReviewStatus } }))}><option value="draft">Draft</option><option value="in_review">In review</option><option value="approved">Approved for demo</option></select></label>
      </div>
      <ProgrammeProfileBody record={record} includeConversation={false} />
      <section className="partner-workflow panel">
        <div><p className="eyebrow">Next actions</p><h2>Move this record forward</h2></div>
        <div className="partner-workflow-actions">
          <Link to="/partners/data-quality">Review evidence gaps <span>→</span></Link>
          <Link to="/partners/scenarios">Model an initiative <span>→</span></Link>
          <Link to="/partners/reports">Build a partner report <span>→</span></Link>
        </div>
      </section>
    </PartnerFrame>
  )
}

export function PartnerCompare() {
  const roleId = useDemo((store) => store.state.roleId)
  const records = recordsForRole(roleId)
  const [selectedIds, setSelectedIds] = useState(() => records.slice(0, 3).map((record) => record.person.id))
  const selected = records.filter((record) => selectedIds.includes(record.person.id))
  const toggle = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current)

  return (
    <PartnerFrame tab="compare">
      <WorkspaceHeading eyebrow="Comparable evidence" title="Compare without flattening the differences." copy="This view compares evidence coverage and reporting context. It does not rank unlike outcomes on one misleading scale." />
      <div className="compare-picker">
        {records.map((record) => (
          <label key={record.person.id} className={selectedIds.includes(record.person.id) ? "selected" : undefined}>
            <input type="checkbox" checked={selectedIds.includes(record.person.id)} onChange={() => toggle(record.person.id)} disabled={!selectedIds.includes(record.person.id) && selectedIds.length >= 4} />
            <span>{record.person.programme_name}</span>
          </label>
        ))}
      </div>
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead><tr><th scope="col">Evidence dimension</th>{selected.map((record) => <th scope="col" key={record.person.id}>{record.person.programme_name}<small>{record.person.partner_name}</small></th>)}</tr></thead>
          <tbody>
            <tr><th scope="row">Coverage</th>{selected.map((record) => <td key={record.person.id}><CoverageBadge coverage={record.coverage} /></td>)}</tr>
            <tr><th scope="row">Reported measures</th>{selected.map((record) => <td key={record.person.id}><strong>{record.metrics.length}</strong><small>{record.metrics.map((metric) => metric.label).join("; ") || "No numerical outcome loaded"}</small></td>)}</tr>
            <tr><th scope="row">Primary source</th>{selected.map((record) => <td key={record.person.id}><EvidenceBadge state={record.evidenceState} /><small>{record.sources[0]?.title ?? "No source loaded"}</small></td>)}</tr>
            <tr><th scope="row">Reporting period</th>{selected.map((record) => <td key={record.person.id}>{record.editorial.period}</td>)}</tr>
            <tr><th scope="row">Report readiness</th>{selected.map((record) => <td key={record.person.id}><strong>{programmeReadiness(record).score}%</strong><small>Partner approval remains pending</small></td>)}</tr>
            <tr><th scope="row">Key limitation</th>{selected.map((record) => <td key={record.person.id}>{record.editorial.limitations[0]}</td>)}</tr>
            <tr><th scope="row">Open record</th>{selected.map((record) => <td key={record.person.id}><Link to={`/partners/programmes/${record.person.id}`}>View workspace →</Link></td>)}</tr>
          </tbody>
        </table>
      </div>
    </PartnerFrame>
  )
}

export function PartnerSimulate() {
  return (
    <PartnerFrame tab="scenarios">
      <WorkspaceHeading eyebrow="Planning studio" title="Test an initiative without confusing it for an outcome." copy="Every result is explicitly illustrative and saved with its inputs, outputs, assumptions and source context." />
      <section className="scenario-workspace panel"><ScenarioPanel /></section>
      <section className="portfolio-section">
        <div className="section-heading"><div><p className="eyebrow">Scenario library</p><h2>Saved planning records</h2></div></div>
        <SavedScenarioList />
      </section>
    </PartnerFrame>
  )
}

export function PartnerReport() {
  const programmeId = useDemo((store) => store.state.programmeId)
  const savedScenarios = useDemo((store) => store.state.savedScenarios)
  const reportScenarioId = useDemo((store) => store.state.reportScenarioId)
  const gapStatus = useDemo((store) => store.state.gapStatus)
  const reviewStatus = useDemo((store) => store.state.programmeReview[store.state.programmeId] ?? "draft")
  const [generatedAt] = useState(() => new Date())
  const record = getProgrammeRecord(programmeId)
  const scenario = savedScenarios.find((item) => item.id === reportScenarioId) ?? savedScenarios.find((item) => item.scenarioId === reportScenarioId)
  const scenarioDefinition = scenario ? handoff.simulations.scenarios.find((item) => item.id === scenario.scenarioId) : undefined
  const outputs = scenario ? (scenario.outputs ?? scenarioOutcome(scenario.scenarioId, scenario.inputs)) : undefined
  if (!record) return null

  return (
    <PartnerFrame tab="reports">
      <WorkspaceHeading
        eyebrow="Report builder"
        title="A defensible record, ready for review."
        copy="The report uses the same programme evidence, current gap state and complete saved scenario as the workspace."
        action={<button className="btn" type="button" onClick={() => window.print()}>Print or save as PDF</button>}
      />
      <div className="report-controls no-print">
        <ProgrammeSelector label="Report programme" />
        <Link className="btn ghost" to="/partners/scenarios">Manage scenario</Link>
        <Link className="btn ghost" to="/partners/data-quality">Review gaps</Link>
      </div>
      <article className="partner-report">
        <header className="report-cover">
          <p>Make A Mark Live</p>
          <h1>Partner impact report</h1>
          <h2>{record.person.programme_name}</h2>
          <dl>
            <div><dt>Partner</dt><dd>{record.person.partner_name}</dd></div>
            <div><dt>Reporting period</dt><dd>{record.editorial.period}</dd></div>
            <div><dt>Evidence</dt><dd>{record.coverage} · {record.evidenceState}</dd></div>
            <div><dt>Generated</dt><dd>{generatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</dd></div>
          </dl>
          <p className="report-draft">Prototype report · local review status: {statusLabel(reviewStatus)}</p>
        </header>
        <section className="report-section">
          <p className="report-kicker">01 · Executive summary</p>
          <h2>{record.editorial.dek}</h2>
          {record.editorial.sections.map((section) => <div key={section.heading}><h3>{section.heading}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>)}
        </section>
        <section className="report-section">
          <p className="report-kicker">02 · Reported measures</p>
          <MetricEvidenceGrid metrics={record.metrics} />
        </section>
        <section className="report-section report-two-column">
          <div><p className="report-kicker">03 · Supported interpretation</p><ul>{record.editorial.shows.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><p className="report-kicker">04 · Limitations</p><ul>{record.editorial.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </section>
        <section className="report-section">
          <p className="report-kicker">05 · Illustrative scenario</p>
          {scenario && scenarioDefinition && outputs ? (
            <div className="report-scenario">
              <div><Kind kind="illustrative" /><h2>{scenario.title || scenarioDefinition.title}</h2><p>Saved {new Date(scenario.at).toLocaleString("en-GB")}</p></div>
              <div className="report-scenario-grid">
                <div><h3>Inputs</h3><dl>{Object.entries(scenario.inputs).map(([key, value]) => <div key={key}><dt>{labelFromId(key)}</dt><dd>{value}</dd></div>)}</dl></div>
                <div><h3>Outputs</h3><dl>{Object.entries(outputs).map(([key, value]) => <div key={key}><dt>{labelFromId(key)}</dt><dd>{typeof value === "number" ? value.toLocaleString("en-GB", { maximumFractionDigits: 2 }) : value}</dd></div>)}</dl></div>
              </div>
              <h3>Assumptions</h3><ul>{scenarioDefinition.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
              <p>This scenario is not a reported outcome or guaranteed forecast.</p>
            </div>
          ) : <p>No saved scenario is selected. The report does not invent one.</p>}
        </section>
        <section className="report-section">
          <p className="report-kicker">06 · Data quality</p>
          <table className="report-gap-table"><thead><tr><th>Gap</th><th>Owner</th><th>Current status</th></tr></thead><tbody>{handoff.partners.data_gaps.map((gap) => <tr key={gap.id}><td>{gap.title}</td><td>{gap.owner_role}</td><td>{statusLabel(gapStatus[gap.id] ?? gap.status)}</td></tr>)}</tbody></table>
        </section>
        <section className="report-section">
          <p className="report-kicker">07 · Sources</p>
          <ol className="report-sources">{record.sources.map((source) => <li key={source.id}>{source.title}{source.page ? `, page ${source.page}` : ""}. {source.publisher ?? "Publisher recorded in source metadata"}, {source.year ?? "year not stated"}.</li>)}</ol>
        </section>
      </article>
    </PartnerFrame>
  )
}

function labelFromId(value: string) {
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase())
}

function statusLabel(value: string) {
  return {
    not_loaded: "Not loaded",
    illustrative_work_in_progress: "Illustrative work in progress",
    not_connected: "Not connected",
    in_review: "In review",
    resolved: "Resolved",
    draft: "Draft",
    approved: "Approved for demo",
  }[value] ?? value.replaceAll("_", " ")
}

function gapNextAction(id: string) {
  return {
    gap_career: "Agree a consented follow-up measure and reporting interval with each programme owner.",
    gap_cost: "Load approved programme expenditure and define which shared costs belong in the calculation.",
    gap_supplier: "Replace category-level estimates with approved activity data from priority suppliers.",
    gap_race: "Connect an authorized operational feed and define freshness and failure-state rules.",
  }[id] ?? "Confirm the required evidence, owner and review date."
}

export function PartnerGaps() {
  const gapStatus = useDemo((store) => store.state.gapStatus)
  const replace = useDemo((store) => store.replace)
  const [sourceId, setSourceId] = useState<string | null>(null)
  const resolved = handoff.partners.data_gaps.filter((gap) => (gapStatus[gap.id] ?? gap.status) === "resolved").length
  return (
    <PartnerFrame tab="data-quality">
      <WorkspaceHeading eyebrow="Evidence governance" title="Make missing information actionable." copy="A status change tracks work; it never creates evidence or upgrades a claim by itself." />
      <div className="data-quality-summary">
        <div><span>Tracked gaps</span><strong>{handoff.partners.data_gaps.length}</strong></div>
        <div><span>Resolved</span><strong>{resolved}</strong></div>
        <div><span>Still open</span><strong>{handoff.partners.data_gaps.length - resolved}</strong></div>
      </div>
      <div className="gap-list">
        {handoff.partners.data_gaps.map((gap, index) => {
          const current = gapStatus[gap.id] ?? gap.status
          return (
            <article key={gap.id} className="gap-card">
              <div className="gap-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="gap-copy"><p className="eyebrow">{gap.owner_role}</p><h2>{gap.title}</h2><p>{gap.explanation}</p><p className="gap-next"><strong>Next action:</strong> {gapNextAction(gap.id)}</p><button className="text-link" type="button" onClick={() => setSourceId(gap.source_ids[0])}>Inspect supporting context →</button></div>
              <label><span>Status</span><select value={current} onChange={(event) => replace((state) => ({ ...state, gapStatus: { ...state.gapStatus, [gap.id]: event.target.value } }))}>
                <option value="not_loaded">Not loaded</option>
                <option value="not_connected">Not connected</option>
                <option value="illustrative_work_in_progress">Illustrative work in progress</option>
                <option value="in_review">In review</option>
                <option value="resolved">Resolved</option>
              </select></label>
            </article>
          )
        })}
      </div>
      {sourceId ? <SourceDrawer sourceId={sourceId} onClose={() => setSourceId(null)} /> : null}
    </PartnerFrame>
  )
}

export function PartnerInclusion() {
  const metrics = handoff.partners.inclusion_metric_ids.map((id) => getMetric(id)).filter((metric): metric is Metric => Boolean(metric))
  const percentMetrics = metrics.filter((metric) => metric.unit === "percent")
  return (
    <PartnerFrame tab="inclusion">
      <WorkspaceHeading eyebrow="Leadership · published aggregates" title="Inclusion evidence with privacy boundaries intact." copy="This prototype contains published aggregate reporting only. No individual employee records are loaded." />
      <MetricEvidenceGrid metrics={metrics} />
      <section className="panel inclusion-visual">
        <div className="section-heading"><div><p className="eyebrow">Published measures</p><h2>Representation and pay-gap context</h2></div><span>2025</span></div>
        <div className="outcome-bars">
          {percentMetrics.map((metric) => <div className="outcome-row" key={metric.id}><div><span>{metric.label}</span><strong>{formatMetric(metric)}</strong></div><div className="outcome-track"><i style={{ width: `${Math.min(100, Number(metric.value))}%` }} /></div></div>)}
        </div>
        <div className="privacy-boundary"><strong>Privacy boundary</strong><p>Aggregates describe the published cohort. They do not authorize access to individual identity, health, compensation or employment records.</p></div>
      </section>
      <SourceLibrary sources={[handoff.sources.find((source) => source.id === "ESG25_P55")].filter((source): source is (typeof handoff.sources)[number] => Boolean(source))} />
    </PartnerFrame>
  )
}

export function BusinessPage() {
  const [caseId, setCaseId] = useState("base")
  const selected = handoff.business_case.sensitivities.find((item) => item.id === caseId) ?? handoff.business_case.sensitivities[0]
  const max = Math.max(...handoff.business_case.sensitivities.map((item) => item.three_year_net))
  return (
    <PartnerFrame tab="business-case">
      <WorkspaceHeading eyebrow="Leadership · planning assumptions" title="A business case that keeps uncertainty visible." copy="Planning value is kept separate from historical ESG evidence and should not be described as guaranteed profit." />
      <div className="business-case-layout">
        <section className="business-case-hero panel">
          <Kind kind="illustrative" />
          <p>Selected three-year modelled net</p>
          <strong>${selected.three_year_net.toLocaleString("en-US")}</strong>
          <span>{selected.label}</span>
          <div className="chips">{handoff.business_case.sensitivities.map((item) => <button key={item.id} className={item.id === caseId ? "chip active" : "chip"} type="button" onClick={() => setCaseId(item.id)}>{item.label}</button>)}</div>
        </section>
        <section className="panel sensitivity-chart">
          <h2>Sensitivity cases</h2>
          {handoff.business_case.sensitivities.map((item) => <button type="button" key={item.id} onClick={() => setCaseId(item.id)} className={item.id === caseId ? "active" : undefined}><span>{item.label}</span><div><i style={{ width: `${item.three_year_net / max * 100}%` }} /></div><strong>${item.three_year_net.toLocaleString("en-US")}</strong></button>)}
        </section>
      </div>
      <div className="business-summary-grid">
        <article><span>Pilot ask</span><strong>${handoff.business_case.summary.pilot_ask_rounded.toLocaleString("en-US")}</strong></article>
        <article><span>Year-one cost</span><strong>${handoff.business_case.summary.year_one_cost.toLocaleString("en-US")}</strong></article>
        <article><span>Base model return</span><strong>{handoff.business_case.summary.roi_percent.toFixed(0)}%</strong></article>
        <article><span>Approximate payback</span><strong>Month {handoff.business_case.summary.payback_month_approx}</strong></article>
      </div>
      <div className="report-two-column business-notes">
        <section className="panel"><p className="eyebrow">Value categories</p><h2>What the model includes</h2><ul>{handoff.business_case.categories.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="panel"><p className="eyebrow">Guardrails</p><h2>How not to overstate it</h2><ul>{handoff.business_case.limitations.map((item) => <li key={item}>{item}</li>)}</ul></section>
      </div>
    </PartnerFrame>
  )
}
