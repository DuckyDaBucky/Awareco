import { useMemo, useState } from "react"
import { SourceDrawer } from "../components/Chrome.tsx"
import { handoff } from "../lib/content.ts"
import { emissionsOutcome, mentoringOutcome, outreachOutcome } from "../lib/logic.ts"
import { useDemo } from "../lib/store.ts"

export function ScenarioPanel() {
  const scenarios = handoff.simulations.scenarios
  const [id, setId] = useState(scenarios[0].id)
  const scenario = scenarios.find((item) => item.id === id) ?? scenarios[0]
  const [inputs, setInputs] = useState<Record<string, number>>(() => Object.fromEntries(scenario.inputs.map((input) => [input.id, input.default])))
  const [source, setSource] = useState<string | null>(null)
  const replace = useDemo((store) => store.replace)
  const result = useMemo(() => compute(id, inputs), [id, inputs])

  const choose = (next: string) => {
    const found = scenarios.find((item) => item.id === next)!
    setId(next)
    setInputs(Object.fromEntries(found.inputs.map((input) => [input.id, input.default])))
  }

  return (
    <section>
      <p className="lime">{handoff.simulations.status_label}</p>
      <div className="chips">
        {scenarios.map((item) => <button key={item.id} className={item.id === id ? "chip active" : "chip"} type="button" onClick={() => choose(item.id)}>{item.title}</button>)}
      </div>
      {scenario.inputs.map((input) => (
        <label key={input.id} style={{ display: "block", marginTop: 12 }}>
          {input.label}: {inputs[input.id]} {input.unit}
          <input className="slider" type="range" min={input.min} max={input.max} step={input.step} value={inputs[input.id]} onChange={(event) => setInputs((current) => ({ ...current, [input.id]: Number(event.target.value) }))} />
        </label>
      ))}
      <div className="grid-2" style={{ marginTop: 12 }}>
        {Object.entries(result).map(([key, value]) => (
          <article key={key} className="panel">
            <p className="muted">{key}</p>
            <strong className="flare" style={{ fontSize: 32 }}>{typeof value === "number" ? value.toLocaleString("en-GB", { maximumFractionDigits: 2 }) : value}</strong>
          </article>
        ))}
      </div>
      <ul>{scenario.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
      <div className="chips">
        <button className="btn ghost" type="button" onClick={() => setInputs(Object.fromEntries(scenario.inputs.map((input) => [input.id, input.default])))}>Reset assumptions</button>
        <button className="btn" type="button" onClick={() => replace((current) => ({ ...current, savedScenarios: [...current.savedScenarios, { id: crypto.randomUUID(), scenarioId: id, inputs, at: new Date().toISOString() }], reportScenarioId: id }))}>Save and include in report</button>
        <button className="chip" type="button" onClick={() => setSource(scenario.source_ids[0])}>View baseline source</button>
        <button className="chip" type="button" onClick={() => setSource("DEMO_MODEL")}>View assumptions</button>
      </div>
      {source ? <SourceDrawer sourceId={source} onClose={() => setSource(null)} /> : null}
    </section>
  )
}

function compute(id: string, inputs: Record<string, number>) {
  if (id === "emissions") return emissionsOutcome(inputs.supplier_coverage ?? 0, inputs.hq_coverage ?? 0)
  if (id === "stem") return outreachOutcome(inputs.funding_change_percent ?? 0)
  return { illustrative_cost_per_participant: mentoringOutcome(inputs.cohort_size ?? 16, inputs.budget_gbp ?? 24000) }
}

export function SimulatePage() {
  return (
    <>
      <h1>Make your call</h1>
      <ScenarioPanel />
    </>
  )
}
