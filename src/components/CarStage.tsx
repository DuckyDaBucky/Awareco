import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ComponentRecord } from "../lib/content.ts"
import { getMetric, formatMetric, handoff } from "../lib/content.ts"
import { useDemo } from "../lib/store.ts"
import { Conversation, Kind, MetricCard } from "./Chrome.tsx"

export function CarStage({
  components,
  activeId,
  focusHotspot,
}: {
  components: ComponentRecord[]
  activeId?: string
  focusHotspot?: string
}) {
  const navigate = useNavigate()
  const spots = components.flatMap((component) =>
    component.hotspots.map((hotspot) => ({ ...hotspot, componentId: component.id, label: component.label })),
  )
  return (
    <div
      className="car-stage"
      onDoubleClick={(event) => {
        const target = event.target as HTMLElement
        if (target.closest(".hotspot")) return
        navigate("/car/evolution")
      }}
    >
      <Diagram />
      {spots.map((spot) => (
        <button
          key={spot.id}
          className={activeId === spot.componentId && (!focusHotspot || focusHotspot === spot.id) ? "hotspot active" : "hotspot"}
          style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
          type="button"
          aria-label={spot.label}
          aria-pressed={activeId === spot.componentId}
          onClick={() => navigate(`/car/${spot.componentId}?spot=${spot.id}`)}
        >
          <i />
          <em>{spot.label}</em>
        </button>
      ))}
      <p className="muted" style={{ position: "absolute", left: 16, bottom: 12, margin: 0 }}>
        Explanatory diagram, not a photograph of the AMR26. Select a square to explore a component.
      </p>
    </div>
  )
}

function Diagram() {
  return (
    <svg className="car" viewBox="0 0 400 760" role="img" aria-label="Top view explanatory diagram of a Formula One car">
      <rect width="400" height="760" fill="#000" />
      <ellipse cx="70" cy="180" rx="38" ry="58" fill="#111" stroke="#cedc00" />
      <ellipse cx="330" cy="180" rx="38" ry="58" fill="#111" stroke="#cedc00" />
      <ellipse cx="70" cy="560" rx="42" ry="64" fill="#111" stroke="#cedc00" />
      <ellipse cx="330" cy="560" rx="42" ry="64" fill="#111" stroke="#cedc00" />
      <path d="M120 70 H280 L300 120 H100 Z" fill="#00665e" stroke="#fff" />
      <path d="M150 120 C150 200 145 250 160 320 H240 C255 250 250 200 250 120 Z" fill="#00352f" stroke="#fff" />
      <circle cx="200" cy="250" r="28" fill="#00231f" stroke="#cedc00" />
      <path d="M155 320 H245 L260 470 H140 Z" fill="#00473f" stroke="#fff" />
      <path d="M145 470 H255 L270 620 H130 Z" fill="#00665e" stroke="#fff" />
      <path d="M110 640 H290 L270 700 H130 Z" fill="#00665e" stroke="#fff" />
      <path d="M168 360 H232 V520 H168 Z" fill="#cedc0022" stroke="#cedc00" strokeDasharray="4 3" />
    </svg>
  )
}

export function ComponentPanel({ component, spot }: { component: ComponentRecord; spot?: string }) {
  const generation = useDemo((store) => store.state.generation)
  const replace = useDemo((store) => store.replace)
  const navigate = useNavigate()
  const variant = component.variants.find((item) => item.id === generation) ?? component.variants[1]
  const close = () => navigate("/car")

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  return (
    <section className="panel" aria-label={component.label}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ marginTop: 0 }}>{component.label}</h2>
        <button className="btn ghost" type="button" onClick={close}>Close</button>
      </div>
      <div className="chips" style={{ marginBottom: 12 }}>
        {(["2025", "2026"] as const).map((year) => (
          <button key={year} className={generation === year ? "chip active" : "chip"} type="button" onClick={() => replace((current) => ({ ...current, generation: year }))}>
            {year} {year === "2025" ? "AMR25" : "AMR26"}
          </button>
        ))}
      </div>
      <div className="grid-2">
        <div>
          <p>{variant?.description}</p>
          {variant?.sustainability_connection ? <p>{variant.sustainability_connection}</p> : null}
          <p className="muted">{component.bridge.relationship}</p>
        </div>
        <PartVisual animation={component.animation} states={component.animation_controls.states} xray={component.animation === "fuel_flow" || component.id === "energy_recovery" || component.id === "power_unit"} spot={spot} />
      </div>
      <div className="grid-2" style={{ marginTop: 12 }}>
        {(variant?.metric_ids.length ? variant.metric_ids : component.metric_ids).map((id) => (
          <MetricCard key={id} id={id} />
        ))}
        <article>
          <Kind kind="unavailable" />
          <p>{formatMetric(getMetric(component.missing_metric_id)!)}</p>
        </article>
      </div>
      {component.id === "energy_recovery" ? <PowerCompare /> : null}
      <Conversation surface={`car:${component.id}`} questionIds={component.question_ids} />
      <button className="btn" type="button" style={{ marginTop: 12 }} onClick={() => navigate(`/people/${component.bridge.action_id.replace("person_", "")}`)}>
        {component.bridge.label}
      </button>
    </section>
  )
}

function PowerCompare() {
  const low = getMetric("mgu_k_2025")
  const high = getMetric("mgu_k_2026")
  if (!low || !high || low.value === null || high.value === null) return null
  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <p style={{ marginTop: 0 }}>Permitted MGU-K peak power</p>
      <div className="bars">
        <div className="bar-row"><span>2025</span><span className="track"><i style={{ width: `${(low.value / high.value) * 100}%` }} /></span><span>{formatMetric(low)}</span></div>
        <div className="bar-row"><span>2026</span><span className="track"><i style={{ width: "100%" }} /></span><span>{formatMetric(high)}</span></div>
      </div>
      <p className="muted">{high.note}</p>
    </div>
  )
}

function PartVisual({ animation, states, xray, spot }: { animation: string; states?: string[]; xray: boolean; spot?: string }) {
  const reduced = useDemo((store) => store.state.reducedMotion)
  const [playing, setPlaying] = useState(true)
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (!playing || reduced || !states?.length) return
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % states.length), 900)
    return () => window.clearInterval(timer)
  }, [playing, reduced, states])
  const state = states?.[index]
  return (
    <div className={xray ? "part-visual xray" : "part-visual"} aria-label="Explanatory illustration">
      <p className="muted" style={{ marginTop: 0 }}>Explanatory illustration{spot ? ` · focus ${spot}` : ""}. Not telemetry.</p>
      {animation === "wing_mode_toggle" ? <div className={state === "Straight Mode" ? "wing straight" : "wing"} /> : null}
      {animation === "gear_selector" ? <p className="flare" style={{ fontSize: 42, margin: 0 }}>{state ?? "8"}</p> : null}
      {animation === "recover_store_deploy" ? <p className="flare">{state ?? "Recover"}</p> : null}
      {animation !== "gear_selector" ? (
        <div className="flow" aria-hidden="true">{playing && !reduced ? <span /> : <span style={{ animation: "none", width: "70%" }} />}</div>
      ) : null}
      <p>{caption(animation, state)}</p>
      <div className="chips">
        <button className="chip" type="button" onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : "Play"}</button>
        <button className="chip" type="button" onClick={() => { setIndex(0); setPlaying(false) }}>Reset</button>
      </div>
    </div>
  )
}

function caption(animation: string, state?: string) {
  if (animation === "wing_mode_toggle") return state === "Straight Mode" ? "Straight mode reduces drag." : "Corner mode restores downforce."
  if (animation === "recover_store_deploy") return `${state ?? "Recover"} is a sequence, not a live measurement.`
  if (animation === "fuel_flow") return "Fuel-cell location is shown as an x-ray, not exposed bodywork."
  if (animation === "layer_separation") return "Composite layers are a structural explanation."
  if (animation === "underfloor_airflow") return "Underfloor airflow is a schematic."
  if (animation === "cooling_airflow") return "Cooling air is balanced against drag."
  if (animation === "friction_regen_blend") return "Friction and regenerative braking share the stop."
  if (animation === "wheel_travel") return "Wheel travel shows the mechanical path."
  if (animation === "wheel_rotation") return "Wheel detail for the 18-inch regulation."
  if (animation === "hybrid_energy_flow") return "Combustion and electrical paths share the power unit."
  return handoff.car.interaction.panel_layout
}

export function SideProfile({ year }: { year: string }) {
  const dim = year === "2025"
  return (
    <svg viewBox="0 0 900 260" role="img" aria-label={`${year} side-profile explanatory diagram`}>
      <rect width="900" height="260" fill="#000" />
      <path d="M80 150 H760 L700 190 H140 Z" fill={dim ? "#00352f" : "#00665e"} stroke="#fff" />
      <path d="M150 150 L230 90 H360 L300 150 Z" fill="#00473f" stroke="#fff" />
      <circle cx="230" cy="190" r="42" fill="#111" stroke="#cedc00" />
      <circle cx="640" cy="190" r="42" fill="#111" stroke="#cedc00" />
      <path d="M80 130 H200" stroke="#cedc00" />
      <path d="M700 120 H820" stroke="#cedc00" />
    </svg>
  )
}
