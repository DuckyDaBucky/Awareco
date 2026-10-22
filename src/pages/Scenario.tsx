import { useMemo, useState } from "react"
import { SourceDrawer } from "../components/Chrome.tsx"
import { handoff } from "../lib/content.ts"
import { scenarioOutcome } from "../lib/logic.ts"
import { useDemo } from "../lib/store.ts"

export function ScenarioPanel() {
  const scenarios = handoff.simulations.scenarios
  const [id, setId] = useState(scenarios[0].id)
  const scenario = scenarios.find((item) => item.id === id) ?? scenarios[0]
  const [inputs, setInputs] = useState<Record<string, number>>(() => Object.fromEntries(scenario.inputs.map((input) => [input.id, input.default])))
  const [source, setSource] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const replace = useDemo((store) => store.replace)
  const result = useMemo(() => scenarioOutcome(id, inputs), [id, inputs])

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
            <p className="muted">{outputLabel(key)}</p>
            <strong className="flare" style={{ fontSize: 32 }}>{typeof value === "number" ? value.toLocaleString("en-GB", { maximumFractionDigits: 2 }) : value}</strong>
            {"unit" in scenario && scenario.unit ? <p className="muted">{scenario.unit}</p> : null}
          </article>
        ))}
      </div>
      <ul>{scenario.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
      <div className="chips">
        <button className="btn ghost" type="button" onClick={() => setInputs(Object.fromEntries(scenario.inputs.map((input) => [input.id, input.default])))}>Reset assumptions</button>
        <button className="btn" type="button" onClick={() => {
          const savedId = crypto.randomUUID()
          replace((current) => ({
            ...current,
            savedScenarios: [...current.savedScenarios, {
              id: savedId,
              scenarioId: id,
              title: scenario.title,
              inputs: { ...inputs },
              outputs: { ...result },
              sourceIds: [...scenario.source_ids],
              at: new Date().toISOString(),
            }],
            reportScenarioId: savedId,
          }))
          setSavedMessage("Scenario saved with its inputs, outputs and assumptions. It will appear in the report.")
        }}>Save and include in report</button>
        <button className="chip" type="button" onClick={() => setSource(scenario.source_ids[0])}>View baseline source</button>
        <button className="chip" type="button" onClick={() => setSource("DEMO_MODEL")}>View assumptions</button>
      </div>
      {savedMessage ? <p className="scenario-save-note" role="status">{savedMessage}</p> : null}
      {source ? <SourceDrawer sourceId={source} onClose={() => setSource(null)} /> : null}
    </section>
  )
}

function outputLabel(key: string) {
  return key.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase())
}

export function SavedScenarioList() {
  const saved = useDemo((store) => store.state.savedScenarios)
  const selected = useDemo((store) => store.state.reportScenarioId)
  const replace = useDemo((store) => store.replace)
  if (saved.length === 0) {
    return <p className="scenario-empty">No scenarios have been saved. Adjust a scenario above and include it in the report.</p>
  }
  return (
    <div className="saved-scenario-list">
      {saved.map((item) => (
        <article key={item.id} className={selected === item.id ? "saved-scenario selected" : "saved-scenario"}>
          <div>
            <p className="eyebrow">Illustrative · {new Date(item.at).toLocaleString("en-GB")}</p>
            <h3>{item.title || item.scenarioId}</h3>
            <p>{Object.entries(item.inputs).map(([key, value]) => `${outputLabel(key)}: ${value}`).join(" · ")}</p>
          </div>
          <div className="saved-scenario-actions">
            <button className="chip" type="button" onClick={() => replace((current) => ({ ...current, reportScenarioId: item.id }))}>{selected === item.id ? "Included in report" : "Include in report"}</button>
            <button className="text-btn" type="button" onClick={() => replace((current) => ({
              ...current,
              savedScenarios: current.savedScenarios.filter((scenario) => scenario.id !== item.id),
              reportScenarioId: current.reportScenarioId === item.id ? null : current.reportScenarioId,
            }))}>Remove</button>
          </div>
        </article>
      ))}
    </div>
  )
}

export function SimulatePage() {
  return (
    <>
      <h1>Make your call</h1>
      <ScenarioPanel />
    </>
  )
}
