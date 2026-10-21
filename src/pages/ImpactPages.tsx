import { useState } from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Kind, MetricCard } from "../components/Chrome.tsx"
import { formatMetric, getMetric, handoff, listPersonas } from "../lib/content.ts"

export function ImpactPage() {
  const [tab, setTab] = useState<"environment" | "belong" | "community">("environment")
  const trend = handoff.partners.charts[0].metric_ids.map((id) => {
    const metric = getMetric(id)
    return { year: metric?.period, value: metric?.value }
  })
  const categories = handoff.partners.charts[1].metric_ids.map((id) => {
    const metric = getMetric(id)
    return { name: metric?.label ?? id, value: metric?.value ?? 0, label: metric ? formatMetric(metric) : "" }
  })
  return (
    <>
      <h1>Reported impact</h1>
      <p className="notice">Annual reported figures. This page is not a live feed.</p>
      <div className="chips" style={{ marginBottom: 16 }}>
        {(["environment", "belong", "community"] as const).map((item) => (
          <button key={item} className={tab === item ? "chip active" : "chip"} type="button" onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      {tab === "environment" ? (
        <div className="grid-2">
          <section className="panel">
            <h2>Market-based footprint before SAF certificates</h2>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={trend}>
                  <CartesianGrid stroke="#ffffff22" />
                  <XAxis dataKey="year" stroke="#a3a3a3" />
                  <YAxis stroke="#a3a3a3" unit=" t" />
                  <Tooltip />
                  <Line dataKey="value" stroke="#cedc00" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <ul>
              {trend.map((row) => <li key={row.year}>{row.year}: {row.value?.toLocaleString("en-GB")} tCO2e</li>)}
            </ul>
            <MetricCard id="footprint_2025_after_safc" />
            <p className="muted">The after-certificate total stays off this line so the accounting bases are not mixed.</p>
          </section>
          <section className="panel">
            <h2>2025 categories, tCO2e</h2>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={categories} layout="vertical">
                  <XAxis type="number" stroke="#a3a3a3" unit=" t" />
                  <YAxis type="category" dataKey="name" stroke="#a3a3a3" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00665e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul>
              {categories.map((row) => <li key={row.name}>{row.name}: {row.label}</li>)}
            </ul>
            <p className="muted">{handoff.partners.charts[1].note}</p>
            <MetricCard id="circularity_2025" />
            <MetricCard id="carbon_fibre_2025" />
          </section>
        </div>
      ) : null}
      {tab === "belong" ? (
        <div className="people-grid">
          {listPersonas().filter((person) => person.pillar === "BELONG").map((person) => (
            <article key={person.id} className="panel">
              <h2>{person.programme_name}</h2>
              <Kind kind="reported" />
              {person.metric_ids.length === 0 ? <p>Qualitative evidence only. No numerical outcome is loaded.</p> : person.metric_ids.map((id) => <MetricCard key={id} id={id} />)}
            </article>
          ))}
        </div>
      ) : null}
      {tab === "community" ? (
        <div className="people-grid">
          {listPersonas().filter((person) => person.pillar === "COMMUNITY").map((person) => (
            <article key={person.id} className="panel">
              <h2>{person.programme_name}</h2>
              {person.metric_ids.length === 0 ? <p>The published story does not include a numerical total for this guide.</p> : person.metric_ids.map((id) => <MetricCard key={id} id={id} />)}
            </article>
          ))}
        </div>
      ) : null}
    </>
  )
}
