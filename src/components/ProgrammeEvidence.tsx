import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Conversation, SourceDrawer } from "./Chrome.tsx"
import { formatMetric, getSource, type Metric, type Source } from "../lib/content.ts"
import {
  evidenceLabel,
  evidenceStateForMetric,
  evidenceStateForSource,
  programmeReadiness,
  type EvidenceCoverage,
  type EvidenceState,
  type ProgrammeRecord,
} from "../lib/programmes.ts"

export function EvidenceBadge({ state }: { state: EvidenceState }) {
  return <span className={`evidence-badge evidence-${state}`}>{evidenceLabel(state)}</span>
}

export function CoverageBadge({ coverage }: { coverage: EvidenceCoverage }) {
  const label = coverage === "measured" ? "Measured outcomes" : coverage === "partial" ? "Partial measurement" : "Narrative evidence"
  return <span className={`coverage-badge coverage-${coverage}`}>{label}</span>
}

export function ProgrammeCard({ record, to }: { record: ProgrammeRecord; to: string }) {
  const readiness = programmeReadiness(record)
  return (
    <Link className="programme-card" to={to}>
      <img src={record.image} alt="" />
      <div className="programme-card-shade" />
      <div className="programme-card-copy">
        <div className="programme-card-meta">
          <CoverageBadge coverage={record.coverage} />
          <span>{record.editorial.period}</span>
        </div>
        <p className="programme-partner">{record.person.partner_name}</p>
        <h2>{record.person.programme_name}</h2>
        <p>{record.editorial.dek}</p>
        <div className="programme-card-foot">
          <span>{record.metrics.length} reported measure{record.metrics.length === 1 ? "" : "s"}</span>
          <span>{readiness.score}% report ready</span>
        </div>
      </div>
    </Link>
  )
}

export function ProgrammeHero({ record, eyebrow, actions }: { record: ProgrammeRecord; eyebrow?: string; actions?: ReactNode }) {
  return (
    <section className="programme-hero">
      <img src={record.image} alt="" />
      <div className="programme-hero-wash" />
      <div className="programme-hero-content">
        <div className="programme-hero-badges">
          <EvidenceBadge state={record.evidenceState} />
          <CoverageBadge coverage={record.coverage} />
        </div>
        <p className="eyebrow">{eyebrow ?? record.person.pillar} · {record.editorial.period}</p>
        <h1>{record.person.programme_name}</h1>
        <p className="programme-hero-dek">{record.editorial.dek}</p>
        <dl className="programme-facts">
          <div><dt>Partner</dt><dd>{record.person.partner_name}</dd></div>
          <div><dt>Audience</dt><dd>{record.editorial.audience}</dd></div>
          <div><dt>Review</dt><dd>{record.approvalLabel}</dd></div>
        </dl>
        {actions ? <div className="programme-hero-actions">{actions}</div> : null}
      </div>
    </section>
  )
}

function MetricEvidence({ metric, onSource }: { metric: Metric; onSource: (id: string) => void }) {
  const state = evidenceStateForMetric(metric)
  return (
    <article className="evidence-metric">
      <div className="evidence-metric-head">
        <EvidenceBadge state={state} />
        <span>{metric.period}</span>
      </div>
      <strong>{formatMetric(metric)}</strong>
      <h3>{metric.label}</h3>
      <p>{metric.scope} scope · {metric.cadence}</p>
      {metric.note ? <p className="evidence-note">{metric.note}</p> : null}
      <div className="evidence-citations">
        {metric.source_ids.map((id) => {
          const source = getSource(id)
          return source ? <button key={id} type="button" onClick={() => onSource(id)}>Source{source.page ? ` · p.${source.page}` : ""}</button> : null
        })}
      </div>
    </article>
  )
}

export function MetricEvidenceGrid({ metrics, emptyMessage = "No numerical outcome is reported in the loaded evidence." }: { metrics: Metric[]; emptyMessage?: string }) {
  const [sourceId, setSourceId] = useState<string | null>(null)
  if (metrics.length === 0) {
    return (
      <section className="evidence-empty">
        <span aria-hidden="true">—</span>
        <div>
          <h3>Evidence gap</h3>
          <p>{emptyMessage}</p>
        </div>
      </section>
    )
  }
  return (
    <>
      <div className="evidence-metric-grid">
        {metrics.map((metric) => <MetricEvidence key={metric.id} metric={metric} onSource={setSourceId} />)}
      </div>
      {sourceId ? <SourceDrawer sourceId={sourceId} onClose={() => setSourceId(null)} /> : null}
    </>
  )
}

export function ProgrammeVisualization({ record }: { record: ProgrammeRecord }) {
  const percentageMetrics = record.metrics.filter((metric) => metric.unit === "percent" && metric.value !== null)
  const countMetrics = record.metrics.filter((metric) => metric.unit !== "percent" && metric.value !== null && metric.kind !== "target")
  const targets = record.metrics.filter((metric) => metric.kind === "target" && metric.value !== null)

  if (record.metrics.length === 0) {
    return (
      <section className="programme-visual-empty panel">
        <p className="eyebrow">Evidence coverage</p>
        <h2>A story is published; a quantified outcome is not.</h2>
        <p>This profile keeps the programme visible without turning activity descriptions into invented results. The missing measure is carried into the Partner data-quality workflow.</p>
      </section>
    )
  }

  return (
    <section className="programme-visual panel" aria-labelledby={`visual-${record.person.id}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Evidence in context</p>
          <h2 id={`visual-${record.person.id}`}>What the reported measures say</h2>
        </div>
        <span>{record.editorial.period}</span>
      </div>
      {percentageMetrics.length > 0 ? (
        <div className="outcome-bars">
          {percentageMetrics.map((metric) => (
            <div className="outcome-row" key={metric.id}>
              <div>
                <span>{metric.label}</span>
                <strong>{formatMetric(metric)}</strong>
              </div>
              <div className="outcome-track" role="img" aria-label={`${metric.label}: ${formatMetric(metric)}`}>
                <i style={{ width: `${Math.max(0, Math.min(100, Number(metric.value)))}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {countMetrics.length > 0 ? (
        <div className="measure-ribbon">
          {countMetrics.map((metric) => (
            <div key={metric.id}>
              <strong>{formatMetric(metric)}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      {targets.map((target) => {
        const actual = countMetrics.find((metric) => metric.unit === target.unit)
        const progress = actual && actual.value !== null && target.value !== null ? Number(actual.value) / Number(target.value) * 100 : 0
        return (
          <div className="target-progress" key={target.id}>
            <div><span>Reported reach</span><strong>{actual ? formatMetric(actual) : "Not loaded"}</strong></div>
            <div className="target-line"><i style={{ width: `${Math.min(100, progress)}%` }} /></div>
            <div><span>Stated ambition</span><strong>{formatMetric(target)}</strong></div>
            <p>{progress.toLocaleString("en-GB", { maximumFractionDigits: 1 })}% of the separately stated ambition. This is context, not a forecast.</p>
          </div>
        )
      })}
    </section>
  )
}

export function ProgrammeStory({ record }: { record: ProgrammeRecord }) {
  return (
    <article className="programme-story">
      <p className="eyebrow">Programme story</p>
      {record.editorial.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
      ))}
    </article>
  )
}

export function EvidenceInterpretation({ record }: { record: ProgrammeRecord }) {
  return (
    <div className="interpretation-grid">
      <section className="interpretation-card interpretation-positive">
        <p className="eyebrow">Supported by the evidence</p>
        <h2>What this record shows</h2>
        <ul>{record.editorial.shows.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="interpretation-card">
        <p className="eyebrow">Use with care</p>
        <h2>Limits and open questions</h2>
        <ul>{record.editorial.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
    </div>
  )
}

export function ProgrammeTimeline({ record }: { record: ProgrammeRecord }) {
  return (
    <section className="programme-timeline panel">
      <p className="eyebrow">Evidence journey</p>
      <div className="timeline-steps">
        {record.editorial.milestones.map((milestone, index) => (
          <div key={milestone.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{milestone.label}</h3>
            <p>{milestone.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function SourceRecord({ source, onOpen }: { source: Source; onOpen: (id: string) => void }) {
  return (
    <article className="source-record">
      <div>
        <EvidenceBadge state={evidenceStateForSource(source)} />
        <h3>{source.title}</h3>
        <p>{source.publisher ?? "Publisher not named"}{source.year ? ` · ${source.year}` : ""}{source.page ? ` · page ${source.page}` : ""}</p>
      </div>
      <button className="btn ghost" type="button" onClick={() => onOpen(source.id)}>Inspect source</button>
    </article>
  )
}

export function SourceLibrary({ sources }: { sources: Source[] }) {
  const [sourceId, setSourceId] = useState<string | null>(null)
  return (
    <section className="source-library">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Provenance</p>
          <h2>Sources and review status</h2>
        </div>
        <span>{sources.length} source{sources.length === 1 ? "" : "s"}</span>
      </div>
      {sources.map((source) => <SourceRecord key={source.id} source={source} onOpen={setSourceId} />)}
      {sources.length === 0 ? <p>No approved source is loaded.</p> : null}
      {sourceId ? <SourceDrawer sourceId={sourceId} onClose={() => setSourceId(null)} /> : null}
    </section>
  )
}

export function ProgrammeProfileBody({ record, includeConversation = true }: { record: ProgrammeRecord; includeConversation?: boolean }) {
  return (
    <>
      <section className="profile-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Reported outcomes</p>
            <h2>Measures with their context attached</h2>
          </div>
          <span>{record.metrics.length} measure{record.metrics.length === 1 ? "" : "s"}</span>
        </div>
        <MetricEvidenceGrid metrics={record.metrics} />
      </section>
      <ProgrammeVisualization record={record} />
      <section className="profile-reading-grid">
        <ProgrammeStory record={record} />
        <aside className="profile-reading-aside">
          <ProgrammeTimeline record={record} />
          <div className="panel profile-guide-card">
            <p className="eyebrow">About the guide</p>
            <p>{record.person.name} is an illustrative guide. The programme, reported measures and cited sources are real; the guide's identity is not.</p>
          </div>
        </aside>
      </section>
      <EvidenceInterpretation record={record} />
      <SourceLibrary sources={record.sources} />
      {includeConversation ? (
        <section className="profile-conversation panel">
          <div>
            <p className="eyebrow">Explore the evidence</p>
            <h2>Ask about this programme</h2>
            <p>Answers are prewritten from the same cited programme record.</p>
          </div>
          <Conversation surface={`person:${record.person.id}`} questionIds={record.person.question_ids} intro={record.person.intro} />
        </section>
      ) : null}
    </>
  )
}
